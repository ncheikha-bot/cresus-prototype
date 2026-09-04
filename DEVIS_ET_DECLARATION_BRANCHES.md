# Le devis et la déclaration passent par l'administration — 6 août 2026

Derniers allers-retours simulés du tunnel, signalés à la fin de
[DOSSIER_CREE_ETAPE_4.md](DOSSIER_CREE_ETAPE_4.md). `tsc --noEmit` : 0 erreur.
`npm run build` : vert.

---

## 1. Le devis

**Avant.** Le tunnel se fabriquait son propre devis à la sortie de l'étape 4, à partir du
barème, et s'envoyait à lui-même la notification « ✅ Devis créé par l'admin ». L'administration
avait pourtant son formulaire — frais d'immatriculation, honoraires, publication, timbres,
frais Crésus — mais son « Envoyer au client » ne faisait qu'émettre une notification : aucun
montant ne parvenait au client.

**Après.** Le devis est porté par la fiche société.

| | Écrit par | Lu par |
|---|---|---|
| Montants, notes, `status: 'sent'` | Administration, à l'envoi | Client, étape 5 |
| `status: 'validated'` | Client, à la validation | Administration (débloque ses étapes 4 et 5) |
| `status: 'rejected'` + motif | Client, au refus | Administration, qui corrige |

Côté client, l'étape 5 n'affiche plus un devis fabriqué mais l'attente réelle — « Un
administrateur est en train d'établir un devis personnalisé » — jusqu'à ce que celui-ci
arrive, montants de l'administration compris.

**Vérifié à deux onglets** : l'administration saisit puis envoie le devis (200 000 FCFA au
total) ; sans rechargement, le client passe de l'attente à « L'administrateur a établi un
devis… Total 200 000 FCFA », le valide, et la fiche société porte `status: 'validated'` — ce
qui débloque la suite du workflow d'administration.

## 2. La déclaration sur l'honneur

**Avant.** Le client cochait « Je ne dispose pas de casier judiciaire » et lisait qu'« une
déclaration sur l'honneur sera générée par l'administrateur ». Côté administration, le
composant d'aperçu existait, importé, avec son état… **mais aucun bouton ne l'ouvrait et il
n'était jamais affiché**. La déclaration ne pouvait donc jamais être produite. Pendant ce
temps, la liste des documents à signer la contenait *toujours*, y compris pour un client qui
avait fourni son casier judiciaire.

**Après.** L'étape « Validation statuts » de l'administration propose « Générer la déclaration
sur l'honneur » — seulement si le client l'a demandée —, ouvre l'aperçu et l'envoie :
`honorDeclarationSent` passe dans l'avancement partagé, et le bandeau devient
« Déclaration sur l'honneur envoyée ✓ ».

Côté client, la liste des documents à signer se construit à partir de ces deux conditions :

```ts
const documentsToSign = useHonorDeclaration && processus.honorDeclarationSent
  ? [STATUTS_A_SIGNER, DECLARATION_A_SIGNER]
  : [STATUTS_A_SIGNER];
```

Le message de l'étape 4 suit lui aussi l'état réel : « en préparation » tant que
l'administration n'a rien envoyé, « prête » ensuite.

**Vérifié** : dossier créé en cochant la déclaration ; l'administration la génère et l'envoie,
puis envoie les statuts ; le client arrive à l'étape 8 avec **2 documents à signer** et termine
avec `signedDocuments: ['Statuts de la société', 'Déclaration sur l\'honneur']`.

## Ce qu'il a fallu corriger en chemin

**Les cartes d'étape s'accumulaient.** Le détail d'un dossier ne rend qu'une étape à la fois,
mais l'enveloppe `AnimatePresence` gardait montée chaque carte sortante tant que son animation
de sortie n'était pas terminée — or elle ne l'est jamais dans un onglet en arrière-plan.
Sept cartes se retrouvaient empilées dans la page, et les boutons cliqués appartenaient à
l'une des cartes périmées. L'enveloppe est retirée : une seule carte est rendue, comme prévu.

---

## Ce qui reste simulé

Il ne reste, dans le parcours de création, que des simulations d'infrastructure — la barre de
progression des téléversements, le traitement du paiement — et le contenu des documents,
factices par nature dans un prototype. **Tous les échanges entre le client et l'administration
passent désormais par le dossier partagé** : pièces justificatives, devis, déclaration sur
l'honneur, statuts, rendez-vous et signature.
