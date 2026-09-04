/**
 * Libellés des statuts de dossier.
 *
 * Les écrans « Mes sociétés » traduisaient cinq statuts sur les huit que le type
 * `Company` autorise, et repliaient le reste sur la clé technique : le client
 * lisait « documents_ready » ou « signed » au milieu de « Soumis » et
 * « En révision ». Une table unique, exhaustive, sert les deux écrans.
 */
import type { Company } from '../types';

type StatutSociete = Company['status'];

const LIBELLES: Record<StatutSociete, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  pending: 'En attente',
  in_review: 'En révision',
  in_progress: 'En cours',
  documents_ready: 'Documents prêts',
  signed: 'Signé',
  completed: 'Terminé',
};

const COULEURS: Record<StatutSociete, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  pending: 'bg-gray-100 text-gray-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  documents_ready: 'bg-purple-100 text-purple-700',
  signed: 'bg-teal-100 text-teal-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export const getCompanyStatusLabel = (statut: string): string =>
  LIBELLES[statut as StatutSociete] ?? 'En attente';

export const getCompanyStatusColor = (statut: string): string =>
  COULEURS[statut as StatutSociete] ?? 'bg-gray-100 text-gray-700';
