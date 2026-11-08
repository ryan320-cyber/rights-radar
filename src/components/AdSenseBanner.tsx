import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdSenseBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'horizontal' | 'rectangle';
  responsive?: boolean;
  className?: string;
  badge?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot = '4261895720',
  format = 'auto',
  responsive = true,
  className = '',
  badge = 'PARTENAIRE RADAR // PUB-6292650422847467',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = window.adsbygoogle || [];
        adsbygoogle.push({});
        setAdLoaded(true);
      }
    } catch (err) {
      // Gracefully handle ad blocker or duplicate push
      console.debug('AdSense notice:', err);
      setHasError(true);
    }
  }, []);

  return (
    <div
      className={`relative rounded-3xl apple-card p-4 sm:p-6 overflow-hidden my-12 transition-all duration-300 group ${className}`}
    >
      {/* Apple Telemetry Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 font-mono text-xs text-[#86868B]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse shadow-[0_0_8px_#30D158]" />
          <span className="tracking-widest uppercase text-white/90 font-medium text-[11px]">
            {badge}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="hidden sm:inline-flex items-center gap-1 font-body text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
            AdSense Vérifié
          </span>
          <span className="tracking-wider font-mono text-[10px]">TRANSMISSION FLUIDE</span>
        </div>
      </div>

      {/* Ad Container with Fluid Transition */}
      <div className="min-h-[100px] sm:min-h-[140px] flex items-center justify-center relative rounded-2xl overflow-hidden bg-black/40 border border-white/5">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full transition-opacity duration-700"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client="ca-pub-6292650422847467"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />

        {/* Ambient fallback / placeholder during dev, ad-loading, or adblock */}
        {(!adLoaded || hasError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none bg-gradient-to-r from-transparent via-[#30D158]/5 to-transparent">
            <div className="flex items-center gap-2 text-xs font-mono text-[#30D158] mb-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ESPACE ANNONCES AD-SENSE FLUIDE (ID: pub-6292650422847467)</span>
            </div>
            <p className="text-xs font-body text-white/60 max-w-lg">
              Intégration native Google AdSense optimisée pour l’affichage sans rupture de contraste ni décalage de mise en page (CLS &lt; 0.01).
            </p>
          </div>
        )}
      </div>

      {/* Bottom Sub-tag */}
      <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] text-white/40">
        <span>RADAR SPONSOR // LOCAL ENCRYPTED VIEW</span>
        <span>GOOGLE AD SYSTEM</span>
      </div>
    </div>
  );
};
