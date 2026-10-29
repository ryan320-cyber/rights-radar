import React, { useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.ts';
import { LogIn, LogOut, Menu, ShieldCheck, UserCheck, Mail, Shield } from 'lucide-react';
import { MenuOverlay } from './MenuOverlay.tsx';
import { soundEngine } from '../utils/soundEngine.ts';

interface HeaderProps {
  user: User | null;
  isReviewMode: boolean;
  onToggleReviewMode: () => void;
  onOpenGmailScanner: () => void;
  onOpenSecurity: () => void;
}

export function Header({ user, isReviewMode, onToggleReviewMode, onOpenGmailScanner, onOpenSecurity }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      if ((err as any)?.code === 'auth/popup-closed-by-user' || (err as any)?.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.warn('[Header] Auth Google:', err);
      setAuthError('Connexion interrompue ou bloquée. Veuillez réessayer.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Header] Déconnexion:', err);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    soundEngine.playClick();
    if (href === '#' || href === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#101722] text-[#F6F5F1] px-4 py-2 rounded font-code text-xs border border-[#43DDB0]"
      >
        Passer au contenu principal
      </a>

      <header className="sticky top-0 z-40 w-full bg-[#03070D]/85 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Wordmark */}
          <a
            href="#"
            onClick={(e) => handleNavClick(e, '#')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#43DDB0] ring-4 ring-[#43DDB0]/20 shadow-[0_0_12px_rgba(67,221,176,0.6)]" />
            <span className="font-display italic text-2xl sm:text-3xl tracking-tight text-white group-hover:text-[#43DDB0] transition">
              rights radar
            </span>
          </a>

          {/* Center Navigation Links (Unseen Studio style) */}
          <nav className="hidden md:flex items-center gap-7 font-body text-xs text-white/70 tracking-wide">
            <a
              href="#probleme"
              onClick={(e) => handleNavClick(e, '#probleme')}
              className="hover:text-white transition cursor-pointer"
            >
              Index
            </a>
            <a
              href="#solution"
              onClick={(e) => handleNavClick(e, '#solution')}
              className="hover:text-white transition cursor-pointer"
            >
              Fonctionnement
            </a>
            <a
              href="#engagements"
              onClick={(e) => handleNavClick(e, '#engagements')}
              className="hover:text-white transition cursor-pointer"
            >
              Déontologie
            </a>
            <a
              href="#comparaison"
              onClick={(e) => handleNavClick(e, '#comparaison')}
              className="hover:text-white transition cursor-pointer"
            >
              Modèle
            </a>
            <a
              href="#inscription"
              onClick={(e) => handleNavClick(e, '#inscription')}
              className="hover:text-white transition cursor-pointer"
            >
              Liste d’attente
            </a>
          </nav>

          {/* Right Controls: Gmail Scanner + Security + Auth + Circular Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Gmail Scanner Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenGmailScanner();
              }}
              title="Scanner mes confirmations de vol dans Gmail"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-code text-white transition active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 text-[#43DDB0]" />
              <span className="hidden sm:inline font-medium">Scanner Gmail</span>
            </button>

            {/* Advanced Security Shield Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenSecurity();
              }}
              title="Centre de sécurité & isolation mémoire"
              className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 text-white/80 hover:text-white transition"
              aria-label="Centre de sécurité avancée"
            >
              <ShieldCheck className="w-4 h-4 text-[#43DDB0]" />
            </button>

            {/* Review mode indicator */}
            {isReviewMode && (
              <button
                type="button"
                onClick={onToggleReviewMode}
                title="Désactiver le mode relecture"
                className="review-tag hidden xl:inline-flex cursor-pointer hover:bg-amber-500/20"
              >
                MODE RELECTURE (?review=1)
              </button>
            )}

            {/* Firebase Auth Google Sign-in */}
            {user ? (
              <div className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1.5 rounded-full border border-white/15 transition">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Utilisateur'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#43DDB0] text-black flex items-center justify-center text-xs font-code font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-body text-white font-medium max-w-[100px] truncate hidden sm:inline-block">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Se déconnecter"
                  aria-label="Se déconnecter"
                  className="p-1 hover:text-red-400 transition text-white/60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
                aria-label="Connexion Google"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-code font-semibold transition focus:ring-2 focus:ring-[#43DDB0]"
              >
                <LogIn className="w-3.5 h-3.5 text-black" />
                <span className="hidden xs:inline">{isAuthLoading ? '...' : 'Connexion'}</span>
              </button>
            )}

            {/* Circular Three-Dots Menu Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              className="w-9 h-9 rounded-full border border-white/15 hover:border-[#43DDB0] bg-white/[0.04] hover:bg-white/[0.1] text-white flex items-center justify-center transition focus:ring-2 focus:ring-[#43DDB0]"
            >
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-white" />
                <span className="w-1 h-1 rounded-full bg-white" />
                <span className="w-1 h-1 rounded-full bg-white" />
              </div>
            </button>
          </div>
        </div>

        {authError && (
          <div className="bg-red-950/80 text-red-200 text-xs px-4 py-1.5 text-center border-t border-red-800 font-body">
            {authError}
          </div>
        )}
      </header>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
