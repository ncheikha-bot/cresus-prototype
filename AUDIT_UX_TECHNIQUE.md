# Audit UX & technique — Prototype Crésus V2++

Audit réalisé le 5 août 2026 sur le code du dossier, avec test des parcours dans le navigateur
(Chrome, viewports 1280×720 / 1440×900 / 375×812).

Volume analysé : 157 fichiers TS/TSX, 66 116 lignes hors `components/ui/`.

---

## 1. Blocages — à corriger avant toute autre chose

### 1.1 Le tunnel de création d'entreprise est infranchissable (mobile et web)

**Symptôme reproduit.** Étape 1 remplie correctement → clic sur « Suivant » → l'en-tête passe à
« Étape 2 sur 7 » et la barre de progression avance, **mais le formulaire de l'étape 2 ne s'affiche jamais**.

- Sur **web** : le formulaire de l'étape 1 reste affiché, avec ses messages d'erreur périmés.
- Sur **mobile** : la zone de contenu devient **entièrement vide** et le bouton « Suivant » passe en
  `disabled` (la validation `isCapitalDistributionValid()` échoue puisque aucune saisie n'est possible).
  Le parcours est alors définitivement bloqué : seul « Précédent » répond.

**Cause racine identifiée et validée.** Mesure dans le DOM au moment du blocage :

```
.space-y-4  →  opacity: 0
               transform: matrix(1, 0, 0, 1, -9.61219, 0)   // figé à mi-chemin de exit:{x:-20}
```

Le bloc de l'étape 1 termine son fondu mais **n'est jamais démonté**. Comme `AnimatePresence mode="wait"`
attend le démontage du sortant avant de monter l'entrant, l'étape 2 n'est jamais montée.

Le motif fautif : `AnimatePresence mode="wait"` reçoit **7 enfants frères conditionnels** au lieu d'un
enfant unique keyé.

- `src/components/mobile/CreateCompany.tsx:1480` puis blocs `{currentStep === N && (...)}` lignes
  1482, 1628, 2079, 2267, 2557, 2927, 3141
- `src/components/web/WebCreateCompany.tsx:1505` puis blocs lignes
  1507, 1759, 2286, 2444, 2534, 2910, 3100

**Validation du diagnostic.** Le retrait de `mode="wait"` sur la ligne 1480 (mobile) débloque
immédiatement l'affichage de l'étape 2 (« Associés et répartition du capital »). *Le fichier a été
restauré à l'identique après ce test.*

**Correctif recommandé** — un seul enfant keyé, le contenu passant par une fonction :

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -20, opacity: 0 }}
  >
    {renderStep(currentStep)}
  </motion.div>
</AnimatePresence>
```

**À vérifier ailleurs :** le projet compte **22 occurrences** de `AnimatePresence mode="wait"`.
Auditer chacune pour ce même motif.

### 1.2 L'écran d'accueil est inutilisable sur les écrans courants

`src/components/IntroScreen.tsx:12` applique `overflow-hidden` à un conteneur dont le contenu dépasse
largement le viewport. Le scroll est donc impossible.

| Viewport | Hauteur du contenu | Cartes atteignables |
|---|---|---|
| 1280 × 720 (laptop 13") | 1308 px | **0 sur 4** — les 4 boutons commencent à `top: 730px` |
| 375 × 812 (iPhone) | 1934 px | **1 sur 4**, et seulement ses 52 premiers pixels |

Causes cumulées :
- `IntroScreen.tsx:55` — logo en `h-[32rem]`, soit **512 px de haut** (71 % d'un écran de 720 px).
- `IntroScreen.tsx:47` — `mb-16` sous le bloc d'en-tête.
- `IntroScreen.tsx:80` — grille `md:grid-cols-3` pour **4 cartes** → la 4ᵉ tombe seule sur une 2ᵉ ligne.

**Correctif :** retirer `overflow-hidden` (le garder uniquement sur le calque décoratif en
`absolute inset-0`), ramener le logo à `h-24 md:h-32`, passer la grille en
`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.

### 1.3 Une société créée par un client n'existe pour personne

`AppContext` n'expose **ni `addCompany` ni `setCompanies`** (interface, `src/context/AppContext.tsx:6-45`).
`handleSubmit` (`mobile/CreateCompany.tsx:1028`) se contente de `setSubmitted(true)` et d'une notification.

