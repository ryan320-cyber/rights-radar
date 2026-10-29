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
    { code: 'DL 0890', dep: 'New York (JFK)', arr: 'Paris (CDG)', status: 'Retard 4h 30m', claim: '600 € estimés', eligible: true, type: 'Maintenance au départ' },
  ];

  return (
    <section
      id="probleme"
      ref={sectionRef}
      className="py-24 bg-[#03070E] text-[#F4F4F6] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#43DDB0]/5 blur-[150px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Unseen Studio Index Monospace Tag */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#43DDB0]">
              01 — Le Problème & Constat
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mb-4">
            Le droit à indemnisation existe. Pourtant, <span className="italic text-[#FFB340]">la majorité ne le réclame jamais.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#94A3B8] leading-relaxed font-light">
            Démarches fastidieuses, méconnaissance des textes de loi européens ou crainte de confier ses données personnelles à des tiers : des millions d'euros restent chaque année dans les caisses des transporteurs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Departures Board Mock Panel with Phosphor Scanline Effect */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden scanlines">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Plane className="w-4 h-4 text-[#43DDB0]" />
                <span className="font-mono text-xs uppercase tracking-wider text-white">
                  Tableau des vols perturbés (Exemple fictif, à titre illustratif)
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#43DDB0] bg-[#43DDB0]/10 px-2 py-0.5 rounded border border-[#43DDB0]/20">
                LIVE DETECT
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {fictionalFlights.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#43DDB0]/40 transition-all cursor-default group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white tracking-wider group-hover:text-[#43DDB0] transition">
                      {f.code}
                    </span>
                    <span className="text-[#94A3B8] text-[11px]">
                      {f.dep} → {f.arr}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className="text-[#FFB340] text-[11px] bg-[#FFB340]/10 px-2 py-0.5 rounded">
                      {f.status}
                    </span>
                    <span className="text-[#43DDB0] font-bold text-[11px] bg-[#43DDB0]/10 px-2 py-0.5 rounded border border-[#43DDB0]/20">
                      {f.claim}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>* Tableau fictif présenté pour illustrer le fonctionnement du détecteur</span>
              <span className="text-[#43DDB0]/80">CE 261/2004</span>
            </div>
          </div>

          {/* Right: Sourced Statistics & Non-Recours Gauge */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-[#FFB340]" />
                <span className="font-mono text-xs uppercase tracking-wider text-white">
                  Phénomène du Non-Recours
                </span>
              </div>

              {/* Big Animated Counter */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display italic text-6xl sm:text-7xl lg:text-8xl text-white font-normal">
                    {count}%
                  </span>
                  <span className="font-mono text-xs uppercase text-[#FFB340] tracking-wider">
                    SEULEMENT
                  </span>
                </div>
                <p className="font-sans text-sm text-[#94A3B8] leading-relaxed mt-2 font-light">
                  Seulement 45 % des passagers éligibles réclament une indemnisation lors d'un retard significatif, principalement par méconnaissance de leurs droits ou complexité perçue.
                </p>
              </div>

              {/* Sourced Tag */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/80 font-bold">Source vérifiée :</span>
                  <span className="text-[#43DDB0] bg-[#43DDB0]/10 px-1.5 py-0.5 rounded">
                    [organisme public]
                  </span>
                </div>
                <p className="text-[11px] text-white/50">
                  Transport Focus, 2026 [organisme public] (données ferroviaires documentant le non-recours passager).
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs font-mono text-[#43DDB0] flex items-center justify-between">
              <span>MOTEUR D’EXTRACTION SANS INTERMÉDIAIRE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
