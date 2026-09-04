# Sprint 1 appliqué — 5 août 2026

Correctifs du sprint 1 de [AUDIT_UX_TECHNIQUE.md](AUDIT_UX_TECHNIQUE.md).
`npm run build` (typecheck inclus) est vert. Parcours web retesté dans le navigateur.

---

## 1. Tunnel de création d'entreprise débloqué

**Fichiers** : `src/components/mobile/CreateCompany.tsx:1480`, `src/components/web/WebCreateCompany.tsx:1505`

`AnimatePresence mode="wait"` recevait 7 enfants frères conditionnels. L'étape sortante
n'était jamais démontée, donc l'étape entrante n'était jamais montée : le tunnel était
infranchissable au-delà de l'étape 1 (écran vide et bouton « Suivant » désactivé sur mobile).

La structure est désormais un rendu direct avec une clé sur l'étape :

```tsx
<motion.div
  key={currentStep}
  initial={{ x: 16 }}
  animate={{ x: 0 }}
  transition={{ duration: 0.2 }}
>
  {currentStep === 1 && (...)}
  …
</motion.div>
```

Trois décisions, dans cet ordre :

1. **`AnimatePresence` retiré de la zone des étapes.** Faire dépendre l'affichage d'une
   animation de *sortie* rendait le tunnel inaccessible dès que celle-ci ne se terminait pas.
   L'étape sortante est maintenant démontée immédiatement, l'entrante montée dans la foulée.
2. **Les 7 blocs `<motion.div key="stepN" initial… animate… exit…>` ont perdu leurs props
   d'animation** (la balise `motion.div` est conservée pour ne pas toucher aux fermetures).
   La transition est portée une seule fois, par le conteneur.
3. **Pas d'animation d'opacité.** Seule la translation est animée, pour que le contenu reste
   lisible même si l'animation ne se joue pas (onglet en arrière-plan, `prefers-reduced-motion`,
   appareil lent). Sur un tunnel de création d'entreprise, la lisibilité prime sur l'effet.

**Vérifié dans le navigateur** : étape 1 remplie → « Suivant » → « Répartition du capital »
s'affiche, l'étape 1 est entièrement démontée, aucune superposition. Le retour par
« Précédent » fonctionne et les saisies sont conservées.

> Le projet compte encore **20 autres `AnimatePresence mode="wait"`**. Aucun n'a été audité
> pour ce même motif — à faire avant la prochaine mise en démonstration.

## 2. Écran d'accueil accessible

**Fichier** : `src/components/IntroScreen.tsx`

| | Avant | Après |
|---|---|---|
| Conteneur racine (l. 12) | `overflow-hidden` | supprimé (conservé sur le calque décoratif et les cartes) |
| Logo (l. 55) | `h-[32rem]` (512 px) | `h-24 md:h-32` (96–128 px) |
| Grille (l. 80) | `md:grid-cols-3` pour 4 cartes | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| Cartes | hauteurs inégales, CTA désalignés | `h-full flex` + `mt-auto` sur la ligne de CTA |

Ajouté aussi `text-left` sur les cartes : elles héritaient du `text-center` du conteneur alors
que leur contenu est aligné à gauche.

**Mesures avant / après**, sur les deux viewports qui étaient bloquants :

| Viewport | Avant | Après |
|---|---|---|
| 1280 × 720 | contenu 1308 px, `overflow: hidden`, **0 carte sur 4** atteignable | contenu 731 px, `overflow: visible`, **4 cartes sur 4** visibles sans scroll |
| 375 × 812 | contenu 1934 px, scroll impossible, **1 carte** partiellement visible | contenu 1626 px, document scrollable, **4 cartes** atteignables |

**Correctif complémentaire** — `index.html:10` et `src/index.css:13` :
`height: 100%` sur `html, body, #root` empêchait ces conteneurs de grandir avec le contenu,
donc une page plus haute que le viewport n'était pas scrollable. Remplacé par `min-height`.

## 3. Données sensibles retirées des logs

