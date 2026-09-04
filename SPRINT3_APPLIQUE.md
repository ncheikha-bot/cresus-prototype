# Sprint 3 appliqué — 5 août 2026

Correctifs du sprint 3 de [AUDIT_UX_TECHNIQUE.md](AUDIT_UX_TECHNIQUE.md), après
[SPRINT1_APPLIQUE.md](SPRINT1_APPLIQUE.md) et [SPRINT2_APPLIQUE.md](SPRINT2_APPLIQUE.md).
`npm run build` (typecheck inclus) est vert. Parcours retestés dans le navigateur.

Deux arbitrages ont été tranchés en amont : **supprimer** tout le code mort, et bâtir une
**bibliothèque maison** plutôt que brancher le thème shadcn.

---

## 15. Code mort supprimé — 12 703 lignes

La détection a été refaite par **graphe d'imports** depuis `src/main.tsx` plutôt que par
recherche de noms : un fichier peut être importé sous plusieurs formes de chemin, et un grep
le manque. Résultat plus complet que l'audit initial (11 535 lignes contre 6 061 estimées).

**67 fichiers supprimés**, en deux passes — la première a rendu orphelins des fichiers qui ne
l'étaient pas encore :

| Ensemble | Lignes |
|---|---|
| Composants shadcn/ui jamais atteints (43 fichiers) | ~5 100 |
| Espace banque complet (8 fichiers) | 2 461 |
| Signature électronique client (mobile + web) | 1 301 |
| Orphelins à la racine de `components/` (7 fichiers) | 1 155 |
| `data/testCompanyData.ts` | 606 |
| `client/FiscalDeclarations.tsx` | 517 |
| `DELIVERABLES_INTEGRATION_EXAMPLE.tsx` | 502 |
| `web/WebAuth.tsx`, `web/WebCapitalPayment.tsx`, `accountant/AccountantAuth.tsx` | 688 |

`src/vite-env.d.ts` a été **conservé** : jamais importé par construction, mais indispensable au
typecheck (il déclare le module virtuel `figma:asset/*`).

Le projet passe de 157 à **116 fichiers** et de ~66 000 à **54 062 lignes**. Après suppression,
la détection ne trouve plus aucun fichier mort.

> Le bundle, lui, n'a pas diminué : le tree-shaking éliminait déjà ce code. Le gain est sur la
> maintenance et la lisibilité, pas sur le poids livré.

## 16. Un vrai routeur

Le routing reposait sur quatre `useState<string>` et un sous-routing encodé dans la chaîne
(`mobileScreen.startsWith('create-draft-')`). Conséquences : URL jamais partageable, bouton
retour du navigateur qui quittait l'application, et **F5 renvoyant systématiquement au splash**.

`react-router-dom` est en place, avec une URL par espace :

