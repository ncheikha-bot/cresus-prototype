import React from 'react';
import { motion } from 'motion/react';
import { X } from '../../ui/icons';

/**
 * Enveloppe commune aux modales du dossier admin.
 *
 * Les sept modales répétaient le même échafaudage : voile sombre, fermeture au
 * clic extérieur, `stopPropagation` sur la carte, en-tête bleu nuit avec icône
 * et bouton de fermeture. Environ 20 lignes identiques chacune.
 */
export interface ModalShellProps {
  /** Clé d'animation, unique par modale. */
  animationKey: string;
  title: string;
  icon: React.ElementType;
  onClose: () => void;
  /** Largeur maximale de la carte (classe Tailwind). */
  maxWidth?: string;
  /** Barre d'actions collée en bas, hors de la zone défilante. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  animationKey,
  title,
  icon: Icon,
  onClose,
  maxWidth = 'max-w-2xl',
  footer,
  children,
}) => {
  // Échap ferme la modale : le projet n'avait aucune gestion du clavier.
  React.useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [onClose]);

  return (
    <motion.div
      key={animationKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >
        <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-[#D6A93A]" />
            <h2 className="text-white text-xl">{title}</h2>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="border-t border-[#F5F6FA] px-6 py-4 bg-[#F5F6FA]/50 flex gap-3 flex-shrink-0 rounded-b-2xl">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
