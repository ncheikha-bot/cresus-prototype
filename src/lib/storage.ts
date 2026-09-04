/**
 * Accès au stockage, tolérant aux pannes.
 *
 * Le stockage peut échouer pour des raisons qui n'ont rien à voir avec
 * l'application : quota dépassé, mode privé de Safari, contenu corrompu par une
 * version antérieure. Aucun de ces cas ne doit interrompre la saisie en cours
 * ni empêcher l'application de démarrer — d'où le repli systématique.
 *
 * Les données métier sont en outre recopiées dans un dépôt commun quand une base
 * est configurée : le stockage local devient alors un cache, et deux appareils
 * différents voient le même dossier. Le contrat des fonctions ci-dessous ne
 * change pas, si bien qu'aucun écran n'a eu à être modifié.
 */
import { pousserEtatDistant, souscrireEtatDistant } from './remoteStore';

/**
 * Clés recopiées dans le dépôt commun.
 *
 * Y figure ce qui circule entre le client et l'administration. En sont exclus
 * la session — propre à l'onglet, c'est ce qui permet d'ouvrir le client et
 * l'administration côte à côte — et l'onboarding, propre au navigateur.
 */
const estPartagee = (cle: string): boolean =>
  cle.startsWith('cresus_') && cle !== 'cresus_current_user';

/** Lit une valeur JSON. Renvoie `fallback` si absente, illisible ou corrompue. */
export const readJSON = <T>(key: string, fallback: T): T => {
  try {
    const brut = localStorage.getItem(key);
    if (!brut) return fallback;
    return JSON.parse(brut) as T;
  } catch {
    return fallback;
  }
};

/** Écrit une valeur JSON. Renvoie `false` si l'écriture a échoué. */
export const writeJSON = (key: string, value: unknown): boolean => {
  if (estPartagee(key)) pousserEtatDistant(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/**
 * Écrit seulement si la valeur diffère de celle déjà enregistrée.
 *
 * Sans cette précaution, les onglets se renvoient leurs écritures : celui qui
 * reçoit un changement met son état à jour, son effet de persistance réécrit
 * aussitôt la clé, et l'onglet d'origine relit cette écriture — au risque
 * d'écraser une modification plus récente. Comparer avant d'écrire suffit à
 * arrêter l'aller-retour.
 */
export const writeJSONIfChanged = (key: string, value: unknown): void => {
  try {
    const serialise = JSON.stringify(value);
    if (localStorage.getItem(key) === serialise) return;
    localStorage.setItem(key, serialise);
    if (estPartagee(key)) pousserEtatDistant(key, value);
  } catch {
    /* stockage indisponible : l'application continue sans persistance */
  }
};

/** Efface une clé. Silencieux si le stockage est indisponible. */
export const removeKey = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
};

/**
 * Même chose, mais dans le stockage **de l'onglet**.
 *
 * La session y vit désormais : le `localStorage` est commun à tous les onglets
 * d'un même navigateur, si bien qu'ouvrir l'administration dans un second onglet
 * remplaçait la session cliente du premier. Or c'est précisément ce que l'on
 * veut faire — client d'un côté, administration de l'autre — pour dérouler un
 * dossier de bout en bout. Les données métier, elles, restent partagées.
 */
export const readSession = <T>(key: string, fallback: T): T => {
  try {
    const brut = sessionStorage.getItem(key);
    if (!brut) return fallback;
    return JSON.parse(brut) as T;
  } catch {
    return fallback;
  }
};

export const writeSession = (key: string, value: unknown): boolean => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const removeSessionKey = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
};

/**
 * Prévient l'onglet appelant des écritures faites par les autres onglets.
 *
 * L'événement `storage` n'est émis que dans les *autres* onglets : chacun peut
 * donc recharger la clé modifiée sans se réveiller sur ses propres écritures.
 * Renvoie la fonction de désabonnement.
 */
export const onStorageChange = (
  cles: string[],
  auChangement: (cle: string) => void,
): (() => void) => {
  const ecouteur = (e: StorageEvent) => {
    if (e.storageArea !== localStorage) return;
    // `key` est nul quand tout le stockage est vidé : tout est à relire.
    if (e.key === null) {
      cles.forEach(auChangement);
      return;
    }
    if (cles.includes(e.key)) auChangement(e.key);
  };
  window.addEventListener('storage', ecouteur);

  // Les écritures venues d'un autre appareil empruntent le même chemin que
  // celles d'un autre onglet : l'application ne fait pas la différence.
  const seDesabonner = souscrireEtatDistant((nom, valeur) => {
    if (!cles.includes(nom)) return;
    try {
      localStorage.setItem(nom, JSON.stringify(valeur));
    } catch {
      /* cache local indisponible : l'état reste celui de la mémoire */
    }
    auChangement(nom);
  });

  return () => {
    window.removeEventListener('storage', ecouteur);
    seDesabonner();
  };
};

/** Clés utilisées par l'application, regroupées pour éviter les collisions. */
export const STORAGE_KEYS = {
  /** Brouillons de création, par utilisateur : `cresus_drafts_<userId>`. */
  drafts: (userId: string) => `cresus_drafts_${userId}`,
  /** Avancement des dossiers, partagé entre l'admin et les clients. */
  companyProcesses: 'cresus_company_processes',
  /** Sociétés créées depuis l'application, hors données de référence. */
  companies: 'cresus_companies',
  /** Notifications, partagées : l'administration en émet pour le client. */
  notifications: 'cresus_notifications',
  /** Rendez-vous de signature, demandés par le client et confirmés par l'admin. */
  appointments: 'cresus_appointments',
  /** Demandes d'ouverture de compte, suivies par la banque et l'administration. */
  bankRequests: 'cresus_bank_requests',
  /** Demandes de modification post-statutaire, du client vers l'administration. */
  modifications: 'cresus_modifications',
  /** Contrats de domiciliation souscrits par les clients. */
  domiciliations: 'cresus_domiciliations',
  /** Commandes de branding passées par les clients. */
  brandingProjects: 'cresus_branding_projects',
  /** Session en cours : sans elle, un rechargement renvoyait à la connexion. */
  currentUser: 'cresus_current_user',
  onboardingSeen: 'hasSeenOnboarding',
} as const;