**15 `console.log` supprimés** (31 → 16 ; les 16 restants sont du bruit de développement non
sensible, à traiter plus tard).

| Fichier | Contenu qui était logué |
|---|---|
| `src/context/AppContext.tsx:432-442` | mot de passe en clair, liste complète des comptes bancaires (`bankPassword` inclus), objet utilisateur authentifié |
| `src/components/mobile/BankAuth.tsx:20` | `{ email, password }` |
| `src/components/web/WebBankAuth.tsx:20` | `{ email, password }` |
| `mobile/CreateCompany.tsx:695`, `web/WebCreateCompany.tsx:764` | nom, prénom, email, téléphone, part et montant de **tous les associés**, à chaque clic sur « Suivant » |
| idem, 4 occurrences par fichier | situation et régime matrimonial des associés |

Vérification : `grep console.log | grep -iE 'password|firstName|maritalStatus'` → **0 résultat**.

## 4. Langue et métadonnées

**Fichier** : `index.html`

- `lang="en"` → **`lang="fr"`** (WCAG 3.1.1, niveau A). L'application est intégralement en français.
- `<title>` : « Prototype Crésus V2++ » → « Crésus — Créez et gérez votre entreprise au Sénégal ».
- Ajout de `<meta name="description">` et `<meta name="theme-color" content="#1A2753">`.
- `viewport` complété par `viewport-fit=cover` : sans lui, le `env(safe-area-inset-bottom)`
  déjà présent dans `globals.css:80` n'a aucun effet sur les iPhone à encoche.

## 5. Typographie réparée

**Fichiers** : `src/index.css`, `src/styles/globals.css`

Deux causes racines, deux correctifs.

**a) Aucune police n'était chargée.** Inter et Poppins étaient déclarées en CSS mais le projet
ne contenait ni `<link>` Google Fonts, ni `@font-face`, ni fichier de police, ni paquet
`@fontsource`. Le rendu dépendait donc des polices installées sur la machine du visiteur.

Ajout de `@fontsource-variable/inter` et `@fontsource/poppins` (poids 500/600/700), importés
dans `index.css`. **Auto-hébergées volontairement** : aucune dépendance à un CDN externe, ce
qui compte pour une cible sénégalaise sur réseau mobile. Le build produit bien les `.woff2`.

**b) Aucune taille n'était définie pour les titres.** Le Preflight de Tailwind v4 remet
`h1`–`h6` à `font-size: inherit`, et rien ne le compensait : **tous les titres du projet
s'affichaient en 16 px poids 400**, exactement comme le corps de texte.

Ajout d'une échelle dans `globals.css`, **placée dans `@layer base`** pour que les utilitaires
Tailwind (`text-2xl`, `text-3xl`…) restent prioritaires là où un composant impose une taille :

| Élément | Taille | Graisse | Interlignage |
|---|---|---|---|
| `h1` | 2 rem (32 px) | 700 | 1.2 |
| `h2` | 1.5 rem (24 px) | 600 | 1.3 |
| `h3` | 1.25 rem (20 px) | 600 | 1.4 |
| `h4` | 1.0625 rem (17 px) | 600 | 1.4 |

Les familles passent par les variables `--font-sans` / `--font-display`, avec des piles de
fallback complètes. Mesure après correction sur l'écran d'accueil :

| Élément | Avant | Après |
|---|---|---|
| `h1` « Bienvenue sur Crésus » | 16 px / 400 / police système | **32 px / 700 / Poppins** |
| `h3` « App Mobile » | 16 px / 400 | **20 px / 600 / Poppins** |
| `p` | 16 px / police système | 16 px / **Inter Variable** |

Bénéficie à **1 131 titres** (100 `h1`, 269 `h2`, 762 `h3`) sans toucher aux composants.

**Nettoyage** : `globals.css` refaisait un `@import "tailwindcss"` (sans `source(none)`) alors
que `index.css` l'importe déjà — l'import en double a été retiré.

## 6. Vérification de types au build

Le projet était écrit en `.tsx` **sans aucune infrastructure TypeScript** : ni `typescript`,
ni `@types/react`, ni `tsconfig.json`. Vite transpilait sans jamais vérifier.

