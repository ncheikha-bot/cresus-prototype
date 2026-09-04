# Découpage de AdminCompanySteps — 5 août 2026

Suite de [CHAINAGE_ADMIN_CLIENT.md](CHAINAGE_ADMIN_CLIENT.md), qui avait sorti l'état du
composant sans toucher à sa taille : *« l'état est sorti, pas le composant »*.

`npm run build` est vert, l'écran a été retesté dans le navigateur.

---

## Résultat

| | Avant | Après |
|---|---|---|
| `AdminCompanySteps.tsx` | 2 096 lignes | **906 lignes** (−57 %) |
| Fichiers | 1 | **10** |
| Plus gros fichier | 2 096 | 906 |

```
src/components/admin/
├── AdminCompanySteps.tsx          906  orchestration : états d'interface, handlers, rendu des étapes
└── company-steps/
    ├── stepDefinitions.ts         176  les 7 étapes et leurs libellés, sans JSX
    ├── ModalShell.tsx              86  enveloppe commune aux modales
    ├── CompanyDetailsModal.tsx    310  récapitulatif du dossier soumis
    ├── DocumentsValidationModal.tsx 255  revue des documents : valider / rejeter
    ├── DocumentPreviewModal.tsx   135  aperçu d'un document
    ├── QuoteFormModal.tsx         115  saisie et envoi du devis
    ├── OfficialDocsModal.tsx       97  documents officiels et clôture
    ├── AppointmentValidationModal.tsx 72  validation du rendez-vous de signature
    └── StatutsUploadModal.tsx      72  génération / correction des statuts
```

## Ce qui a été séparé, et pourquoi

**1. La définition des étapes** (`stepDefinitions.ts`)

Cent lignes de logique — « quel libellé afficher selon que les statuts sont envoyés, rejetés,
que le rendez-vous est confirmé… » — étaient noyées au milieu du rendu. C'est désormais une
fonction pure `buildSteps(company, contexte)`, testable sans monter React. Les deux branches
les plus ramifiées (l'action admin et l'action client à l'étape 6) sont extraites en fonctions
nommées plutôt qu'en ternaires imbriqués sur cinq niveaux.

**2. Une enveloppe de modale commune** (`ModalShell.tsx`)

Les sept modales répétaient le même échafaudage : voile sombre, fermeture au clic extérieur,
`stopPropagation` sur la carte, en-tête bleu nuit avec icône et bouton de fermeture. Environ
20 lignes identiques chacune, soit ~140 lignes de duplication.

L'enveloppe ajoute au passage ce qui manquait partout : **fermeture par la touche Échap**,
`role="dialog"`, `aria-modal` et `aria-label`.

**3. Sept modales autonomes**

Chacune reçoit ses données et ses callbacks en props. Aucune ne connaît le composant parent.

## Améliorations faites au passage

- **`QuoteFormModal`** : les cinq champs de montants étaient cinq blocs copiés-collés, avec des
  `<label>` non liés. Ils dérivent maintenant d'une liste de postes, chaque champ ayant un
  `htmlFor` réel et un `inputMode="numeric"`. Les totaux passent par `formatFCFA` au lieu d'un
  `toLocaleString` suivi de `' FCFA'` écrit à la main.
- **`OfficialDocsModal`** : les quatre boutons de dépôt (RCCM, NINEA, statuts, attestation)
  étaient quatre blocs identiques à 8 lignes ; ils dérivent d'une constante.
- **`DocumentPreviewModal`** : les ternaires en cascade sur le statut du document sont devenus
  deux tables de correspondance.
- **Type unifié** : le parent déclarait une interface `Document` locale qui faisait doublon avec
  celle des modales. Il n'en reste qu'une, `AdminDocument`, exportée et partagée.
- **Imports nettoyés** : 10 icônes lucide devenues inutiles dans le parent.

## Vérifications

- `npm run typecheck` : **0 erreur** — vérifié après chaque extraction, pas seulement à la fin.
- `npm run build` : passe.
- **Navigateur** : l'écran de dossier s'affiche correctement (workflow, progression 14 %,
  les 7 étapes avec leurs statuts, les simulations), la modale « Dossier complet » s'ouvre avec
  le bon titre, la modale de validation des documents affiche bien ses trois documents avec
  leurs actions, et Échap ferme.

Deux fausses alertes pendant les tests, dues au throttling des animations dans un onglet
masqué : un `role="dialog"` qui reste dans le DOM pendant une animation de sortie gelée, et une
opacité d'entrée figée sous le seuil de mon détecteur. Vérification faite sur l'état d'animation
réel, les deux comportements sont corrects.

## Ce qui reste

Les 906 lignes du parent se répartissent entre le bandeau de progression, la liste des étapes
avec leurs encarts contextuels, et les handlers. Un découpage supplémentaire est possible —
une `StepCard` et un `StepProgressBar` — mais le gain serait cette fois marginal par rapport au
risque : la liste des étapes partage beaucoup d'état et de conditions d'affichage.

Le bloc « Mode développement — Simulations », qui permet de simuler les actions du client
(valider les statuts, demander un rendez-vous, signer), reste dans le parent. Il faudra le
retirer avant toute mise en production.
