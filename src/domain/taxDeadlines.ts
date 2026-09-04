/**
 * Échéances fiscales affichées sur les tableaux de bord comptables.
 *
 * Les deux écrans calculaient chacun le leur. Le mobile lisait `nextDeadline`,
 * `name` et `frequency` — trois champs optionnels qu'aucune déclaration ne
 * porte : il affichait « Invalid Date / Dans NaN jours ». Le web lisait les bons
 * champs mais annonçait « Dans 0 jours » pour une échéance passée.
 */
import type { TaxDeclaration } from '../data/accountingData';

/** Libellés des impôts, pour ne pas montrer la clé technique. */
const LIBELLES_TYPE: Record<string, string> = {
  tva: 'TVA',
  is: 'Impôt sur les sociétés',
  patente: 'Patente',
  irpp: 'IRPP',
  cfce: 'CFCE',
  autre: 'Autre',
};

export interface EcheanceFiscale {
  /** Intitulé de la déclaration. */
  libelle: string;
  /** Impôt concerné, en clair. */
  impot: string;
  /** Date limite, formatée en français. Vide si la date est absente. */
  date: string;
  /** « Dans 12 jours », « Demain », « Aujourd'hui », « En retard de 3 jours ». */
  delai: string;
  /** Vrai si la date est dépassée : l'affichage doit alerter. */
  enRetard: boolean;
}

const JOUR = 1000 * 60 * 60 * 24;

/** Nombre de jours entiers entre aujourd'hui et une date, passé compris. */
const joursRestants = (echeance: Date, maintenant: number): number =>
  Math.ceil((echeance.getTime() - maintenant) / JOUR);

export const getEcheanceFiscale = (
  declaration: TaxDeclaration,
  maintenant: number = Date.now(),
): EcheanceFiscale => {
  const impot = LIBELLES_TYPE[declaration.type] ?? declaration.type.toUpperCase();
  const libelle = declaration.description || declaration.name || impot;
  const brute = declaration.nextDeadline ?? declaration.dueDate;
  const echeance = brute ? new Date(brute) : null;

  // Une date absente ou illisible ne doit pas produire « Invalid Date ».
  if (!echeance || Number.isNaN(echeance.getTime())) {
    return { libelle, impot, date: '', delai: 'Date à confirmer', enRetard: false };
  }

  const date = echeance.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const jours = joursRestants(echeance, maintenant);

  if (jours < 0) {
    const retard = Math.abs(jours);
    return {
      libelle,
      impot,
      date,
      delai: `En retard de ${retard} jour${retard > 1 ? 's' : ''}`,
      enRetard: true,
    };
  }
  if (jours === 0) return { libelle, impot, date, delai: "Aujourd'hui", enRetard: false };
  if (jours === 1) return { libelle, impot, date, delai: 'Demain', enRetard: false };
  return { libelle, impot, date, delai: `Dans ${jours} jours`, enRetard: false };
};

/**
 * Déclarations à faire figurer sous « Prochaines échéances ».
 *
 * Les deux tableaux de bord prenaient les premières de la liste, sans trier ni
 * filtrer : une déclaration déjà payée y figurait, et trois échéances dépassées
 * s'affichaient sous un titre qui annonce l'inverse. On garde ce qui reste dû,
 * du plus proche au plus lointain, les retards en tête puisqu'ils pressent.
 */
export const getProchainesEcheances = (
  declarations: TaxDeclaration[],
  limite: number,
  maintenant: number = Date.now(),
): TaxDeclaration[] => {
  const dues = declarations.filter(d => d.status !== 'paid');
  const quand = (d: TaxDeclaration) => {
    const brute = d.nextDeadline ?? d.dueDate;
    const date = brute ? new Date(brute).getTime() : NaN;
    return Number.isNaN(date) ? Infinity : date;  // sans date : en dernier
  };
  const passees = dues.filter(d => quand(d) < maintenant).sort((a, b) => quand(b) - quand(a));
  const aVenir = dues.filter(d => quand(d) >= maintenant).sort((a, b) => quand(a) - quand(b));
  return [...passees, ...aVenir].slice(0, limite);
};
