import { getDirectorTitle, getLegalFormInfo } from './legalForms';
import { parseAmount } from '../lib/format';

/**
 * Règles de validation du tunnel de création d'entreprise.
 *
 * Ces fonctions étaient dupliquées à l'identique entre les tunnels mobile et
 * web — dont `handleNext`, 353 lignes de validation reproduites à deux lignes
 * d'écart. Elles sont ici pures : mêmes entrées, mêmes sorties, testables.
 */

export interface AssociateShare {
  percentage: string;
  amount: string;
}

export interface DocumentToUpload {
  id: string;
  name: string;
  description: string;
  required: boolean;
  maxFiles: number;
}

/** Capital saisi, tolérant aux espaces de formatage. */
export const getCapitalNumber = (capital: string): number => parseAmount(capital);

/** Somme des parts, en pourcentage. */
export const getTotalPercentage = (associates: AssociateShare[]): number =>
  associates.reduce((sum, a) => sum + parseAmount(a.percentage), 0);

/** Somme des apports, en FCFA. */
export const getTotalAmount = (associates: AssociateShare[]): number =>
  associates.reduce((sum, a) => sum + parseAmount(a.amount), 0);

/** Le capital atteint-il le minimum légal de la forme juridique ? */
export const isCapitalValid = (capital: string, legalForm: string): boolean =>
  getCapitalNumber(capital) >= getLegalFormInfo(legalForm).capitalMin;

/** Le nombre d'associés respecte-t-il les bornes de la forme juridique ? */
export const isAssociatesCountValid = (count: number, legalForm: string): boolean => {
  const { associesMin, associesMax } = getLegalFormInfo(legalForm);
  if (count < associesMin) return false;
  if (associesMax !== null && count > associesMax) return false;
  return true;
};

/**
 * La répartition est-elle cohérente ?
 * Les tolérances (0,01 % et 1 FCFA) absorbent les arrondis de saisie.
 */
export const isCapitalDistributionValid = (
  associates: AssociateShare[],
  capital: string,
): boolean => {
  const totalPercentage = getTotalPercentage(associates);
  const totalAmount = getTotalAmount(associates);
  return Math.abs(totalPercentage - 100) < 0.01
    && Math.abs(totalAmount - getCapitalNumber(capital)) < 1;
};

/** Documents à fournir, variables selon la forme juridique et le nombre d'associés. */
export const getRequiredDocuments = (
  legalForm: string,
  associatesCount: number,
  useHonorDeclaration: boolean,
): DocumentToUpload[] => {
  const directorTitle = getDirectorTitle(legalForm);

  const documents: DocumentToUpload[] = [
    {
      id: 'cni_gerant',
      name: `CNI du ${directorTitle}`,
      description: "Copie recto-verso de la carte d'identité nationale (PDF, JPG, PNG)",
      required: true,
      maxFiles: 5,
    },
    {
      id: 'casier',
      name: 'Casier judiciaire',
      description: useHonorDeclaration
        ? "Remplacé par une déclaration sur l'honneur"
        : 'Bulletin n°3 du casier judiciaire (moins de 3 mois)',
      required: !useHonorDeclaration,
      maxFiles: 5,
    },
  ];

  if (legalForm === 'SA') {
    documents.push({
      id: 'cni_administrateurs',
      name: 'CNI des administrateurs',
      description: 'Copies des CNI de tous les membres du CA (min 3)',
      required: true,
      maxFiles: 10,
    });
  }

  if (associatesCount > 1) {
    documents.push({
      id: 'cni_associes',
      name: 'CNI de tous les associés',
      description: 'Copies des CNI de chaque associé',
      required: true,
      maxFiles: Math.max(associatesCount, 10),
    });
  }

  return documents;
};

/** Pièce téléversée dans le tunnel, avant transmission au dossier. */
interface FichierTeleverse {
  id: string;
  name: string;
  uploadedAt?: string;
  status?: string;
}

/** Document tel que l'administration l'examine. */
export interface DocumentSoumis {
  id: string;
  name: string;
  type: 'identity' | 'declaration' | 'JUSTIFICATIF';
  uploadedAt: string;
  status: 'pending';
}

/** Catégorie du tunnel → type de document manipulé par l'administration. */
const TYPE_PAR_CATEGORIE: Record<string, DocumentSoumis['type']> = {
  cni_gerant: 'identity',
  cni_associes: 'identity',
  cni_administrateurs: 'identity',
  casier: 'declaration',
};