Conséquences :
- la société n'apparaît jamais dans `companies`, donc **jamais dans l'espace admin** ;
- `updateCompanyStatus` est défini (`AppContext.tsx:147`) mais **appelé nulle part** — 0 occurrence ;
- `AdminCompanySteps.tsx` (2 053 lignes, l'écran de pilotage du dossier) tient ses 25 `useState` en local :
  une validation admin ne produit **aucun effet visible côté client** et disparaît au démontage.

Le parcours de bout en bout client → admin → client n'existe pas. C'est le chaînon manquant central
pour passer du prototype au produit.

### 1.4 Les brouillons sont écrits mais irrécupérables

`mobile/CreateCompany.tsx:1117` et `web/WebCreateCompany.tsx:1186` :

```ts
localStorage.setItem(`draft_${currentUser?.id}_${Date.now()}`, JSON.stringify(draftData));
```

La clé contient `Date.now()` et **aucun `getItem` correspondant n'existe dans le projet**. Chaque
« Enregistrer et quitter » crée une entrée orpheline et fait grossir le localStorage indéfiniment.
Le message affiché — « Votre progression a été enregistrée. Vous pouvez reprendre plus tard. »
(`mobile/CreateCompany.tsx:1122`) — est faux.

En parallèle, `App.tsx:132` et `:198` passent `draftId={draftId}` à des composants dont les interfaces
`CreateCompanyProps` (l.11-13) et `WebCreateCompanyProps` (l.14-16) ne déclarent que `onBack` :
`draftId` a **0 occurrence** dans les deux fichiers. Toute la branche « reprise de brouillon » est morte.

### 1.5 Mots de passe et données personnelles écrits dans la console

| Fichier:ligne | Contenu logué |
|---|---|
| `src/context/AppContext.tsx:433` | `{ email, password }` en clair |
| `src/context/AppContext.tsx:434` | la liste complète des comptes bancaires, `bankPassword` inclus |
| `src/components/web/WebBankAuth.tsx:20` | `{ email, password }` |
| `src/components/mobile/BankAuth.tsx:20` | `{ email, password }` |
| `web/WebCreateCompany.tsx:764-780`, `mobile/CreateCompany.tsx:695-711` | nom, prénom, email, téléphone, part et montant de **tous les associés**, à chaque clic sur « Suivant » |
| `web/WebCreateCompany.tsx:1996-2047`, `mobile/CreateCompany.tsx:1815-1864` | situation et régime matrimonial des associés |

31 `console.log` au total. Les 3 premiers font transiter le mot de passe trois fois par tentative de
connexion. À supprimer avant toute mise en ligne, même de démonstration
(loi sénégalaise 2008-12 sur les données à caractère personnel).

---

## 2. Design system — deux causes racines, un effet massif

### 2.1 Aucune police n'est chargée

`globals.css` déclare `'Inter'` (l. 39, 59, 63) et `'Poppins'` (l. 47, 51, 55). Or le projet ne contient :

- aucun `<link>` Google Fonts dans `index.html` (15 lignes, `<head>` réduit à un `<style>`) ;
- aucun `@font-face`, aucun `@import url()` de police dans les 2 fichiers CSS ;
- aucun fichier `.woff/.woff2/.ttf/.otf` sous `src/` ;
- aucun paquet `@fontsource/*` dans `package.json`.

Le rendu retombe donc sur les polices système, **différentes d'une machine à l'autre**, et les titres
(`Poppins, sans-serif`, sans fallback intermédiaire) rendent dans une famille différente du corps de
texte (`-apple-system…`). L'identité typographique de la marque n'existe pas à l'écran.

**Correctif :** installer `@fontsource-variable/inter` et `@fontsource/poppins`, les importer dans
`index.css`, et compléter les piles de fallback.

### 2.2 Toute la hiérarchie typographique est écrasée

Aucun `font-size` n'est déclaré pour `h1`/`h2`/`h3` — ni dans `globals.css`, ni dans `index.css`.
Le Preflight de Tailwind v4 remet donc tous les titres à `font-size: inherit; font-weight: inherit`.

Mesure en direct sur l'écran d'accueil :

| Élément | Taille rendue | Graisse |
|---|---|---|
| `<h1>` « Bienvenue sur Crésus » | **16 px** | 400 |
| `<h3>` « App Mobile » | **16 px** | 400 |
| `<p>` du paragraphe voisin | 16 px | 400 |

Titres et corps de texte sont strictement identiques. Le projet compte **100 `<h1>`, 269 `<h2>` et
762 `<h3>`** : la correction est centrale et bénéficie à toute l'application d'un coup.

**Correctif :** définir une échelle typographique dans un bloc `@theme` (Tailwind v4) et styler
`h1`–`h4` dans `@layer base`.

### 2.3 Les tokens de marque ne servent à rien

`globals.css:3-23` déclare `--bleu-nuit`, `--or-imperial`, `--bleu-acier`… dans un bloc `:root`
**et non dans un bloc `@theme`**. Il n'existe ni `tailwind.config.ts`, ni `postcss.config`.
Conséquence : aucun utilitaire `bg-primary` / `text-bleu-nuit` n'est généré.

Résultat mesuré dans `src/components` :

- **6 853 occurrences de couleurs HEX en dur**, réparties sur 98 fichiers, dont 6 752 sous forme de
  classes arbitraires (`text-[#1A2753]` ×2 116, `text-[#273A7A]` ×1 890, `#D6A93A` ×1 687…) ;
- **`var(--bleu-nuit)` & consorts : 0 occurrence** dans les composants ;
- **3 960 occurrences de couleurs Tailwind par défaut** (`bg-gray-50`, `text-green-600`…) sur
  **110 nuances** et 16 familles — aucune n'appartient à la palette Crésus ;
- **5 nuances d'or concurrentes** pour le même rôle « hover » : `#b8902f`, `#C09830`, `#B8923C`,
  `#c89830`, `#C49530` (114 occurrences) ;
- deux valeurs différentes pour le **même** gradient de header : `mobile/Dashboard.tsx:92` utilise
  `via-[#1E3068]`, `web/WebDashboard.tsx:209` utilise `via-[#1e2f63]`.

**Corollaire : le mode sombre ne peut pas fonctionner.** `globals.css:25-31` redéfinit les variables
sous `[data-theme="dark"]` et le basculement est câblé (`AppContext.tsx:452-458`), mais comme aucun
composant ne consomme ces variables et qu'il y a **0 classe `dark:`** hors de `components/ui/`, seul
le fond du `<body>` change. Les 6 853 couleurs en dur restent claires.

### 2.4 La bibliothèque de composants est contournée à 99,5 %

`src/components/ui/` contient 46 composants shadcn. **5 imports seulement** existent hors de ce dossier,
répartis sur **2 fichiers** (`MobileAuth.tsx` — orphelin — et `mobile/BankAccount.tsx` — mort aussi).

| | Composant utilisé | Écrit à la main |
|---|---|---|
| Boutons | **4** `<Button>` | **769** `<button>` bruts |
| Cartes | **0** `<Card>` | 834 `bg-white rounded-*`, pour **377 signatures de classes distinctes** |

Un archétype de carte existe de fait (`bg-white rounded-2xl p-6 shadow-sm`, 96 occurrences) mais il se
décline en 377 variantes. Les boutons or comptent **280 occurrences pour 210 signatures distinctes** —
quasiment une par usage.

Les 46 composants `ui/` référencent 340 classes sémantiques (`bg-primary`, `text-muted-foreground`,
`ring-destructive`…) dont **aucune variable n'est définie** : un grep de `--background|--foreground|
--primary|--muted|--accent|--destructive|--card|--border|--ring|--radius` sur les 2 fichiers CSS renvoie
**0 résultat**. Le thème shadcn n'existe nulle part. **41 des 46 composants sont du code mort.**

**Décision à prendre :** soit brancher le thème shadcn et migrer progressivement, soit assumer une
petite bibliothèque maison (`<Button>`, `<Card>`, `<Field>`, `<Badge>`) et supprimer `ui/`.
La situation actuelle — les deux, sans passerelle — est la plus coûteuse.

### 2.5 Le « Liquid Glass Design System » couvre 5,8 % de l'app

Les 8 classes `.glass*` (`globals.css:122-224`, soit 46 % du fichier) totalisent **35 utilisations dans
6 fichiers, tous dans `mobile/`**. Zéro usage dans `web/` (31 fichiers), `admin/` (19) et `accountant/` (9).

---

## 3. Accessibilité — parcours critiques concernés

| Critère | Mesure | Seuil |
|---|---|---|
| Champs de formulaire avec nom accessible | **30 / 285 (10,5 %)** | 100 % |
| Boutons icône sans nom accessible | **218 / 988 (22,1 %)** — `aria-label` applicatif : **0** | 0 |
| Boutons avec style de focus | **0 / 988** | 100 % |
| Cibles tactiles < 44 px | **130 / 151** boutons icône mesurables | 0 |
| Éléments cliquables non sémantiques | **153** (132 `motion.div`, 20 `div`), **0** avec gestion clavier | 0 |
| Textes à opacité ≤ 70 % | **1 096**, dont 802 sur du texte ≤ 14 px | — |
| Images sans `alt` | **0** — conforme | 0 |

Trois points saillants :

**a) `<html lang="en">`** (`index.html:3`) sur une application intégralement en français.
Un lecteur d'écran prononcera tout le contenu avec une phonétique anglaise. Échec WCAG 3.1.1 (niveau A),
correctif d'un caractère.

**b) La navigation principale du mobile est illisible.** Mesure en direct sur `mobile/BottomBar.tsx:77-79` :

| Onglet | Taille | Contraste mesuré |
|---|---|---|
| Accueil (actif) | 9 px | 13,33:1 |
| Sociétés, Dossiers, Documents, Profil | **9 px** | **2,42:1** |

Le seuil WCAG AA pour du texte normal est 4,5:1. Ces libellés sont à 54 % du seuil, en 9 px.
La couleur `text-[#273A7A]/35` est de plus multipliée par une animation `opacity: 0.45`.
À noter : la taille de la cible tactile, elle, est conforme (≈ 48 × 54 px).

**c) Le contenu passe sous la barre de navigation.** Toujours en 375 × 812 : la `BottomBar` flottante
commence à `y = 732`, tandis que le libellé « Comptabilité » de la dernière rangée de cartes est à
`y = 716`. Il manque un `padding-bottom` sur le conteneur scrollable.

Autres manques structurels : **0 `focus-visible:ring`** applicatif (234 `outline-none` dont 140
compensés par une simple couleur), **0 gestion de la touche Échap** dans les modales (vérifié en direct :
Échap ne ferme pas l'onboarding, dont l'unique bouton de sortie fait 32 × 32 px sans nom accessible),
**0 focus trap**, **0 `prefers-reduced-motion`** pour 567 `motion.div` animés, **0 `<a href>`**
dans toute l'application.

Les 3 layouts desktop (`WebLayout`, `AdminLayout`, `AccountantLayout`) sont en revanche correctement
structurés en `<nav>`/`<main>`/`<header>`. **Les 31 écrans mobile n'ont aucun landmark**
(`BottomBar.tsx:20` est un `<div>`, pas un `<nav>`).

---

## 4. Parcours et cohérence — ce que voit l'utilisateur

### 4.1 Quatre systèmes de numérotation pour un tunnel de 7 étapes

Le bandeau affiche « Étape N sur 7 » (`web/WebCreateCompany.tsx:1460`) pendant que les sous-titres
internes annoncent, en dur :

| Ligne | Affiché | Réel |
|---|---|---|
| `WebCreateCompany.tsx:1519` | Étape **1/5** | 1/7 |
| `:1776` | Étape **2/5** | 2/7 |
| `:2303` | Étape **3/5** | 3/7 |
| `:2461` | Étape **4/6** | 4/7 |
| *(aucun)* | — | 5/7 |
| `:2927` | Étape 6/7 | 6/7 |
| `:3117` | Étape 7/7 | 7/7 |

Le tunnel **mobile** n'a pas ces sous-compteurs (pastilles uniquement) : les deux plateformes ne
racontent pas la même histoire. Un 4ᵉ système existe sur les dashboards :
`mobile/Dashboard.tsx:275` et `web/WebDashboard.tsx:668` affichent `Étape {draft.currentStep}/5`
avec une barre `width: ${(draft.currentStep / 5) * 100}%` → un brouillon repris à l'étape 7 affiche
« Étape 7/5 » et une **barre de progression à 140 %**.

### 4.2 Quatre mécanismes de feedback concurrents

| Mécanisme | Occurrences | État |
|---|---|---|
| `addNotification` (persistant) | 122 | dont **36 sont des erreurs de saisie** (30 %) |
| `alert()` / `confirm()` / `prompt()` natifs | **62** | non stylés, bloquants, hors charte |
| Bloc d'erreur inline | 6 | non relié aux champs |
| `sonner` (toast) | — | **`<Toaster />` jamais monté** : la lib est inerte |

Chaque échec de validation empile une notification **permanente** dans la cloche
(`AppContext.tsx:132-139` n'a aucun mécanisme d'expiration) — vérifié en direct : un clic sur « Suivant »
avec un formulaire vide fait passer le compteur de 1 à 2. Un utilisateur qui bute cinq fois sur l'étape 2
retrouve cinq « Informations incomplètes ❌ » mêlées à ses documents officiels.

Cas les plus problématiques : `web/WebBankRequestDetail.tsx:68-121` utilise **6 `prompt()` natifs**
pour saisir un motif de rejet, une date de rendez-vous **et un numéro de RIB**.
`WebCreateCompany.tsx:505` place un `window.confirm()` multi-lignes au cœur de la validation du devis.

**Règle à poser :** erreur de saisie → message inline sous le champ ; succès/action transitoire → toast
(monter `<Toaster />`) ; événement métier → notification persistante. Remplacer les 62 dialogues natifs
par les composants `AlertDialog`/`Dialog` déjà présents dans `ui/`.

### 4.3 Les erreurs ne disparaissent pas quand on corrige

`setErrors` n'apparaît que **4 fois par fichier**, toutes dans `handleNext` ou dans un
`useEffect([currentStep])` (`mobile/CreateCompany.tsx:358`, `web:370`). **Aucun `onChange` ne réinitialise
les erreurs.** L'utilisateur corrige son nom d'entreprise et continue de lire
« Le nom de l'entreprise est obligatoire » — constaté à l'écran pendant le test.

Le reset sur changement d'étape est de surcroît contre-productif : il efface les erreurs au moment
précis où la validation vient de réussir.

Aucun marquage au niveau du champ : mesure en direct des 3 champs fautifs → `borderColor: rgba(0,0,0,0)`.
Et côté lecteur d'écran, **0 `role="alert"`, 0 `aria-live`, 0 `aria-invalid`** sur la page, le focus
restant sur `<body>` : rien n'est annoncé, l'échec est invisible.

### 4.4 Montants et devise

- Le champ « Capital social » contient `1000000` sous un placeholder qui promet `1 000 000`
  (`mobile/CreateCompany.tsx:277` et `:1606-1612`). Aucun formatage à la saisie ni au blur, sur le
  champ juridiquement le plus sensible du formulaire.
- Placeholders divergents entre plateformes pour le champ « Montant » d'un associé :
  `"250 000"` en mobile (`:1773-1780`), `"250000"` en web (`:1948-1955`).
- **Trois rendus de devise coexistent** : `FCFA` (239 occurrences), `F CFA` (via 6 `Intl.NumberFormat`
  avec `currency: 'XOF'`), et des montants bruts non formatés (4 endroits, dont le bouton
  « Payer 1000000 FCFA » de `mobile/CapitalPayment.tsx:180` et le devis officiel
  `admin/QuotePreview.tsx:187`).
- Côté admin, trois échelles cohabitent : `AdminDashboard.tsx:105` produit `6000k FCFA`,
  `AdminPayments.tsx:51` produit `M FCFA`, et `AdminDashboard.tsx:153` contient la chaîne en dur
  `'2,450k FCFA'` — avec une **virgule anglo-saxonne**, qu'un lecteur francophone lira comme un
  séparateur décimal. Constaté à l'écran : « 10200.0k FCFA ».
- `formatPrice`/`formatAmount` sont **redéfinis localement dans 8 fichiers**, en 3 implémentations.

**Correctif :** un seul helper `formatFCFA(n)` dans `src/lib/`, utilisé partout, plus un masque de
saisie sur les champs monétaires.

### 4.5 Quatre caractères corrompus dans des libellés visibles

Ce sont des `U+FFFD`, la perte est définitive — il faut retaper les caractères.

| Fichier:ligne | Texte affiché |
|---|---|
| `web/WebCreateCompany.tsx:163` | `N��cessite conseil juridique` |
| `web/WebCreateCompany.tsx:1130` | `…ont ét�� rejetés` |
| `web/WebCreateCompany.tsx:2599` | `Versement int��gral du capital` |
| `mobile/CreateCompany.tsx:3307` | `Réserver ce cr��neau` — **libellé de bouton** |

À quoi s'ajoute une incohérence de nommage du même écran selon l'espace : `'Dashboard'`
(`AdminLayout.tsx:20`), `'Tableau de bord'` (`AccountantLayout.tsx:13`), `'Accueil'`
(`WebLayout.tsx:21`, `BottomBar.tsx:11`). Et « uploader » (`AccountantDeclarations.tsx:787`) contre
« téléverser » (`mobile/CreateCompany.tsx:1289`).

### 4.6 Données incohérentes d'un écran à l'autre

Pour le **même utilisateur**, au même instant :

| Écran | Sociétés | En cours |
|---|---|---|
| Dashboard web | 3 | 7 |
| Dashboard mobile | **10** | **3** |

Le dashboard web duplique par ailleurs la même information à 200 px d'écart (encart « Aperçu rapide »
3/7/0, puis les trois premières tuiles KPI). La tuile « 0 Actions requises — Tout est à jour » porte
une icône d'alerte orange, et deux tuiles sur quatre affichent une flèche ↗ : rien n'indique lesquelles
sont cliquables.

