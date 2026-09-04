import { REGISTRATION_FEES, getTotalRegistrationFees } from './pricing';
import { formatFCFA } from '../lib/format';

/**
 * Tarifs d'appel affichés sur les cartes de service.
 *
 * Aucun prix n'était visible avant d'entrer dans un parcours de plusieurs
 * étapes : l'utilisateur devait s'engager pour découvrir ce qu'il allait payer.
 * Les montants existent déjà dans les données ; ce module les remonte à
 * l'endroit où la décision se prend.
 */
export interface ServicePricing {
  /** Prix d'appel, déjà formaté. `null` si le service est sur devis. */
  from: string | null;
  /** Unité de facturation, quand elle n'est pas ponctuelle. */
  unit?: string;
  /** Délai indicatif de traitement. */
  delay?: string;
}

/** Frais d'immatriculation d'une création : somme du barème. */
const FRAIS_CREATION = getTotalRegistrationFees(REGISTRATION_FEES);

/** Le plus bas prix de chaque catalogue, relevé dans les données de référence. */
const DOMICILIATION_MENSUEL_MIN = 25000; // Pack ESSENTIEL
const COMPTABILITE_MENSUEL_MIN = 80000;
const BRANDING_MIN = 50000;

export const SERVICE_PRICING: Record<string, ServicePricing> = {
  create: { from: formatFCFA(FRAIS_CREATION), delay: '48 h' },
  domiciliation: { from: formatFCFA(DOMICILIATION_MENSUEL_MIN), unit: '/ mois', delay: '24 h' },
  accounting: { from: formatFCFA(COMPTABILITE_MENSUEL_MIN), unit: '/ mois' },
  branding: { from: formatFCFA(BRANDING_MIN) },
  // L'ouverture de compte est gratuite côté Crésus : les frais éventuels
  // relèvent de la banque et varient d'un établissement à l'autre.
  'bank-account': { from: null, delay: '5 à 10 j' },
  modification: { from: null, delay: 'Sur devis' },
};

/** Libellé court à afficher sur une carte de service. */
export const getServiceLabel = (serviceId: string): string | null => {
  const p = SERVICE_PRICING[serviceId];
  if (!p) return null;
  const prix = p.from ? `dès ${p.from}${p.unit ? ' ' + p.unit : ''}` : null;
  return [prix, p.delay].filter(Boolean).join(' · ') || null;
};
