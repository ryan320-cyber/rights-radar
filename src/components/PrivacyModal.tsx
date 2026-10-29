import React from 'react';
import { X, ShieldCheck, Lock, Database, Server } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 bg-[#101722]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[#101722] text-[#F6F5F1] border border-[#E7E7E2]/20 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#E7E7E2]/10 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#43DDB0]" />
            <h2 id="privacy-modal-title" className="font-serif text-2xl">
              Transparence & Politique de Confidentialité
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="p-1.5 rounded-full border border-[#E7E7E2]/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#43DDB0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 font-sans text-sm text-[#E7E7E2]/80 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-semibold uppercase">
              <Lock className="w-4 h-4" />
              <span>Note : Mode Démo Actif</span>
            </div>
            <p className="text-xs">
              Pour des raisons de simplicité et de démonstration, le scanner Gmail est actuellement en <strong>mode simulation locale</strong>. Aucune connexion réelle à votre compte Google n'est établie et aucune donnée de votre boîte de réception n'est lue. Les e-mails affichés sont des exemples fictifs destinés à illustrer les capacités de détection de Rights Radar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#43DDB0] font-semibold uppercase">
              <Server className="w-4 h-4" />
              <span>1. Recherche en direct (Google Search Grounding)</span>
            </div>
            <p className="text-xs">
              Lorsque vous déclenchez la vérification d'incident d'un vol dans le simulateur, le code de vol et la date sont transmis au serveur de Rights Radar pour consulter l'API Gemini avec Google Search. Seules les données publiques de vol sont analysées pour identifier les bulletins météo et grèves.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#43DDB0] font-semibold uppercase">
              <Database className="w-4 h-4" />
              <span>2. Sauvegarde & Liste d'attente</span>
            </div>
            <p className="text-xs">
              Si vous êtes connecté via Firebase et choisissez d'enregistrer une analyse, celle-ci est conservée sur votre profil personnel. Vos réponses au questionnaire d'enquête et votre e-mail d'inscription à la liste d'attente sont enregistrés de manière sécurisée pour améliorer nos services.
            </p>
          </div>

          <h3 className="font-serif text-lg text-[#F6F5F1] pt-2">Vos Droits (RGPD)</h3>
          <p className="text-xs">
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit permanent d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez supprimer vos analyses sauvegardées directement depuis le simulateur.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E7E7E2]/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#43DDB0] text-[#101722] font-mono text-xs font-semibold hover:bg-[#38c49b] cursor-pointer"
          >
            Compris & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
