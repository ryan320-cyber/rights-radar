import { User } from 'firebase/auth';
import { DEMO_EMAILS } from '../data/demoEmails';

// Mock constants for visual consistency
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
];

export interface DetectedFlightEmail {
  id: string;
  messageId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  airline: string;
  flightCode: string;
  route: string;
  status: 'retard' | 'annule' | 'confirme' | 'inconnu';
  delayText: string;
  delayHours: number | null;
  eligible: boolean;
  compensation: string;
  preset: 'short' | 'medium' | 'long';
  rawFromEmail?: string;
}

// SIMULATED STATE
let isDemoSignedIn = false;

export const initGmailAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  // In demo mode, we don't need a real listener, but we'll simulate a check
  if (isDemoSignedIn && onAuthSuccess) {
    onAuthSuccess({ displayName: 'Voyageur Démo', email: 'demo@rights-radar.io' }, 'mock-demo-token');
  } else if (onAuthFailure) {
    onAuthFailure();
  }
  return () => {};
};

export const googleSignInWithGmail = async (): Promise<{ user: any; accessToken: string } | null> => {
  // SIMULATED SIGN IN
  await new Promise(resolve => setTimeout(resolve, 800)); // Latency
  isDemoSignedIn = true;
  return {
    user: {
      displayName: 'Voyageur Démo',
      email: 'demo@rights-radar.io',
      photoURL: null
    },
    accessToken: 'mock-demo-token'
  };
};

export const getGmailAccessToken = (): string | null => {
  return isDemoSignedIn ? 'mock-demo-token' : null;
};

export const logoutGmail = async () => {
  isDemoSignedIn = false;
};

/**
 * SIMULATED SCANNER
 * Returns deterministic fictional records from our demo dataset.
 */
export async function scanGmailFlightReceipts(token: string): Promise<DetectedFlightEmail[]> {
  // If fetch is available, perform/verify Gmail API search
  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=' +
          encodeURIComponent('subject:(confirmation OR reservation OR vol OR flight OR ticket)'),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && Array.isArray(data.messages)) {
          if (data.messages.length === 0) {
            return [];
          }
        }
      }
    } catch {
      // On network failure or mock environment error
    }
  }

  // Fallback to deterministic demo emails ONLY in explicit local demo mode
  if (token === 'mock-demo-token') {
    await new Promise(resolve => setTimeout(resolve, 600)); // Latency
    return DEMO_EMAILS;
  }

  return [];
}

export function extractAirlineName(from: string, subject: string): string {
  const combined = (from + ' ' + subject).toLowerCase();
  if (combined.includes('air france')) return 'Air France';
  if (combined.includes('delta')) return 'Delta Air Lines';
  if (combined.includes('lufthansa')) return 'Lufthansa';
  if (combined.includes('easyjet')) return 'easyJet';
  if (combined.includes('ryanair')) return 'Ryanair';
  if (combined.includes('transavia')) return 'Transavia';
  if (combined.includes('british airways')) return 'British Airways';
  if (combined.includes('iberia')) return 'Iberia';
  if (combined.includes('klm')) return 'KLM Royal Dutch';
  return 'Compagnie Aérienne';
}

/**
 * SIMULATED DRAFT CREATOR
 */
export async function createGmailClaimDraft(
  _token: string,
  recipientEmail: string,
  _subject: string,
  _bodyContent: string
): Promise<{ draftId: string }> {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    throw new Error('Veuillez vérifier l’adresse email du destinataire.');
  }

  await new Promise(resolve => setTimeout(resolve, 1200)); // Latency
  return { draftId: 'DRAFT_' + Math.random().toString(36).substring(2, 9).toUpperCase() };
}

