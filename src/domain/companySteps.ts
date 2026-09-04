/**
 * Étapes du tunnel de création d'entreprise.
 *
 * Source unique du nombre d'étapes. Le projet en affichait quatre versions
 * concurrentes — « Étape 2 sur 7 » dans le bandeau, « Étape 2/5 » dans le
 * sous-titre, « Étape 4/6 » à l'étape 4, et un « /5 » sur les brouillons du
 * tableau de bord qui pouvait produire une barre de progression à 140 %.
 */
export const COMPANY_CREATION_STEPS = [
  { id: 1, title: 'Informations entreprise' },
  // La saisie des associés est scindée : d'abord qui participe et pour combien
  // (une décision), puis leurs coordonnées (une saisie administrative). Réunies,
  // elles demandaient 21 champs sur un seul écran.
  { id: 2, title: 'Répartition du capital' },
  { id: 3, title: 'Coordonnées des associés' },
  { id: 4, title: 'Documents' },
  { id: 5, title: 'Validation devis' },
  { id: 6, title: 'Versement capital' },
  { id: 7, title: 'Validation statuts' },
  { id: 8, title: 'Signature' },
] as const;

export const TOTAL_CREATION_STEPS = COMPANY_CREATION_STEPS.length;

/** Progression d'un brouillon, bornée à 100 %. */
export const getCreationProgress = (currentStep: number): number =>
  Math.min(100, Math.round((currentStep / TOTAL_CREATION_STEPS) * 100));

export type StepStatus = 'completed' | 'active' | 'pending';

/** Ce qu'il faut savoir d'une société pour situer son dossier. */
interface CompanySummary {
  status?: string;
  shareholders?: unknown[];
  documents?: { status: string }[];
  quote?: { status: string };
}

/** Avancement du dossier, tel que l'admin l'a fait progresser. */
interface ProcessSummary {
  statutsSent: boolean;
  statutsValidatedByClient: boolean;
  onlineSignatureCompleted: boolean;
  appointmentRequest: { status: string } | null;
  companyFinalized: boolean;
  documentDecisions: Record<string, { status: string }>;
}

/**
 * Statut effectif d'une pièce.
 *
 * Une pièce naît « pending » au dépôt et ne change plus : la décision de l'admin
 * est écrite à part, dans le processus. Lire `doc.status` seul revient donc à
 * afficher « en attente » sur un dossier entièrement validé.
 */
export const getDocumentStatus = (
  document: { id?: string; status: string },
  decisions: Record<string, { status: string }>,
): string => decisions[document.id ?? '']?.status ?? document.status;

/**
 * Statut des 7 étapes, déduit de l'état réel du dossier.
 *
 * Les deux écrans de suivi client affichaient jusqu'ici des statuts et des
 * dates écrits en dur : le client voyait toujours la même progression, quoi
 * que l'admin fasse. Cette fonction est la source unique des deux timelines.
 */
export const getStepStatuses = (
  company: CompanySummary,
  process: ProcessSummary,
): StepStatus[] => {
  // Dossier clos : tout est derrière nous.
  if (process.companyFinalized || company.status === 'completed') {
    return COMPANY_CREATION_STEPS.map(() => 'completed' as StepStatus);
  }

  const documents = company.documents ?? [];
  const documentsValides =
    documents.length > 0 &&
    documents.every(doc => getDocumentStatus(doc, process.documentDecisions) === 'validated');

  const signatureFaite =
    process.onlineSignatureCompleted || process.appointmentRequest?.status === 'confirmed';

  const associes = company.shareholders ?? [];
  // Les coordonnées sont réputées saisies dès qu'un associé porte une adresse :
  // c'est le champ que la nouvelle étape 3 rend obligatoire.
  const coordonneesSaisies =
    associes.length > 0 && associes.every(a => !!(a as { address?: string }).address);

  const faites = [
    true, // 1. la société existe, donc l'étape d'informations est passée
    associes.length > 0, // 2. répartition du capital
    coordonneesSaisies, // 3. coordonnées des associés
    documentsValides,
    company.quote?.status === 'validated',
    ['signed', 'documents_ready', 'completed'].includes(company.status ?? ''),
    process.statutsValidatedByClient,
    signatureFaite,
  ];

  // La première étape non faite est celle en cours ; les suivantes attendent.
  //
  // La progression est rendue strictement séquentielle : un jalon atteint alors
  // qu'un précédent ne l'est pas — dossier marqué « documents prêts » sans devis
  // validé, ou action de l'administration hors ordre — affichait sinon une étape
  // terminée *après* une étape en attente, que le fil vertical reliait en dents
  // de scie.
  const indexActif = faites.findIndex(fait => !fait);
  if (indexActif === -1) return faites.map(() => 'completed' as StepStatus);

  return faites.map((_, i) => {
    if (i < indexActif) return 'completed';
    return i === indexActif ? 'active' : 'pending';
  });
};
