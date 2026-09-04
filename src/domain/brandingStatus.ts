/**
 * Avancement d'une commande de branding, tel que les écrans l'affichent.
 *
 * L'administration et l'espace client traduisaient chacun le statut de leur
 * côté : le projet pris en charge par l'administration restait « En attente de
 * paiement » pour le client.
 */
import type { ProjectStatus } from '../data/brandingData';

export type StatutCommande =
  | 'submitted'
  | 'quote_sent'
  | 'in_progress'
  | 'delivered'
  | 'completed';

const CORRESPONDANCE: Record<StatutCommande, ProjectStatus> = {
  submitted: 'payment-pending',
  quote_sent: 'payment-pending',
  in_progress: 'in-progress',
  delivered: 'in-review',
  completed: 'delivered',
};

export const getStatutProjet = (statut: StatutCommande): ProjectStatus =>
  CORRESPONDANCE[statut] ?? 'payment-pending';
