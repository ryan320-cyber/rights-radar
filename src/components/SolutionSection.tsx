import React, { useState } from 'react';
import { FileUp, SearchCheck, Calculator, FileText, CalendarCheck, Sparkles, Check, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

export const SolutionSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Importer',
      desc: 'Glissez-déposez vos confirmations de réservation (PDF, e-mails). Aucun envoi vers un serveur externe, traitement 100% local.',
      icon: FileUp,
      status: 'Analyseur local sécurisé',
    },
    {
      num: '02',
      title: 'Vérifier le vol',
      desc: 'Croisement des horaires officiels pour mesurer le retard exact à l’arrivée et détecter les annulations tardives.',
      icon: SearchCheck,
      status: 'Vérification météo & DGAC',
    },
    {
      num: '03',
      title: 'Estimer le droit',
      desc: 'Application rigoureuse des barèmes européens CE 261/2004 : 250 €, 400 € ou 600 € selon la distance orthodromique.',
      icon: Calculator,
      status: 'Calcul kilométrique précis',
    },
    {
      num: '04',
      title: 'Préparer la lettre',
      desc: 'Génération automatique d’une mise en demeure formelle avec références jurisprudentielles (Sturgeon, Wallentin-Hermann).',
      icon: FileText,
      status: 'Validation manuelle requise',
    },
    {
      num: '05',
      title: 'Suivre les délais',
      desc: 'Calendrier des délais légaux de réponse de la compagnie (2 mois recommandés) et prescription nationale (5 ans en France).',
      icon: CalendarCheck,
      status: 'Dashboard de suivi local',
    },
  ];

  return (
    <section
      id="solution"
      className="py-24 bg-[#03070E] text-[#F4F4F6] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-1/4 w-[600px] h-[500px] bg-[#43DDB0]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#43DDB0]">
              03 — Fonctionnement en 5 Étapes
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mb-4">
            Cinq étapes simples. <span className="italic text-[#43DDB0]">Vous gardez le contrôle total.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#94A3B8] leading-relaxed font-light">
            De la détection de vos billets à l'envoi de la lettre de réclamation, aucune démarche n'est initiée sans votre relecture et votre consentement exprès.
          </p>
        </div>

        {/* 5 Step Connected Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative mb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.num}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveStep(idx);
                }}
                className={`glass-panel glass-panel-hover p-6 rounded-2xl cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                  isSelected ? 'border-[#43DDB0] bg-white/[0.06] shadow-[0_0_30px_rgba(67,221,176,0.15)]' : ''
                }`}
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold text-[#43DDB0] tracking-wider">
                      {step.num}
                    </span>
                    <div className={`p-2 rounded-xl transition ${isSelected ? 'bg-[#43DDB0] text-black' : 'bg-white/[0.04] text-[#43DDB0]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl text-white mb-2 font-normal">
                    {step.title}
                  </h3>

                  <p className="font-sans text-xs text-[#94A3B8] leading-relaxed font-light mb-4">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/40 uppercase">
                    {step.status}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-[#FFB340] border border-[#FFB340]/20">
                    Maquette
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Detailed Terminal View */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-pulse" />
              <span className="font-mono text-xs text-[#43DDB0] uppercase tracking-wider">
                Étape {steps[activeStep].num} // {steps[activeStep].title}
              </span>
            </div>
            <p className="font-sans text-sm text-white/80 font-light max-w-2xl">
              {steps[activeStep].desc} Chaque action est soumise à votre validation préalable sur votre machine.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-white/50">
              Étape {activeStep + 1} sur 5
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveStep((prev) => (prev + 1) % steps.length);
              }}
              className="px-4 py-2 rounded-full bg-[#43DDB0] text-black font-mono text-xs font-semibold hover:bg-neutral-200 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Étape suivante</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
