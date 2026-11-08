import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  estimateFlightRights,
  generateClaimLetterTemplate,
  DisruptionType,
  FlightEstimationResult,
} from '../utils/rightsCalculator.ts';
import { SearchGroundingBadges, GroundingSource } from './SearchGroundingBadges.tsx';
import { X, Plane, Copy, Check, Save, Trash2, ShieldCheck, Search, Loader2, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

interface FlightSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  initialPreset?: 'short' | 'medium' | 'long' | null;
  initialFlightCode?: string | null;
}

interface SavedInspection {
  id: string;
  flightCode: string;
  route: string;
  delayHours: number;
  estimatedAmount: number;
  notes?: string;
}

export function FlightSimulatorModal({ isOpen, onClose, user, initialPreset, initialFlightCode }: FlightSimulatorModalProps) {
  const [flightCode, setFlightCode] = useState(initialFlightCode || 'AF 1234');
  const [departure, setDeparture] = useState('Paris-CDG');
  const [departureCountry, setDepartureCountry] = useState('FR');
  const [arrival, setArrival] = useState('Nice-NCE');
  const [arrivalCountry, setArrivalCountry] = useState('FR');
  const [distanceKm, setDistanceKm] = useState(700);
  const [delayHours, setDelayHours] = useState(3.5);
  const [disruptionType, setDisruptionType] = useState<DisruptionType>('delay');
  const [isEUOrUKCarrier, setIsEUOrUKCarrier] = useState(true);
  const [passengerName, setPassengerName] = useState(user?.displayName || '');
  const [bookingRef, setBookingRef] = useState('PNR-7890');
  const [airlineName, setAirlineName] = useState('Air France');
  const [flightDate, setFlightDate] = useState('2026-09-15');

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedInspections, setSavedInspections] = useState<SavedInspection[]>([]);

  // Search Grounding Live Verification States
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSummary, setLiveSummary] = useState<string | null>(null);
  const [disruptionAssessment, setDisruptionAssessment] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Calculate rights in real time using pure legal engine
  const estimation: FlightEstimationResult = estimateFlightRights({
    distanceKm,
    delayHours,
    disruptionType,
    departureCountry,
    arrivalCountry,
    isEUOrUKCarrier,
    flightDate,
  });

  const letterText = generateClaimLetterTemplate({
    passengerName,
    bookingRef,
    flightCode,
    departureAirport: departure,
    arrivalAirport: arrival,
    flightDate,
    delayHours,
    disruptionType,
    estimatedAmount: estimation.estimatedAmountEuro,
    airlineName,
  });

  // Load user's saved flight inspections if authenticated
  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchInspections = async () => {
      const path = 'inspections';
      try {
        const q = query(collection(db, path), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const list: SavedInspection[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            flightCode: data.flightCode || 'Vol',
            route: data.route || 'Trajet',
            delayHours: data.delayHours || 0,
            estimatedAmount: data.estimatedAmount || 0,
            notes: data.notes,
          });
        });
        setSavedInspections(list);
      } catch (err) {
        console.warn('Could not load saved inspections:', err);
      }
    };

    fetchInspections();
  }, [user, isOpen, saveSuccess]);

  const handleVerifyFlightSearch = async () => {
    soundEngine.playPing();
    setIsSearchingLive(true);
    setSearchError(null);
    setLiveSummary(null);
    setGroundingSources([]);

    try {
      const res = await fetch('/api/verify-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightCode,
          flightDate,
          departure,
          arrival,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la vérification de vol.');
      }

      const data = await res.json();
      setLiveSummary(data.summary || 'Vérification effectuée.');
      setDisruptionAssessment(data.disruptionAssessment || 'potentially_compensable');
      setGroundingSources(data.groundingSources || []);
    } catch (err: any) {
      console.warn('[FlightSimulatorModal] Info vérification:', err?.message || err);
      setSearchError('Service de recherche temporairement indisponible.');
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleCopyLetter = async () => {
    soundEngine.playClick();
    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!user) {
      alert('Veuillez vous connecter avec Google pour synchroniser vos analyses sur votre profil.');
      return;
    }
    soundEngine.playClick();
    setIsSaving(true);
    const path = 'inspections';
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        flightCode: flightCode.trim(),
        route: `${departure} → ${arrival}`,
        departureDate: flightDate,
        disruptionType,
        delayHours,
        estimatedAmount: estimation.estimatedAmountEuro,
        notes: liveSummary
          ? `Analyse Google Search : ${liveSummary.slice(0, 300)}`
          : `Simulation : ${estimation.qualificationText}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.warn('[FlightSimulatorModal] Info sauvegarde Firestore:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch (e) {
        alert("Erreur lors de l'enregistrement. Veuillez vérifier votre connexion.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    soundEngine.playClick();
    const path = 'inspections';
    try {
      await deleteDoc(doc(db, path, id));
      setSavedInspections((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.warn('[FlightSimulatorModal] Info suppression Firestore:', err);
    }
  };

  const loadPreset = (preset: 'short' | 'medium' | 'long') => {
    soundEngine.playTick();
    setLiveSummary(null);
    setGroundingSources([]);
    if (preset === 'short') {
      setFlightCode('AF 1234');
      setDeparture('Paris-CDG');
      setDepartureCountry('FR');
      setArrival('Nice-NCE');
      setArrivalCountry('FR');
      setDistanceKm(700);
      setDelayHours(3.5);
      setIsEUOrUKCarrier(true);
      setAirlineName('Air France');
    } else if (preset === 'medium') {
      setFlightCode('AF 1032');
      setDeparture('Paris-CDG');
      setDepartureCountry('FR');
      setArrival('Athènes-ATH');
      setArrivalCountry('GR');
      setDistanceKm(2100);
      setDelayHours(4);
      setIsEUOrUKCarrier(true);
      setAirlineName('Air France');
    } else {
      setFlightCode('AF 0022');
      setDeparture('Paris-CDG');
      setDepartureCountry('FR');
      setArrival('New York-JFK');
      setArrivalCountry('US');
      setDistanceKm(5840);
      setDelayHours(4.5);
      setIsEUOrUKCarrier(true);
      setAirlineName('Air France');
    }
  };

  useEffect(() => {
    if (isOpen && initialPreset) {
      loadPreset(initialPreset);
    }
    if (isOpen && initialFlightCode) {
      setFlightCode(initialFlightCode);
    }
  }, [isOpen, initialPreset, initialFlightCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Simulateur d'estimation de vol"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="apple-card border border-white/10 text-[#F5F5F7] rounded-[28px] max-w-4xl w-full p-6 sm:p-8 shadow-2xl my-auto max-h-[92vh] overflow-y-auto relative">
        {/* Apple Sheet Grab Handle */}
        <div className="apple-sheet-handle mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-[#43DDB0] flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Simulateur de vol & Préparation de dossier
              </h2>
              <span className="text-xs text-white/50 font-normal">
                Calculateur CE 261/2004 · Analyse de portée géographique
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Fermer la simulation"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center apple-press transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Segmented Bar */}
        <div className="mb-6">
          <span className="text-xs text-white/60 block mb-2 font-medium">Exemples types :</span>
          <div className="apple-segmented-group p-1 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => loadPreset('short')}
              className="apple-segmented-item text-xs apple-press cursor-pointer flex-1 min-w-[140px]"
            >
              Court-courrier (≤ 1 500 km · 250 €)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('medium')}
              className="apple-segmented-item text-xs apple-press cursor-pointer flex-1 min-w-[140px]"
            >
              Moyen-courrier intra-UE (&gt; 1 500 km · 400 €)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('long')}
              className="apple-segmented-item text-xs apple-press cursor-pointer flex-1 min-w-[140px]"
            >
              Long-courrier (&gt; 3 500 km · 600 €)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
          {/* Flight Input Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Vol</label>
                <input
                  type="text"
                  value={flightCode}
                  onChange={(e) => setFlightCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Date du vol</label>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Départ (ex: CDG)</label>
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Arrivée (ex: JFK)</label>
                <input
                  type="text"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Pays départ (ISO)</label>
                <input
                  type="text"
                  value={departureCountry}
                  onChange={(e) => setDepartureCountry(e.target.value.toUpperCase())}
                  placeholder="FR, US, GB"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Pays arrivée (ISO)</label>
                <input
                  type="text"
                  value={arrivalCountry}
                  onChange={(e) => setArrivalCountry(e.target.value.toUpperCase())}
                  placeholder="FR, US, GB"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Type d'incident</label>
                <select
                  value={disruptionType}
                  onChange={(e) => setDisruptionType(e.target.value as DisruptionType)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="delay" className="bg-[#1C1C1E] text-white">Retard à l'arrivée</option>
                  <option value="cancellation" className="bg-[#1C1C1E] text-white">Vol annulé</option>
                  <option value="denied_boarding" className="bg-[#1C1C1E] text-white">Surbooking / Refus d'embarquement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">Compagnie UE/UK ?</label>
                <select
                  value={isEUOrUKCarrier ? 'yes' : 'no'}
                  onChange={(e) => setIsEUOrUKCarrier(e.target.value === 'yes')}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="yes" className="bg-[#1C1C1E] text-white">Oui (Air France, Lufthansa...)</option>
                  <option value="no" className="bg-[#1C1C1E] text-white">Non (Delta, Emirates...)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">
                  Distance ({Math.round(distanceKm)} km)
                </label>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1 font-medium">
                  Retard ({delayHours} h)
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={delayHours}
                  onChange={(e) => setDelayHours(Number(e.target.value))}
                  className="w-full accent-[#43DDB0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1 font-medium">Compagnie aérienne</label>
              <input
                type="text"
                value={airlineName}
                onChange={(e) => setAirlineName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Google Search Verification Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleVerifyFlightSearch}
                disabled={isSearchingLive}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white apple-press transition cursor-pointer font-medium"
              >
                {isSearchingLive ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#43DDB0]" />
                    <span>Recherche des bulletins officiels et incidents...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 text-[#43DDB0]" />
                    <span>Rechercher les incidents associés à ce vol (Google Search)</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Google Search Result Box */}
            {liveSummary && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#43DDB0]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#43DDB0] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recherche d'actualité en direct
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      disruptionAssessment === 'extraordinary_circumstance'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {disruptionAssessment === 'extraordinary_circumstance'
                      ? 'Circonstance extraordinaire citée'
                      : disruptionAssessment === 'verification_unavailable'
                      ? 'Recherche non disponible'
                      : "Analyse d'incidents effectuée"}
                  </span>
                </div>
                <p className="text-xs text-white/85 leading-relaxed">
                  {liveSummary}
                </p>
                {groundingSources.length > 0 && (
                  <SearchGroundingBadges sources={groundingSources} />
                )}
              </div>
            )}

            {searchError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {searchError}
              </div>
            )}

            {/* Result Estimate Card */}
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-white/70 font-medium">Indemnité forfaitaire estimée :</span>
                <span className="text-3xl font-semibold tracking-tight text-[#43DDB0]">
                  {estimation.estimatedAmountEuro} €
                </span>
              </div>
              <div className="text-xs text-white/80 leading-snug">
                {estimation.qualificationText}
              </div>
              <div className="text-[11px] text-amber-300/90 leading-snug">
                Portée géographique : {estimation.scopeExplanation}
              </div>
              <div className="text-[10px] text-white/50 pt-2 border-t border-white/10">
                Fondement : {estimation.legalBasis} · Prescription : {estimation.prescriptionExplanation}
              </div>
            </div>
          </div>

          {/* Letter Draft Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80 font-medium">Courrier de réclamation généré</span>
              <button
                type="button"
                onClick={handleCopyLetter}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white apple-press transition cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#43DDB0]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier la lettre'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={letterText}
              rows={12}
              className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-[11px] text-white/80 leading-relaxed focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={handleSaveToFirestore}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold apple-press transition cursor-pointer hover:bg-white/90"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveSuccess ? 'Enregistré dans Firestore !' : isSaving ? 'Enregistrement...' : 'Enregistrer sur mon profil'}</span>
                </button>
              ) : (
                <div className="text-xs text-white/50">
                  Connectez-vous avec Google pour enregistrer vos analyses.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User's Persisted Flights in Firestore */}
        {user && savedInspections.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-base font-semibold text-white mb-3">
              Vos vols enregistrés dans votre radar personnel (Firestore)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {savedInspections.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#43DDB0]">{item.flightCode}</div>
                    <div className="text-white/70">{item.route}</div>
                    <div className="text-[11px] text-white/40">~{item.estimatedAmount} € estimé</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(item.id)}
                    title="Supprimer cette analyse"
                    className="p-1.5 hover:text-red-400 text-white/40 apple-press transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#43DDB0] shrink-0" />
          <span>
            Rights Radar ne transmet aucun courrier à votre place sans votre validation explicite. Vous conservez la pleine maîtrise de l'envoi.
          </span>
        </div>
      </div>
    </div>
  );
}
