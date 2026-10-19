import { Injectable, Logger } from '@nestjs/common';
import { urlBaseDeDonnees } from './base-de-donnees';

/**
 * Configuration lue une fois au démarrage.
 *
 * Une variable manquante en production arrête l'API d'emblée plutôt qu'au
 * premier appel : un secret JWT absent produirait des jetons signés avec une
 * valeur devinable, une base absente des erreurs à chaque requête.
 */
@Injectable()
export class Configuration {
  private readonly journal = new Logger('Configuration');

  readonly production = process.env.NODE_ENV === 'production';
  readonly port = Number(process.env.PORT ?? 4001);
  /** Vérifiée au démarrage ; la connexion elle-même est montée par `configurationPg`. */
  readonly databaseUrl = this.exigerBase();
  readonly jwtSecret = this.secretJwt();
  readonly dureeJeton = process.env.JWT_EXPIRES_IN ?? '7d';

  /**
   * Connexion sans mot de passe aux comptes de démonstration.
   *
   * C'est le comportement du prototype — choisir « Administration » suffit à
   * l'ouvrir. Il doit donc être demandé explicitement : désactivé par défaut,
   * il ne s'allume que si `DEMO_LOGIN=true`.
   */
  readonly connexionDemo = process.env.DEMO_LOGIN === 'true';

  /** Origines autorisées à appeler l'API depuis un navigateur. */
  readonly originesAutorisees = (
    process.env.CORS_ORIGINS ??
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://ncheikha-bot.github.io'
  )
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  private exigerBase(): string {
    const adresse = urlBaseDeDonnees();
    if (!adresse) {
      throw new Error("Variable d'environnement manquante : DATABASE_URL (ou DB_HOST, DB_USER, DB_PASSWORD)");
    }
    return adresse;
  }

  private secretJwt(): string {
    const secret = process.env.JWT_SECRET;
    if (secret) return secret;
    if (this.production) throw new Error("Variable d'environnement manquante : JWT_SECRET");
    this.journal.warn('JWT_SECRET absent : secret de développement utilisé. À ne jamais faire en production.');
    return 'secret-de-developpement-cresus';
  }
}
