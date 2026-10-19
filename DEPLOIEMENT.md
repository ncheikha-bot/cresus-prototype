# Déploiement

**Frontend : https://ncheikha-bot.github.io/cresus-prototype/** (GitHub Pages)
**API : à déployer sur Render** — voir ci-dessous.

Dépôt : https://github.com/ncheikha-bot/cresus-prototype

---

## L'architecture

| Partie | Technologie | Hébergement |
|---|---|---|
| Frontend | React + Vite | GitHub Pages (branche `gh-pages`) |
| API | NestJS 11 + Prisma 7 | Render, service web |
| Base | PostgreSQL | Render, base gérée |

Le frontend fonctionne **avec ou sans** l'API. Construit sans `VITE_API_URL`, il
garde tout dans le navigateur, comme avant. Construit avec, il partage les
dossiers entre tous les appareils, en direct. Le détail de l'API est dans
[`api/README.md`](api/README.md).

---

## Mettre l'API en ligne

Il faut un compte Render, que je ne peux pas créer à votre place. Comptez cinq
minutes.

1. Ouvrez **https://render.com/deploy?repo=https://github.com/ncheikha-bot/cresus-prototype**
2. Connectez-vous avec GitHub et autorisez Render à lire le dépôt.
3. Render lit [`render.yaml`](render.yaml) et propose de créer **cresus-db** (la
   base) et **cresus-api** (le service). Validez avec **Apply**.

Render construit l'API, applique les migrations, insère les comptes de
démonstration et la démarre. Le secret des jetons est généré automatiquement.
L'API répond alors sur `https://cresus-api.onrender.com/api/health` (si ce nom
est déjà pris chez Render, il ajoute un suffixe : l'adresse exacte est affichée
en haut de la page du service).

### Brancher le frontend sur l'API

```bash
VITE_API_URL=https://cresus-api.onrender.com npm run deploy
```

Le site est reconstruit avec l'adresse de l'API et republié. Pour ne plus avoir
à la retaper, mettez-la dans un fichier `.env.production` à la racine (elle n'a
rien de secret).

### Ce que l'offre gratuite implique

- **Le service s'endort** après 15 minutes sans visite. Le premier visiteur
  suivant attend environ une minute : le site s'affiche tout de suite depuis son
  cache, les dossiers arrivent quand l'API est réveillée.
- **La base gratuite expire 30 jours** après sa création. Pour une base durable
  sans frais, créez-en une sur [neon.tech](https://neon.tech) et remplacez la
  variable `DATABASE_URL` du service Render par l'URL fournie ; les migrations
  s'y appliquent au démarrage suivant. Ou passez la base Render en offre payante.

---

## Repartir de zéro

- **Dans l'administration**, le bouton **« Réinitialiser la démo »** vide la base
  pour tout le monde — sociétés, dossiers, notifications, demandes, contrats. Les
  comptes restent. Les appareils ouverts vident leur affichage aussitôt.
- **Sur l'accueil**, « Réinitialiser la démonstration » n'efface que le
  navigateur : avec l'API branchée, les dossiers reviennent au rechargement.

## Publier une mise à jour

```bash
npm run deploy          # frontend
git push                # code source ; Render redéploie l'API tout seul
```

**Le navigateur garde l'ancienne version quelques minutes.** GitHub Pages sert
`index.html` depuis son cache : après une publication, rechargez sans le cache
(Cmd+Maj+R), ou ajoutez `?v=2` à l'adresse. Pour vérifier ce qui est réellement
servi :

```bash
curl -s "https://ncheikha-bot.github.io/cresus-prototype/?x=$RANDOM" | grep -o 'assets/index-[^"]*\.js'
```

Le nom doit correspondre à celui de votre `build/index.html`.

### Passer en publication automatique

Le fichier [`infra/pages.yml`](infra/pages.yml) contient un workflow GitHub
Actions qui reconstruit et publie à chaque poussée sur `main`. Il n'a pas pu
être déposé : le jeton d'authentification utilisé n'a pas la portée `workflow`.
Pour l'activer :

```bash
gh auth refresh -s workflow
mkdir -p .github/workflows && git mv infra/pages.yml .github/workflows/pages.yml
git commit -m "Publication automatique" && git push
```

Puis, dans le dépôt : **Settings → Pages → Source = GitHub Actions**, et
**Settings → Secrets and variables → Actions → Variables** pour y déposer
`VITE_API_URL`.

---

## Ce qu'il ne faut pas y mettre

La démonstration tourne avec `DEMO_LOGIN=true` : choisir un espace suffit à s'y
connecter, administration comprise. **Quiconque a l'adresse du site peut donc
tout lire et tout effacer.** N'y saisissez aucune donnée réelle — ni pièce
d'identité, ni coordonnées de personnes existantes, ni montant contractuel.

L'API sait faire mieux : les règles d'accès par utilisateur sont en place et
testées, et la connexion par mot de passe existe (`POST /api/auth/login`). Une
mise en service passe par `DEMO_LOGIN=false`, de vrais comptes, et un écran de
connexion dans le frontend — qui n'en a pas encore.
