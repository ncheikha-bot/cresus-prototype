# Sprint 2 appliqué — 5 août 2026

Correctifs du sprint 2 de [AUDIT_UX_TECHNIQUE.md](AUDIT_UX_TECHNIQUE.md), après
[SPRINT1_APPLIQUE.md](SPRINT1_APPLIQUE.md). `npm run build` (typecheck inclus) est vert.
Parcours retesté dans le navigateur.

---

## 7. Un domaine métier partagé

Les deux tunnels dupliquaient 33 fonctions de calcul et de validation, dont `handleNext`
(353 lignes reproduites à deux lignes d'écart) et les 152 lignes de règles OHADA — qui avaient
déjà commencé à diverger. Le barème d'immatriculation était écrit en dur dans le `useState` de
deux composants d'interface : changer un tarif demandait deux éditions dans deux fichiers de
3 500 lignes.

Cinq modules créés, seule source de vérité désormais :

| Module | Contenu |
|---|---|
| `src/domain/legalForms.ts` | Les 7 formes juridiques (capital minimum, bornes d'associés, avantages), `getLegalFormInfo`, `getDirectorTitle` |
| `src/domain/pricing.ts` | `REGISTRATION_FEES` (le barème), calcul des frais, du montant à verser, du capital net et de la libération |
| `src/domain/companyValidation.ts` | `isCapitalValid`, `isAssociatesCountValid`, `isCapitalDistributionValid`, `getRequiredDocuments`, `validateStep1` |
| `src/domain/companySteps.ts` | Les 7 étapes et `TOTAL_CREATION_STEPS` |
| `src/lib/format.ts` | `formatFCFA`, `formatFCFACompact`, `parseAmount`, `formatAmountInput` |

Ces fonctions sont **pures** : mêmes entrées, mêmes sorties, testables sans monter React.

Dans les composants, les fonctions locales gardent leur nom et leur signature mais délèguent au
domaine — aucun des ~200 sites d'appel dans le JSX n'a été touché :

```ts
const isCapitalValid = () => checkCapital(formData.capital, formData.legalForm);
```

| Fichier | Avant | Après |
|---|---|---|
| `mobile/CreateCompany.tsx` | 3 612 | **3 281** |
| `web/WebCreateCompany.tsx` | 3 376 | **3 034** |

Soit ~670 lignes de duplication remplacées par 495 lignes de domaine partagé.

**Effet de bord utile** : le caractère corrompu de `web:163` (`N��cessite conseil juridique`)
n'avait plus lieu d'exister — la version de référence est unique.

## 8. Une société créée existe enfin pour l'admin

`handleSubmit` se contentait d'un `setSubmitted(true)` et d'une notification. La société
n'entrait jamais dans `companies`, donc n'apparaissait jamais côté admin : le chaînage
client → admin, qui est le cœur du produit, n'existait pas.

`addCompany` a été ajouté à `AppContext` (`src/context/AppContext.tsx:227`) et branché dans les
deux tunnels. À la soumission, la société entre dans le référentiel partagé avec son nom, sa
forme juridique, son capital, son adresse, ses associés et le client propriétaire — et une
notification part vers l'admin.

## 9. Des brouillons réellement récupérables

L'ancienne implémentation écrivait sous `draft_${userId}_${Date.now()}`, une clé qu'aucun
`getItem` ne relisait : chaque « Enregistrer et quitter » créait une entrée orpheline, faisait
grossir le localStorage, et le message « Vous pouvez reprendre plus tard » était faux. En
parallèle, `App.tsx` passait un `draftId` que les composants ne déclaraient même pas.

Quatre fonctions ajoutées au contexte : `getDraftsByUser`, `getDraftById`, `saveDraft`,
`deleteDraft`, sur une clé stable `cresus_drafts_${userId}`. Le tunnel restaure le brouillon au
montage via un `useEffect` sur `draftId`, et le supprime une fois le dossier soumis. Les
lectures/écritures sont protégées par `try/catch` : un localStorage corrompu ou saturé
n'interrompt pas la saisie.

**Cycle vérifié de bout en bout dans le navigateur** : saisie → « Enregistrer et quitter » →
une seule clé `cresus_drafts_1` (aucune orpheline) → le brouillon apparaît sur le tableau de
bord → « Reprendre » → les quatre champs sont restaurés, capital compris.

## 10. Les erreurs sont rattachées aux champs

Avant : une liste rouge en haut du formulaire, aucun marquage sur les champs concernés
(bordure mesurée à `rgba(0,0,0,0)`), **0 `role="alert"`, 0 `aria-live`, 0 `aria-invalid`** sur
la page, le focus restant sur `<body>`. Un utilisateur au lecteur d'écran ne savait pas que sa
soumission avait échoué. Et les messages ne disparaissaient pas quand on corrigeait, puisque
`setErrors` n'était appelé que depuis `handleNext`.

Un composant `src/components/ui/form-field.tsx` prend en charge le motif complet :

- `<label htmlFor>` réellement lié au champ (le projet n'avait que 30 champs étiquetés sur 285) ;
- `aria-invalid` et `aria-describedby` pointant sur le message ;
- message d'erreur sous le champ avec `role="alert"` ;
- bordure rouge et fond rosé.

Côté tunnel : `validateStep1` renvoie les erreurs **par champ**, `updateField` efface l'erreur
d'un champ dès qu'on le corrige, et `focusFirstError` place le focus sur le premier champ fautif
en l'amenant à l'écran.

**Mesuré en direct après un « Suivant » sur formulaire vide** :

| | Avant | Après |
|---|---|---|
| `role="alert"` sur la page | 0 | **4** |
| Champs avec `aria-invalid` | 0 | **4** |
| Champs avec libellé lié | 0 | **4** |
| Focus après échec | `<body>` | **`company-name`** |

Détail corrigé au passage : le champ portait `transition-all duration-300`, qui faisait *fondre*
la bordure d'erreur sur 300 ms. La transition est désormais ciblée sur `box-shadow` — le signal
d'erreur apparaît instantanément, ce qui est précisément ce qu'on attend de lui.

## 11. Un mécanisme de feedback par usage

Quatre mécanismes cohabitaient sans règle : un bloc inline, `addNotification` (persistant),
62 `alert/confirm/prompt` natifs, et `sonner` — installé mais dont le `<Toaster />` n'était
monté nulle part, donc inerte.

La règle posée : **erreur de saisie → message inline ou toast ; action transitoire → toast ;
événement métier → notification persistante.**

- `<Toaster />` est monté dans `App.tsx`, avec les providers de dialogues, au-dessus des quatre espaces.
- Deux helpers créés : `src/components/ui/confirm-dialog.tsx` (`useConfirm()`) et
  `src/components/ui/prompt-dialog.tsx` (`usePrompt()`), qui retournent une promesse pour que les
  sites d'appel restent lisibles. Ils se ferment avec Échap, posent le focus initial correctement
  et suivent la palette Crésus.
- Les **62 dialogues natifs sont remplacés**, dont les 6 `prompt()` de
  `WebBankRequestDetail.tsx` qui servaient à saisir un motif de rejet, une date de rendez-vous
  **et un numéro de RIB** dans une boîte de dialogue navigateur.
- Le `window.confirm()` multi-lignes au cœur de la validation du devis est devenu un vrai
  dialogue, avec les montants formatés et des libellés d'action explicites
  (« Continuer avec ce devis » / « Revoir mon capital » plutôt que « OK » / « Annuler »).

| | Avant | Après |
|---|---|---|
| Dialogues natifs | 62 | **0** |
| `addNotification` | 122 | **91** (les erreurs de saisie sont parties) |
| Toasts réellement affichés | 0 | **83** |

## 12. Un seul compteur d'étapes

Le tunnel affichait quatre numérotations concurrentes pour un même processus de 7 étapes :
« Étape 2 sur 7 » dans le bandeau, « Étape 2/5 » dans le sous-titre, « Étape 4/6 » à l'étape 4,
et un « /5 » sur les brouillons du tableau de bord — ce dernier pouvant produire une **barre de
progression à 140 %** pour un brouillon repris à l'étape 7.

Tout dérive maintenant de `TOTAL_CREATION_STEPS`, et la progression passe par
`getCreationProgress()`, bornée à 100 %. Vérifié à l'écran : le bandeau affiche « Étape 1 sur 7 »
et le sous-titre « Étape 1/7 ».

## 13. Un seul format monétaire

Trois rendus de la même devise coexistaient (`1 000 000 FCFA`, `1 000 000 F CFA` via `Intl` avec
`currency: 'XOF'`, et des montants bruts `1000000 FCFA`), avec huit `formatPrice`/`formatAmount`
redéfinis localement en trois implémentations.

`src/lib/format.ts` centralise le formatage. Corrections visibles :

- **Le champ capital social** — le plus sensible du tunnel — a désormais un masque de saisie :
  il affiche `1 000 000` au lieu de `1000000` sous un placeholder qui promettait le format espacé.
  Le montant auto-calculé des associés est formaté de la même façon, et les placeholders
  divergents entre mobile (`250 000`) et web (`250000`) sont alignés.
- **Le bouton « Payer 1000000 FCFA »** de l'écran de paiement mobile affiche un montant lisible.
- **Le devis officiel** (`admin/QuotePreview.tsx:187`) affichait le capital brut.
- **Le tableau de bord admin** affichait `10200.0k FCFA` et des chaînes en dur comme
  `'2,450k FCFA'` — avec une virgule anglo-saxonne qu'un lecteur francophone lit comme un
  séparateur décimal. Tout passe par `formatFCFACompact` : `10,2 M FCFA`, `920 k FCFA`.

Vérifié à l'écran : plus aucun `toFixed().k/M` bricolé dans le projet.

## 14. Caractères corrompus

Les 4 `U+FFFD` sont retapés : `Nécessite conseil juridique`, `ont été rejetés`,
`Versement intégral du capital`, et le libellé de bouton `Réserver ce créneau`.

---

## État après sprint 2

| | Avant sprint 2 | Après |
|---|---|---|
| Règles juridiques et barème | dupliqués, déjà divergents | une seule source (`src/domain/`) |
| Société créée par un client | invisible pour l'admin | enregistrée et notifiée |
| Brouillons | écrits, jamais relus | cycle complet vérifié |
| Erreurs de formulaire | liste en haut, 0 `role="alert"` | sous le champ, focus, `aria-invalid` |
| Dialogues natifs | 62 | 0 |
| Numérotation des étapes | 4 systèmes, barre à 140 % | une seule source |
| Format monétaire | 3 rendus + 8 helpers locaux | un helper unique |
| Typecheck | 0 erreur | 0 erreur |

## Ce qui reste (sprint 3)

Les 6 061 lignes de code mort (dont l'espace banque complet et la signature électronique, à
trancher : supprimer ou rebrancher), l'absence de routeur (URL non partageables, F5 renvoyant au
splash), les 1 096 usages de texte à opacité insuffisante, la barre de navigation mobile à 9 px
et 2,42:1, les 218 boutons icône sans nom accessible, les 153 `div onClick` inaccessibles au
clavier, le sort de shadcn/ui (41 composants morts), et les 20 autres
`AnimatePresence mode="wait"` non audités.

À noter aussi, découvert pendant le sprint : dans les deux tunnels, le changement de forme
juridique crée des associés partiels là où `addAssociate` les crée complets. Les champs
manquants ont été rendus optionnels au niveau du type (zéro impact à l'exécution), mais le
comportement mérite un arbitrage produit — remplir `isManager: false` transformerait une case à
cocher non contrôlée en case contrôlée.
