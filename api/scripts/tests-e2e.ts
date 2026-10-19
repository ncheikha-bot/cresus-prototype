/**
 * Tests de bout en bout : `npm run test:e2e`.
 *
 * Chaque passage démarre une base vierge et jetable, y applique les
 * migrations, lance Jest puis efface tout : les tests ne dépendent ni d'une
 * base existante, ni de l'ordre des passages précédents.
 */
import { spawnSync, execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { demarrerPostgres } from './postgres-embarque';

const principal = async () => {
  const dossier = mkdtempSync(join(tmpdir(), 'cresus-tests-'));
  const base = await demarrerPostgres({ dossier, port: 5591, base: 'cresus_test', persistante: false });
  const env = {
    ...process.env,
    DATABASE_URL: base.url,
    JWT_SECRET: 'secret-des-tests',
    DEMO_LOGIN: 'true',
    NODE_ENV: 'test',
  };

  let code = 1;
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
    const resultat = spawnSync(
      'npx',
      ['jest', '--config', 'test/jest-e2e.json', '--runInBand', ...process.argv.slice(2)],
      { stdio: 'inherit', env },
    );
    code = resultat.status ?? 1;
  } finally {
    await base.arreter();
    rmSync(dossier, { recursive: true, force: true });
  }
  process.exit(code);
};

principal().catch(erreur => {
  console.error(erreur);
  process.exit(1);
});