Sur l'écran admin « Dossiers entreprises », les 4 dossiers affichent **exactement** les mêmes chiffres
(« 5 documents · 3 validés · 1 en attente · 1 à corriger ») et 3 sur 4 la même progression de 40 % —
la démonstration se lit immédiatement comme factice.

Racine du problème (voir §5) : `mockAppointments` existe en **3 exemplaires incompatibles**
(`data/mockData.ts:1035`, `mobile/Appointment.tsx:55`, `web/WebAppointment.tsx:55`). Un rendez-vous pris
côté client ne remonte jamais dans `AdminAppointments`, qui lit une troisième liste figée.

### 4.7 Détails d'interface relevés pendant le test

- **Bouton « Retour » inopérant** (`admin/AdminDossiers.tsx:14`) : il appelle `window.history.back()`.
  Cliqué en conditions réelles, il ne produit **rien** ; sur un historique vide, il ferait sortir du site.
- **Icônes contradictoires pour la même fonction** : le repli de la barre latérale utilise une croix `X`
  côté client (`WebLayout.tsx:106`) et un chevron `<` côté admin. Une croix signifie « fermer /
  supprimer », pas « replier ». Aucun des deux n'a d'`aria-label`.
- **L'onboarding masque ce qu'il présente** : la modale en 7 étapes floute intégralement l'arrière-plan.
  L'utilisateur lit la description de fonctionnalités qu'il ne peut pas voir. Un spotlight sur l'élément
  décrit serait plus efficace — et plus court que 7 écrans.
