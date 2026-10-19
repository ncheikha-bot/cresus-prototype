/**
 * Retour à l'état de démonstration.
 *
 * Une démonstration se joue plusieurs fois : sans moyen de repartir à zéro, les
 * dossiers d'essai s'accumulent dans le navigateur et le prochain visiteur
 * hérite des brouillons du précédent. Effacer les clés de l'application suffit —
 * le jeu de référence, lui, vit dans le code et revient de lui-même.
 */
import { partageActif } from './sync';

/** Vrai si la clé appartient à l'application. */
const estANous = (cle: string): boolean =>
  cle.startsWith('cresus_') || cle === 'hasSeenOnboarding';

/**
 * Efface les données de ce navigateur, puis recharge.
 *
 * Quand une base partagée est configurée, l'effacement est **local** : les
 * dossiers restent visibles pour les autres participants, et ce navigateur les
 * retrouvera au rechargement. C'est voulu — un participant ne doit pas pouvoir
 * effacer la démonstration de tout le monde d'un clic.
 */
export const reinitialiserDonnees = (): void => {
  try {
    Object.keys(localStorage).filter(estANous).forEach(c => localStorage.removeItem(c));
  } catch {
    /* stockage indisponible : il n'y avait rien à effacer */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* idem */
  }
  window.location.href = import.meta.env.BASE_URL;
};

/** Ce que la réinitialisation va faire, à annoncer avant de la lancer. */
export const portéeReinitialisation = (): string =>
  partageActif
    ? "Vos dossiers d'essai seront effacés de ce navigateur. Les données partagées avec les autres participants ne sont pas touchées."
    : "Tous les dossiers, brouillons et notifications créés sur cet appareil seront effacés. Le jeu de démonstration revient à son état initial.";