/**
 * Pièces du tunnel, mises à plat pour le dossier transmis à l'administration.
 *
 * Le tunnel les range par catégorie (`{ cni_gerant: [...], casier: [...] }`)
 * alors que le dossier attend une liste. Faute de conversion, une société
 * soumise arrivait sans aucune pièce : l'administration voyait « Examiner et
 * valider les documents soumis » en action requise, sans rien à examiner et
 * sans bouton pour le faire — le workflow était bloqué dès sa première étape.
 */
export const toDocumentsSoumis = (
  fichiers: Record<string, FichierTeleverse[]>,
): DocumentSoumis[] =>
  Object.entries(fichiers).flatMap(([categorie, pieces]) =>
    (pieces ?? []).map(piece => ({
      id: piece.id,
      name: piece.name,
      type: TYPE_PAR_CATEGORIE[categorie] ?? 'JUSTIFICATIF',
      uploadedAt: piece.uploadedAt ?? new Date().toISOString(),
      status: 'pending' as const,
    })),
  );

/**
 * Explique pourquoi l'étape 2 n'est pas franchissable.
 *
 * Le bouton « Suivant » était simplement grisé, sans un mot : l'utilisateur
 * voyait un bouton mort et devait deviner ce qui manquait. Renvoie `null`
 * quand tout est valide.
 */
export const getStep2BlockingReason = (
  associates: AssociateShare[],
  capital: string,
  legalForm: string,
): string | null => {
  const { associesMin, associesMax } = getLegalFormInfo(legalForm);

  if (associates.length < associesMin) {
    const manquants = associesMin - associates.length;
    return `Une ${legalForm} requiert au moins ${associesMin} associés. Ajoutez-en ${manquants} pour continuer.`;
  }
  if (associesMax !== null && associates.length > associesMax) {
    return `Une ${legalForm} ne peut pas dépasser ${associesMax} associés.`;
  }

  const totalPourcentage = getTotalPercentage(associates);
  if (Math.abs(totalPourcentage - 100) >= 0.01) {
    const ecart = 100 - totalPourcentage;
    // Séparateur décimal français, et pas de « ,00 » superflu.
    const enPourcent = (v: number) => v.toFixed(2).replace(/\.00$/, '').replace('.', ',');
    return ecart > 0
      ? `Il reste ${enPourcent(ecart)} % de parts à répartir entre les associés.`
      : `Les parts dépassent 100 % de ${enPourcent(Math.abs(ecart))} %. Ajustez la répartition.`;
  }

  const capitalNum = getCapitalNumber(capital);
  const totalMontant = getTotalAmount(associates);
  if (Math.abs(totalMontant - capitalNum) >= 1) {
    const ecart = capitalNum - totalMontant;
    const formate = Math.abs(ecart).toLocaleString('fr-FR');
    return ecart > 0
      ? `Il manque ${formate} FCFA pour atteindre le capital social.`
      : `Les apports dépassent le capital social de ${formate} FCFA.`;
  }

  return null;
};

/** Associé, tel que saisi dans les étapes 2 et 3. */
export interface AssociateInput extends AssociateShare {
  firstName?: string;
  lastName?: string;
  address?: string;
  profession?: string;
  email?: string;
  phone?: string;
  isManager?: boolean;
  maritalStatus?: string;
  matrimonialRegime?: string;
  spouseInfo?: { firstName?: string; lastName?: string; birthDate?: string; profession?: string };
}

/** Un numéro sénégalais : +221 ou 00221 suivi de 9 chiffres. */
export const isSenegalPhone = (phone: string): boolean =>
  /^(\+221|00221)[0-9]{9}$/.test(phone.replace(/[\s-]/g, ''));

/**
 * Étape 2 — qui participe et pour combien.
 *
 * Ne contrôle que ce que l'utilisateur voit à cette étape : identité,
 * répartition, désignation du gérant. Les coordonnées relèvent de l'étape 3.
 */
export const validateStep2 = (
  associates: AssociateInput[],
  capital: string,
  legalForm: string,
): string[] => {
  const erreurs: string[] = [];

  if (!isAssociatesCountValid(associates.length, legalForm)) {
    const { associesMin, associesMax } = getLegalFormInfo(legalForm);
    erreurs.push(
      associesMax
        ? `Une ${legalForm} doit avoir entre ${associesMin} et ${associesMax} associé(s)`
        : `Une ${legalForm} doit avoir au minimum ${associesMin} associé(s)`,
    );
  }

  const sansNom = associates.find(a => !a.firstName || !a.lastName);
  if (sansNom) erreurs.push("Renseignez le prénom et le nom de chaque associé");

  const sansApport = associates.find(
    a => (!a.percentage || parseAmount(a.percentage) === 0) && (!a.amount || parseAmount(a.amount) === 0),
  );
  if (sansApport) erreurs.push('Indiquez le pourcentage ou le montant pour chaque associé');

  if (!isCapitalDistributionValid(associates, capital)) {
    erreurs.push('La répartition doit totaliser 100 % et correspondre au capital social');
  }

  return erreurs;
};

