import React, { useState } from 'react';
import { FileUp, SearchCheck, Calculator, FileText, CalendarCheck, Sparkles, Check, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

export const SolutionSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Importer',
      desc: 'Glissez-déposez vos confirmations de réservation (PDF, e-mails). Aucun envoi vers un serveur externe : traitement 100% local en mémoire vive.',
      icon: FileUp,
      status: 'Analyseur local sécurisé',
    },
    {
      num: '02',
      title: 'Vérifier le vol',
      desc: 'Croisement des horaires officiels pour mesurer le retard exact à l’arrivée et détecter les annulations tardives soumises à indemnisation.',
      icon: SearchCheck,
      status: 'Vérification météo & DGAC',
    },
    {
      num: '03',
      title: 'Estimer le droit',
      desc: 'Application rigoureuse des barèmes européens CE 261/2004 : 250 €, 400 € ou 600 € selon la distance orthodromique calculée.',
      icon: Calculator,
      status: 'Calcul kilométrique précis',
    },
    {
      num: '04',
      title: 'Préparer la lettre',
      desc: 'Génération automatique d’une mise en demeure formelle avec références jurisprudentielles CJUE (arrêts Sturgeon, Wallentin-Hermann).',
      icon: FileText,
      status: 'Validation manuelle requise',
    },
    {
      num: '05',
      title: 'Suivre les délais',
      desc: 'Calendrier des délais légaux de réponse du transporteur (2 mois recommandés) et prescription nationale (5 ans en France).',
      icon: CalendarCheck,
      status: 'Dashboard de suivi local',
    },
  ];

  return (
    <section
      id="solution"
      className="py-28 bg-[#000000] text-[#F5F5F7] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-1/4 w-[600px] h-[550px] bg-[#30D158]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Apple Optical Typography */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#30D158] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            <span>03 — PARCOURS EN 5 ÉTAPES</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.03em] text-white mb-4">
            Cinq étapes simples. <span className="text-[#30D158]">Vous gardez le contrôle total.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-2xl font-normal">
            De la détection de vos billets à l'envoi de la lettre de réclamation, aucune démarche n'est initiée sans votre relecture et votre consentement exprès.
          </p>
        </div>

        {/* Apple Segmented Stepper */}
        <div className="flex flex-wrap gap-2 mb-10 pb-2 border-b border-white/[0.08]">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveStep(idx);
                }}
                className={`apple-press flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full text-xs font-body font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
                    : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                <span className="font-mono text-[11px] opacity-70">{s.num}</span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Details: Apple Bento Card with Mockup Tag */}
        <div className="apple-card p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#30D158] bg-[#30D158]/10 px-3 py-1 rounded-full border border-[#30D158]/20">
                  ÉTAPE {steps[activeStep].num} / 05
                </span>
                <span className="font-mono text-xs text-white/50">
                  {steps[activeStep].status}
                </span>
              </div>

              <h3 className="font-display font-semibold text-3xl sm:text-4xl text-white tracking-tight">
                {steps[activeStep].title}
              </h3>

              <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-xl font-normal">
                {steps[activeStep].desc}
              </p>

              <div className="pt-4 flex items-center gap-4 text-xs font-mono text-[#30D158]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Zéro serveur tiers
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Code Open Source
                </span>
              </div>
            </div>

            {/* Right Preview Card with Mandatory « Maquette » Badge */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-white/70 font-semibold uppercase">
                  Aperçu de l'interface
                </span>
                <span className="font-mono text-[11px] text-[#FF9F0A] bg-[#FF9F0A]/10 px-2.5 py-0.5 rounded-full border border-[#FF9F0A]/20">
                  « Maquette »
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs font-body">
                <div className="flex justify-between text-white/70">
                  <span>Traitement en cours :</span>
                  <span className="text-[#30D158] font-mono font-medium">100% Mémoire Vive</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Cryptographie :</span>
                  <span className="text-white font-mono">WebCrypto AES-GCM</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Validation humaine :</span>
                  <span className="text-[#FF9F0A] font-mono">Requise avant envoi</span>
                </div>
              </div>

              <p className="text-[11px] font-body text-white/40 leading-relaxed italic">
                * Les écrans ci-dessus sont des maquettes interactives destinées à calibrer l'expérience utilisateur de Rights Radar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
