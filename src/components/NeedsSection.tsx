import React from 'react';
import { DollarSign, Zap, Sliders, Lock, ArrowUpRight } from 'lucide-react';

export const NeedsSection: React.FC = () => {
  const needs = [
    {
      icon: DollarSign,
      title: 'Clarté absolue du prix',
      tag: '01 // PRIX TRANSPARENT',
      desc: 'Un modèle forfaitaire connu avant toute démarche, évitant d’abandonner 35 % à 50 % de son indemnisation pour un simple courrier.',
    },
    {
      icon: Zap,
      title: 'Rapidité d’analyse en direct',
      tag: '02 // INSTANTANÉITÉ',
      desc: 'Savoir en quelques secondes si un vol perturbé est susceptible d’ouvrir un droit selon la réglementation européenne consolidée.',
    },
    {
      icon: Sliders,
      title: 'Maintien du contrôle direct',
      tag: '03 // SOUVERAINETÉ',
      desc: 'Vous relisez chaque mot de la lettre de réclamation, choisissez votre canal d’envoi et conservez le lien direct avec la compagnie.',
    },
    {
      icon: Lock,
      title: 'Confidentialité inviolable',
      tag: '04 // LOCAL-FIRST',
      desc: 'Aucune transmission de boîtes e-mail entières, aucune revente de données personnelles à des annonceurs ou comparateurs de billets.',
    },
  ];

  return (
    <section
      id="besoins"
      className="py-28 bg-[#000000] text-[#F5F5F7] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-0 w-[550px] h-[550px] bg-[#64D2FF]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Apple Optical Typography */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#64D2FF] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64D2FF]" />
            <span>06 — ATTENTES & BESOINS IDENTIFIÉS</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.03em] text-white mb-4">
            Prix transparents, rapidité, <span className="text-[#64D2FF]">contrôle et intimité numérique.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-2xl font-normal">
            Les quatre attentes fondamentales exprimées par les voyageurs réguliers pour reprendre le pouvoir face aux compagnies aériennes.
          </p>
        </div>

        {/* 2x2 Apple Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {needs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="apple-card p-8 sm:p-10 rounded-3xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#64D2FF] group-hover:scale-105 group-hover:bg-[#64D2FF]/15 transition-all">
                      <Icon className="w-6 h-6 text-[#64D2FF]" />
                    </div>
                    <span className="font-mono text-xs text-white/40 tracking-wider">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-2xl text-white mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="font-body text-base text-[#86868B] leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-body text-white/40">
                  <span>Exigence voyageur</span>
                  <ArrowUpRight className="w-4 h-4 text-[#64D2FF] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
