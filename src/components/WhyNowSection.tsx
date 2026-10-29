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
    description: 'Les institutions européennes examinent la révision du règlement (CE) n° 261/2004 afin de clarifier les seuils d’indemnisation et les obligations d’assistance.',
    source: 'Conseil de l’Union européenne & Parlement européen',
    sourceType: '[organisme public]',
    isUnverified: true,
  },
  {
    id: 't2',
    date: '2025 - 2026',
    title: 'IA légère et locale (Local-First)',
    description: 'Les navigateurs modernes exécutent de puissants modèles d’analyse de documents en mémoire vive sans transmettre les confirmations à des serveurs tiers.',
    source: 'Recherches en intelligence artificielle embarquée WebAssembly',
    sourceType: '[académique]',
    isUnverified: false,
  },
  {
    id: 't3',
    date: '2025 - 2026',
    title: 'Équité numérique & transparence',
    description: 'Encadrement strict des interfaces trompeuses (dark patterns), des abonnements dissimulés et des commissions non annoncées dès l’inscription.',
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
      // Fallback
    } finally {
      setIsLoadingPulse(false);
    }
  };

  return (
    <section
      id="pourquoi-maintenant"
      className="py-24 bg-[#020408] text-[#F4F4F6] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-0 w-[550px] h-[500px] bg-[#00F0FF]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#43DDB0]">
                02 — Contexte & Veille Réglementaire
              </span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mb-4">
              Pourquoi maintenant ? <span className="italic text-[#43DDB0]">Trois bascules majeures.</span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#94A3B8] leading-relaxed font-light">
              L'évolution du droit aérien européen, l'avènement des modèles légers fonctionnant en local et le rejet des commissions abusives ouvrent la voie à une nouvelle génération d'outils.
            </p>
          </div>

          {/* Live Regulatory Pulse Trigger */}
          <button
            type="button"
            onClick={fetchLivePulse}
            disabled={isLoadingPulse}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-white/80 hover:text-white transition active:scale-95 w-fit shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#43DDB0] ${isLoadingPulse ? 'animate-spin' : ''}`} />
            <span>Actualiser la veille (Search Grounding)</span>
          </button>
        </div>

        {/* Live Grounding Pulse Banner (if loaded) */}
        {livePulse?.summary && (
          <div className="mb-8 p-5 rounded-2xl bg-[#43DDB0]/5 border border-[#43DDB0]/30 text-xs font-mono text-white/90 flex items-start gap-3">
            <Radio className="w-4 h-4 text-[#43DDB0] shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="text-[#43DDB0] font-bold uppercase tracking-wider block">
                Signal en direct (Vérifié Google Search) :
              </span>
              <p className="text-[#F4F4F6] font-sans text-sm font-light leading-relaxed">
                {livePulse.summary}
              </p>
            </div>
          </div>
        )}

        {/* 3 Column Timeline Cards with Lusion Glass Aesthetic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {timelineData.map((item, idx) => (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-5">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#43DDB0]">
                    0{idx + 1} // {item.date}
                  </span>
                  <span className="text-[10px] font-mono text-white/40 uppercase bg-white/[0.04] px-2 py-0.5 rounded">
                    {item.sourceType}
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-white mb-3 group-hover:text-[#43DDB0] transition">
                  {item.title}
                </h3>

                <p className="font-sans text-sm text-[#94A3B8] leading-relaxed font-light mb-6">
                  {item.description}
                </p>

                {item.isUnverified && isReviewMode && (
                  <div className="mb-4">
                    <span className="review-tag" data-review="true">
                      [À VÉRIFIER : accord provisoire annoncé en juin 2026]
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40">
                <span className="truncate max-w-[200px]">{item.source}</span>
                <Scale className="w-3.5 h-3.5 text-[#43DDB0]/60 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