- **Sections vides** sur le dashboard admin : la tuile « Dossiers actifs » occupe seule une ligne de
  grille de 4 colonnes pendant le chargement différé, et le bloc « Modes de paiement » réserve ~350 px
  au-dessus de sa légende.
- **Ton inadapté** : « Bienvenue sur votre Dashboard 👋 » sur un back-office utilisé quotidiennement.
- **La couleur ne porte aucune information** sur le dashboard admin : 8 KPI, 8 couleurs
  (vert, violet, bleu, orange, rouge…) sans logique sémantique. Pire, « En révision : 4 » affiche
  « -5 % » en **rouge** — alors qu'une baisse des dossiers en révision est une bonne nouvelle.

### 4.8 États vides, chargement, erreurs

| | Couverture |
|---|---|
| Écrans avec état vide | 37 / 91 (41 %) |
| Écrans avec état de chargement | **7 / 91 (8 %)** — uniquement des spinners dans un bouton |
| `Skeleton` | **0** usage applicatif |
| `try`/`catch` dans tout `src/` | **3** |
| État d'erreur d'écran | **0** |

Aucun écran ne gère un échec de chargement : ni retry, ni message « connexion perdue », ni mode dégradé.
Pour une cible sénégalaise sur réseau mobile, c'est un manque structurant.

