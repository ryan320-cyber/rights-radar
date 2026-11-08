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
    'Aucune promesse trompeuse d’indemnisation assurée (aucun verbe « garantir » ni « 100% »).',
    'Aucune prestation de conseil juridique personnalisée réservée aux avocats.',
    'Aucune revente de vos données de voyage à des courtiers ou annonceurs tiers.',
  ];

  return (
    <section
      id="engagements"
      className="py-28 bg-[#000000] text-[#F5F5F7] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-0 w-[550px] h-[550px] bg-[#30D158]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Apple Optical Typography */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#30D158] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            <span>04 — DÉONTOLOGIE & ENGAGEMENTS</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.03em] text-white mb-4">
            Transparence totale sur notre rôle et <span className="text-[#FF9F0A]">nos limites déontologiques.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-2xl font-normal">
            Rights Radar est un outil d'assistance numérique pour les voyageurs. Nous ne sommes ni une agence commerciale à la commission ni un cabinet d'avocats.
          </p>
        </div>

        {/* Two Column Apple Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Ce que nous faisons */}
          <div className="apple-card p-8 sm:p-10 rounded-3xl space-y-6 border-[#30D158]/25 shadow-[0_4px_30px_rgba(48,209,88,0.06)]">
            <div className="flex items-center gap-3.5 border-b border-white/[0.08] pb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#30D158]/15 text-[#30D158] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#30D158]" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-2xl text-white tracking-tight">Ce que nous faisons</h3>
                <span className="font-mono text-xs text-[#30D158] uppercase tracking-wider font-semibold">Engagements formels</span>
              </div>
            </div>

            <ul className="space-y-4 font-body text-sm text-white/80">
              {doList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#30D158]/20 text-[#30D158] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ce que nous refusons de faire */}
          <div className="apple-card p-8 sm:p-10 rounded-3xl space-y-6 border-[#FF9F0A]/25 shadow-[0_4px_30px_rgba(255,159,10,0.06)]">
            <div className="flex items-center gap-3.5 border-b border-white/[0.08] pb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#FF9F0A]" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-2xl text-white tracking-tight">Ce que nous refusons de faire</h3>
                <span className="font-mono text-xs text-[#FF9F0A] uppercase tracking-wider font-semibold">Limites strictes</span>
              </div>
            </div>

            <ul className="space-y-4 font-body text-sm text-white/80">
              {dontList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mandatory Legal Disclaimer Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/30 flex items-center gap-3 text-xs sm:text-sm font-body text-[#FF9F0A]">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>
            <strong>Information légale essentielle :</strong> Rights Radar ne remplace pas un avocat et aucune indemnisation n’est garantie ni promise à 100%. L’accord final dépend de la compagnie aérienne ou du juge compétent.
          </span>
        </div>
      </div>
    </section>
  );
};
