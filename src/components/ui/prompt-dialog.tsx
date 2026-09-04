"use client";

/**
 * Remplacement accessible de `window.prompt()`.
 *
 * Usage :
 *   const prompt = usePrompt();
 *   const reason = await prompt({ title: 'Rejeter la demande', label: 'Raison du rejet' });
 *   if (!reason) return; // même sémantique que window.prompt()
 *
 * `<PromptDialogProvider>` doit être monté une fois au-dessus de l'arbre
 * (cf. src/App.tsx). Le dialogue se ferme avec Échap ou un clic sur l'overlay
 * (résout `null`) et place le focus initial sur le champ de saisie.
 */

import * as React from "react";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { cn } from "./utils";

export interface PromptOptions {
  /** Titre du dialogue (ce que l'utilisateur est en train de faire). */
  title: string;
  /** Contexte complémentaire, affiché sous le titre. */
  description?: React.ReactNode;
  /** Libellé du champ, relié par `htmlFor`. Défaut : reprend le titre. */
  label?: string;
  /** Texte indicatif dans le champ vide. */
  placeholder?: string;
  /** Valeur pré-remplie. */
  defaultValue?: string;
  /** Rend le champ multiligne (`<textarea>`). */
  multiline?: boolean;
  /** Bloque la validation tant que le champ est vide. */
  required?: boolean;
  /** Aide affichée sous le champ (format attendu, exemple…). */
  hint?: React.ReactNode;
  /** `type` du champ HTML (`text`, `date`, `time`…). Ignoré si `multiline`. */
  type?: React.HTMLInputTypeAttribute;
  /** Libellé du bouton de validation. Défaut : « Valider ». */
  confirmLabel?: string;
  /** Libellé du bouton d'annulation. Défaut : « Annuler ». */
  cancelLabel?: string;
}

/* Palette Crésus : bleu nuit #1A2753, or impérial #D6A93A, bleu acier #273A7A. */
const FIELD =
  "w-full rounded-xl border border-[#1A2753]/15 bg-white px-4 py-2.5 text-sm text-[#1A2753] placeholder:text-[#273A7A]/40 outline-none transition-all focus:border-[#D6A93A] focus:ring-2 focus:ring-[#D6A93A]/30";

const SUBMIT_BUTTON =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[#D6A93A] px-5 text-sm font-medium text-white transition-all hover:bg-[#C09830] outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const CANCEL_BUTTON =
  "inline-flex h-10 items-center justify-center rounded-xl border border-[#1A2753]/15 bg-white px-5 text-sm font-medium text-[#1A2753] transition-all hover:bg-[#F5F6FA] outline-none focus-visible:ring-2 focus-visible:ring-[#273A7A] focus-visible:ring-offset-2";

export interface PromptDialogProps extends PromptOptions {
  open: boolean;
  /** Reçoit la saisie, ou `null` en cas d'annulation (comme `window.prompt`). */
  onResolve: (value: string | null) => void;
  className?: string;
}

/**
 * Version contrôlée, utilisable directement lorsqu'on préfère piloter l'état
 * soi-même plutôt que de passer par `usePrompt()`.
 */
export function PromptDialog({
  open,
  onResolve,
  title,
  description,
  label,
  placeholder,
  defaultValue = "",
  multiline = false,
  required = false,
  hint,
  type = "text",
  confirmLabel = "Valider",
  cancelLabel = "Annuler",
  className,
}: PromptDialogProps) {
  const fieldId = React.useId();
  const hintId = `${fieldId}-hint`;
  const [value, setValue] = React.useState(defaultValue);
  const fieldRef = React.useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Réinitialise le champ à chaque ouverture (une nouvelle demande ne doit pas
  // hériter de la saisie précédente).
  React.useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  const submitDisabled = required && value.trim() === "";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitDisabled) return;
    onResolve(value);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Échap, croix de fermeture ou clic sur l'overlay : annulation.
        if (!next) onResolve(null);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-5 rounded-2xl border border-[#1A2753]/10 bg-white p-6 shadow-xl duration-200 sm:max-w-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            fieldRef.current?.focus();
            fieldRef.current?.select?.();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#1A2753]">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="whitespace-pre-line text-[#273A7A]/80">
                {description}
              </DialogDescription>
            ) : (
              /* Radix exige une description : on reprend le titre pour les
                 lecteurs d'écran sans l'afficher deux fois. */
              <DialogPrimitive.Description className="sr-only">
                {title}
              </DialogPrimitive.Description>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor={fieldId}
                className="text-sm font-medium text-[#1A2753]"
              >
                {label ?? title}
                {required && (
                  <span className="ml-1 text-[#EF4444]" aria-hidden="true">
                    *
                  </span>
                )}
              </label>

              {multiline ? (
                <textarea
                  id={fieldId}
                  ref={fieldRef}
                  className={cn(FIELD, "min-h-24 resize-y")}
                  placeholder={placeholder}
                  required={required}
                  aria-describedby={hint ? hintId : undefined}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              ) : (
                <input
                  id={fieldId}
                  ref={fieldRef}
                  type={type}
                  className={FIELD}
                  placeholder={placeholder}
                  required={required}
                  aria-describedby={hint ? hintId : undefined}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              )}

              {hint && (
                <p id={hintId} className="text-xs text-[#273A7A]/60">
                  {hint}
                </p>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                className={CANCEL_BUTTON}
                onClick={() => onResolve(null)}
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                className={SUBMIT_BUTTON}
                disabled={submitDisabled}
              >
                {confirmLabel}
              </button>
            </DialogFooter>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

type PromptFn = (options: PromptOptions) => Promise<string | null>;

const PromptContext = React.createContext<PromptFn | null>(null);

export function PromptDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<PromptOptions | null>(null);
  // Conserver le `resolve` hors du state garantit qu'il n'est appelé qu'une
  // fois, quel que soit l'ordre des événements Radix.
  const resolveRef = React.useRef<((value: string | null) => void) | null>(
    null,
  );

  const settle = React.useCallback((value: string | null) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setOpen(false);
    resolve?.(value);
  }, []);

  const prompt = React.useCallback<PromptFn>(
    (nextOptions) =>
      new Promise<string | null>((resolve) => {
        // Une demande déjà ouverte est considérée comme annulée.
        resolveRef.current?.(null);
        resolveRef.current = resolve;
        setOptions(nextOptions);
        setOpen(true);
      }),
    [],
  );

  return (
    <PromptContext.Provider value={prompt}>
      {children}
      {/* `options` reste monté après la fermeture pour laisser jouer
          l'animation de sortie. */}
      {options && <PromptDialog open={open} onResolve={settle} {...options} />}
    </PromptContext.Provider>
  );
}

/**
 * Retourne `prompt(options): Promise<string | null>`.
 * `null` = annulation, comme `window.prompt()`.
 */
export function usePrompt(): PromptFn {
  const prompt = React.useContext(PromptContext);
  if (!prompt) {
    throw new Error(
      "usePrompt() doit être utilisé à l'intérieur de <PromptDialogProvider>.",
    );
  }
  return prompt;
}
