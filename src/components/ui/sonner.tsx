"use client";

import * as React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

/**
 * Toaster Crésus.
 *
 * Monté une seule fois dans `src/App.tsx`, il dessert les quatre espaces
 * (mobile, web, admin, comptable). Position `top-center` : la vue mobile a une
 * barre de navigation fixe en bas, un toast en bas la recouvrirait.
 *
 * Les couleurs sont fixées explicitement (palette Crésus) plutôt que via les
 * tokens shadcn `--popover` / `--border` : ceux-ci ne sont pas définis dans ce
 * projet, les toasts se seraient affichés sans fond. `next-themes` n'est pas
 * monté non plus, le thème est donc figé sur « light ».
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      richColors
      closeButton
      className="toaster group"
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#1A2753",
          "--normal-border": "rgba(26, 39, 83, 0.12)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
