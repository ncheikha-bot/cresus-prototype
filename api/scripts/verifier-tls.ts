/**
 * Vérifie la connexion chiffrée exigée par RDS : `npx tsx scripts/verifier-tls.ts`.
 *
 * Monte un Postgres local qui, comme RDS, refuse toute connexion non chiffrée,
 * avec un certificat signé par une autorité de test. Puis contrôle que :
 *   1. les migrations passent quand l'autorité est fournie ;
 *   2. la base refuse bien toute connexion en clair (sinon le test ne prouverait rien) ;
 *   3. l'application se connecte, et la session est bien chiffrée ;
 *   4. une autorité étrangère fait échouer l'application ;
 *   5. et l'outil de migration.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { configurationPg } from '../src/config/base-de-donnees';
import { PrismaClient } from '../src/generated/prisma/client';

const PORT = 5592;
const dossier = mkdtempSync(join(tmpdir(), 'cresus-tls-'));
const f = (nom: string) => join(dossier, nom);

const openssl = (...args: string[]) => execFileSync('openssl', args, { stdio: 'pipe' });

const autorite = (nom: string) => {
  writeFileSync(
    f(`${nom}.cnf`),
    `[req]\ndistinguished_name=dn\nx509_extensions=v3_ca\n[dn]\n[v3_ca]\nbasicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\nsubjectKeyIdentifier=hash\n`,
  );
  openssl('req', '-x509', '-new', '-nodes', '-newkey', 'rsa:2048', '-days', '2',
    '-keyout', f(`${nom}.key`), '-out', f(`${nom}.pem`), '-subj', `/CN=${nom}`, '-config', f(`${nom}.cnf`));
};

const resultats: Array<[string, boolean]> = [];
const verifier = (libelle: string, ok: boolean) => {
  resultats.push([libelle, ok]);
  console.log(`${ok ? '✔' : '✘'} ${libelle}`);
};

const migrer = (ca: string) =>
  spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      DATABASE_URL: `postgresql://cresus:cresus@localhost:${PORT}/cresus`,
      DATABASE_SSL_CA: ca,
    },
  });

const connecterApplication = async (ca: string) => {
  const env = { ...process.env, DATABASE_URL: `postgresql://cresus:cresus@localhost:${PORT}/cresus`, DATABASE_SSL_CA: ca };
  const prisma = new PrismaClient({ adapter: new PrismaPg(configurationPg(env)) });
  try {
    const lignes = await prisma.$queryRaw<Array<{ ssl: boolean }>>`SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()`;
    return lignes[0]?.ssl === true;
  } finally {
    await prisma.$disconnect();
  }
};

const principal = async () => {
  autorite('autorite-test');
  autorite('autorite-etrangere');
  // Ce que portent les certificats de RDS, et qu'exige macOS pour en accepter un.
  writeFileSync(
    f('serveur.ext'),
    'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1\nextendedKeyUsage=serverAuth\nkeyUsage=critical,digitalSignature,keyEncipherment\n',
  );
  openssl('req', '-new', '-nodes', '-newkey', 'rsa:2048', '-keyout', f('serveur.key'), '-out', f('serveur.csr'), '-subj', '/CN=localhost');
  openssl('x509', '-req', '-in', f('serveur.csr'), '-CA', f('autorite-test.pem'), '-CAkey', f('autorite-test.key'),
    '-CAcreateserial', '-out', f('serveur.crt'), '-days', '2', '-extfile', f('serveur.ext'));
  chmodSync(f('serveur.key'), 0o600);

  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const pg = new EmbeddedPostgres({
    databaseDir: f('donnees'),
    port: PORT,
    user: 'cresus',
    password: 'cresus',
    persistent: true,
    postgresFlags: ['-c', 'ssl=on', '-c', `ssl_cert_file=${f('serveur.crt')}`, '-c', `ssl_key_file=${f('serveur.key')}`],
    onLog: () => {},
  });

  try {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase('cresus');
    await pg.stop();
    // Comme RDS : plus aucune connexion en clair n'est acceptée.
    writeFileSync(
      join(f('donnees'), 'pg_hba.conf'),
      'hostssl all all 127.0.0.1/32 scram-sha-256\nhostssl all all ::1/128 scram-sha-256\n',
    );
    await pg.start();

    const avec = migrer(f('autorite-test.pem'));
    verifier('migrations avec l’autorité', avec.status === 0);
    if (avec.status !== 0) console.log(avec.stdout, avec.stderr);

    const enClair = new PrismaClient({
      adapter: new PrismaPg({ connectionString: `postgresql://cresus:cresus@localhost:${PORT}/cresus`, ssl: false }),
    });
    const clairRefuse = await enClair.$queryRaw`SELECT 1`.then(() => false, () => true);
    await enClair.$disconnect().catch(() => {});
    verifier('connexion en clair refusée par la base', clairRefuse);

    verifier('application connectée, session chiffrée', await connecterApplication(f('autorite-test.pem')));

    const etrangere = await connecterApplication(f('autorite-etrangere.pem')).then(() => false, () => true);
    verifier('application refusée face à une autorité étrangère', etrangere);

    const cliEtrangere = migrer(f('autorite-etrangere.pem'));
    verifier('migrations refusées face à une autorité étrangère', cliEtrangere.status !== 0);
  } finally {
    await pg.stop().catch(() => {});
    rmSync(dossier, { recursive: true, force: true });
  }

  const echecs = resultats.filter(([, ok]) => !ok).length;
  console.log(echecs ? `\n${echecs} contrôle(s) en échec.` : '\nConnexion chiffrée conforme.');
  process.exit(echecs ? 1 : 0);
};

principal().catch(erreur => {
  console.error(erreur);
  rmSync(dossier, { recursive: true, force: true });
  process.exit(1);
});
