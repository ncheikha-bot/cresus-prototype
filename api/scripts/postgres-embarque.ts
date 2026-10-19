/**
 * Postgres embarqué, pour travailler sans Docker ni installation système.
 *
 * Le paquet `embedded-postgres` télécharge les binaires officiels de Postgres
 * à l'installation : la base tourne dans un dossier du projet, sur un port à
 * part, et disparaît avec lui. Rien ici ne sert en production, où l'API se
 * branche sur la base de l'hébergeur par `DATABASE_URL`.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface BaseEmbarquee {
  url: string;
  arreter: () => Promise<void>;
}

export const demarrerPostgres = async (options: {
  dossier: string;
  port: number;
  base: string;
  persistante: boolean;
}): Promise<BaseEmbarquee> => {
  // Le paquet n'existe qu'en module ES : chargé dynamiquement depuis ce script CommonJS.
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const pg = new EmbeddedPostgres({
    databaseDir: options.dossier,
    port: options.port,
    user: 'cresus',
    password: 'cresus',
    persistent: options.persistante,
    onLog: () => {},
  });

  // Un dossier déjà initialisé se réutilise tel quel : réinitialiser
  // effacerait les données de la session précédente.
  if (!existsSync(join(options.dossier, 'PG_VERSION'))) {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase(options.base);
  } else {
    await pg.start();
  }

  return {
    url: `postgresql://cresus:cresus@127.0.0.1:${options.port}/${options.base}`,
    arreter: () => pg.stop(),
  };
};
