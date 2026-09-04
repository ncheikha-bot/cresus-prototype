/**
 * Documents d'une société, tels que le client peut les consulter.
 *
 * Les deux écrans « Mes documents » renvoyaient une liste constante de cinq
 * pièces — mêmes noms, mêmes tailles, mêmes dates d'octobre 2025 — pour
 * n'importe quelle société, en ignorant l'identifiant reçu. Un dossier tout
 * juste créé affichait donc des statuts antérieurs à sa propre existence.
 */
import type { Company } from '../types';
import { getDocumentStatus } from './companySteps';

export interface DocumentClient {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'completed' | 'pending';
  /** Taille du fichier ; vide si elle n'a pas été enregistrée. */
  size: string;
}

/**
 * Libellés lisibles des types de pièces.
 *
 * `DocumentType` mêle deux familles héritées — des clés en majuscules et leurs
 * équivalents en minuscules — que les différents écrans écrivent indifféremment.
 * Les deux sont couvertes ici.
 */
const TYPE_LISIBLE: Record<string, string> = {
  CNI: 'Pièce d\'identité',
  identity: 'Pièce d\'identité',
  CASIER: 'Casier judiciaire',
  DECLARATION_HONNEUR: 'Déclaration sur l\'honneur',
  declaration: 'Déclaration',
  JUSTIFICATIF: 'Justificatif',
  address: 'Justificatif de domicile',
  capital: 'Justificatif de capital',
  diploma: 'Diplôme',
  STATUTS: 'Statuts',
  statuts: 'Statuts',
  ATTESTATION: 'Attestation',
  CONTRAT: 'Contrat',
  RC: 'Registre du commerce',
  rccm: 'Registre du commerce',
  NINEA: 'NINEA',
  ninea: 'NINEA',
  PV_AG: 'Procès-verbal d\'assemblée',
  FORMULAIRE_M0: 'Formulaire M0',
};

const formaterDate = (brute?: string): string => {
  if (!brute) return '';
  const date = new Date(brute);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** La taille est déjà formatée à l'enregistrement ; on la reprend telle quelle. */
const formaterTaille = (taille?: string): string => taille ?? '';

/**
 * Pièces déposées par le client, puis documents officiels remis par Crésus.
 *
 * `officialDocs` vient du processus du dossier ; il est passé à part pour que
 * ce module reste ignorant du contexte applicatif.
 */
export const getDocumentsClient = (
  company: Pick<Company, 'documents'>,
  officialDocs: { name: string; uploadedAt: string }[] = [],
  decisions: Record<string, { status: string }> = {},
): DocumentClient[] => {
  const deposes: DocumentClient[] = (company.documents ?? []).map(piece => ({
    id: piece.id,
    name: piece.name,
    type: TYPE_LISIBLE[piece.type] ?? 'Justificatif',
    date: formaterDate(piece.uploadedAt),
    // La pièce reste « pending » sur le dossier ; c'est le processus qui porte
    // la décision de l'administration.
    status: getDocumentStatus(piece, decisions) === 'validated' ? 'completed' : 'pending',
    size: formaterTaille(piece.size),
  }));

  const officiels: DocumentClient[] = officialDocs.map((doc, index) => ({
    id: `officiel-${index}-${doc.name}`,
    name: doc.name,
    type: 'Document officiel',
    date: formaterDate(doc.uploadedAt),
    status: 'completed',
    size: '',
  }));

  return [...officiels, ...deposes];
};
