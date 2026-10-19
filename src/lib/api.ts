/**
 * Client de l'API Crésus.
 *
 * Sans `VITE_API_URL`, l'application fonctionne comme avant, sur le seul
 * stockage du navigateur : c'est ce qui permet de la faire tourner sans
 * serveur, ou de publier une version de démonstration autonome.
 */

const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '');

/** Vrai si un serveur est configuré pour cette construction. */
export const apiActive = BASE.length > 0;

/** Jeton de l'onglet. Il vit avec la session : un onglet, une identité. */
const CLE_JETON = 'cresus_jeton';

interface JetonEnregistre {
  jeton: string;
  utilisateurId: string;
}

const lireJeton = (): JetonEnregistre | null => {
  try {
    const brut = sessionStorage.getItem(CLE_JETON);
    return brut ? (JSON.parse(brut) as JetonEnregistre) : null;
  } catch {
    return null;
  }
};

let courant: JetonEnregistre | null = lireJeton();

export const jetonCourant = (): string | null => courant?.jeton ?? null;

export class ErreurApi extends Error {
  constructor(
    readonly statut: number,
    message: string,
  ) {
    super(message);
  }
}

export const appeler = async <T>(chemin: string, options: RequestInit = {}): Promise<T> => {
  const reponse = await fetch(`${BASE}/api${chemin}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(courant ? { Authorization: `Bearer ${courant.jeton}` } : {}),
      ...options.headers,
    },
  });
  if (!reponse.ok) {
    const corps = await reponse.json().catch(() => ({}));
    throw new ErreurApi(reponse.status, corps.message ?? reponse.statusText);
  }
  return (reponse.status === 204 ? undefined : await reponse.json()) as T;
};

/**
 * Ouvre une session serveur pour l'utilisateur choisi.
 *
 * Le prototype connecte d'office les comptes de démonstration — choisir
 * « Administration » suffit. La même règle vaut côté serveur, si et seulement
 * s'il a été lancé avec `DEMO_LOGIN=true`.
 *
 * Renvoie `true` si une nouvelle session a été ouverte, `false` si celle de
 * l'onglet convenait déjà.
 */
export const ouvrirSession = async (utilisateurId: string): Promise<boolean> => {
  if (!apiActive) return false;
  if (courant?.utilisateurId === utilisateurId) return false;

  const { jeton } = await appeler<{ jeton: string }>('/auth/demo', {
    method: 'POST',
    body: JSON.stringify({ utilisateurId }),
  });
  courant = { jeton, utilisateurId };
  try {
    sessionStorage.setItem(CLE_JETON, JSON.stringify(courant));
  } catch {
    /* stockage de l'onglet indisponible : la session durera le temps de la page */
  }
  return true;
};

export const fermerSession = (): void => {
  courant = null;
  try {
    sessionStorage.removeItem(CLE_JETON);
  } catch {
    /* rien à effacer */
  }
};

/** Adresse du flux temps réel, jeton compris (EventSource ne pose pas d'en-tête). */
export const adresseFlux = (): string | null =>
  courant ? `${BASE}/api/events?token=${encodeURIComponent(courant.jeton)}` : null;
