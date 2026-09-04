  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import { chargerEtatDistant, partageActif } from "./lib/remoteStore";

  /**
   * L'état commun est chargé **avant** le premier rendu.
   *
   * Le contexte lit son état initial dans le stockage local au montage : hydrater
   * après coup laisserait apparaître l'ancien contenu, puis le vrai — et un
   * nouvel appareil, dont le cache est vide, démarrerait sur le jeu de
   * démonstration avant de se corriger sous les yeux de l'utilisateur.
   */
  const demarrer = async () => {
    if (partageActif) {
      for (const { cle, valeur } of await chargerEtatDistant()) {
        try {
          localStorage.setItem(cle, JSON.stringify(valeur));
        } catch {
          /* cache local indisponible : l'application lira le réseau à chaque fois */
        }
      }
    }
    createRoot(document.getElementById("root")!).render(<App />);
  };

  void demarrer();
