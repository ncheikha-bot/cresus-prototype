import { parseAmount } from '../lib/format';

/**
 * Barème d'immatriculation.
 *
 * Il était écrit en dur dans le `useState` de deux composants d'interface
 * (`mobile/CreateCompany.tsx` et `web/WebCreateCompany.tsx`), en deux
 * exemplaires : une hausse de tarif exigeait deux éditions dans deux fichiers
 * de 3 500 lignes. C'est désormais la seule source.
 */
export const REGISTRATION_FEES = {
  registrationFees: 75000,
  legalFees: 50000,
  publicationFees: 25000,
  stampDuty: 30000,
  adminFees: 20000,
} as const;

export interface QuoteFees {
  registrationFees: number;
  legalFees: number;
  publicationFees: number;
  stampDuty: number;
  adminFees: number;
}

/** Total des frais d'immatriculation d'un devis. */
export const getTotalRegistrationFees = (fees: QuoteFees): number =>
  fees.registrationFees + fees.legalFees + fees.publicationFees + fees.stampDuty + fees.adminFees;

export type LiberationType = 'total' | 'partial';
export type LiberationMethod = 'amount' | 'percentage';

/**
 * Montant du capital effectivement libéré à la constitution.
 * En libération partielle, la valeur saisie est soit un pourcentage,
 * soit un montant, selon la méthode choisie.
 */
export const getLiberatedAmount = (
  capital: number,
  liberationType: LiberationType,
  liberationMethod: LiberationMethod,
  liberationValue: string,
): number => {
  if (liberationType === 'total') return capital;

  if (liberationMethod === 'percentage') {
    const pourcentage = parseAmount(liberationValue);
    return Math.round((capital * pourcentage) / 100);
  }
  return parseAmount(liberationValue);
};

/** Reliquat de capital restant à libérer. */
export const getRemainingAmount = (
  capital: number,
  liberationType: LiberationType,
  liberationMethod: LiberationMethod,
  liberationValue: string,
): number => capital - getLiberatedAmount(capital, liberationType, liberationMethod, liberationValue);

/**
 * Montant que le client verse réellement.
 * Si le capital couvre les frais, il ne verse que le capital (les frais y sont
 * prélevés) ; sinon les frais s'ajoutent au capital.
 */
export const getPaymentAmount = (capital: number, fees: QuoteFees): number => {
  const total = getTotalRegistrationFees(fees);
  return capital >= total ? capital : capital + total;
};

/** Capital restant à la société une fois les frais déduits. */
export const getNetCapital = (capital: number, fees: QuoteFees): number => {
  const total = getTotalRegistrationFees(fees);
  return capital >= total ? capital - total : capital;
};
