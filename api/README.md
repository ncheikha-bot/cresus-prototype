# API Crésus

NestJS 11 · Prisma 7 · PostgreSQL · JWT · Server-Sent Events

Persistance partagée des dossiers Crésus : ce qu'un client saisit sur son
téléphone, l'administration le voit et le traite depuis son poste, en direct.

---

## Démarrer en local

Aucune installation de Postgres ni de Docker n'est nécessaire : une base
embarquée tourne dans le dossier du projet.

```bash
cd api
npm install
npm run db:local          # démarre Postgres, migre, crée les comptes — laisser ouvert
```

Dans un second terminal :

```bash
cd api
cp .env.example .env      # les valeurs par défaut conviennent en local
npm run build && npm start
```

L'API répond sur http://127.0.0.1:4001 et sa documentation interactive sur
http://127.0.0.1:4001/api/docs.

Pour brancher le frontend dessus, créez à la racine du dépôt un fichier
`.env.development.local` :

```
VITE_API_URL=http://127.0.0.1:4001
```

puis relancez `npm run dev`.

## Tester

```bash
npm run test:e2e
```

Chaque passage démarre une base vierge et jetable, y applique les migrations et
joue 17 scénarios : connexion, lecture et écriture de chaque famille, temps
réel, remise à zéro — et surtout **les refus** : un client qui tente de lire,
modifier ou s'approprier le dossier d'un autre.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run db:local` | Base de développement persistante (`.pgdata/`) |
| `npm run build` | Génère le client Prisma et compile vers `dist/` |
| `npm start` | Lance l'API compilée |
| `npm run start:dev` | Lance l'API en recompilant à chaque modification |
| `npm run test:e2e` | Tests de bout en bout sur une base éphémère |
| `npm run db:deploy` | Applique les migrations (production) |
| `npm run db:seed` | Crée ou met à jour les comptes de démonstration |
| `npx tsx scripts/creer-migration.ts <nom>` | Crée une migration après modification du schéma |
| `npx tsx scripts/verifier-tls.ts` | Vérifie la connexion chiffrée exigée par RDS, contre un Postgres local qui refuse le clair |

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Base PostgreSQL. Obligatoire, sauf si les variables `DB_*` sont fournies. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Alternative à `DATABASE_URL`, telle qu'ECS l'injecte depuis Secrets Manager. |
| `DATABASE_SSL_CA` | Autorité de certification de la base. Sur RDS : `certs/rds-global-bundle.pem`. Active un TLS vérifié, pour l'application comme pour les migrations. |
| `JWT_SECRET` | Secret de signature des jetons. **Obligatoire en production.** |
| `DEMO_LOGIN` | `true` : connexion sans mot de passe aux comptes de démonstration. Désactivée par défaut. |
| `CORS_ORIGINS` | Origines autorisées, séparées par des virgules. |
| `PORT` | Port d'écoute (4001 par défaut ; l'hébergeur fournit le sien). |
| `JWT_EXPIRES_IN` | Durée de validité des jetons (`7d` par défaut). |
| `SEED_ADMIN_PASSWORD` | Mot de passe du compte d'administration, haché à l'amorçage. Sans lui, ce compte ne se connecte qu'en mode démo. |

---

## Ce que l'API expose

Toutes les routes sont préfixées par `/api`.

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/health` | État de l'API et de sa base (public) |
| `POST` | `/auth/login` | Connexion par adresse et mot de passe (public) |
| `POST` | `/auth/demo` | Connexion à un compte de démonstration (public, si `DEMO_LOGIN=true`) |
| `GET` | `/auth/me` | Compte associé au jeton |
| `GET` | `/collections` | Tout ce que la session peut lire, par famille |
| `GET` | `/collections/:famille` | Les lignes visibles d'une famille |
| `PUT` | `/collections/:famille/:id` | Crée ou remplace une ligne |
| `DELETE` | `/collections/:famille/:id` | Supprime une ligne |
| `GET` | `/events?token=…` | Flux temps réel (Server-Sent Events) |
| `POST` | `/admin/reinitialiser` | Efface toutes les données métier (administration) |

Les neuf familles : `companies`, `company-processes`, `drafts`, `notifications`,
`appointments`, `bank-requests`, `modifications`, `domiciliations`,
`branding-orders`.

## Qui peut faire quoi

| Profil | Lecture | Écriture |
|---|---|---|
| Administration | tout | tout |
| Comptabilité | tout | notifications |
| Banque | demandes adressées à sa banque, sociétés, ses notifications | ses demandes |
| Client | ce qui lui appartient | ce qui lui appartient |

Un client ne peut ni modifier la ligne d'un autre, ni céder la sienne. Il peut
**créer** une notification pour autrui — le parcours prévient l'administration
d'un refus de devis — mais pas modifier celle d'un autre. Le flux temps réel
applique les mêmes règles : chaque poste ne reçoit que ce qu'il a le droit de
lire.

Les règles sont dans [`src/collections/acces.ts`](src/collections/acces.ts), et
chacune est couverte par un test.

## Le modèle de données

Une table par famille. Les colonnes portent ce sur quoi le serveur raisonne —
propriétaire, statut, société de rattachement — et une colonne `data` conserve
l'objet complet tel que l'application le manipule. Le frontend évolue encore
vite : figer chaque champ imbriqué (associés, pièces, devis) en colonnes aurait
imposé une migration à chaque retouche d'écran. Les champs se promouvront en
colonnes au fur et à mesure qu'ils se stabilisent.

Le schéma est dans [`prisma/schema.prisma`](prisma/schema.prisma).

## Déploiement

Sur AWS — ECS Express Mode, RDS, S3 + CloudFront — par un modèle CloudFormation
et deux workflows GitHub Actions : voir [`DEPLOIEMENT.md`](../DEPLOIEMENT.md).
L'image Docker se construit à partir du [`Dockerfile`](Dockerfile) de ce dossier.

## Comment le frontend s'y branche

Aucun écran n'a changé. Le frontend range chaque famille sous une clé du
stockage local ; [`src/lib/sync.ts`](../src/lib/sync.ts) observe ces écritures,
en déduit les entités réellement modifiées et les envoie **une à une** — deux
personnes qui travaillent sur des dossiers différents ne s'écrasent jamais. En
retour, il charge l'état du serveur à la connexion et applique en direct les
écritures des autres postes.

---

## Ce qui reste à faire avant une mise en service

L'API contrôle **à qui** appartient chaque ligne, pas **ce qu'on y écrit**. Les
règles métier vivent encore dans le frontend (`src/domain/`) : un client
techniquement habile pourrait, sur son propre dossier, se marquer un devis comme
validé à un autre montant, ou déclarer sa société immatriculée. Pour une mise en
service, ces transitions doivent passer par des routes dédiées qui les
vérifient — `POST /companies/:id/quote/validate` plutôt qu'un remplacement
d'objet.

S'y ajoutent : un écran de connexion dans le frontend (l'API sait déjà
authentifier par mot de passe), le stockage des pièces justificatives (le
prototype n'en conserve que les noms), et une limitation du débit des requêtes.
