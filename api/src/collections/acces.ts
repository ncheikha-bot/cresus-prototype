/**
 * Qui peut lire et écrire quoi.
 *
 * - L'administration lit et écrit tout ; la comptabilité lit tout et écrit des
 *   notifications.
 * - Une banque voit les demandes qui lui sont adressées et les sociétés
 *   concernées, et fait avancer ces demandes.
 * - Un client ne voit et ne modifie que ce qui lui appartient. Il ne peut ni
 *   s'approprier la ligne d'un autre, ni céder la sienne.
 *
 * Exception : un client peut **créer** une notification pour autrui — le
 * parcours prévient l'administration d'un refus de devis, par exemple — mais
 * pas modifier celle d'un autre.
 */
import type { Session } from '../auth/session';
import { estPersonnel } from '../auth/session';
import type { Descripteur } from './descripteurs';

/** Ligne déjà enregistrée, réduite à ce dont les règles ont besoin. */
export interface LigneExistante {
  proprietaire: string | null;
  bankId?: string | null;
}

/** Filtre Prisma des lignes visibles. `null` : aucune. */
export const filtreLecture = (d: Descripteur, s: Session): Record<string, unknown> | null => {
  if (estPersonnel(s)) return {};
  if (s.role === 'bank') {
    if (d.nom === 'bank-requests') return { bankId: s.bankId ?? '__aucune__' };
    if (d.nom === 'companies') return {};
    if (d.nom === 'notifications') return { recipientId: s.id };
    return null;
  }
  return { [d.champProprietaire]: s.id };
};

/** Une ligne précise est-elle visible ? Sert au filtrage du temps réel. */
export const peutVoir = (
  d: Descripteur,
  s: Session,
  ligne: { proprietaire: string | null; bankId?: string | null },
): boolean => {
  if (estPersonnel(s)) return true;
  if (s.role === 'bank') {
    if (d.nom === 'bank-requests') return Boolean(s.bankId) && ligne.bankId === s.bankId;
    if (d.nom === 'companies') return true;
    if (d.nom === 'notifications') return ligne.proprietaire === s.id;
    return false;
  }
  return ligne.proprietaire === s.id;
};

/** Écriture (création ou mise à jour) d'une ligne. */
export const peutEcrire = (
  d: Descripteur,
  s: Session,
  nouvelle: { proprietaire: string | null; bankId?: string | null },
  existante: LigneExistante | null,
): boolean => {
  if (s.role === 'admin') return true;

  if (d.nom === 'notifications') {
    // Créer pour autrui : permis. Modifier : seulement les siennes.
    return existante === null || existante.proprietaire === s.id;
  }

  if (s.role === 'accountant') return false;

  if (s.role === 'bank') {
    if (d.nom !== 'bank-requests' || !s.bankId) return false;
    return nouvelle.bankId === s.bankId && (existante === null || existante.bankId === s.bankId);
  }

  // Client : la ligne doit être à lui, avant comme après.
  return nouvelle.proprietaire === s.id && (existante === null || existante.proprietaire === s.id);
};

export const peutSupprimer = (d: Descripteur, s: Session, existante: LigneExistante): boolean => {
  if (s.role === 'admin') return true;
  if (s.role === 'bank') return d.nom === 'bank-requests' && existante.bankId === s.bankId;
  if (s.role === 'accountant') return d.nom === 'notifications' && existante.proprietaire === s.id;
  return existante.proprietaire === s.id;
};
