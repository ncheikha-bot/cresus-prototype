/**
 * Connexion à PostgreSQL, partagée par l'API, l'amorçage et l'outil de migration.
 *
 * Deux exigences viennent de l'hébergement sur AWS :
 *
 * - **L'adresse peut arriver en morceaux.** Les services gérés injectent
 *   volontiers l'hôte, l'utilisateur et le mot de passe séparément, ce dernier
 *   depuis un coffre de secrets. `DATABASE_URL` reste prioritaire ; à défaut,
 *   l'adresse est assemblée depuis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`
 *   et `DB_PASSWORD`.
 *
 * - **RDS impose TLS**, avec des certificats signés par l'autorité d'Amazon,
 *   qu'aucun système ne connaît d'office. `DATABASE_SSL_CA` désigne le fichier
 *   de cette autorité (fourni dans `certs/`). Les deux pilotes ne lisent pas le
 *   TLS au même endroit : l'application le reçoit en options, l'outil de
 *   migration de Prisma dans les paramètres de l'adresse, sous des noms qui
 *   lui sont propres. D'où les deux fonctions ci-dessous.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Env = NodeJS.ProcessEnv;

/** Paramètres TLS qu'une adresse pourrait porter, et qui feraient double emploi. */
const PARAMETRES_TLS = ['sslmode', 'sslcert', 'sslrootcert', 'sslkey', 'sslaccept', 'sslidentity', 'sslpassword'];

export const urlBaseDeDonnees = (env: Env = process.env): string | undefined => {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (!env.DB_HOST || !env.DB_USER || !env.DB_PASSWORD) return undefined;
  const code = encodeURIComponent;
  return `postgresql://${code(env.DB_USER)}:${code(env.DB_PASSWORD)}@${env.DB_HOST}:${env.DB_PORT ?? 5432}/${code(env.DB_NAME ?? 'cresus')}`;
};

/** Chemin absolu de l'autorité de certification, si un TLS vérifié est demandé. */
export const cheminAutorite = (env: Env = process.env): string | undefined =>
  env.DATABASE_SSL_CA ? resolve(env.DATABASE_SSL_CA) : undefined;

const sansTls = (adresse: string): string => {
  const url = new URL(adresse);
  for (const p of PARAMETRES_TLS) url.searchParams.delete(p);
  return url.toString();
};

/**
 * Configuration du pilote `pg` pour l'application.
 *
 * Quand une autorité est fournie, le certificat du serveur et son nom d'hôte
 * sont vérifiés. Les éventuels paramètres TLS de l'adresse sont retirés : `pg`
 * leur donnerait la priorité sur les options, et `sslmode=require` y vaut
 * désormais une vérification complète… sans autorité pour la mener.
 */
export const configurationPg = (env: Env = process.env) => {
  const adresse = urlBaseDeDonnees(env);
  if (!adresse) throw new Error("Base de données non configurée : DATABASE_URL, ou DB_HOST / DB_USER / DB_PASSWORD");
  const chemin = cheminAutorite(env);
  if (!chemin) return { connectionString: adresse };
  return {
    connectionString: sansTls(adresse),
    ssl: { ca: readFileSync(chemin, 'utf8'), rejectUnauthorized: true },
  };
};

/** Adresse pour l'outil de migration de Prisma, qui lit le TLS dans l'URL. */
export const urlPourMigrations = (env: Env = process.env): string | undefined => {
  const adresse = urlBaseDeDonnees(env);
  const chemin = cheminAutorite(env);
  if (!adresse || !chemin) return adresse;
  const url = new URL(sansTls(adresse));
  url.searchParams.set('sslmode', 'require');
  // Pour Prisma, `sslcert` désigne le certificat racine qui authentifie le serveur.
  url.searchParams.set('sslcert', chemin);
  url.searchParams.set('sslaccept', 'strict');
  return url.toString();
};
