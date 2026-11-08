import React, { useEffect, useRef, useState } from 'react';
import { Plane, AlertTriangle, CheckCircle2, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

export const ProblemSection: React.FC = () => {
  const [count, setCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 1400; // 1.4s

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * 45));
            if (progress < 1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animationFrame = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);

  const fictionalFlights = [
    { code: 'AF 1840', dep: 'Paris (CDG)', arr: 'Rome (FCO)', status: 'Retard 3h 40m', claim: '250 € estimés', eligible: true, type: 'Rotation appareil' },
    { code: 'IB 3411', dep: 'Madrid (MAD)', arr: 'Lisbonne (LIS)', status: 'Annulation tardive', claim: '250 € estimés', eligible: true, type: 'Non-acheminement' },
    { code: 'KL 1204', dep: 'Amsterdam (AMS)', arr: 'Nice (NCE)', status: 'Retard 4h 10m', claim: '400 € estimés', eligible: true, type: 'Panne technique' },
    { code: 'DL 0890', dep: 'New York (JFK)', arr: 'Paris (CDG)', status: 'Retard 4h 30m', claim: '600 € estimés', eligible: true, type: 'Maintenance départ' },
  ];

  return (
    <section
      id="probleme"
      ref={sectionRef}
      className="py-28 bg-[#000000] text-[#F5F5F7] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-0 w-[550px] h-[550px] bg-[#30D158]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Apple Optical Typography */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#30D158] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            <span>01 — LE PROBLÈME & CONSTAT</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.03em] text-white mb-4">
            Le droit à indemnisation existe. Pourtant, <span className="text-[#FF9F0A]">la majorité ne le réclame jamais.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-2xl font-normal">
            Démarches fastidieuses, méconnaissance des règlements européens ou crainte de confier ses données personnelles à des tiers : des millions d'euros restent chaque année conservés par les transporteurs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Apple Glass Departures Board */}
          <div className="lg:col-span-7 apple-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Plane className="w-4 h-4 text-[#30D158]" />
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-white">
                  Tableau des vols perturbés (Exemple fictif illustratif)
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#30D158] bg-[#30D158]/10 px-2.5 py-0.5 rounded-full border border-[#30D158]/30 font-medium">
                DÉTECTION CE 261
              </span>
            </div>

            <div className="space-y-3 font-body text-xs">
              {fictionalFlights.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#30D158]/40 transition-all cursor-default group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white tracking-wider group-hover:text-[#30D158] transition">
                      {f.code}
                    </span>
                    <span className="text-[#86868B] text-xs">
                      {f.dep} → {f.arr}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className="text-[#FF9F0A] text-xs font-medium bg-[#FF9F0A]/10 px-2.5 py-1 rounded-full border border-[#FF9F0A]/20">
                      {f.status}
                    </span>
                    <span className="text-[#30D158] font-semibold text-xs bg-[#30D158]/10 px-2.5 py-1 rounded-full border border-[#30D158]/30">
                      {f.claim}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-white/40">
              <span>* Données fictives simulant l'identification locale d'un vol</span>
              <span className="text-[#30D158]/80 font-medium">CE 261/2004</span>
            </div>
          </div>

          {/* Right: Apple Sourced Statistics & Non-Recours Card */}
          <div className="lg:col-span-5 apple-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-[#FF9F0A]" />
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-white">
                  Phénomène du Non-Recours
                </span>
              </div>

              {/* Big Animated Counter with Apple Display Styling */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-semibold text-6xl sm:text-7xl lg:text-8xl text-white tracking-[-0.03em]">
                    {count}%
                  </span>
                  <span className="font-mono text-xs uppercase text-[#FF9F0A] font-bold tracking-wider">
                    SEULEMENT
                  </span>
                </div>
                <p className="font-body text-sm text-[#86868B] leading-relaxed mt-2 font-normal">
                  Seulement 45 % des passagers éligibles réclament leur indemnisation lors d'une perturbation significative, principalement par manque d'information ou découragement face aux démarches.
                </p>
              </div>

              {/* Sourced Tag with Explicit Legal Attribution */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-body text-white/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Source vérifiée :</span>
                  <span className="text-[#30D158] bg-[#30D158]/15 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold">
                    [organisme public]
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-normal">
                  Transport Focus [organisme public] (données ferroviaires documentant le taux de non-recours passager).
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/40 font-body">
              <span>Transparence documentaire</span>
              <span className="text-[#30D158] font-medium">Zéro commission</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
