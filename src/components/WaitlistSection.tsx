import React, { useState } from 'react';
import { submitWaitlist } from '../utils/waitlist';
import { UsageFrequency, WaitlistPayload } from '../types';
import { Users, Scale, Tag, Send, CheckCircle, AlertCircle, Loader2, Plane, Clock, Shield, Sparkles, MessageSquare } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [usageFrequency, setUsageFrequency] = useState<UsageFrequency | ''>('');

  // Extended questions
  const [pastDisruptions, setPastDisruptions] = useState<string[]>([]);
  const [pastClaimExperience, setPastClaimExperience] = useState<string>('');
  const [frequentAirlines, setFrequentAirlines] = useState<string[]>([]);
  const [annualFlightCount, setAnnualFlightCount] = useState<string>('3-6');
  const [preferredFeature, setPreferredFeature] = useState<string>('local_detection');
  const [preferredPricingModel, setPreferredPricingModel] = useState<string>('flat_fee_9_14');
  const [feedbackOrFrustration, setFeedbackOrFrustration] = useState<string>('');

  const [interestTypes, setInterestTypes] = useState({
    userResearch: true,
    legalSupport: false,
    pricingFeedback: false,
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const toggleDisruption = (val: string) => {
    soundEngine.playTick();
    setPastDisruptions((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleAirline = (name: string) => {
    soundEngine.playTick();
    setFrequentAirlines((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();

    if (!usageFrequency) {
      setStatus('error');
      setMessage('Veuillez indiquer comment vous envisagez d’utiliser l’outil.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const payload: WaitlistPayload = {
      email,
      usageFrequency: usageFrequency as UsageFrequency,
      interestTypes,
      pastDisruptions,
      pastClaimExperience,
      frequentAirlines,
      annualFlightCount,
      preferredFeature,
      preferredPricingModel,
      feedbackOrFrustration: feedbackOrFrustration.trim() || undefined,
    };

    const res = await submitWaitlist(payload);

    if (res.success) {
      soundEngine.playPing();
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } else {
      setStatus('error');
      setMessage(res.message);
    }
  };

  return (
    <section
      id="inscription"
      className="py-28 bg-[#000000] text-[#F5F5F7] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-[600px] h-[550px] bg-[#30D158]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Apple Optical Typography */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#30D158] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            <span>07 — ENQUÊTE PASSAGERS & LISTE D'ATTENTE</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.03em] text-white mb-4">
            Pour faire progresser Rights Radar, <span className="text-[#30D158]">nous recherchons des participants.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-2xl font-normal">
            Partagez vos habitudes de voyage et vos expériences passées pour co-concevoir un outil indépendant, 100% respectueux de la vie privée et sans commission abusive.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Why participate & Commitments */}
          <div className="lg:col-span-4 space-y-4">
            <div className="apple-card p-6 rounded-3xl space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-[#30D158]/15 text-[#30D158]">
                  <Users className="w-5 h-5 text-[#30D158]" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white">1. Recherche utilisateurs</h3>
              </div>
              <p className="font-body text-sm text-[#86868B] leading-relaxed font-normal">
                Tester nos maquettes interactives en avant-première et nous aider à calibrer la détection automatique de vos vols.
              </p>
            </div>

            <div className="apple-card p-6 rounded-3xl space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-[#FF9F0A]/15 text-[#FF9F0A]">
                  <Scale className="w-5 h-5 text-[#FF9F0A]" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white">2. Relecture juridique</h3>
              </div>
              <p className="font-body text-sm text-[#86868B] leading-relaxed font-normal">
                Avocats, juristes en droit des transports ou voyageurs réguliers souhaitant relire et valider nos modèles de mise en demeure.
              </p>
            </div>

            <div className="apple-card p-6 rounded-3xl space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-[#64D2FF]/15 text-[#64D2FF]">
                  <Tag className="w-5 h-5 text-[#64D2FF]" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white">3. Éthique tarifaire</h3>
              </div>
              <p className="font-body text-sm text-[#86868B] leading-relaxed font-normal">
                Aidez-nous à valider le modèle d'un forfait fixe accessible (9 € à 14 €) en rupture avec les 35% à 50% des intermédiaires commerciaux.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#30D158]/10 border border-[#30D158]/25 text-white space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-[#30D158] uppercase tracking-wider font-semibold">
                <Shield className="w-4 h-4" />
                <span>Zéro revente de données</span>
              </div>
              <p className="font-body text-xs text-white/70 leading-relaxed font-normal">
                Vos réponses sont confidentielles et servent exclusivement à orienter les priorités de développement de Rights Radar. Aucun démarchage commercial.
              </p>
            </div>
          </div>

          {/* Right Column: Apple Form */}
          <div className="lg:col-span-8 apple-card p-6 sm:p-10 rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Title */}
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#30D158] font-semibold block mb-1">
                  Enquête Passagers • Accès Anticipé
                </span>
                <h3 className="font-display font-semibold text-2xl sm:text-3xl text-white">
                  Rejoindre la liste d'attente
                </h3>
              </div>

              {/* Question 1: Email */}
              <div className="space-y-2">
                <label htmlFor="waitlist-email" className="block text-xs font-mono uppercase tracking-wider text-white/80">
                  1. Votre adresse e-mail <span className="text-[#30D158]">*</span>
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.fr"
                  className="w-full apple-input"
                />
              </div>

              {/* Question 2: Usage Frequency */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/80">
                  2. Comment envisagez-vous d'utiliser l'outil ? <span className="text-[#30D158]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-body text-sm">
                  {[
                    { id: 'once', label: 'Une seule fois (vol spécifique)' },
                    { id: 'multiple', label: 'Plusieurs fois par an' },
                    { id: 'unknown', label: 'Je ne sais pas encore' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => {
                        soundEngine.playTick();
                        setUsageFrequency(opt.id as UsageFrequency);
                      }}
                      className={`apple-press text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
                        usageFrequency === opt.id
                          ? 'bg-[#30D158]/15 border-[#30D158] text-[#30D158] shadow-[0_0_15px_rgba(48,209,88,0.15)] font-semibold'
                          : 'bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Perturbations subies récemment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/80">
                    3. Avez-vous subi l'une de ces perturbations au cours des 5 dernières années ?
                  </label>
                  <span className="text-[11px] font-mono text-white/40">Choix multiple</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body text-xs">
                  {[
                    { id: 'delay_3h', label: 'Retard de vol > 3 heures à l’arrivée' },
                    { id: 'cancellation', label: 'Vol annulé moins de 14 jours avant' },
                    { id: 'missed_conn', label: 'Correspondance manquée suite à un retard' },
                    { id: 'denied_boarding', label: 'Refus d’embarquement (surbooking)' },
                    { id: 'lost_luggage', label: 'Bagage retardé, détérioré ou perdu' },
                    { id: 'none', label: 'Aucune perturbation jusqu’à présent' },
                  ].map((item) => {
                    const isSelected = pastDisruptions.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleDisruption(item.id)}
                        className={`apple-press text-left p-3 rounded-2xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#30D158]/15 border-[#30D158] text-[#30D158] font-semibold'
                            : 'bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25'
                        }`}
                      >
                        <span className="mr-2 font-bold">{isSelected ? '✓' : '+'}</span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 4: Expérience passée */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/80">
                  4. Avez-vous déjà tenté de demander une indemnité auprès d'une compagnie ?
                </label>
                <div className="space-y-2 font-body text-xs">
                  {[
                    { id: 'abandoned', label: 'Non, j’ai abandonné face à la complexité ou au manque de temps' },
                    { id: 'rejected', label: 'Oui, mais la compagnie a rejeté ou invoqué des "circonstances extraordinaires"' },
                    { id: 'agency', label: 'Oui, via un intermédiaire commercial qui a prélevé 35 % à 50 % de commission' },
                    { id: 'success_solo', label: 'Oui, j’ai réussi seul après de multiples démarches' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => {
                        soundEngine.playTick();
                        setPastClaimExperience(opt.id);
                      }}
                      className={`apple-press w-full text-left p-3 rounded-2xl border transition-all ${
                        pastClaimExperience === opt.id
                          ? 'bg-[#30D158]/15 border-[#30D158] text-[#30D158] font-semibold'
                          : 'bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 5: Compagnies aériennes régulières */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/80">
                    5. Quelles compagnies aériennes empruntez-vous le plus souvent ?
                  </label>
                  <span className="text-[11px] font-mono text-white/40">Sélectionnez</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Air France / KLM',
                    'easyJet',
                    'Ryanair',
                    'Transavia',
                    'Lufthansa Group',
                    'Vueling / Iberia',
                    'British Airways',
                    'Vols internationaux / Long-courrier',
                  ].map((airline) => {
                    const isSelected = frequentAirlines.includes(airline);
                    return (
                      <button
                        type="button"
                        key={airline}
                        onClick={() => toggleAirline(airline)}
                        className={`apple-press px-3.5 py-1.5 rounded-full text-xs font-body transition-all ${
                          isSelected
                            ? 'bg-[#30D158] text-black font-semibold shadow-sm'
                            : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12] border border-white/10'
                        }`}
                      >
                        {airline} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 6: Fonctionnalité prioritaire */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/80">
                  6. Quelle fonctionnalité vous paraît la plus utile pour Rights Radar ?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-body text-xs">
                  {[
                    {
                      id: 'local_detection',
                      title: 'Détection 100% locale',
                      desc: 'Scanner mes emails et billets sans qu’aucune donnée ne quitte mon appareil.',
                    },
                    {
                      id: 'instant_calculator',
                      title: 'Calculateur CE 261/2004',
                      desc: 'Estimer en 1 clic les 250 €, 400 € ou 600 € selon la distance et le retard.',
                    },
                    {
                      id: 'legal_demand_letter',
                      title: 'Mise en demeure prête à l’emploi',
                      desc: 'Générer la lettre officielle avec les articles de loi et la jurisprudence CJUE.',
                    },
                    {
                      id: 'prescription_alert',
                      title: 'Surveillance de prescription',
                      desc: 'Alerte pour réclamer sur les vols des 5 dernières années avant expiration.',
                    },
                  ].map((feat) => (
                    <button
                      type="button"
                      key={feat.id}
                      onClick={() => {
                        soundEngine.playTick();
                        setPreferredFeature(feat.id);
                      }}
                      className={`apple-press text-left p-3.5 rounded-2xl border transition-all ${
                        preferredFeature === feat.id
                          ? 'bg-[#30D158]/15 border-[#30D158] text-white font-semibold'
                          : 'bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      <div className="font-semibold text-white mb-1">{feat.title}</div>
                      <div className="text-[11px] text-white/50 leading-relaxed">{feat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 7: Modèle tarifaire préféré */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/80">
                  7. Quel modèle de tarification vous semble le plus juste ?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-body text-xs">
                  {[
                    {
                      id: 'flat_fee_9_14',
                      label: 'Forfait fixe 9 € - 14 €',
                      desc: '0 % de commission prélevée sur votre indemnité.',
                    },
                    {
                      id: 'annual_pass',
                      label: 'Pass Annuel illimité (29 €)',
                      desc: 'Pour les voyageurs réguliers et familles.',
                    },
                    {
                      id: 'free_basic_premium_dossier',
                      label: 'Audit gratuit + Option dossier',
                      desc: 'Vérification gratuite, paiement si dossier juridique généré.',
                    },
                  ].map((pricing) => (
                    <button
                      type="button"
                      key={pricing.id}
                      onClick={() => {
                        soundEngine.playTick();
                        setPreferredPricingModel(pricing.id);
                      }}
                      className={`apple-press text-left p-3.5 rounded-2xl border transition-all ${
                        preferredPricingModel === pricing.id
                          ? 'bg-[#30D158]/15 border-[#30D158] text-white font-semibold'
                          : 'bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      <div className="font-semibold text-white mb-1">{pricing.label}</div>
                      <div className="text-[11px] text-white/50 leading-tight">{pricing.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 8: Commentaire libre */}
              <div className="space-y-2">
                <label htmlFor="waitlist-feedback" className="block text-xs font-mono uppercase tracking-wider text-white/80">
                  8. Avez-vous une frustration particulière ou une suggestion à nous faire ? (Optionnel)
                </label>
                <textarea
                  id="waitlist-feedback"
                  rows={3}
                  value={feedbackOrFrustration}
                  onChange={(e) => setFeedbackOrFrustration(e.target.value)}
                  placeholder="Ex : Air France m'a répondu 4 mois plus tard en invoquant la météo..."
                  className="w-full apple-input resize-none"
                />
              </div>

              {/* Consent and Privacy */}
              <p className="text-xs font-body text-white/50 leading-relaxed">
                En soumettant ce formulaire, vous acceptez de recevoir des nouvelles sur le lancement de Rights Radar. Vos réponses sont strictement confidentielles et ne seront jamais partagées avec des tiers ni des compagnies aériennes.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="apple-press w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-neutral-100 text-black font-body text-sm font-semibold disabled:opacity-50 transition active:scale-[0.98] shadow-[0_4px_24px_rgba(255,255,255,0.2)]"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer mes réponses & m'inscrire sur la liste d'attente</span>
                    <Send className="w-4 h-4 text-black" />
                  </>
                )}
              </button>

              {/* Feedback Live Region */}
              <div aria-live="polite" className="pt-2">
                {status === 'success' && (
                  <div className="p-4 rounded-2xl bg-[#30D158]/15 border border-[#30D158] text-[#30D158] text-sm font-body flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-2xl bg-[#FF9F0A]/15 border border-[#FF9F0A] text-[#FF9F0A] text-sm font-body flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
