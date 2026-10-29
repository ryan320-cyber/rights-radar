import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export const CommitmentsSection: React.FC = () => {
  const doList = [
    'Repérer les perturbations éligibles selon les textes réglementaires officiels.',
    'Estimer un montant indicatif (250 €, 400 €, 600 €) sans promesse ferme ni faux espoir.',
    'Préparer un projet de lettre de réclamation complet à relire et expédier vous-même.',
    'Conserver l’intégralité de vos confirmations de vol en local sur votre appareil.',
    'Afficher les sources et dates de chaque règle juridique appliquée.',
  ];

  const dontList = [
    'Pas de rachat de créance ni de prélèvement de commission punitive de 35% à 50%.',
    'Aucun envoi de courrier ni démarche initiée sans votre accord préalable explicite.',
    'Aucune garantie d’indemnisation assurée (aucun verbe trompeur ni promesse de 100%).',
    'Aucune prestation de conseil juridique personnalisé réservée aux avocats.',
    'Aucune revente de vos données de voyage à des courtiers ou annonceurs tiers.',
  ];

  return (
    <section
      id="engagements"
      className="py-24 bg-[#020408] text-[#F4F4F6] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#43DDB0]/5 blur-[150px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#43DDB0]">
              04 — Déontologie & Engagements
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mb-4">
            Transparence totale sur notre rôle et <span className="italic text-[#FFB340]">nos limites déontologiques.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#94A3B8] leading-relaxed font-light">
            Rights Radar est un outil d'assistance numérique pour les voyageurs. Nous ne sommes ni une agence commerciale à la commission ni un cabinet d'avocats.
          </p>
        </div>

        {/* Two Column Cards with Lusion Glass Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Ce que nous faisons */}
          <div className="glass-panel p-8 sm:p-10 rounded-2xl space-y-6 border-[#43DDB0]/30 shadow-[0_0_40px_rgba(67,221,176,0.06)]">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-5">
              <div className="w-9 h-9 rounded-xl bg-[#43DDB0]/15 text-[#43DDB0] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#43DDB0]" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-white">Ce que nous faisons</h3>
                <span className="font-mono text-[10px] text-[#43DDB0] uppercase tracking-wider">Engagements formels</span>
              </div>
            </div>

            <ul className="space-y-4">
              {doList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#F4F4F6] font-light">
                  <span className="w-5 h-5 rounded-full bg-[#43DDB0]/20 text-[#43DDB0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ce que nous ne faisons pas */}
          <div className="glass-panel p-8 sm:p-10 rounded-2xl space-y-6 border-[#FFB340]/30 shadow-[0_0_40px_rgba(255,179,64,0.06)]">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FFB340]/15 text-[#FFB340] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#FFB340]" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-white">Ce que nous refusons</h3>
                <span className="font-mono text-[10px] text-[#FFB340] uppercase tracking-wider">Lignes rouges</span>
              </div>
            </div>

            <ul className="space-y-4">
              {dontList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#F4F4F6] font-light">
                  <span className="w-5 h-5 rounded-full bg-[#FFB340]/20 text-[#FFB340] flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="glass-panel p-5 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <span>* Rights Radar ne remplace pas un avocat et ne garantit aucune indemnisation.</span>
          <span className="text-[#43DDB0]">CONSEIL D'ÉTAT & CJUE COMPLIANT</span>
        </div>
      </div>
    </section>
  );
};