À signaler aussi : `web/WebBranding.tsx:967-968` et `:998-999` branchent les boutons « Télécharger »
sur un `console.log`. Le clic ne produit **rien**, sans aucun retour visuel.

---

## 5. Architecture — la dette qui bloquera la suite

### 5.1 53 % du code applicatif est dupliqué entre mobile et web

**25 paires** `mobile/X.tsx` ↔ `web/WebX.tsx`, soit **35 200 lignes**.

| Paire | mobile | web | similarité |
|---|---|---|---|
| SendAccountingDocuments | 529 | 575 | **85 %** |
| Appointment | 789 | 753 | **81 %** |
| BankRequestDetail | 460 | 468 | **81 %** |
| BankAccountOpening | 727 | 783 | **79 %** |
| CreateCompany | 3 612 | 3 376 | **78 %** |

Dans les deux `CreateCompany`, **33 fonctions métier sont dupliquées**, dont plusieurs strictement
identiques : `getCapitalNumber`, `getLiberatedAmount`, `getRemainingAmount`, `getTotalRegistrationFees`,
`getDirectorTitle`, `getRequiredDocuments`, `isCapitalValid`, `isAssociatesCountValid`,
`isCapitalDistributionValid`.

Deux blocs particulièrement parlants :

- **`handleNext`** — toute la validation des 7 étapes : `mobile:665-1017` vs `web:734-1086`.
  **353 lignes, 2 lignes d'écart** (le texte d'un `console.log`).
