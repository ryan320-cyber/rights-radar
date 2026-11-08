import React, { useState, useEffect } from 'react';
import { Mail, Search, CheckCircle2, AlertTriangle, Sparkles, Shield, X, LogOut, ArrowRight, FileText, Send, Lock, Edit3, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/soundEngine.ts';
import {
  googleSignInWithGmail,
  scanGmailFlightReceipts,
  logoutGmail,
  getGmailAccessToken,
  createGmailClaimDraft,
  DetectedFlightEmail,
} from '../services/gmailService.ts';
import { generateClaimLetterTemplate } from '../utils/rightsCalculator.ts';

interface GmailScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFlightForSimulation: (preset: 'short' | 'medium' | 'long', flightCode?: string) => void;
}

export function GmailScannerModal({ isOpen, onClose, onSelectFlightForSimulation }: GmailScannerModalProps) {
  const [user, setUser] = useState<{ displayName?: string; email?: string; photoURL?: string | null } | null>(null);
  const [token, setToken] = useState<string | null>(getGmailAccessToken());
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFlights, setDetectedFlights] = useState<DetectedFlightEmail[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Draft confirmation & preview modal state
  const [draftConfirmFlight, setDraftConfirmFlight] = useState<DetectedFlightEmail | null>(null);
  const [draftRecipient, setDraftRecipient] = useState<string>('');
  const [draftSubject, setDraftSubject] = useState<string>('');
  const [draftBody, setDraftBody] = useState<string>('');
  const [draftSuccessMsg, setDraftSuccessMsg] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentToken = getGmailAccessToken();
      setToken(currentToken);
      // In demo mode, if token exists, we simulate a user object
      if (currentToken) {
        setUser({ displayName: 'Voyageur Démo', email: 'demo@rights-radar.io' });
        if (!hasScanned) {
          handleScanInbox(currentToken);
        }
      }
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    setErrorMsg(null);
    soundEngine.playClick();
    try {
      const res = await googleSignInWithGmail();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        handleScanInbox(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Échec de connexion au simulateur Gmail.');
    }
  };

  const handleScanInbox = async (accessToken: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    soundEngine.playPing();
    try {
      const flights = await scanGmailFlightReceipts(accessToken);
      setDetectedFlights(flights);
      setHasScanned(true);
      soundEngine.playPing();
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de lire les confirmations de vol (Mode Démo).');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSignOut = async () => {
    soundEngine.playClick();
    await logoutGmail();
    setUser(null);
    setToken(null);
    setDetectedFlights([]);
    setHasScanned(false);
  };

  // Prepares the draft preview for user confirmation
  const handleOpenDraftPreview = (flight: DetectedFlightEmail) => {
    soundEngine.playClick();
    setDraftConfirmFlight(flight);

    // Default recipient address based on airline or email from header
    let defaultRecipient = flight.rawFromEmail || '';
    if (!defaultRecipient || !defaultRecipient.includes('@')) {
      const normAirline = flight.airline.toLowerCase().replace(/\s+/g, '');
      if (normAirline.includes('airfrance')) defaultRecipient = 'serviceclient@airfrance.fr';
      else if (normAirline.includes('iberia')) defaultRecipient = 'reclamaciones@iberia.es';
      else if (normAirline.includes('easyjet')) defaultRecipient = 'customer.service@easyjet.com';
      else if (normAirline.includes('lufthansa')) defaultRecipient = 'customer.relations@lufthansa.com';
      else defaultRecipient = 'serviceclient@compagnie.com';
    }

    const subject = `Mise en demeure d'indemnisation CE 261/2004 — Vol ${flight.flightCode}`;
    const body = generateClaimLetterTemplate({
      passengerName: user?.displayName || 'Passager titulaire',
      flightCode: flight.flightCode,
      departureAirport: flight.route.split(' > ')[0] || 'Aéroport de départ',
      arrivalAirport: flight.route.split(' > ')[1] || "Aéroport d'arrivée",
      flightDate: flight.date,
      delayHours: flight.delayHours || 3.5,
      estimatedAmount: parseInt(flight.compensation, 10) || 250,
      airlineName: flight.airline,
    });

    setDraftRecipient(defaultRecipient);
    setDraftSubject(subject);
    setDraftBody(body);
  };

  // Creates the draft only upon explicit user validation
  const handleConfirmCreateDraft = async () => {
    if (!draftConfirmFlight) return;
    setIsCreatingDraft(true);
    soundEngine.playClick();

    try {
      await createGmailClaimDraft(
        token || 'demo-token',
        draftRecipient,
        draftSubject,
        draftBody
      );

      setDraftSuccessMsg(
        `Brouillon de réclamation simulé avec succès pour le vol ${draftConfirmFlight.flightCode}.`
      );
      setDraftConfirmFlight(null);
      soundEngine.playPing();
    } catch (err: any) {
      alert(`Erreur lors de la simulation : ${err.message}`);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240, mass: 0.9 }}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-3xl apple-card border border-white/10 rounded-[28px] shadow-2xl p-6 sm:p-8 text-white relative max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Apple Sheet Grab Handle */}
          <div className="apple-sheet-handle mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 text-[#43DDB0]">
                <Beaker className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                  <span>Scanner de Réservations (Mode Démo)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                    SIMULATION LOCALE
                  </span>
                </h2>
                <p className="text-xs text-white/60 font-normal">
                  Découvrez comment Rights Radar analyse vos e-billets sans jamais accéder à vos données réelles.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center apple-press transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner Messages */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {draftSuccessMsg && (
            <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{draftSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setDraftSuccessMsg(null)}
                className="text-white/60 hover:text-white apple-press"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-5 space-y-5">
            {!user ? (
              /* Zero State: Explore Demo Inbox */
              <div className="text-center py-8 px-4 max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto text-[#43DDB0]">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Lancez une simulation d'analyse
                  </h3>
                  <p className="text-xs text-white/65 leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour explorer une boîte de réception fictive contenant des scénarios de vol réels (retards, annulations, grèves). 
                    <br/><br/>
                    <strong className="text-amber-300">Aucune connexion à votre compte Google n'est requise.</strong>
                  </p>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full bg-white text-black font-semibold text-xs shadow-lg apple-press transition cursor-pointer hover:bg-white/90"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Explorer l'Inbox Démo</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-amber-300/80">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Données 100% fictives générées localement</span>
                </div>
              </div>
            ) : (
              /* Connected State */
              <div className="space-y-5">
                {/* User Info Bar */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-semibold text-xs border border-amber-500/30">
                      D
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {user.displayName}
                      </div>
                      <div className="text-[11px] text-amber-300/70">
                        Compte de Simulation Actif
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScanInbox(token || '')}
                      disabled={isScanning}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 hover:border-white/30 text-xs text-white apple-press transition cursor-pointer font-medium"
                    >
                      <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>{isScanning ? 'Scan en cours...' : 'Réinitialiser la démo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="p-1.5 rounded-full text-white/50 hover:text-red-400 hover:bg-white/10 apple-press transition cursor-pointer"
                      title="Quitter la démo"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scan Results */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/60 font-medium">
                      Vols détectés dans l'Inbox Démo ({detectedFlights.length})
                    </span>
                    <span className="text-[10px] text-amber-300 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3" />
                      SIMULATEUR RADAR
                    </span>
                  </div>

                  {isScanning ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-t-[#43DDB0] animate-spin"></div>
                        <Search className="absolute inset-0 m-auto w-5 h-5 text-[#43DDB0]" />
                      </div>
                      <p className="text-xs text-white/60">Analyse des en-têtes et métadonnées fictives...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detectedFlights.map((flight) => (
                        <div
                          key={flight.id}
                          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">
                                {flight.flightCode}
                              </span>
                              <span className="text-xs text-white/60">
                                · {flight.airline}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                flight.eligible
                                  ? 'bg-[#43DDB0]/15 text-[#43DDB0] border border-[#43DDB0]/30'
                                  : 'bg-white/5 text-white/40 border border-white/10'
                              }`}>
                                {flight.status}
                              </span>
                            </div>
                            <div className="text-xs text-white/80">
                              {flight.route} · Date : {flight.date}
                            </div>
                            <div className="text-[11px] text-white/50">
                              {flight.snippet}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {flight.eligible && (
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  onSelectFlightForSimulation(
                                    flight.flightCode.startsWith('AF 0022') ? 'long' : 'short',
                                    flight.flightCode
                                  );
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold apple-press transition cursor-pointer hover:bg-white/90"
                              >
                                Simuler {flight.compensation}
                              </button>
                            )}

                            {flight.eligible && (
                              <button
                                type="button"
                                onClick={() => handleOpenDraftPreview(flight)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white apple-press transition cursor-pointer"
                                title="Préparer et vérifier un brouillon (Simulation)"
                              >
                                <FileText className="w-4 h-4 text-[#43DDB0]" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Editable Draft Preview & Confirmation Modal */}
          {draftConfirmFlight && (
            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
              <div className="max-w-lg w-full apple-card border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4 my-auto">
                <div className="flex items-center gap-2.5 text-[#43DDB0]">
                  <Edit3 className="w-5 h-5" />
                  <h3 className="text-sm font-semibold text-white">
                    Relecture du brouillon (Simulation)
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-white/60 text-[11px] font-medium mb-1">
                      Destinataire :
                    </label>
                    <input
                      type="email"
                      value={draftRecipient}
                      onChange={(e) => setDraftRecipient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 text-[11px] font-medium mb-1">
                      Objet :
                    </label>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 text-[11px] font-medium mb-1">
                      Aperçu (Simulation) :
                    </label>
                    <textarea
                      rows={6}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/90 font-mono text-[11px] leading-relaxed resize-none focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setDraftConfirmFlight(null);
                    }}
                    disabled={isCreatingDraft}
                    className="px-4 py-1.5 rounded-full border border-white/15 text-xs text-white/70 hover:text-white apple-press transition cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCreateDraft}
                    disabled={isCreatingDraft}
                    className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold apple-press transition flex items-center gap-1.5 cursor-pointer hover:bg-white/90"
                  >
                    <span>{isCreatingDraft ? 'Création...' : 'Valider Simulation'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer notice */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Environnement de test sécurisé · Aucune donnée externe transmise</span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="text-white/60 hover:text-white apple-press cursor-pointer font-medium"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
