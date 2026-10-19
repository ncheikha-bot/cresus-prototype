/**
 * Base de développement : `npm run db:local`.
 *
 * Démarre Postgres dans `.pgdata/`, applique les migrations et insère les
 * comptes de démonstration, puis reste ouverte jusqu'à Ctrl+C. Les données
 * survivent d'une session à l'autre.
 */
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { demarrerPostgres } from './postgres-embarque';

const PORT = Number(process.env.PORT_BASE_LOCALE ?? 5544);

const principal = async () => {
  const base = await demarrerPostgres({
    dossier: join(__dirname, '..', '.pgdata'),
    port: PORT,
    base: 'cresus',
    persistante: true,
  });
  const env = { ...process.env, DATABASE_URL: base.url };

  execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env });

  console.log(`\nBase locale prête : ${base.url}`);
  console.log('Renseignez cette URL dans api/.env (DATABASE_URL), puis lancez `npm run start:dev`.');
  console.log('Ctrl+C pour arrêter.\n');

  const fermer = async () => {
    await base.arreter();
    process.exit(0);
  };
  process.on('SIGINT', fermer);
  process.on('SIGTERM', fermer);
};

principal().catch(erreur => {
  console.error(erreur);
  process.exit(1);
});
