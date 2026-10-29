import React, { useState } from 'react';
import { Info, BarChart2, Sliders, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

export const ComparisonSection: React.FC = () => {
  const [indemnityAmount, setIndemnityAmount] = useState<number>(400);

  // Computations
  const commissionRate = 0.35; // 35% AirHelp standard
  const commissionFee = Math.round(indemnityAmount * commissionRate);
  const remainingPassengerAirHelp = indemnityAmount - commissionFee;

  const rightsRadarFlatFeeMin = 9;
  const rightsRadarFlatFeeMax = 14;
  const remainingPassengerRadar = indemnityAmount - rightsRadarFlatFeeMax;
  const percentageKeptRadar = Math.round((remainingPassengerRadar / indemnityAmount) * 100);

  return (
    <section
      id="comparaison"
      className="py-24 bg-[#03070E] text-[#F4F4F6] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/3 w-[600px] h-[500px] bg-[#FFB340]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#43DDB0]">
              05 — Modèle Économique Comparé
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mb-4">
            D&apos;autres services existent. <span className="italic text-[#43DDB0]">Comparez le modèle à commission et le prix fixe.</span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#94A3B8] leading-relaxed font-light">
            Les agences commerciales facturent généralement de 35 % à 50 % de votre indemnité. Nous testons une approche alternative à forfait fixe abordable.
          </p>
        </div>

        {/* Comparison Interactive Glass Panel */}
        <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-white/10 space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
          {/* Top Interactive Amount Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-5 h-5 text-[#43DDB0]" />
              <span className="font-mono text-sm uppercase text-white tracking-wider">
                Simulation comparative dynamique
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-full border border-white/10">
              <span className="text-xs font-mono text-white/50 px-2">Échelon légal :</span>
              {[250, 400, 600].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setIndemnityAmount(amt);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                    indemnityAmount === amt
                      ? 'bg-[#43DDB0] text-black shadow-[0_0_12px_rgba(67,221,176,0.5)]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {amt} €
                </button>
              ))}
            </div>
          </div>

          {/* Option A: Commission Service (e.g. AirHelp 35%) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-mono gap-1">
              <span className="font-medium text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFB340]" />
                <span>Intermédiaire classique à la commission (35 %)</span>
                <span className="text-[11px] text-white/40 font-normal">[partie intéressée : AirHelp]</span>
              </span>
              <span className="text-[#FFB340] font-bold">
                {commissionFee} € prélevés <span className="text-white/60 font-normal">(Reste {remainingPassengerAirHelp} € pour vous)</span>
              </span>
            </div>

            <div className="w-full h-10 bg-white/[0.04] rounded-xl overflow-hidden flex border border-white/10">
              <div
                style={{ width: `${100 - commissionRate * 100}%` }}
                className="bg-[#43DDB0]/30 h-full flex items-center justify-center text-xs font-mono font-bold text-white transition-all duration-500"
              >
                {remainingPassengerAirHelp} € à l'usager (65 %)
              </div>
              <div
                style={{ width: `${commissionRate * 100}%` }}
                className="bg-[#FFB340] h-full flex items-center justify-center text-xs font-mono font-bold text-black transition-all duration-500"
              >
                {commissionFee} € commission
              </div>
            </div>
          </div>

          {/* Option B: Rights Radar Fixed Fee Hypothesis (9-14 €) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-mono gap-1">
              <span className="font-medium text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#43DDB0]" />
                <span>Rights Radar (Modèle forfaitaire transparent)</span>
                <span className="text-[11px] text-[#43DDB0]/80 font-normal">[hypothèse à tester]</span>
              </span>
              <span className="text-[#43DDB0] font-bold">
                {rightsRadarFlatFeeMin} à {rightsRadarFlatFeeMax} € forfait <span className="text-white/60 font-normal">(~{remainingPassengerRadar} € conservés)</span>
              </span>
            </div>

            <div className="w-full h-10 bg-white/[0.04] rounded-xl overflow-hidden flex border border-white/10">
              <div
                style={{ width: `${percentageKeptRadar}%` }}
                className="bg-[#43DDB0] h-full flex items-center px-4 text-xs font-mono font-bold text-black transition-all duration-500 shadow-[0_0_20px_rgba(67,221,176,0.3)]"
              >
                ~{remainingPassengerRadar} € conservés par vous ({percentageKeptRadar} %)
              </div>
              <div
                style={{ width: `${100 - percentageKeptRadar}%` }}
                className="bg-white/20 h-full"
                title="Forfait 9-14 €"
              />
            </div>
          </div>

          {/* Sourced Disclaimer Box */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-start gap-3 text-xs font-mono text-[#94A3B8]">
            <Info className="w-4 h-4 text-[#43DDB0] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-light">
              <strong className="text-white font-medium">Exemple de calcul, pas un résultat :</strong> Ce graphique est fourni à titre indicatif pour comparer le coût réel d'un intermédiaire à la commission (environ 35 % à 50 % selon les étapes) avec notre hypothèse de forfait fixe indépendant de 9 à 14 €.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
