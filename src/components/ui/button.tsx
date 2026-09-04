import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils';

/**
 * Bouton de l'application.
 *
 * Remplace la version shadcn, qui référençait des tokens (`bg-primary`,
 * `text-primary-foreground`, `bg-destructive`, `ring-ring`…) **définis nulle
 * part dans ce projet** : les boutons s'affichaient donc sans couleur de fond.
 * Les variantes gardent leurs noms d'origine pour rester compatibles avec
 * `alert-dialog.tsx`, mais portent la palette Crésus.
 *
 * Le rayon est `rounded-xl`, la valeur employée par les ~770 boutons écrits à
 * la main dans les écrans — et non le `rounded-md` de shadcn, qui ne
 * correspondait à rien de ce que le projet affiche.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl',
    'text-sm font-medium transition-all',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    // Focus visible au clavier : le projet n'en avait aucun sur ses 988 boutons.
    'outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-[#D6A93A] text-white hover:bg-[#C09830]',
        primary: 'bg-[#1A2753] text-white hover:bg-[#273A7A]',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        outline: 'border border-[#273A7A]/20 bg-white text-[#1A2753] hover:bg-[#F5F6FA]',
        secondary: 'bg-[#F5F6FA] text-[#1A2753] hover:bg-[#E5E6EB]',
        ghost: 'text-[#1A2753] hover:bg-[#F5F6FA]',
        link: 'text-[#273A7A] underline-offset-4 hover:underline',
      },
      size: {
        // 44 px de haut : la cible tactile minimale recommandée.
        default: 'h-11 px-5 py-2',
        sm: 'h-9 gap-1.5 px-3',
        lg: 'h-12 px-6',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      // `type="button"` par défaut : sans lui, un bouton placé dans un
      // formulaire le soumet au clic, ce qui n'est presque jamais voulu ici.
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
