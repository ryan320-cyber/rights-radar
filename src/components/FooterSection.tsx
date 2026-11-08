import React, { useState } from 'react';
import { ArrowUp, Shield, Cookie, ShieldCheck } from 'lucide-react';
import { PrivacyModal } from './PrivacyModal';
import { soundEngine } from '../utils/soundEngine.ts';

interface FooterSectionProps {
  onOpenCookies?: () => void;
  onOpenSecurity?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onOpenCookies, onOpenSecurity }) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const sources = [
    'EUR-Lex',
    'Commission européenne',
    'Règlement (CE) n° 261/2004',
    'Conseil de l’Union européenne',
    'CURIA',
    'Google Workspace API',
    'OpenSky Network ADS-B',
    'Lucide Icons',
    'Three.js',
  ];

  const scrollToTop = () => {
    soundEngine.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="S9"
      className="bg-[#000000] text-[#F5F5F7] py-20 border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-3">
            <h3 className="font-display font-semibold text-2xl text-white tracking-tight">Rights Radar</h3>
            <p className="font-body text-sm text-[#86868B] leading-relaxed max-w-md font-normal">
              Radar d’estimation locale de vos droits de passager aérien. Analyse directe sur votre appareil via WebCrypto et Google Workspace, sans intermédiaires commerciaux ni revente de créances.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#30D158] font-semibold">
              Sources & Références citées
            </h4>
            <p className="font-mono text-xs text-[#86868B] leading-relaxed">
              {sources.join(' • ')}
            </p>
          </div>
        </div>

        {/* Legal & Privacy Row */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-body text-[#86868B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="leading-relaxed">
            <strong className="text-white">Avertissement légal :</strong> Ce site constitue un outil d'assistance technique et d'information juridique générale. Il ne se substitue pas à une consultation auprès d'un avocat.
          </p>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {onOpenCookies && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenCookies();
                }}
                className="apple-press inline-flex items-center gap-1.5 text-white/70 hover:text-white transition"
              >
                <Cookie className="w-3.5 h-3.5 text-[#30D158]" />
                <span>Gestion des cookies</span>
              </button>
            )}

            {onOpenSecurity && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenSecurity();
                }}
                className="apple-press inline-flex items-center gap-1.5 text-[#30D158] hover:text-[#34C759] font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Centre de sécurité avancée</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setIsPrivacyOpen(true);
              }}
              className="apple-press inline-flex items-center gap-1.5 text-white/70 hover:text-white"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Politique de confidentialité</span>
            </button>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.08] text-xs font-body text-[#86868B]">
          <p>© 2026 Rights Radar. Système local certifié CE 261/2004.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="apple-press inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.1] transition-all"
          >
            <span>Retour en haut</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#30D158]" />
          </button>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </footer>
  );
};
