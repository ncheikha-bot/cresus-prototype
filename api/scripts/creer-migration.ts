/**
 * Crée une migration à partir du schéma : `npx tsx scripts/creer-migration.ts <nom>`.
 *
 * `prisma migrate dev` réclame une base vivante (et une base fantôme pour
 * comparer) : ce script en démarre une, éphémère, le temps de la commande.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { demarrerPostgres } from './postgres-embarque';

const nom = process.argv[2];
if (!nom) {
  console.error('Usage : npx tsx scripts/creer-migration.ts <nom>');
  process.exit(1);
}

const principal = async () => {
  const dossier = mkdtempSync(join(tmpdir(), 'cresus-migration-'));
  const base = await demarrerPostgres({ dossier, port: 5590, base: 'cresus', persistante: false });
  try {
    execSync(`npx prisma migrate dev --name ${nom}`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: base.url },
    });
  } finally {
    await base.arreter();
    rmSync(dossier, { recursive: true, force: true });
  }
};

principal().catch(erreur => {
  console.error(erreur);
  process.exit(1);
});