- **`legalFormInfo`** — les règles OHADA des 7 formes juridiques (SARL, SA, SAS, SASU, SUARL, SNC, SCI) :
  `mobile:78-229` vs `web:81-232`, **152 lignes**. Seul écart réel : le caractère corrompu de la
  ligne `web:163`. La divergence a déjà commencé.
- **Le barème d'immatriculation** est écrit en dur dans le `useState` d'un composant d'interface,
  en double : `mobile:317-326` et `web:329-338`
  (`registrationFees: 75000, legalFees: 50000, publicationFees: 25000, stampDuty: 30000, adminFees: 20000`).
  Une hausse de tarif exige deux éditions dans deux fichiers de 3 500 lignes.

**Correctif prioritaire :** extraire dans `src/domain/` les règles juridiques (`legalForms.ts`),
le barème (`pricing.ts`) et la validation (`companyValidation.ts`). C'est le refactor à plus fort
rendement du projet : il supprime la duplication la plus risquée (des règles **juridiques**) avant de
toucher à l'interface.

### 5.2 6 061 lignes de code mort (9,2 %)

20 fichiers ne sont importés nulle part :

- **Un 5ᵉ espace « banque » complet et inaccessible — 2 461 lignes** :
  `mobile/BankAccount.tsx` (581), `mobile/BankRequestDetail.tsx` (460), `mobile/BankDashboard.tsx` (215),
  `mobile/BankAuth.tsx` (178), `web/WebBankRequestDetail.tsx` (468), `web/WebBankDashboard.tsx` (318),
  `web/WebBankAuth.tsx` (225), `web/WebBankInterface.tsx` (16).
  `AppContext.tsx:10` type bien `viewMode` avec `'bank'`, mais `App.tsx` n'a **aucune branche** pour ce mode.
