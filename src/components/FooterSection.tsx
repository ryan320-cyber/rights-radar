import React, { useState } from 'react';
import { ArrowUp, Shield, Cookie, ShieldCheck } from 'lucide-react';
import { PrivacyModal } from './PrivacyModal';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="S9"
      className="bg-[#050912] text-[#F6F5F1] py-16 border-t border-[#E7E7E2]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-3">
            <h3 className="font-display italic text-2xl text-[#F6F5F1]">rights radar</h3>
            <p className="font-sans text-sm text-[#E7E7E2]/70 leading-relaxed max-w-md">
              Radar d’estimation locale de vos droits de passager aérien. Analyse directe sur votre appareil via WebCrypto et Google Workspace, sans intermédiaires commerciaux ni revente de créances.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#43DDB0]">
              Sources & Références citées
            </h4>
            <p className="font-mono text-xs text-[#5C626D] leading-relaxed">
              {sources.join(' • ')}
            </p>
          </div>
        </div>

        {/* Legal & Privacy Row */}
        <div className="p-4 rounded-xl bg-white/5 border border-[#E7E7E2]/10 text-xs font-mono text-[#5C626D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p>
            <strong className="text-[#F6F5F1]">Avertissement légal :</strong> Ce site constitue un outil d'assistance technique et d'information juridique générale. Il ne se substitue pas à une consultation auprès d'un avocat.
          </p>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {onOpenCookies && (
              <button
                type="button"
                onClick={onOpenCookies}
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition"
              >
                <Cookie className="w-3.5 h-3.5 text-[#43DDB0]" />
                <span>Gestion des cookies</span>
              </button>
            )}

            {onOpenSecurity && (
              <button
                type="button"
                onClick={onOpenSecurity}
                className="inline-flex items-center gap-1.5 text-[#43DDB0] hover:underline"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Centre de sécurité avancée</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white hover:underline"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Politique de confidentialité</span>
            </button>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E7E7E2]/10 text-xs font-mono text-[#5C626D]">
          <p>© 2026 Rights Radar. Système local certifié CE 261/2004.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7E7E2]/20 text-[#F6F5F1] hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
          >
            <span>Retour en haut</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#43DDB0]" />
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
