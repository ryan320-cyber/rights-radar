import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, addWaitlistSubmission, saveFlightScan } from './src/db/users.ts';
import { initDatabase } from './src/db/init.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security: JSON body size limit
app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiting map (IP -> request count)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function applyRateLimit(limit: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(ip, record);

    if (record.count > limit) {
      return res.status(429).json({ error: 'Trop de requêtes. Veuillez patienter avant de réessayer.' });
    }
    next();
  };
}

// Initialize Gemini client with mandatory User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface GroundingSource {
  title: string;
  url: string;
}

function extractGroundingSources(response: any): GroundingSource[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const sources: GroundingSource[] = [];
  const seenUrls = new Set<string>();

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || 'Source web';
    if (uri && typeof uri === 'string' && (uri.startsWith('http://') || uri.startsWith('https://')) && !seenUrls.has(uri)) {
      seenUrls.add(uri);
      sources.push({
        title,
        url: uri,
      });
    }
  }
  return sources.slice(0, 5);
}

// Official evergreen legal reference links (separate from live search findings)
const OFFICIAL_LEGAL_REFERENCES: GroundingSource[] = [
  {
    title: 'EUR-Lex — Règlement (CE) n° 261/2004 consolidé',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=celex%3A32004R0261',
  },
  {
    title: 'Commission européenne — Droits des passagers aériens',
    url: 'https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_fr.htm',
  },
  {
    title: 'DGAC — Ministère de la Transition Écologique (Réclamations)',
    url: 'https://www.ecologie.gouv.fr/passagers-aeriens-vos-droits',
  },
];

// Bounded in-memory caches with explicit TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const flightCache = new Map<string, CacheEntry<any>>();
const MAX_FLIGHT_CACHE_SIZE = 100;
const FLIGHT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

let cachedRegulatoryPulse: CacheEntry<any> | null = null;
const REGULATORY_PULSE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
let quotaCooldownUntil = 0;

/**
 * POST /api/verify-flight
 * Live flight status & extraordinary circumstance search with Gemini grounding
 */
app.post('/api/verify-flight', applyRateLimit(20, 60 * 1000), async (req, res) => {
  const { flightCode, flightDate, departure, arrival } = req.body || {};

  if (!flightCode || typeof flightCode !== 'string' || flightCode.trim().length === 0) {
    return res.status(400).json({ error: 'Le code de vol est requis.' });
  }

  const cleanFlightCode = flightCode.trim().slice(0, 32);
  const cacheKey = `${cleanFlightCode}-${departure || ''}-${arrival || ''}-${flightDate || ''}`;
  const now = Date.now();

  const cached = flightCache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    return res.json(cached.data);
  }

  const queryPrompt = `Vérifie les bulletins d'incident officiels et les conditions météo/grèves pour le vol ${cleanFlightCode} (${departure || ''} -> ${arrival || ''}, date : ${flightDate || 'récente'}).
Recherche s'il existe des rapports confirmés de grève externe ou de météo extrême.
Réponds en 3 phrases en français :
1. Événements répertoriés ou absence d'événement majeur dans les résultats de recherche.
2. Évaluation préliminaire : circonstance extraordinaire potentielle ou retard a priori couvert sous CE 261/2004.
Précise clairement qu'il s'agit d'une recherche d'actualité et non d'une preuve juridique définitive.`;

  // Truthful fallback response when live verification cannot be performed
  const fallbackFlightResult = {
    summary: `Vérification en direct indisponible ou quota temporairement restreint. Les critères d'éligibilité légaux restent calculés sur la base de vos horaires déclarés et du barème officiel CE 261/2004.`,
    disruptionAssessment: 'verification_unavailable',
    groundingSources: OFFICIAL_LEGAL_REFERENCES,
    fallback: true,
    verifiedAt: new Date().toISOString(),
  };

  try {
    if (!ai || now < quotaCooldownUntil) {
      return res.json(fallbackFlightResult);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: queryPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summaryText = response.text || 'Analyse effectuée via Google Search.';
    const sources = extractGroundingSources(response);

    const lower = summaryText.toLowerCase();
    const isExtraordinary =
      lower.includes('circonstance extraordinaire') ||
      lower.includes('météo extrême') ||
      lower.includes('grève des contrôleurs');

    const result = {
      summary: summaryText,
      disruptionAssessment: isExtraordinary ? 'extraordinary_circumstance' : 'potentially_compensable',
      groundingSources: sources.length > 0 ? sources : OFFICIAL_LEGAL_REFERENCES,
      fallback: false,
      verifiedAt: new Date().toISOString(),
    };

    // Store in bounded cache
    if (flightCache.size >= MAX_FLIGHT_CACHE_SIZE) {
      const firstKey = flightCache.keys().next().value;
      if (firstKey) flightCache.delete(firstKey);
    }
    flightCache.set(cacheKey, { data: result, expiresAt: now + FLIGHT_CACHE_TTL_MS });

    return res.json(result);
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      quotaCooldownUntil = now + 10 * 60 * 1000;
      console.info('[Server] Quota Gemini atteint, bascule sur la référence légale.');
    } else {
      console.info('[Server] Service de recherche en direct temporairement indisponible.');
    }
    return res.json(fallbackFlightResult);
  }
});

/**
 * GET /api/regulatory-pulse
 * Regulatory news monitoring with Gemini Search grounding
 */
