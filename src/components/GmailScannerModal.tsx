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

    const subject = `Mise en demeure d’indemnisation CE 261/2004 — Vol ${flight.flightCode}`;
    const body = generateClaimLetterTemplate({
      passengerName: user?.displayName || 'Passager titulaire',
      flightCode: flight.flightCode,
      departureAirport: flight.route.split(' > ')[0] || 'Aéroport de départ',
      arrivalAirport: flight.route.split(' > ')[1] || 'Aéroport d’arrivée',
      flightDate: flight.date,
      delayHours: flight.delayHours || 3.5,
      estimatedAmount: parseInt(flight.compensation, 10) || 250,
      airlineName: flight.airline,
    });

    setDraftRecipient(defaultRecipient);
    setDraftSubject(subject);
    setDraftBody(body);
  };

  const handleConfirmCreateDraft = async () => {
    if (!draftConfirmFlight || !token) return;
    setIsCreatingDraft(true);
    soundEngine.playClick();

    try {
      const res = await createGmailClaimDraft(token, draftRecipient, draftSubject, draftBody);
      setDraftSuccessMsg(`Simulation réussie : Brouillon "${res.draftId}" créé dans l'inbox virtuel !`);
      soundEngine.playPing();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la simulation de création de brouillon.');
    } finally {
      setIsCreatingDraft(false);
      setDraftConfirmFlight(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-3xl bg-[#080E18] border border-white/20 rounded-2xl shadow-2xl p-6 text-white scanlines relative max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-[#43DDB0]/20 text-[#43DDB0] border border-white/15">
                <Beaker className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-display text-lg tracking-wide text-white flex items-center gap-2">
                  <span>Scanner de Réservations (Mode Démo)</span>
                  <span className="text-[10px] font-code px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase font-semibold">
                    SIMULATION LOCALE
                  </span>
                </h2>
                <p className="text-xs font-body text-white/60">
                  Découvrez comment Rights Radar analyse vos e-billets sans jamais accéder à vos données réelles.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Messages */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {draftSuccessMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{draftSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setDraftSuccessMsg(null)}
                className="text-white/60 hover:text-white"
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
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-[#43DDB0]">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-base text-white mb-2">
                    Lancez une simulation d'analyse
                  </h3>
                  <p className="font-body text-xs text-white/65 leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour explorer une boîte de réception fictive contenant des scénarios de vol réels (retards, annulations, grèves). 
                    <br/><br/>
                    <strong className="text-amber-400">Aucune connexion à votre compte Google n'est requise.</strong>
                  </p>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#43DDB0] hover:bg-[#38c29b] text-black font-bold text-sm shadow-lg transition active:scale-95 cursor-pointer group"
                  >
                    <Mail className="w-5 h-5 group-hover:animate-bounce" />
                    <span>Explorer l'Inbox Démo</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] font-code text-amber-400/80">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Données 100% fictives générées localement</span>
                </div>
              </div>
            ) : (
              /* Connected State */
              <div className="space-y-5">
                {/* User Info Bar */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-code text-xs border border-amber-500/30">
                      D
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {user.displayName}
                      </div>
                      <div className="text-[11px] font-code text-amber-400/60">
                        Compte de Simulation Actif
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScanInbox(token || '')}
                      disabled={isScanning}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-white text-xs font-code text-white transition cursor-pointer"
                    >
                      <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>{isScanning ? 'Scan en cours...' : 'Réinitialiser la démo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="p-1.5 rounded-full text-white/50 hover:text-red-400 hover:bg-white/5 transition"
                      title="Quitter la démo"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scan Results */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-code text-white/60 uppercase tracking-wider">
                      Vols détectés dans l'Inbox Démo ({detectedFlights.length})
                    </span>
                    <span className="text-[10px] font-code text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      SIMULATEUR RADAR
                    </span>
                  </div>

                  {isScanning ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-[#43DDB0]/20 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-t-[#43DDB0] animate-spin"></div>
                        <Search className="absolute inset-0 m-auto w-6 h-6 text-[#43DDB0]" />
                      </div>
                      <p className="text-xs font-code text-white/60 animate-pulse">Analyse des en-têtes et métadonnées fictives...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detectedFlights.map((flight) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={flight.id}
                          className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#43DDB0]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-code text-xs font-bold text-white">
                                {flight.flightCode}
                              </span>
                              <span className="text-[11px] font-body text-white/60">
                                · {flight.airline}
                              </span>
                              <span className={`text-[10px] font-code px-2 py-0.5 rounded border ${
                                flight.eligible
                                  ? 'bg-[#43DDB0]/15 text-[#43DDB0] border-[#43DDB0]/30 font-bold'
                                  : 'bg-white/5 text-white/40 border-white/10'
                              }`}>
                                {flight.eligible ? `${flight.compensation} estimés` : 'Non-éligible'}
                              </span>
                            </div>

                            <div className="text-xs font-medium text-white/90 group-hover:text-[#43DDB0] transition-colors">
                              {flight.subject}
                            </div>

                            <div className="text-[11px] font-body text-white/50 line-clamp-1">
                              {flight.snippet}
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <div className="text-[10px] font-code text-amber-400/80">
                                {flight.delayText}
                              </div>
                              <div className="text-[10px] font-code text-white/30">
                                Date : {flight.date}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                onClose();
                                onSelectFlightForSimulation(flight.preset, flight.flightCode);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-code font-semibold transition active:scale-95 shadow cursor-pointer"
                            >
                              <span>Simuler</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            {flight.eligible && (
                              <button
                                type="button"
                                onClick={() => handleOpenDraftPreview(flight)}
                                className="p-1.5 rounded-full border border-white/20 hover:border-[#43DDB0] text-white/70 hover:text-white transition cursor-pointer"
                                title="Préparer et vérifier un brouillon (Simulation)"
                              >
                                <FileText className="w-4 h-4 text-[#43DDB0]" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Editable Draft Preview & Confirmation Modal */}
          {draftConfirmFlight && (
            <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
              <div className="max-w-lg w-full bg-[#0E1522] border border-[#43DDB0]/40 rounded-2xl p-5 shadow-2xl text-white space-y-4 my-auto">
                <div className="flex items-center gap-2.5 text-[#43DDB0]">
                  <Edit3 className="w-5 h-5" />
                  <h3 className="font-display text-sm font-semibold">
                    Relecture du brouillon (Simulation)
                  </h3>
                </div>

                <div className="space-y-3 font-code text-xs">
                  <div>
                    <label className="block text-white/50 text-[10px] uppercase mb-1">
                      Destinataire :
                    </label>
                    <input
                      type="email"
                      value={draftRecipient}
                      onChange={(e) => setDraftRecipient(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#43DDB0]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 text-[10px] uppercase mb-1">
                      Objet :
                    </label>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#43DDB0]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 text-[10px] uppercase mb-1">
                      Aperçu (Simulation) :
                    </label>
                    <textarea
                      rows={6}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/20 text-white/90 font-mono text-[11px] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#43DDB0]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDraftConfirmFlight(null)}
                    disabled={isCreatingDraft}
                    className="px-4 py-1.5 rounded-full border border-white/20 text-xs font-code text-white/70 hover:text-white transition cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCreateDraft}
                    disabled={isCreatingDraft}
                    className="px-4 py-1.5 rounded-full bg-[#43DDB0] hover:bg-[#38c29b] text-black font-code text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isCreatingDraft ? 'Création...' : 'Valider Simulation'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer notice */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-code text-white/50 shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Environnement de test sécurisé · Aucune donnée externe transmise</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

