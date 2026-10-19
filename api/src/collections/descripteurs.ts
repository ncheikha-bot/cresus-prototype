/**
 * Les neuf familles de données que l'application partage.
 *
 * Chaque descripteur dit où la famille est rangée, comment le frontend la
 * présente (une liste, ou une table indexée par société pour l'avancement des
 * dossiers) et quelles colonnes tirer de l'objet reçu — en premier lieu son
 * propriétaire, sur lequel reposent toutes les règles d'accès.
 */

export const NOMS_COLLECTIONS = [
  'companies',
  'company-processes',
  'drafts',
  'notifications',
  'appointments',
  'bank-requests',
  'modifications',
  'domiciliations',
  'branding-orders',
] as const;

export type NomCollection = (typeof NOMS_COLLECTIONS)[number];

export type Donnees = Record<string, unknown>;

/** Résout le propriétaire d'une société, pour les familles qui s'y rattachent. */
export type ProprietaireDeSociete = (societeId: unknown) => Promise<string | null>;

export interface Descripteur {
  nom: NomCollection;
  /** Délégué Prisma (`prisma.company`, `prisma.companyProcess`…). */
  modele:
    | 'company'
    | 'companyProcess'
    | 'draft'
    | 'notification'
    | 'appointment'
    | 'bankRequest'
    | 'modification'
    | 'domiciliation'
    | 'brandingOrder';
  /** Clé primaire de la table. */
  cle: 'id' | 'companyId';
  /** Colonne qui désigne à qui appartient la ligne. */
  champProprietaire: 'ownerId' | 'recipientId';
  /** Colonnes indexées, déduites de l'objet complet. */
  colonnes: (donnees: Donnees, proprietaireDeSociete: ProprietaireDeSociete, id: string) => Promise<Donnees>;
}

const texte = (valeur: unknown): string | null =>
  typeof valeur === 'string' && valeur.length > 0 ? valeur : null;

const entier = (valeur: unknown): number | null =>
  typeof valeur === 'number' && Number.isInteger(valeur) ? valeur : null;

/** Premier propriétaire explicite, à défaut celui de la société rattachée. */
const proprietaire = async (d: Donnees, viaSociete: ProprietaireDeSociete, ...champs: string[]) => {
  for (const champ of champs) {
    const valeur = texte(d[champ]);
    if (valeur) return valeur;
  }
  return viaSociete(d.companyId);
};

export const DESCRIPTEURS: Record<NomCollection, Descripteur> = {
  companies: {
    nom: 'companies',
    modele: 'company',
    cle: 'id',
    champProprietaire: 'ownerId',
    colonnes: async d => ({
      ownerId: texte(d.userId) ?? texte(d.clientId),
      name: texte(d.name) ?? 'Société sans nom',
      legalForm: texte(d.legalForm),
      status: texte(d.status) ?? 'draft',
      currentStep: entier(d.currentStep),
    }),
  },
  'company-processes': {
    nom: 'company-processes',
    modele: 'companyProcess',
    cle: 'companyId',
    champProprietaire: 'ownerId',
    // L'avancement n'a pas de propriétaire à lui : c'est celui de la société.
    colonnes: async (_d, viaSociete, id) => ({ ownerId: await viaSociete(id) }),
  },
  drafts: {
    nom: 'drafts',
    modele: 'draft',
    cle: 'id',
    champProprietaire: 'ownerId',
    colonnes: async d => ({ ownerId: texte(d.userId) ?? '' }),
  },
  notifications: {
    nom: 'notifications',
    modele: 'notification',
    cle: 'id',
    champProprietaire: 'recipientId',
    colonnes: async d => ({ recipientId: texte(d.userId) ?? '', read: d.read === true }),
  },
  appointments: {
    nom: 'appointments',
    modele: 'appointment',
    cle: 'id',
    champProprietaire: 'ownerId',
    colonnes: async (d, viaSociete) => ({
      ownerId: await proprietaire(d, viaSociete, 'clientId', 'userId'),
      companyId: texte(d.companyId),
      status: texte(d.status),
    }),
  },
  'bank-requests': {
    nom: 'bank-requests',
    modele: 'bankRequest',
    cle: 'id',
    champProprietaire: 'ownerId',
    // La demande ne nomme pas son client : elle se rattache à une société.
    colonnes: async (d, viaSociete) => ({
      ownerId: await proprietaire(d, viaSociete, 'userId', 'clientId'),
      companyId: texte(d.companyId),
      bankId: texte(d.bankId),
      status: texte(d.status),
    }),
  },
  modifications: {
    nom: 'modifications',
    modele: 'modification',
    cle: 'id',
    champProprietaire: 'ownerId',
    colonnes: async (d, viaSociete) => ({
      ownerId: await proprietaire(d, viaSociete, 'clientId', 'userId'),
      companyId: texte(d.companyId),
      status: texte(d.status),
    }),
  },
  domiciliations: {
    nom: 'domiciliations',
    modele: 'domiciliation',
    cle: 'id',
    champProprietaire: 'ownerId',
    colonnes: async (d, viaSociete) => ({
      ownerId: await proprietaire(d, viaSociete, 'userId', 'clientId'),
      companyId: texte(d.companyId),
      status: texte(d.status),
    }),
  },
  'branding-orders': {
    nom: 'branding-orders',
    modele: 'brandingOrder',
    cle: 'id',
    champProprietaire: 'ownerId',
    colonnes: async d => ({
      ownerId: texte(d.clientId) ?? texte(d.userId),
      status: texte(d.status),
    }),
  },
};
