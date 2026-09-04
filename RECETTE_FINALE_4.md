# Quatrième recette complète — 6 août 2026

Reprise après le branchement du devis et de la déclaration sur l'honneur
([DEVIS_ET_DECLARATION_BRANCHES.md](DEVIS_ET_DECLARATION_BRANCHES.md)).
`tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Couverture

| Espace | Écrans | Résultat |
|---|---|---|
| Client mobile (`/app`) | 16 | Rendus, 0 erreur console |
| Client web (`/web`) | 15 | Rendus, 0 erreur console |
| Administration (`/admin`) | 11 | Rendus, 0 erreur console |
| Comptable (`/comptable`) | 5 | Rendus, 0 erreur console |

**Parcours joués à deux onglets** : création d'un dossier **sans** déclaration sur l'honneur,
de la saisie à la signature, avec le devis établi côté administration ; parcours domiciliation,
modification et comptabilité côté web ; rechargements complets.

## Un défaut trouvé et corrigé

### Le workflow d'administration ne repassait pas en arrière

L'action « Étape suivante », ajoutée pour permettre à l'administration de faire avancer un
dossier, n'avait pas de réciproque. Une étape franchie par mégarde était donc définitive — et
comme les actions vivent chacune sur leur étape, dépasser « Validation statuts » rendait
l'envoi des statuts **inaccessible** : le client restait indéfiniment sur « Statuts en
préparation », sans qu'aucun écran ne permette de le débloquer.

Deux correctifs, l'un pour rattraper, l'autre pour empêcher :

- **« Étape précédente »** complète la navigation, à laquelle il manquait le retour.
  *Vérifié* : dossier poussé à l'étape 7 par erreur, ramené à l'étape 6, et l'action
  « Générer les statuts V1 » redevient disponible.
- **On ne quitte plus une étape dont le travail n'est pas fait.** « Étape suivante » est
  désactivée, avec le motif en info-bulle, tant que l'étape courante attend une action :
  le devis à l'étape 3, la déclaration sur l'honneur puis les statuts à l'étape 6. C'est ce
  qui fermait l'impasse plutôt que de la réparer après coup.

*Vérifié* sur un dossier mené de bout en bout : arrêt à l'étape 3 — « Impossible : le devis
n'a pas encore été envoyé » — puis, une fois le devis émis et validé par le client, arrêt à
l'étape 6 — « Impossible : les statuts n'ont pas encore été envoyés ». Sur un dossier avec
déclaration sur l'honneur demandée, le motif devient « la déclaration sur l'honneur n'a pas
encore été envoyée », et elle est bien proposée à l'écran.

## Ce que la recette a confirmé

- **Le dossier naît à l'étape 4** : « RECETTE 4 SARL » apparaît dans le référentiel avec ses
  trois pièces dès la sortie de l'étape des documents, le client n'étant qu'à l'étape 5.
- **Le devis vient de l'administration** : l'étape 5 affiche « Devis en cours d'établissement »
  tant que rien n'a été envoyé, puis le devis réel (200 000 FCFA) une fois émis — sans
  rechargement de l'onglet client. Sa validation revient sur la fiche société.
- **La déclaration sur l'honneur suit la demande du client** : ce dossier ayant été créé sans
  la cocher, l'administration ne propose pas de la générer, et l'étape 8 n'affiche qu'**un
  seul document à signer** — « 0/1 documents signés » — là où la liste en comptait deux quoi
  qu'il arrive.
- **Les statuts** arrivent au client une fois envoyés, avec « Consulter / Télécharger » et le
  choix valider / demander correction.
- **Persistance et session** : après rechargement complet, la session de l'onglet est intacte,
  le dossier créé est toujours là (11 sociétés), et les cinq jeux de données partagés sont
  bien enregistrés.
- **Parcours multi-étapes** : domiciliation (989 → 2 774 caractères de contenu au fil des
  étapes), modification post-statutaire, comptabilité.

## Une limite de l'environnement de test, pas du produit

Le volet de prévisualisation est masqué pendant ces essais : sa fenêtre mesure 0 × 0 pixel et
les animations y sont gelées. Deux conséquences, sans effet pour un utilisateur réel :

- les modales de l'administration s'ouvrent de façon capricieuse quand une autre est déjà
  ouverte, ce qui a demandé plusieurs tentatives ;
- les cartes d'étape restent à `opacity: 0`, leur animation d'entrée ne démarrant jamais.

Ces symptômes disparaissent dès que l'onglet est au premier plan ; ils ne se manifestent que
dans l'automatisation.
