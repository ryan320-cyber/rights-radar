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
      className="py-24 bg-[#020408] text-[#F4F4F6] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-0 w-[550px] h-[500px] bg-[#00F0FF]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#43DDB0]">
              06 — Attentes & Besoins Identifiés
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mb-4">
            Prix transparents, rapidité, <span className="italic text-[#43DDB0]">contrôle et intimité numérique.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#94A3B8] leading-relaxed font-light">
            Les quatre attentes fondamentales exprimées par les voyageurs réguliers pour reprendre le pouvoir face aux compagnies aériennes.
          </p>
        </div>

        {/* 2x2 Grid with Lusion Iridescent Glass Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {needs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover p-8 sm:p-10 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-[11px] text-[#43DDB0] tracking-wider uppercase">
                      {item.tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#43DDB0] group-hover:scale-110 group-hover:bg-[#43DDB0] group-hover:text-black transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl text-white mb-3 font-normal">
                    {item.title}
                  </h3>

                  <p className="font-sans text-sm text-[#94A3B8] leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-white/40">
                  <span>EXIGENCE RECHERCHE #0{idx + 1}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#43DDB0]/60 group-hover:text-[#43DDB0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