| Espace | Chemin |
|---|---|
| Accueil (choix d'espace) | `/` |
| Client mobile | `/app/<écran>` |
| Client web | `/web/<page>` |
| Administration | `/admin/<page>` |
| Comptable | `/comptable/<page>` |

Les quatre espaces sont extraits dans `src/spaces/`. Les composants d'écran n'ont **pas** été
touchés : ils reçoivent toujours des callbacks `onNavigate` / `onBack`, désormais implémentés
avec `useNavigate`. La sémantique « une chaîne = un écran » est conservée, y compris pour les
sous-routes paramétrées (`/web/create-draft-<id>`).

**Vérifié dans le navigateur** : `http://localhost:3000/web/dashboard` et `/admin/dossiers`
ouvrent directement le bon écran, sans splash ni écran de choix. Une navigation interne change
l'URL (`/web/domiciliation`), et le bouton retour du navigateur ramène à l'écran précédent
**en restant dans l'application**.

### Code splitting

Les 4 espaces sont chargés en `React.lazy`. Le bundle monolithique de 2 322 ko est découpé :

| Morceau | Taille | gzip |
|---|---|---|
| socle commun | 476 ko | 149 ko |
| MobileSpace | 447 ko | 79 ko |
| WebSpace | 511 ko | 89 ko |
| AdminSpace | 767 ko | 169 ko |
| AccountantSpace | 132 ko | 22 ko |

Un client mobile télécharge maintenant **228 ko gzip au lieu de 514** — il ne reçoit plus
l'espace d'administration ni l'espace comptable. Pour une cible sénégalaise sur réseau mobile,
c'est le gain de performance le plus tangible du chantier.

> **À prévoir pour la mise en production** : avec `BrowserRouter`, le serveur doit renvoyer
> `index.html` sur toutes les routes (fallback SPA). Vite le fait en développement ; un
> hébergement statique demandera une règle de réécriture.

## 17. Contrastes — 1 135 corrections

Deux passes sur des périmètres disjoints (client / back-office).

| Correction | Client | Back-office |
|---|---|---|
| `text-[#273A7A]` d'une opacité faible vers `/80` | 663 | 329 |
| `text-white/50\|/45\|/40\|/25` → `/70` | 33 | 4 |
| `text-gray-400\|300` → `text-gray-600` | 51 | 29 |
| `text-gray-500` → `600` (sur fonds gris seulement) | 23 | 4 |

Le projet compte désormais **1 124 textes en `/80`** (5,67:1) là où le combo dominant était
`/60` (3,36:1). Les ~86 opacités faibles restantes sont **volontaires** et documentées : icônes
décoratives, boutons désactivés (WCAG exempte les contrôles désactivés, et les foncer
supprimerait l'indice visuel), et `text-gray-500` sur fond blanc qui passe déjà AA.

### La barre de navigation mobile

C'était le pire cas du projet : libellés en **9 px** à **2,42:1** sur l'élément de navigation
principal, avec une opacité `/35` encore multipliée par une animation à `0.45`.

`BottomBar.tsx` : taille portée à 11 px, couleur à `/80`, animation d'opacité supprimée, plus
`min-h-[44px]`, `aria-label` et `aria-current="page"`. **Contraste : 2,42:1 → 5,67:1.**

### L'indicateur de focus

Les deux passes ont d'abord posé un anneau doré `#D6A93A`. Il n'offre que **2,06:1** sur fond
blanc, sous les 3:1 exigés par WCAG 1.4.11 pour un indicateur d'interface — un anneau de focus
qu'on ne voit pas ne sert à rien. Les **791 anneaux** ont été repassés en bleu nuit `#1A2753`
(~13:1). Les 71 anneaux blancs sur fonds bleu nuit sont conservés, avec `ring-offset` sombre.

## 18. Une bibliothèque maison

Les 43 composants shadcn morts sont partis avec le reste du code mort. Il reste 8 fichiers dans
`ui/`, dont trois créés pendant ce chantier (`form-field`, `confirm-dialog`, `prompt-dialog`).

**Découverte en cours de route** : `button.tsx`, `dialog.tsx` et `alert-dialog.tsx`
référençaient des tokens shadcn (`bg-primary`, `bg-background`, `text-muted-foreground`,
`ring-ring`, `bg-destructive`…) **définis nulle part dans ce projet** — comme le wrapper
`sonner` du sprint 2. Les boutons et le fond des dialogues s'affichaient donc sans couleur.
Les 7 tokens fantômes ont été remplacés par des valeurs Crésus explicites.

Trois composants forment le socle :

- **`Button`** — réécrit aux couleurs Crésus, en `rounded-xl` (la valeur employée par les ~770
  boutons écrits à la main, et non le `rounded-md` de shadcn qui ne correspondait à rien à
  l'écran), avec une hauteur de 44 px et un focus visible. `type="button"` par défaut : sans
  lui, un bouton dans un formulaire le soumet au clic.
- **`Card`** — fixe l'archétype `bg-white rounded-2xl p-6 shadow-sm` (90 occurrences réelles)
  et n'expose que les variations utilisées, là où le projet compte **377 signatures de classes
  distinctes** pour la même carte.
- **`Badge`** — six tonalités de statut, toutes conformes AA sur fond clair, en remplacement
  des couples fond/texte réinventés écran par écran.

> La migration des 834 cartes existantes vers `<Card>` n'a **pas** été faite : c'est un
> remplacement mécanique à faible risque mais à fort volume, à mener écran par écran avec une
> vérification visuelle. Le socle est prêt, le chantier reste ouvert.

## 19. Accessibilité — noms, focus, sémantique

| | Avant | Après |
|---|---|---|
| `aria-label` sur boutons icône | **0** | **169** |
| Boutons avec focus visible | **0 / 988** | **859** |
| `scope` sur en-têtes de tableau | **0** | **13** |
| `div onClick` convertis en `<button>` | — | **25** |

Les 106 `div onClick` restants sont justifiés : **102** sont des overlays de fermeture de
modale ou des conteneurs `stopPropagation` (le bouton de fermeture existe à côté), et **4** sont
des cartes contenant déjà un bouton d'action — les convertir imbriquerait un `<button>` dans un
`<button>`, ce qui est du HTML invalide. Une vérification automatique confirme **0 élément
interactif imbriqué** dans un bouton.

Reste un cas non résolu : `AdminAppointments.tsx:489`, une carte de rendez-vous sans chemin
clavier vers le détail. Le corriger demande de repenser la carte (titre cliquable ou bouton
« Voir le détail »), ce qui dépasse une passe non destructive.

## 20. Duplication mobile / web

La fusion des composants jumeaux n'a **pas** été menée : fusionner `CreateCompany` et
`WebCreateCompany` (6 300 lignes cumulées) sans tests automatisés ferait courir un risque de
régression disproportionné. Ce qui pouvait l'être sans risque l'a déjà été au sprint 2, où
l'extraction de `src/domain/` a supprimé la duplication la plus dangereuse — les règles
juridiques et le barème.

En revanche, une duplication de **données** a été corrigée, dans la lignée d'`addCompany` :

**Les rendez-vous existaient en trois listes indépendantes** — `data/mockData.ts` lue par
l'admin, plus une copie locale dans chacun des deux écrans client. Un rendez-vous pris par un
client n'apparaissait donc jamais côté admin, dont les statistiques portaient sur une liste
figée. `appointments`, `addAppointment` et `updateAppointmentStatus` sont maintenant dans le
contexte ; les deux écrans client y écrivent, l'admin y lit. Vérifié à l'écran : l'admin
affiche bien le total issu du référentiel partagé.

---

## État après sprint 3

| | Avant chantier | Après |
|---|---|---|
| Fichiers / lignes | 157 / ~66 000 | **116 / 54 062** |
| Code mort | 6 061 lignes (estimé) | **0** |
| Poids initial pour un client mobile | 514 ko gzip | **228 ko gzip** |
| URL partageable / bouton retour | non | **oui** |
| F5 sur un écran | retour au splash | **reste sur l'écran** |
| Boutons avec focus visible | 0 / 988 | **859** |
| `aria-label` | 0 | **169** |
| Navigation mobile | 9 px, 2,42:1 | **11 px, 5,67:1** |
| Tokens de couleur fantômes | 7 familles | **0** |
| Typecheck | inexistant | **0 erreur, bloquant au build** |

## Ce qui reste

- **Migrer les 834 cartes** et les ~770 boutons vers le socle `Card` / `Button`.
- **Fusionner les composants jumeaux** mobile/web (≥ 78 % de similarité), idéalement après
  avoir mis en place des tests.
- **`AdminCompanySteps.tsx`** (2 053 lignes) tient encore ses 25 `useState` en local : une
  validation admin n'a toujours aucun effet visible côté client. C'est le dernier gros chaînon
  manquant du référentiel partagé, après `addCompany` et `appointments`.
- **Les 20 autres `AnimatePresence mode="wait"`**, non audités pour le motif qui bloquait le
  tunnel de création.
- **`prefers-reduced-motion`** : toujours aucune prise en compte, pour ~500 éléments animés.
- **Une vraie session** : `currentUser` n'est pas persisté, donc `/app/dashboard` en accès
  direct renvoie à l'écran de connexion. C'est le comportement attendu d'une application
  authentifiée, mais il n'y a pas encore d'authentification réelle.
- **Passer `strict` à `true`** dans `tsconfig.json`, chantier à part entière.
