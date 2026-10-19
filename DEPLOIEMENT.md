# Déploiement sur AWS

Dépôt : https://github.com/ncheikha-bot/cresus-prototype

---

## L'architecture

| Partie | Service AWS | Créé par |
|---|---|---|
| Site (React + Vite) | S3 + CloudFront | CloudFormation, puis publié par le workflow **Site** |
| API (NestJS + Prisma) | ECS Express Mode (Fargate + équilibreur HTTPS) | le workflow **API** |
| Base | RDS PostgreSQL 18, privée, chiffrée | CloudFormation |
| Images de l'API | ECR | CloudFormation, alimenté par le workflow **API** |
| Secrets | Secrets Manager (mot de passe de la base, secret des jetons) | CloudFormation |
| Accès de GitHub à AWS | Rôle IAM par OIDC — aucune clé permanente | CloudFormation |

ECS Express Mode remplace App Runner, fermé aux nouveaux clients depuis le 30 avril
2026. Il fournit d'office une adresse HTTPS de la forme
`https://<service>.ecs.<région>.on.aws`, sans nom de domaine ni certificat à gérer.

**Région conseillée : Paris (`eu-west-3`)**, la plus proche de Dakar. Si ECS Express
Mode n'y est pas proposé, prenez l'Irlande (`eu-west-1`) : le modèle a été validé
pour les deux.

---

## Mise en service

### 1. Créer le socle (console AWS, 15 minutes dont 10 d'attente)

1. Console AWS, région **Europe (Paris)**, service **CloudFormation**.
2. **Create stack → With new resources**, puis **Upload a template file** :
   [`infra/aws/cresus.yaml`](infra/aws/cresus.yaml).
3. Nom de la pile : `cresus`. Paramètres :
   - **VPC** : le VPC par défaut (marqué *default*) ;
   - **Sous-réseaux** : cochez-en au moins deux du VPC par défaut ;
   - le reste peut rester tel quel. Mettez **CreateGitHubOidcProvider** à `false`
     seulement si le compte a déjà connecté GitHub Actions par OIDC.
4. Cochez l'accusé de réception sur la création de rôles IAM, puis **Submit**.

La base met une dizaine de minutes à se créer. Une fois la pile en
`CREATE_COMPLETE`, l'onglet **Outputs** donne tout ce qu'il faut pour la suite.

### 2. Autoriser le dépôt à recevoir des workflows (terminal, une fois)

```bash
gh auth refresh -h github.com -s workflow
```

Le jeton utilisé jusqu'ici ne permet pas de déposer des fichiers dans
`.github/workflows/`. Cette commande ouvre le navigateur pour l'étendre.

### 3. Brancher GitHub sur AWS

Déplacez les workflows à leur place et poussez :

```bash
mkdir -p .github/workflows
git mv infra/github/api.yml .github/workflows/api.yml
git mv infra/github/site.yml .github/workflows/site.yml
git commit -m "Workflows de déploiement AWS" && git push
```

Puis reportez les sorties de la pile en **variables** du dépôt (pas en secrets :
aucune n'est confidentielle) :

```bash
gh variable set AWS_REGION --body "eu-west-3"
gh variable set AWS_ROLE_ARN --body "<AwsRoleArn>"
gh variable set ECS_EXECUTION_ROLE_ARN --body "<EcsExecutionRoleArn>"
gh variable set ECS_INFRASTRUCTURE_ROLE_ARN --body "<EcsInfrastructureRoleArn>"
gh variable set DB_SECRET_ARN --body "<DatabaseSecretArn>"
gh variable set JWT_SECRET_ARN --body "<JwtSecretArn>"
gh variable set SITE_BUCKET --body "<SiteBucket>"
gh variable set CLOUDFRONT_DISTRIBUTION_ID --body "<CloudFrontDistributionId>"
gh variable set SITE_URL --body "<SiteUrl>"
```

### 4. Déployer l'API

```bash
gh workflow run api.yml
```

Le workflow rejoue les tests, construit l'image, la pousse sur ECR et crée le
service `cresus-api`. Au premier passage, comptez une dizaine de minutes : ECS crée
l'équilibreur et attend que l'API réponde sur `/api/health`. L'adresse de l'API
s'affiche dans le résumé de l'exécution (onglet **Actions**).

### 5. Publier le site

```bash
gh variable set API_URL --body "https://cresus-api.ecs.eu-west-3.on.aws"   # l'adresse affichée à l'étape 4
gh workflow run site.yml
```

Le site est en ligne à l'adresse `SiteUrl`.

---

## Ensuite

Chaque `git push` sur `main` redéploie ce qui a changé : l'API si `api/` a bougé
(après les tests ; un échec bloque le déploiement), le site si le frontend a bougé.
ECS déploie l'API en canari et revient en arrière seul si les erreurs 5xx grimpent.

**Repartir de zéro** : dans l'administration, le bouton « Réinitialiser la démo »
vide la base pour tout le monde. Les comptes restent.

**Journaux** : CloudWatch Logs, groupe créé par Express Mode pour `cresus-api`.

**Mettre à jour PostgreSQL** : RDS applique seul les versions mineures. Avant toute
mise à jour de la pile CloudFormation, relevez `EngineVersion` dans le modèle à la
version en service (console RDS), faute de quoi CloudFormation tenterait un retour
en arrière que RDS refuse.

---

## Coût

Ordre de grandeur, hors crédits de l'offre gratuite, à confirmer avec le
[calculateur AWS](https://calculator.aws/) : **60 à 80 USD par mois**. L'essentiel
vient de trois postes : la tâche Fargate (0,5 vCPU, 1 Go), l'équilibreur de charge
et la base `db.t4g.micro`, auxquels s'ajoutent les adresses IPv4 publiques
(facturées à l'heure). CloudFront, S3, ECR et Secrets Manager pèsent quelques
dollars.

Pour tout arrêter : supprimer le service `cresus-api` (console ECS), vider le
bucket du site, puis supprimer la pile `cresus`. Un instantané de la base est
conservé ; supprimez-le dans la console RDS si vous n'en voulez plus.

---

## Ce qu'il ne faut pas y mettre

La démonstration tourne avec `DEMO_LOGIN=true` : choisir un espace suffit à s'y
connecter, administration comprise. **Quiconque a l'adresse du site peut donc tout
lire et tout effacer.** N'y saisissez aucune donnée réelle.

L'API sait faire mieux : les règles d'accès par utilisateur sont en place et
testées, et la connexion par mot de passe existe. Une mise en service passe par
`DEMO_LOGIN=false`, de vrais comptes et un écran de connexion dans le frontend —
voir [`api/README.md`](api/README.md), section « Ce qui reste à faire ».

---

## L'ancienne version GitHub Pages

https://ncheikha-bot.github.io/cresus-prototype/ reste en ligne, dans sa version
autonome : chaque navigateur y garde ses propres données. Elle n'est plus mise à
jour ; pour la retirer : **Settings → Pages → Unpublish site**.
