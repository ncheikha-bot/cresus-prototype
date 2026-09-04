# Déploiement

**Le prototype est en ligne : https://ncheikha-bot.github.io/cresus-prototype/**

Dépôt : https://github.com/ncheikha-bot/cresus-prototype

---

## Où en est la persistance

Le site publié **fonctionne dès maintenant**, mais chaque visiteur a pour l'instant
ses propres données : elles survivent aux rechargements, aux onglets et à la
fermeture du navigateur, mais restent sur sa machine. La boucle client ↔
administration fonctionne donc entre deux onglets d'un même navigateur.

Pour que deux **appareils** voient le même dossier — le client saisit sur son
téléphone, l'administration traite depuis son poste — il reste trois choses à
faire, qui demandent un compte que je ne peux pas créer à votre place. Comptez
dix minutes.

### 1. Créer la base

Sur [supabase.com](https://supabase.com), créez un compte puis un projet
(offre gratuite, région Europe de préférence). Dans **SQL Editor**, collez le
contenu de [`infra/schema-supabase.sql`](infra/schema-supabase.sql) et lancez-le.

### 2. Relever les deux identifiants

**Project Settings → API** :

| Champ Supabase | À reporter dans |
|---|---|
| Project URL | `VITE_SUPABASE_URL` |
| Project API keys → `anon` `public` | `VITE_SUPABASE_ANON_KEY` |

La clé `anon` est faite pour vivre dans un navigateur : la publier est prévu.
Ne reportez **jamais** la clé `service_role`, qui contourne toutes les règles.

### 3. Reconstruire avec ces valeurs

En local, créez un fichier `.env` à partir de `.env.example`, collez-y les deux
valeurs, puis :

```bash
npm run deploy
```

Le site est reconstruit et republié. Les visiteurs partagent alors le même état,
et les changements arrivent **en direct** : validez un document côté
administration, le client le voit sans recharger.

Pour vérifier que la base est bien branchée, ouvrez la console du navigateur sur
le site publié : un avertissement « État partagé indisponible » signale que la
base n'est pas jointe (mauvaise URL, table absente, ou règles refusées).

---

## Repartir de zéro

L'accueil porte un bouton **« Réinitialiser la démonstration »** : il efface les
dossiers, brouillons et notifications créés sur l'appareil, et rend au jeu de
démonstration son état initial. Une démonstration se joue plusieurs fois ; sans
cela, le prochain visiteur hérite des essais du précédent.

Une fois la base partagée branchée, l'effacement reste **local** : les dossiers
restent visibles pour les autres participants, et l'appareil les retrouvera au
rechargement. Un participant ne peut donc pas effacer la démonstration de tout
le monde d'un clic.

## Publier une mise à jour

```bash
npm run deploy
```

Cette commande reconstruit et pousse sur la branche `gh-pages`. Le code source,
lui, se pousse normalement sur `main` (`git push`), sans effet sur le site.

**Le navigateur garde l'ancienne version quelques minutes.** GitHub Pages sert
`index.html` depuis son cache : après une publication, un rechargement simple
peut encore montrer l'ancien site, voire échouer sur un module absent — les
fichiers ont changé de nom, pas la page qui les réclame. Rechargez sans le
cache (Cmd+Maj+R), ou ajoutez `?v=2` à l'adresse. Pour vérifier ce qui est
réellement servi :

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
**Settings → Secrets and variables → Actions** pour y déposer
`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Les identifiants cessent alors
d'avoir à passer par votre machine.

---

## Ce qu'il ne faut pas y mettre

Le dépôt est **public** et la base de démonstration est **ouverte en lecture et
en écriture** à quiconque possède l'adresse du site : c'est ce qui permet à un
client et à un administrateur de se répondre sans avoir à créer de compte.

N'y saisissez donc aucune donnée réelle — ni pièce d'identité, ni coordonnées de
personnes existantes, ni montant contractuel véritable. Une mise en service
demanderait une authentification et des règles d'accès par utilisateur, ce que le
fichier de schéma signale à l'endroit concerné.

---

## Comment c'est branché

Le prototype rangeait tout par clé dans le stockage du navigateur. Le dépôt
commun reprend exactement ce contrat — une clé, une valeur JSON, une seule table
— si bien qu'aucun écran n'a eu à changer :

- [`src/lib/remoteStore.ts`](src/lib/remoteStore.ts) parle à la base ; sans
  configuration, il se désactive et l'application retrouve son comportement
  d'origine.
- [`src/lib/storage.ts`](src/lib/storage.ts) recopie les écritures vers ce dépôt
  et fait entrer les changements distants par le même chemin que ceux des autres
  onglets — l'application ne distingue pas un autre onglet d'un autre appareil.
- [`src/main.tsx`](src/main.tsx) charge l'état commun avant le premier rendu,
  pour qu'un appareil neuf ne montre pas d'abord le jeu de démonstration.

La session, elle, reste propre à l'onglet : c'est ce qui permet d'ouvrir le
client d'un côté et l'administration de l'autre.
