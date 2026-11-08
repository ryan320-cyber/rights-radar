import React, { useState, useEffect } from 'react';
import { TimelineItem } from '../types';
import { Clock, HelpCircle, ExternalLink, RefreshCw, Radio, Sparkles, Scale } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

interface WhyNowSectionProps {
  isReviewMode: boolean;
}

const timelineData: TimelineItem[] = [
  {
    id: 't1',
    date: 'Horizon 2026',
    title: 'Modernisation du cadre européen',
    description: 'Les institutions européennes examinent la révision du règlement (CE) n° 261/2004 afin de clarifier les seuils d’indemnisation et les obligations d’assistance des compagnies aériennes.',
    source: 'Conseil de l’Union européenne & Parlement européen',
    sourceType: '[organisme public]',
    isUnverified: true,
  },
  {
    id: 't2',
    date: '2025 - 2026',
    title: 'IA légère et locale (Local-First)',
    description: 'Les navigateurs modernes exécutent de puissants modèles d’analyse de documents en mémoire vive sans transmettre les confirmations de vol à des serveurs distants.',
    source: 'Recherches en intelligence artificielle embarquée WebAssembly',
    sourceType: '[académique]',
    isUnverified: false,
  },
  {
    id: 't3',
    date: '2025 - 2026',
    title: 'Équité numérique & transparence',
    description: 'Encadrement strict des interfaces trompeuses (dark patterns), des abonnements dissimulés et des commissions imprévues prélevées sur les indemnisations.',
    source: 'Commission européenne — Digital Fairness Act',
    sourceType: '[organisme public]',
    isUnverified: false,
  },
];

export const WhyNowSection: React.FC<WhyNowSectionProps> = ({ isReviewMode }) => {
  const [livePulse, setLivePulse] = useState<{ summary?: string; checkedAt?: string } | null>(null);
  const [isLoadingPulse, setIsLoadingPulse] = useState(false);

  const fetchLivePulse = async () => {
    setIsLoadingPulse(true);
    soundEngine.playPing();
    try {
      const res = await fetch('/api/regulatory-pulse');
      if (res.ok) {
        const data = await res.json();
        setLivePulse(data);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoadingPulse(false);
    }
  };

  return (
    <section
      id="pourquoi-maintenant"
      className="py-28 bg-[#000000] text-[#F5F5F7] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-[#64D2FF]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Apple Optical Typography */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#64D2FF] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64D2FF]" />
            <span>02 — CONTEXTE & OPPORTUNITÉ</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.03em] text-white mb-4">
            Pourquoi lancer ce radar <span className="text-[#64D2FF]">maintenant ?</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-2xl font-normal">
            La convergence de la révision réglementaire européenne et des technologies WebAssembly permet désormais d'offrir une solution indépendante, instantanée et 100% locale.
          </p>
        </div>

        {/* Live Regulatory Pulse Banner (Apple Translucent Capsule) */}
        <div className="mb-10 p-5 sm:p-6 rounded-3xl apple-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#64D2FF]/20 shadow-[0_4px_24px_rgba(100,210,255,0.08)]">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#64D2FF]/15 text-[#64D2FF] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-[#64D2FF] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#64D2FF]">
                  Veille Règlementaire Directe (CE 261/2004)
                </span>
                <span className="font-mono text-[10px] text-white/40">Gemini Grounding</span>
              </div>
              <p className="font-body text-xs sm:text-sm text-white/80 mt-1 max-w-2xl">
                {livePulse?.summary
                  ? livePulse.summary
                  : 'Surveillance active des révisions CE 261 et jurisprudences de la Cour de Justice de l’Union Européenne (CJUE).'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLivePulse}
            disabled={isLoadingPulse}
            className="apple-press inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-body font-medium text-white transition active:scale-[0.97] shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPulse ? 'animate-spin' : ''}`} />
            <span>{isLoadingPulse ? 'Interrogation...' : 'Actualiser le statut'}</span>
          </button>
        </div>

        {/* Apple 3-Column Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {timelineData.map((item) => (
            <div
              key={item.id}
              className="apple-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-[#64D2FF] bg-[#64D2FF]/10 px-2.5 py-1 rounded-full border border-[#64D2FF]/20">
                    {item.date}
                  </span>
                  {isReviewMode && item.isUnverified && (
                    <span className="review-tag">
                      À VÉRIFIER
                    </span>
                  )}
                </div>

                <h3 className="font-display font-semibold text-xl text-white mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-[#86868B] leading-relaxed mb-6 font-normal">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-body text-white/40">
                <span className="truncate max-w-[200px]" title={item.source}>
                  {item.source}
                </span>
                <span className="font-mono text-[10px] text-[#64D2FF] bg-[#64D2FF]/10 px-1.5 py-0.5 rounded">
                  {item.sourceType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
