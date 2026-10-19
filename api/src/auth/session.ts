import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export type Role = 'client' | 'admin' | 'bank' | 'accountant';

/** Ce que le jeton porte, et donc ce que chaque requête sait de son auteur. */
export interface Session {
  id: string;
  role: Role;
  /** Banque partenaire, pour les comptes bancaires. */
  bankId?: string;
}

export const ROUTE_PUBLIQUE = 'routePublique';

/** Route accessible sans jeton : santé, connexion. */
export const Publique = () => SetMetadata(ROUTE_PUBLIQUE, true);

export const JETON_EN_PARAMETRE = 'jetonEnParametre';

/**
 * Route qui accepte le jeton dans l'adresse (`?token=`).
 *
 * Réservé au flux temps réel : `EventSource` ne permet pas d'envoyer
 * l'en-tête `Authorization`. Ailleurs, un jeton dans l'URL finirait dans les
 * journaux des proxys.
 */
export const JetonEnParametre = () => SetMetadata(JETON_EN_PARAMETRE, true);

/** Session de l'auteur de la requête, posée par le garde d'authentification. */
export const SessionCourante = createParamDecorator(
  (_: unknown, contexte: ExecutionContext): Session => contexte.switchToHttp().getRequest().session,
);

/** Administration et comptabilité voient l'ensemble des dossiers. */
export const estPersonnel = (session: Session): boolean =>
  session.role === 'admin' || session.role === 'accountant';