app.get('/api/regulatory-pulse', applyRateLimit(30, 60 * 1000), async (req, res) => {
  const now = Date.now();
  if (cachedRegulatoryPulse && now < cachedRegulatoryPulse.expiresAt) {
    return res.json(cachedRegulatoryPulse.data);
  }

  const queryPrompt = `Quelle est l'actualité officielle récente sur la révision ou la jurisprudence du Règlement européen (CE) n° 261/2004 ?
Mentionne en 3 phrases en français l'état d'avancement au Conseil UE / Parlement UE ou un arrêt récent de la CJUE. Précise le statut d'avancement exact sans extrapolation.`;

  const fallbackRegulatoryResult = {
    summary: `Veille réglementaire CE 261/2004 : Le texte consolidé du Règlement (CE) n° 261/2004 et la jurisprudence constante de la CJUE restent les textes de référence en vigueur pour l'indemnisation des passagers aériens (250 €, 400 €, 600 €).`,
    groundingSources: OFFICIAL_LEGAL_REFERENCES,
    fallback: true,
    checkedAt: new Date().toISOString(),
  };

  try {
    if (!ai || now < quotaCooldownUntil) {
      return res.json(fallbackRegulatoryResult);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: queryPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summaryText = response.text || 'Données réglementaires issues de Google Search.';
    const sources = extractGroundingSources(response);

    const result = {
      summary: summaryText,
      groundingSources: sources.length > 0 ? sources : OFFICIAL_LEGAL_REFERENCES,
      fallback: false,
      checkedAt: new Date().toISOString(),
    };

    cachedRegulatoryPulse = { data: result, expiresAt: now + REGULATORY_PULSE_TTL_MS };
    return res.json(result);
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      quotaCooldownUntil = now + 10 * 60 * 1000;
    }
    return res.json(fallbackRegulatoryResult);
  }
});

/**
 * POST /api/user/sync
 * Authenticated endpoint to synchronize Firebase Auth user profile into PostgreSQL
 */
app.post('/api/user/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    const displayName = req.user?.name || (req.body?.displayName as string) || null;
    const photoUrl = req.user?.picture || (req.body?.photoUrl as string) || null;

    if (!uid || !email) {
      return res.status(400).json({ error: 'User UID and email required' });
    }

    const userRecord = await getOrCreateUser(uid, email, displayName, photoUrl);
    return res.json({ success: true, user: userRecord });
  } catch (error: any) {
    console.error('Error synchronizing user to Cloud SQL:', error);
    return res.status(500).json({ error: 'Failed to synchronize user record' });
  }
});

/**
 * POST /api/waitlist
 * Persists waitlist & survey submissions into PostgreSQL
 */
app.post('/api/waitlist', applyRateLimit(10, 60 * 1000), async (req, res) => {
  try {
    const {
      email,
      profile,
      frequency,
      notificationPref,
      pastDisruptions,
      pastClaimExperience,
      frequentAirlines,
      annualFlightCount,
      preferredFeature,
      preferredPricingModel,
      feedbackOrFrustration,
    } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Une adresse email valide est requise.' });
    }
    if (!frequency) {
      return res.status(400).json({ error: 'La fréquence d’usage est requise.' });
    }

    const submission = await addWaitlistSubmission({
      email: email.trim().toLowerCase(),
      profile: profile || 'passager_frequent',
      frequency: frequency || 'occasionnel',
      notificationPref: notificationPref || 'forfait_fixe',
      pastDisruptions: pastDisruptions || null,
      pastClaimExperience: pastClaimExperience || null,
      frequentAirlines: frequentAirlines || null,
      annualFlightCount: annualFlightCount || null,
      preferredFeature: preferredFeature || null,
      preferredPricingModel: preferredPricingModel || null,
      feedbackOrFrustration: feedbackOrFrustration ? String(feedbackOrFrustration).slice(0, 1000) : null,
    });

    return res.status(201).json({ success: true, submission });
  } catch (error: any) {
    console.error('Error adding waitlist entry to Cloud SQL:', error);
    return res.status(500).json({ error: 'Erreur lors de l’enregistrement de votre inscription.' });
  }
});

/**
 * POST /api/flight-scans
 * Authenticated endpoint: Records flight compensation simulations to Cloud SQL
 */
app.post('/api/flight-scans', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;

    if (!uid || !email) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }

    // Map Firebase Auth UID to internal user ID
    const userRecord = await getOrCreateUser(uid, email, req.user?.name || null, req.user?.picture || null);

    const { flightNumber, flightDate, route, delayMinutes, amountEstimated, claimLetter } = req.body || {};

    if (!flightNumber || typeof flightNumber !== 'string') {
      return res.status(400).json({ error: 'Le numéro de vol est requis.' });
    }

    const scan = await saveFlightScan({
      userId: userRecord.id,
      flightNumber: flightNumber.trim().slice(0, 32),
      flightDate: flightDate ? String(flightDate).slice(0, 32) : undefined,
      route: route ? String(route).slice(0, 128) : undefined,
      delayMinutes: delayMinutes ? Math.max(0, parseInt(delayMinutes, 10)) : 0,
      amountEstimated: amountEstimated ? Math.max(0, parseInt(amountEstimated, 10)) : 0,
      claimLetter: claimLetter ? String(claimLetter).slice(0, 5000) : undefined,
    });

    return res.status(201).json({ success: true, scan });
  } catch (error: any) {
    console.error('Error saving flight scan to Cloud SQL:', error);
    return res.status(500).json({ error: 'Échec de la sauvegarde de la simulation' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.SQL_HOST) {
    try {
      await initDatabase();
    } catch (dbErr) {
      console.warn('⚠️ Non-fatal: Database auto-init skipped or failed:', dbErr);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rights Radar server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
