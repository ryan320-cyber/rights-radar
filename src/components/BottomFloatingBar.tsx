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
      <div className="max-w-2xl mx-auto flex items-center justify-between p-2 rounded-full apple-chrome border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
        {/* Left Audio Pill with animated equalizer */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className="apple-press flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white transition"
          aria-label={isMuted ? "Activer l'ambiance sonore" : "Couper l'ambiance sonore"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white/40" />
          ) : (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 pb-0.5">
              <span className="w-0.5 bg-[#30D158] rounded-full eq-1" />
              <span className="w-0.5 bg-[#30D158] rounded-full eq-2" />
              <span className="w-0.5 bg-[#30D158] rounded-full eq-3" />
              <span className="w-0.5 bg-[#30D158] rounded-full eq-4" />
            </div>
          )}
          <span className="text-xs font-body tracking-tight font-medium select-none">
            {isMuted ? 'Audio désactivé' : 'Ambiance Lo-Fi'}
          </span>
        </button>

        {/* Center Prominent 3D Radar Toggle Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleWorld();
          }}
          className="apple-press inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-neutral-100 text-black font-body text-xs font-semibold transition active:scale-95 shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
        >
          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
          <span>{isWorldActive ? 'Retour au site' : 'Radar 3D World'}</span>
          <Globe className="w-3.5 h-3.5 text-black" />
        </button>

        {/* Right Status metadata */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/50 px-3">
          <span>CE 261/2004</span>
          <span>•</span>
          <span className="text-[#30D158]">Actif</span>
        </div>
      </div>
    </aside>
  );
}