Mise en place :

- `typescript`, `@types/react@^18` et `@types/react-dom@^18` en devDependencies
  (les versions 19 installées par défaut ont été alignées sur React 18, la version du projet) ;
- `tsconfig.json`, volontairement **non strict** au départ — le code n'a jamais été vérifié,
  activer `strict` est un chantier à part. Les contrôles actifs attrapent déjà les vraies
  erreurs (unions incompatibles, props inexistantes, typos). Les 38 alias versionnés de
  `vite.config.ts` (`sonner@2.0.3`…) y sont répliqués, sinon `tsc` ne résout pas ces imports ;
- `src/vite-env.d.ts` pour le module virtuel `figma:asset/*` ;
- scripts : `"typecheck": "tsc --noEmit"` et **`"build": "tsc --noEmit && vite build"`**.

**Résultat : 258 erreurs révélées, ramenées à 0.**

L'erreur annoncée dans l'audit était bien réelle : `IntroScreen.tsx` émettait `'accountant'`
alors que `viewMode` était typé `'mobile' | 'admin' | 'web' | 'bank'`, deux unions disjointes.
L'espace comptable ne fonctionnait que parce que rien ne vérifiait les types. Corrigé par un
type `ViewMode` partagé dans `src/types/index.ts` et `UserRole` élargi à `'accountant'`.

Autres corrections notables :

- `draftId` était passé par `App.tsx:132` et `:198` à des composants qui ne le déclaraient pas.
  La prop est désormais déclarée et documentée comme non encore exploitée — la reprise de
  brouillon reste à implémenter (sprint 2, point 9).
- Les 15 appels `addNotification` de `AdminCompanySteps.tsx` omettaient `userId` et `read`.
- **Un `ReferenceError` latent** : `mobile/Modification.tsx:831` et `:925` utilisaient une
  variable `index` jamais déclarée dans `transition={{ delay: 0.05 * index }}` — plantage
  garanti si ces branches rendaient. Le paramètre a été ajouté au callback `.map()`.
- Interfaces complétées dans `src/types/index.ts` (`Company`, `Document`, `Modification`,
  `BankPartner`, `BankMessage`…) : le code utilisait des propriétés absentes des types.

Aucun `@ts-ignore` ni `@ts-nocheck` n'a été ajouté, aucune option désactivée, aucun fichier exclu.

**Point à arbitrer côté produit** : dans les deux `CreateCompany`, le changement de forme
juridique crée des associés partiels (`{id, firstName, lastName, percentage, amount}`) là où
`addAssociate` les crée complets. Les champs manquants ont été rendus optionnels dans le type
(zéro impact à l'exécution) plutôt que remplis, car ajouter `isManager: false` transformerait
une checkbox non contrôlée en checkbox contrôlée.

---

## État après sprint 1

| | Avant | Après |
|---|---|---|
| Tunnel de création | bloqué à l'étape 2 (mobile et web) | franchissable |
| Écran d'accueil en 1280 × 720 | 0 carte sur 4 atteignable | 4 sur 4 |
| Titres | tous en 16 px / 400 | échelle 32/24/20/17 px |
| Polices | aucune chargée | Inter + Poppins auto-hébergées |
| `lang` | `en` | `fr` |
| Logs de mots de passe | 3 | 0 |
| Vérification de types | inexistante | au build, 0 erreur |

## Ce qui n'a pas été touché

Tout le reste de l'audit, notamment : les 4 systèmes de numérotation d'étapes (le sous-titre
« Étape 2/5 » reste visible à côté de « Étape 2 sur 7 »), les 62 `alert/confirm/prompt`
natifs, les erreurs de formulaire non reliées aux champs, `addCompany` toujours absent du
contexte, les brouillons irrécupérables, les 6 061 lignes de code mort, les contrastes, et les
20 autres `AnimatePresence mode="wait"`. Voir les sprints 2 et 3 de
[AUDIT_UX_TECHNIQUE.md](AUDIT_UX_TECHNIQUE.md).
