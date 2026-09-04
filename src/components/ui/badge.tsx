import React from 'react';
import { cn } from './utils';

/**
 * Badge de statut.
 *
 * Les statuts métier (dossier soumis, en révision, validé, rejeté…) étaient
 * colorés à la main écran par écran, avec des couples fond/texte différents
 * pour un même statut d'un écran à l'autre. Les variantes ci-dessous sont les
 * seules à utiliser, et toutes respectent le contraste AA sur fond clair.
 */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-[#F5F6FA] text-[#273A7A]',
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
  accent: 'bg-[#D6A93A]/15 text-[#8A6A17]',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', className, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm whitespace-nowrap',
      TONES[tone],
      className,
    )}
    {...props}
  />
);
