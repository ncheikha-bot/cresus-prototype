import React from 'react';
import { cn } from './utils';

/**
 * Carte : la surface de contenu de l'application.
 *
 * Le projet écrivait cette carte à la main dans 834 endroits, en
 * **377 signatures de classes distinctes** — alors qu'un archétype existait de
 * fait (`bg-white rounded-2xl p-6 shadow-sm`, 90 occurrences). Ce composant
 * fixe cet archétype et n'expose que les variations réellement utilisées.
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const PADDINGS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  /** Ombre portée légère. Mettre à false pour une carte posée sur fond blanc. */
  elevated?: boolean;
  /** Ajoute une bordure discrète plutôt qu'une ombre. */
  bordered?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', elevated = true, bordered = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-2xl',
        PADDINGS[padding],
        elevated && 'shadow-sm',
        bordered && 'border border-[#273A7A]/10',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

/** En-tête de carte : titre à gauche, action éventuelle à droite. */
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between mb-4', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/** Titre de carte. Rendu en `h3` pour rester dans la hiérarchie du document. */
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-[#1A2753]', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';