/** Nom lisible d'un associé, pour les messages d'erreur. */
const nommer = (a: AssociateInput): string =>
  [a.firstName, a.lastName].filter(Boolean).join(' ') || 'un associé';

/**
 * Étape 3 — de quoi joindre chaque associé.
 *
 * Ne demande que ce qu'un client a en tête au moment où il remplit : où il
 * habite, son email, son téléphone. Profession et état civil relèvent de
 * `validateStatutsInfo`, plus loin dans le tunnel.
 */
export const validateStep3 = (associates: AssociateInput[]): string[] => {
  const erreurs: string[] = [];

  const incomplet = associates.find(a => !a.address || !a.email || !a.phone);
  if (incomplet) {
    const manquants: string[] = [];
    if (!incomplet.address) manquants.push('adresse');
    if (!incomplet.email) manquants.push('email');
    if (!incomplet.phone) manquants.push('téléphone');
    erreurs.push(`Champs manquants pour ${nommer(incomplet)} : ${manquants.join(', ')}`);
  }

  // Le gérant est joignable : son numéro sert aux démarches d'immatriculation.
  // Le contrôle vivait à l'étape 2, où le téléphone n'est pas encore saisi.
  const gerant = associates.find(a => a.isManager);
  if (gerant?.phone && !isSenegalPhone(gerant.phone)) {
    erreurs.push('Le téléphone du gérant doit être un numéro sénégalais (+221 suivi de 9 chiffres)');
  }

  return erreurs;
};

/**
 * Informations d'état civil reprises dans les statuts.
 *
 * Demandées après la présentation du devis, et non à la saisie des associés :
 * la profession exacte d'un associé, son régime matrimonial ou la date de
 * naissance de son conjoint sont rarement connues sur le moment, et les exiger
 * d'emblée bloquait l'accès au devis — donc au prix.
 */
export const validateStatutsInfo = (associates: AssociateInput[]): string[] => {
  const erreurs: string[] = [];

  const incomplet = associates.find(a => !a.profession || !a.maritalStatus);
  if (incomplet) {
    const manquants: string[] = [];
    if (!incomplet.profession) manquants.push('profession');
    if (!incomplet.maritalStatus) manquants.push('situation matrimoniale');
    erreurs.push(`Champs manquants pour ${nommer(incomplet)} : ${manquants.join(', ')}`);
  }

  const marieSansRegime = associates.find(a => a.maritalStatus === 'married' && !a.matrimonialRegime);
  if (marieSansRegime) {
    erreurs.push(`Régime matrimonial manquant pour ${nommer(marieSansRegime)}`);
  }

  // En communauté de biens, le conjoint est partie prenante : ses informations
  // figurent dans les statuts.
  const conjointIncomplet = associates.find(
    a =>
      a.maritalStatus === 'married' &&
      a.matrimonialRegime === 'community' &&
      (!a.spouseInfo?.firstName || !a.spouseInfo?.lastName || !a.spouseInfo?.birthDate || !a.spouseInfo?.profession),
  );
  if (conjointIncomplet) {
    erreurs.push(`Informations du conjoint incomplètes pour ${nommer(conjointIncomplet)}`);
  }

  return erreurs;
};

export interface Step1Values {
  name: string;
  legalForm: string;
  activity: string;
  address: string;
  capital: string;
}

/**
 * Validation de l'étape 1, renvoyée par champ.
 *
 * La clé est le nom du champ : elle permet d'afficher le message sous le champ
 * concerné et de poser le focus sur le premier en erreur, là où le tunnel se
 * contentait d'une liste globale en haut de formulaire.
 */
export const validateStep1 = (values: Step1Values): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.name) errors.name = "Le nom de l'entreprise est obligatoire";
  if (!values.activity) errors.activity = "L'activité de l'entreprise est obligatoire";
  if (!values.address) errors.address = "L'adresse du siège social est obligatoire";

  if (!isCapitalValid(values.capital, values.legalForm)) {
    const { capitalMin } = getLegalFormInfo(values.legalForm);
    errors.capital = `Le capital minimum pour une ${values.legalForm} est de ${capitalMin.toLocaleString('fr-FR')} FCFA`;
  }

  return errors;
};
