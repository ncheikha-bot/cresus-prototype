"use client";

/**
 * Remplacement accessible de `window.confirm()`.
 *
 * Usage :
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: 'Supprimer ce rendez-vous ?', variant: 'destructive' }))) return;
 *
 * `<ConfirmDialogProvider>` doit être monté une fois au-dessus de l'arbre
 * (cf. src/App.tsx). Le dialogue se ferme avec Échap ou un clic sur l'overlay
 * (résout `false`) et place le focus initial sur l'action principale.
 */

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog@1.1.6";

import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { cn } from "./utils";

export type ConfirmVariant = "default" | "destructive";

export interface ConfirmOptions {
  /** Question courte posée à l'utilisateur. */
  title: string;
  /** Contexte ou conséquence de l'action. */
  description?: React.ReactNode;
  /** Libellé du bouton de validation. Défaut : « Confirmer ». */
  confirmLabel?: string;
  /** Libellé du bouton d'annulation. Défaut : « Annuler ». */
  cancelLabel?: string;
  /** `destructive` colore l'action principale en rouge. */
  variant?: ConfirmVariant;
}

/* Palette Crésus : bleu nuit #1A2753, or impérial #D6A93A, bleu acier #273A7A. */
const ACTION_BASE =
  "inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-medium text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const ACTION_VARIANTS: Record<ConfirmVariant, string> = {
  default: "bg-[#D6A93A] hover:bg-[#C09830] focus-visible:ring-[#1A2753]",
  destructive: "bg-[#EF4444] hover:bg-[#DC2626] focus-visible:ring-[#EF4444]",
};

const CANCEL_BUTTON =
  "inline-flex h-10 items-center justify-center rounded-xl border border-[#1A2753]/15 bg-white px-5 text-sm font-medium text-[#1A2753] transition-all hover:bg-[#F5F6FA] outline-none focus-visible:ring-2 focus-visible:ring-[#273A7A] focus-visible:ring-offset-2";

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  /** Reçoit `true` (validation) ou `false` (annulation, Échap, clic hors zone). */
  onResolve: (confirmed: boolean) => void;
  className?: string;
}

/**
 * Version contrôlée, utilisable directement lorsqu'on préfère piloter l'état
 * soi-même plutôt que de passer par `useConfirm()`.
 */
export function ConfirmDialog({
  open,
  onResolve,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  className,
}: ConfirmDialogProps) {
  const actionRef = React.useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Échap ou clic sur l'overlay : équivalent d'une annulation.
        if (!next) onResolve(false);
      }}
    >
      {/* Portail / overlay / contenu composés depuis les primitives Radix
          plutôt que depuis <AlertDialogContent> : le wrapper shadcn du projet
          déclare AlertDialogOverlay sans forwardRef, ce qui déclenche un
          avertissement React 18 (« Function components cannot be given refs »)
          lorsque Radix lui attache une ref d'animation. */}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-5 rounded-2xl border border-[#1A2753]/10 bg-white p-6 shadow-xl duration-200 sm:max-w-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          onOpenAutoFocus={(event) => {
            // Radix focalise « Annuler » par défaut : on privilégie l'action
            // principale, plus rapide au clavier.
            event.preventDefault();
            actionRef.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1A2753]">
              {title}
            </AlertDialogTitle>
            {description ? (
              <AlertDialogDescription className="whitespace-pre-line text-[#273A7A]/80">
                {description}
              </AlertDialogDescription>
            ) : (
              /* Radix exige une description : on reprend le titre pour les
                 lecteurs d'écran sans l'afficher deux fois. */
              <AlertDialogPrimitive.Description className="sr-only">
                {title}
              </AlertDialogPrimitive.Description>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogPrimitive.Cancel className={CANCEL_BUTTON}>
              {cancelLabel}
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              ref={actionRef}
              className={cn(ACTION_BASE, ACTION_VARIANTS[variant])}
              onClick={() => onResolve(true)}
            >
              {confirmLabel}
            </AlertDialogPrimitive.Action>
          </AlertDialogFooter>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialog>
  );
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  // Conserver le `resolve` hors du state garantit qu'il n'est appelé qu'une
  // fois : Radix déclenche `onOpenChange(false)` juste après le clic sur
  // l'action, ce qui produirait sinon une seconde résolution.
  const resolveRef = React.useRef<((confirmed: boolean) => void) | null>(null);

  const settle = React.useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setOpen(false);
    resolve?.(confirmed);
  }, []);

  const confirm = React.useCallback<ConfirmFn>(
    (nextOptions) =>
      new Promise<boolean>((resolve) => {
        // Une demande déjà ouverte est considérée comme annulée.
        resolveRef.current?.(false);
        resolveRef.current = resolve;
        setOptions(nextOptions);
        setOpen(true);
      }),
    [],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {/* `options` reste monté après la fermeture pour laisser jouer
          l'animation de sortie. */}
      {options && (
        <ConfirmDialog open={open} onResolve={settle} {...options} />
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * Retourne `confirm(options): Promise<boolean>`.
 * `true` = l'utilisateur a validé, `false` = annulation.
 */
export function useConfirm(): ConfirmFn {
  const confirm = React.useContext(ConfirmContext);
  if (!confirm) {
    throw new Error(
      "useConfirm() doit être utilisé à l'intérieur de <ConfirmDialogProvider>.",
    );
  }
  return confirm;
}