- `mobile/SignDocuments.tsx` (588) + `web/WebSignDocuments.tsx` (712) — **1 300 lignes** :
  la signature électronique, argument commercial du produit, n'est atteignable par aucun écran.
- 7 fichiers à la racine de `components/` (1 155 lignes) : `MobileDashboard`, `CapitalLiberation`,
  `MobileAuth`, `ElectronicSignature`, `Splash`, `CreateCompany`, `ProcessTimeline`.
- `DELIVERABLES_INTEGRATION_EXAMPLE.tsx` (502), `client/FiscalDeclarations.tsx` (517),
  `accountant/AccountantAuth.tsx` (126).
- `data/testCompanyData.ts` (605 lignes) n'est importé par aucun composant.

Trois variantes « Improved » sont en revanche bien vivantes, atteintes via des wrappers de réexport de
11 à 16 lignes (`WebMyCompanies.tsx`, `AccountantFolders.tsx`, `AccountantDashboard.tsx`…).

### 5.3 Une source de vérité globale contre 32 sources locales

`AppContext` porte 9 champs. En face : **277 `useState`** hors `ui/`, dont **32 initialisés avec des
données métier**, sur 19 composants de plus de 600 lignes.

Pour la seule entité « modification » : **3 sources concurrentes déconnectées** —
`admin/AdminModifications.tsx:190` (146 lignes de données en dur), `mobile/Modification.tsx:79`,
`web/WebModification.tsx` — plus `data/modificationsData.ts`.

**10 des 19 composants admin n'appellent jamais `useApp()`.** Les mocks eux-mêmes ne sont pas centralisés :
77 tableaux littéraux vivent dans `components/`, et `AppContext.tsx:50-107` contient ses propres
`mockDocumentsData`.

### 5.4 Pas de routeur, pas de vérification de types au build

Le routing repose sur 4 `useState<string>` (`App.tsx:77-80`) et un sous-routing encodé dans la chaîne
(`mobileScreen.startsWith('create-draft-')`, `App.tsx:130`). Conséquences vérifiées :

- l'URL reste `http://localhost:3000/` quel que soit l'écran — **aucun lien partageable** vers un dossier,
  une demande bancaire ou une déclaration ;
- le bouton retour du navigateur **quitte l'application** ;
- **F5 renvoie systématiquement au splash puis à l'écran de choix d'espace** (constaté à chaque rechargement
  pendant le test) : `viewMode` repart à `'mobile'`, `showIntro` à `true`. Un tunnel à l'étape 6/7 perd
  ses 32 `useState` ;
- les 4 espaces sont importés statiquement (68 imports dans `App.tsx`) : **aucun code splitting**, le
  bundle initial embarque les 66 000 lignes, code mort compris.

**`tsc` n'est jamais exécuté** : `package.json` déclare `"build": "vite build"`, sans `tsc &&`.
Une erreur de type réelle passe donc inaperçue — `IntroScreen.tsx:7` émet `'accountant'`
(ligne 239) alors que `AppContext.tsx:10` type `viewMode` comme
`'mobile' | 'admin' | 'web' | 'bank'`. Les deux unions sont disjointes sur 2 valeurs :
le test `App.tsx:259` `viewMode === 'accountant'` compare des types sans recouvrement.
L'espace comptable ne fonctionne que parce que rien ne vérifie les types.

---

## 6. Ce qui fonctionne bien

