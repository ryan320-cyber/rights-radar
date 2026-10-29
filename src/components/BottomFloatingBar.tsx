import React, { useState, useEffect } from 'react';
import { Globe, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

interface BottomFloatingBarProps {
  onToggleWorld: () => void;
  isWorldActive: boolean;
}

export function BottomFloatingBar({ onToggleWorld, isWorldActive }: BottomFloatingBarProps) {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted());

  useEffect(() => {
    setIsMuted(soundEngine.isMuted());
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playTick();
    }
  };

  return (
    <aside
      aria-label="Contrôles immersifs de l'expérience"
      className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Left Audio pill with animated equalizer bars */}
        <button
          type="button"
          onClick={handleToggleAudio}
          data-cursor="action"
          className="group cursor-pointer pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#080C14]/90 hover:bg-[#0E1524] border border-white/15 text-white/80 hover:text-white backdrop-blur-xl shadow-xl transition-all duration-200 active:scale-95"
          aria-label={isMuted ? "Activer l'ambiance sonore" : "Couper l'ambiance sonore"}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
          ) : (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 pb-0.5">
              <span className="w-0.5 bg-[#43DDB0] rounded-full eq-1" />
              <span className="w-0.5 bg-[#43DDB0] rounded-full eq-2" />
              <span className="w-0.5 bg-[#43DDB0] rounded-full eq-3" />
              <span className="w-0.5 bg-[#43DDB0] rounded-full eq-4" />
            </div>
          )}
          <span className="text-[11px] font-code tracking-wider uppercase select-none">
            {isMuted ? 'Musique: Off' : 'Relaxed City Lo-Fi ♫'}
          </span>
        </button>

        {/* Center Prominent World Toggle Button (just like UNSEEN WORLD in the video!) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleWorld();
          }}
          data-cursor="radar"
          className="group cursor-pointer pointer-events-auto relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-code text-xs font-semibold tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(67,221,176,0.6)] active:scale-95 select-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-ping" />
          <span>{isWorldActive ? 'Retour au site' : 'Radar 3D World'}</span>
          <Globe className="w-3.5 h-3.5 text-black group-hover:rotate-45 transition-transform" />
        </button>

        {/* Right Legal / Year metadata */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-code text-white/40 bg-[#080C14]/80 px-3.5 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <span>CE 261/2004</span>
          <span>•</span>
          <span>©2026</span>
        </div>
      </div>
    </aside>
  );
}
