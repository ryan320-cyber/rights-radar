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

      {/* Top Editorial Telemetry Bar (Apple System Status) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 mb-8 border-b border-white/[0.07] pb-4 flex flex-wrap items-center justify-between text-xs font-mono text-white/50 tracking-wide">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-[#30D158] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse shadow-[0_0_8px_#30D158]" />
            <span>RADAR ACTIF // 1090 MHz</span>
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-white/40">Paris CDG · 48°51′24″ N, 002°21′07″ E</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60">CE 261/2004</span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="hidden md:inline text-[#30D158]">Protection 100% Locale</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Kinetic Apple Display Headline & Controls */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Fine Calibration Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#30D158] tracking-wider mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
              <span>DÉTECTION · ESTIMATION · PRÉPARATION LOCALE</span>
            </div>

            {/* Exactly one H1 for the page with Spring Reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 26, stiffness: 220, mass: 0.9 }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.96] tracking-[-0.035em] text-white font-semibold font-display"
              >
                <span className="block">Le radar de vos</span>
                <span className="text-[#30D158] block relative">
                  droits en voyage.
                </span>
              </motion.h1>
            </div>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="font-body text-lg sm:text-xl text-[#86868B] leading-relaxed mb-8 max-w-xl font-normal tracking-[-0.011em]"
            >
              Il repère les vols ouvrant droit à une indemnisation forfaitaire (250 €, 400 €, 600 €), calcule le montant selon la distance orthodromique et prépare votre réclamation formelle. Vos données ne quittent jamais votre appareil.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-3.5 mb-10"
            >
              <a
                href="#inscription"
                onClick={(e) => {
                  e.preventDefault();
                  soundEngine.playClick();
                  document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="apple-press inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-body text-sm font-semibold transition active:scale-[0.97] shadow-[0_4px_24px_rgba(255,255,255,0.2)]"
              >
                <span>Rejoindre la liste d’attente</span>
                <ArrowDownRight className="w-4 h-4 text-black" />
              </a>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenSimulator();
                }}
                className="apple-press inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white font-body text-sm font-medium transition active:scale-[0.97]"
              >
                <Sparkles className="w-4 h-4 text-[#FF9F0A]" />
                <span>Simulateur de vol</span>
              </button>

              {onOpenGmailScanner && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenGmailScanner();
                  }}
                  className="apple-press inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#30D158]/30 hover:border-[#30D158] bg-[#30D158]/10 hover:bg-[#30D158]/20 text-[#30D158] font-body text-sm font-medium transition active:scale-[0.97]"
                >
                  <Mail className="w-4 h-4 text-[#30D158]" />
                  <span>Scanner Gmail</span>
                </button>
              )}
            </motion.div>

            {/* Micro Feature Grid: Apple Bento Capsules */}
            <div className="grid grid-cols-3 gap-3.5 pt-6 border-t border-white/[0.08]">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
                <span className="text-[#30D158] font-semibold text-lg font-display">0 Octet</span>
                <span className="text-white/60 text-xs font-body">Transmis à des tiers</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
                <span className="text-white font-semibold text-lg font-display">250 € à 600 €</span>
                <span className="text-white/60 text-xs font-body">Barème légal CE 261</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
                <span className="text-[#FF9F0A] font-semibold text-lg font-display">9 € à 14 €</span>
                <span className="text-white/60 text-xs font-body">Forfait fixe envisagé</span>
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
