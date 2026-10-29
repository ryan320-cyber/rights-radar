import React, { useEffect, useRef } from 'react';
import { ArrowDownRight, ShieldCheck, Sparkles, Radio, Mail, Activity, Eye, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { RadarCanvas } from './RadarCanvas.tsx';
import { soundEngine } from '../utils/soundEngine.ts';

interface HeroSectionProps {
  onOpenSimulator: (preset?: 'short' | 'medium' | 'long') => void;
  onOpenGmailScanner?: () => void;
}

export function HeroSection({ onOpenSimulator, onOpenGmailScanner }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lusion-inspired Interactive Atmospheric Light Particles Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle field
    const count = 55;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Also update CSS variable for body spotlight
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle attraction to mouse (Lusion organic physics)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          p.x += (dx / dist) * 0.45;
          p.y += (dy / dist) * 0.45;
        }

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
        ctx.fillStyle = `rgba(67, 221, 176, ${Math.max(0.05, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section
      id="hero"
      aria-label="Présentation générale"
      className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-hidden py-10 md:py-16 bg-[#020408] text-[#F4F4F6]"
    >
      {/* Background Interactive Lusion Particle Field Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
      />

      {/* Atmospheric Lusion Bioluminescent Glows */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#43DDB0]/12 via-[#00F0FF]/6 to-transparent blur-[140px] pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 right-10 w-[550px] h-[400px] bg-gradient-to-br from-[#FFB340]/8 via-transparent to-transparent blur-[130px] pointer-events-none z-0"
      />

      {/* Top Editorial Telemetry Bar (Unseen Studio Signature) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 mb-8 border-b border-white/[0.07] pb-4 flex flex-wrap items-center justify-between text-[11px] font-code text-white/40 tracking-wider">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#43DDB0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0] animate-ping" />
            <span className="font-semibold">RADAR ONLINE // 1090 MHz</span>
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline">LAT 48°51&apos;24&quot; N · LON 002°21&apos;07&quot; E</span>
        </div>
        <div className="flex items-center gap-4">
          <span>EUR-LEX CE 261/2004</span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="hidden md:inline text-[#43DDB0]/80">LOCAL-FIRST PRIVACY SHIELD</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Kinetic Editorial Headline & Controls */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Fine Calibration Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-code text-[#43DDB0] tracking-widest mb-6 w-fit shadow-[0_0_15px_rgba(67,221,176,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0] shadow-[0_0_8px_#43DDB0]" />
              <span>DÉTECTION · ESTIMATION · SOULAGEMENT LOCAL</span>
            </div>

            {/* Exactly one H1 for the page with Masked Reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.93] tracking-tight text-white font-normal"
              >
                <span className="font-display block">Le radar de vos</span>
                <span className="font-display italic text-[#43DDB0] block relative">
                  droits en voyage.
                  <span className="absolute -bottom-1 left-0 w-32 h-[1px] bg-gradient-to-r from-[#43DDB0] to-transparent opacity-60" />
                </span>
              </motion.h1>
            </div>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="font-body text-lg sm:text-xl text-[#94A3B8] leading-relaxed mb-8 max-w-xl font-light"
            >
              Il repère les vols qui ouvrent un droit à indemnisation (250 €, 400 €, 600 €), estime le montant exact selon la distance et prépare votre réclamation. Vos données privées ne quittent jamais votre ordinateur.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <a
                href="#inscription"
                onClick={(e) => {
                  e.preventDefault();
                  soundEngine.playClick();
                  document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                data-cursor="action"
                className="group cursor-pointer inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-white hover:bg-neutral-100 text-black font-code text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(67,221,176,0.4)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
              >
                <span>Rejoindre la liste d’attente</span>
                <ArrowDownRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenSimulator();
                }}
                data-cursor="action"
                className="group cursor-pointer inline-flex items-center gap-2 px-6 py-4 rounded-full border border-white/20 hover:border-[#FFB340]/60 bg-white/[0.03] hover:bg-[#FFB340]/10 text-white font-code text-xs uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFB340] active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFB340] group-hover:rotate-12 transition-transform" />
                <span>Simulateur de vol</span>
              </button>

              {onOpenGmailScanner && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenGmailScanner();
                  }}
                  data-cursor="action"
                  className="group cursor-pointer inline-flex items-center gap-2 px-6 py-4 rounded-full border border-[#43DDB0]/30 hover:border-[#43DDB0] bg-[#43DDB0]/05 hover:bg-[#43DDB0]/15 text-[#43DDB0] font-code text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(67,221,176,0.15)] focus:outline-none focus:ring-2 focus:ring-[#43DDB0] active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5 text-[#43DDB0]" />
                  <span>Scanner Gmail</span>
                </button>
              )}
            </motion.div>

            {/* Micro Feature Grid with Unseen Hairlines */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] text-xs font-code text-[#94A3B8]">
              <div className="flex flex-col gap-1">
                <span className="text-[#43DDB0] font-bold text-base">0 Octet</span>
                <span className="text-white/60 text-[11px]">Exporté vers un tiers</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/[0.08] pl-4">
                <span className="text-white font-bold text-base">250 € à 600 €</span>
                <span className="text-white/60 text-[11px]">Barème européen CE 261</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/[0.08] pl-4">
                <span className="text-[#FFB340] font-bold text-base">9 € à 14 €</span>
                <span className="text-white/60 text-[11px]">Forfait fixe envisagé</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Precision Living Radar Canvas */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            <div className="relative w-full max-w-[560px] aspect-square rounded-full p-2 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              <RadarCanvas onSelectFlightPreset={onOpenSimulator} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
