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
      className="py-28 bg-[#000000] text-[#F5F5F7] border-t border-white/[0.08] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/3 w-[600px] h-[550px] bg-[#FF9F0A]/5 blur-[160px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Apple Optical Typography */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#30D158] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            <span>05 — MODÈLE ÉCONOMIQUE COMPARÉ</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.03em] text-white mb-4">
            D'autres services existent. <span className="text-[#30D158]">Comparez le modèle à commission et le prix fixe.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-[#86868B] leading-relaxed max-w-2xl font-normal">
            Les agences commerciales prélèvent généralement de 35 % à 50 % de votre indemnité. Nous testons une approche alternative à forfait fixe abordable.
          </p>
        </div>

        {/* Comparison Interactive Apple Bento Panel */}
        <div className="apple-card p-6 sm:p-10 rounded-3xl space-y-8">
          {/* Top Interactive Amount Selector: Apple Segmented Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-5 h-5 text-[#30D158]" />
              <span className="font-body text-sm font-semibold uppercase text-white tracking-wider">
                Simulation comparative dynamique
              </span>
            </div>

            <div className="apple-segmented-control">
              <span className="text-xs font-body text-white/50 px-2">Échelon :</span>
              {[250, 400, 600].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setIndemnityAmount(amt);
                  }}
                  className={`apple-press apple-segmented-item ${
                    indemnityAmount === amt
                      ? 'apple-segmented-item-active'
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-body gap-1">
              <span className="font-medium text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" />
                <span>Intermédiaire classique à la commission (35 %)</span>
                <span className="text-xs text-white/50 font-normal">[partie intéressée : AirHelp]</span>
              </span>
              <span className="text-[#FF9F0A] font-bold font-mono">
                {commissionFee} € prélevés <span className="text-white/60 font-normal">(Reste {remainingPassengerAirHelp} € pour vous)</span>
              </span>
            </div>

            <div className="w-full h-11 bg-white/[0.04] rounded-2xl overflow-hidden flex border border-white/10 p-1 gap-1">
              <div
                style={{ width: `${100 - commissionRate * 100}%` }}
                className="bg-white/[0.12] h-full rounded-xl flex items-center justify-center text-xs font-body font-semibold text-white transition-all duration-500"
              >
                {remainingPassengerAirHelp} € conservés (65 %)
              </div>
              <div
                style={{ width: `${commissionRate * 100}%` }}
                className="bg-[#FF9F0A]/30 border border-[#FF9F0A]/40 text-[#FF9F0A] h-full rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all duration-500"
              >
                -{commissionFee} € (35%)
              </div>
            </div>
          </div>

          {/* Option B: Rights Radar Fixed Fee Model */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-body gap-1">
              <span className="font-medium text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]" />
                <span>Rights Radar : Forfait fixe transparent (9 € à 14 €)</span>
                <span className="text-xs text-[#30D158] font-normal">[hypothèse à tester]</span>
              </span>
              <span className="text-[#30D158] font-bold font-mono">
                {remainingPassengerRadar} € conservés ({percentageKeptRadar} %)
              </span>
            </div>

            <div className="w-full h-11 bg-white/[0.04] rounded-2xl overflow-hidden flex border border-white/10 p-1 gap-1">
              <div
                style={{ width: `${(remainingPassengerRadar / indemnityAmount) * 100}%` }}
                className="bg-[#30D158]/25 border border-[#30D158]/40 h-full rounded-xl flex items-center justify-center text-xs font-body font-bold text-white transition-all duration-500"
              >
                {remainingPassengerRadar} € conservés ({percentageKeptRadar} %)
              </div>
              <div
                style={{ width: `${(rightsRadarFlatFeeMax / indemnityAmount) * 100}%` }}
                className="bg-white/20 h-full rounded-xl flex items-center justify-center text-[11px] font-mono font-bold text-white transition-all duration-500 min-w-[50px]"
              >
                14 €
              </div>
            </div>
          </div>

          {/* Summary Callout Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-body">
            <div className="text-white/70 leading-relaxed">
              <strong className="text-white">Différence nette pour vous :</strong> Sur une indemnité de {indemnityAmount} €, vous conservez environ{' '}
              <strong className="text-[#30D158] font-bold font-mono">
                +{commissionFee - rightsRadarFlatFeeMax} € de plus
              </strong>{' '}
              qu&apos;avec une commission standard de 35 %.
            </div>

            <a
              href="#inscription"
              onClick={(e) => {
                e.preventDefault();
                soundEngine.playClick();
                document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="apple-press inline-flex items-center gap-1.5 text-[#30D158] hover:text-[#34C759] font-semibold shrink-0"
            >
              <span>Valider ce modèle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
