  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";

  // Le rendu n'attend pas le serveur : l'application s'affiche depuis son
  // cache local, puis l'état partagé arrive à l'ouverture de session (voir
  // `lib/sync.ts`). Un hébergement gratuit peut mettre près d'une minute à se
  // réveiller ; bloquer l'affichage pendant ce temps laisserait une page blanche.
  createRoot(document.getElementById("root")!).render(<App />);