- **L'identité de marque est forte et bien tenue** là où elle s'applique : le bleu nuit et l'or
  fonctionnent, le hero du dashboard web est le meilleur écran du prototype.
- **L'architecture de l'information est juste.** Le découpage de la barre latérale
  (Principal / Services essentiels / Services complémentaires) reflète une vraie compréhension du métier,
  et les 7 étapes du tunnel correspondent au processus réel de création d'entreprise au Sénégal.
- **Les règles juridiques sont sérieuses** : `legalFormInfo` couvre 7 formes avec capital minimum,
  nombre d'associés et conseils contextuels. Le message « Idéale pour les PME et projets familiaux »
  sous le sélecteur de forme juridique, et « 2 à 50 associés maximum » à l'étape 2, sont exactement
  le bon type d'aide au bon moment.
- **La validation métier existe et est correcte** — c'est son affichage qui pose problème, pas sa logique.
- **Les 3 layouts desktop sont sémantiquement bien construits** (`<nav>`/`<main>`/`<header>`), ce qui
  est rare dans un export Figma.
- **100 % des images ont un `alt`.**
- **Les états vides couvrent 41 % des écrans**, avec de bons exemples contextualisés au filtre actif
  (`WebMyDomiciliations.tsx:179-183`).
- La couverture fonctionnelle est impressionnante : création, domiciliation, banque, comptabilité,
  branding, modifications, 4 espaces utilisateurs. La matière produit est là.

---

## 7. Plan d'action proposé

### Sprint 1 — Débloquer (≈ 2 jours, effet immédiat)

1. Corriger `AnimatePresence mode="wait"` dans les 2 tunnels — **débloque le parcours principal** (§1.1).
2. Retirer `overflow-hidden` et réduire le logo de l'`IntroScreen` — **rend l'app utilisable
   sur laptop et mobile** (§1.2).
3. Supprimer les 3 `console.log` de mots de passe et les 10 de données personnelles (§1.5).
4. `lang="fr"` dans `index.html` — un caractère (§3a).
5. Charger Inter et Poppins + définir l'échelle typographique `h1`–`h4` — **répare d'un coup
   la hiérarchie de 1 131 titres** (§2.1, §2.2).
6. Ajouter `tsc --noEmit &&` au script de build, puis corriger les erreurs révélées (§5.4).

### Sprint 2 — Fiabiliser le parcours (≈ 1 semaine)

7. Extraire `src/domain/` : `legalForms.ts`, `pricing.ts`, `companyValidation.ts` — supprime la
   duplication des règles juridiques et du barème (§5.1).
8. Ajouter `addCompany` au contexte et brancher `handleSubmit` → une société créée devient visible
   côté admin (§1.3).
9. Réparer les brouillons : clé stable `draft_${userId}`, lecture au montage, câblage de `draftId` (§1.4).
10. Erreurs de formulaire : message inline sous le champ + bordure rouge + `aria-invalid` +
    `role="alert"` + focus sur le premier champ fautif + reset au `onChange` (§4.3).
11. Monter `<Toaster />`, basculer les 36 erreurs de saisie de `addNotification` vers l'inline,
    remplacer les 62 `alert/confirm/prompt` par les composants `Dialog` (§4.2).
12. Corriger la numérotation d'étapes : un seul compteur dérivé de `steps.length` (§4.1).
13. Un helper `formatFCFA()` unique + masque de saisie sur les champs monétaires (§4.4).
14. Corriger les 4 caractères `U+FFFD` (§4.5).

### Sprint 3 — Assainir les fondations (≈ 2 semaines)

15. Supprimer les 6 061 lignes de code mort — **ou** rebrancher l'espace banque et la signature
    électronique si ces fonctionnalités sont au périmètre. À trancher explicitement (§5.2).
16. Introduire `react-router` : URL partageables, bouton retour fonctionnel, état préservé au refresh,
    code splitting par espace (§5.4).
17. Contraste : porter les 1 096 opacités ≤ 70 % au minimum `/80`, et reprendre la `BottomBar`
    (9 px → 11 px, contraste 2,42:1 → ≥ 4,5:1) (§3b).
18. Décider du sort de shadcn/ui : brancher le thème ou supprimer les 41 composants morts.
    Puis extraire `<Button>`, `<Card>`, `<Field>` et migrer les 377 signatures de cartes (§2.4).
19. Ajouter `aria-label` sur les 218 boutons icône, `focus-visible:ring` global, convertir les
    153 `div onClick` en `<button>` (§3).
20. Unifier mobile et web sur les écrans les plus dupliqués (≥ 78 % de similarité) : un composant,
    deux mises en page (§5.1).
