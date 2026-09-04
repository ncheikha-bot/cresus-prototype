# Recette — cinquième passage — 6 août 2026

Passage complet après la refonte iconographique
([ICONOGRAPHIE_CLIENT.md](ICONOGRAPHIE_CLIENT.md),
[ICONOGRAPHIE_ADMIN.md](ICONOGRAPHIE_ADMIN.md)). Cette fois le parcours a été joué
**de bout en bout sur un dossier réel**, du formulaire vide jusqu'à l'immatriculation,
en faisant alterner deux onglets — client et administration.

`tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Le parcours complet, en conditions réelles

Un dossier `REPRISE AUTO SARL` a traversé la chaîne entière :

| Étape | Qui | Résultat |
|---|---|---|
| 1 → 3 | Client | Entreprise, deux associés à 50 %, coordonnées |
| 4 | Client | 3 pièces déposées → **dossier créé**, visible côté admin |
| 2 admin | Admin | Les 3 pièces validées, notification reçue par le client |
| 3 admin | Admin | Devis 200 000 FCFA envoyé |
| 5 | Client | **Devis reçu en direct**, sans rechargement, puis validé |
| 6 | Client | Capital libéré par Orange Money |
| 6 admin | Admin | Statuts V1 envoyés |
| 7 | Client | **Statuts reçus en direct**, relus et validés |
| 8 | Client | Signature électronique tracée, dossier soumis |
| 7 admin | Admin | 4 documents officiels déposés, société finalisée |
| — | Client | Société **Terminé**, avancement 100 % |

Aucune erreur console sur l'ensemble de la séquence.

## Huit défauts trouvés et corrigés

### 1. Les cartes de dossiers annonçaient toutes les mêmes documents

`getDocumentStats` renvoyait une constante : **tout** dossier affichait « 5 documents,
3 validés, 1 en attente, 1 à corriger », y compris celui qui n'en portait aucun.
Le décompte lit maintenant les pièces réelles.

### 2. …et les aurait comptées au mauvais statut

Une pièce naît `pending` au dépôt et ne change plus : la décision de l'admin est
écrite à part, dans le processus. Un dossier entièrement validé se serait donc
affiché « 3 en attente ». La règle qui réconcilie les deux — jusque-là enfouie dans
`getStepStatuses` — devient
[`getDocumentStatus`](src/domain/companySteps.ts), partagée par les deux lecteurs.

### 3. Le client web ne pouvait pas signer

Le bouton « Signer » de la dernière étape levait bien `showSignatureModal`, mais
**rien ne l'écoutait** : le pavé de signature n'avait jamais été rendu dans le tunnel
web. Le dossier restait bloqué à l'étape 8, bouton de soumission grisé. Le pavé
existait côté mobile ; il est désormais dans les deux.

### 4. Un dossier quitté sans « Enregistrer » était perdu

Le brouillon n'était écrit que sur clic explicite. Or le dossier est créé à l'étape 4 :
un client qui fermait son navigateur juste après voyait sa société dans « Mes sociétés »
**sans aucun chemin pour revenir** valider le devis, verser le capital ou signer.
La sauvegarde est maintenant automatique à chaque étape franchie, sous le même
identifiant de brouillon. Vérifié en quittant brutalement : le dossier se reprend à
l'étape exacte.

### 5. Trois statuts s'affichaient en clé technique

« Mes sociétés » traduisait cinq statuts sur les huit possibles et repliait le reste
sur la clé brute : le client lisait `documents_ready` et `signed` au milieu de
« Soumis » et « En révision ». Table unique et exhaustive dans
[`companyStatus.ts`](src/domain/companyStatus.ts), partagée par le web et le mobile.

### 6. La société finalisée restait « Signé »

La clôture écrivait `companyFinalized` dans le processus mais jamais le statut de la
fiche. La timeline disait « terminé », la liste des sociétés disait « Signé ».

### 7. Neuf notifications parlaient du client à la troisième personne

Elles partent vers le client mais étaient rédigées depuis le bureau de l'admin :
« Le devis a été envoyé **au client** », « **Le client** va recevoir une notification »,
« **Le client** devra choisir un autre créneau ». Toutes réécrites à la deuxième
personne, avec le motif de rejet désormais transmis dans le message.

### 8. Deux textes affirmaient des choses fausses

- Le devis affichait des « notes de l'administrateur » **écrites en dur** — un
  commentaire sur les délais que l'administration n'avait pas écrit. Les notes
  viennent maintenant du devis réel, et disparaissent quand il n'y en a pas.
- L'attente des statuts renvoyait à « la déclaration sur l'honneur à l'étape 4 »,
  numérotation d'avant le découpage et hors sujet quand aucune déclaration n'est
  demandée.

Et, au passage : l'avancement des sociétés dans la barre latérale du suivi affichait
un « % » orphelin pour tout dossier créé depuis le tunnel — `progress` n'existe que
sur le jeu de démonstration. Il est calculé à partir des étapes.

## Couverture

- **15 écrans** client web, **16** client mobile, **10** administration, **5** comptabilité :
  rendus sans erreur console, sans emoji dans le texte affiché, sans clé technique
  ni `undefined`.
- Les catalogues (branding, modifications, comptabilité) affichent leurs symboles
  de trait à la place des emojis retirés au passage précédent.

## Ce qui reste

Cinq emojis subsistaient dans le contenu de messages d'une conversation de
démonstration. Ils ont été retirés depuis, avec vingt-huit autres pictogrammes que
la recherche de ce passage n'avait pas vus :
[NETTOYAGE_PICTOGRAMMES.md](NETTOYAGE_PICTOGRAMMES.md).

**Le volet de prévisualisation reste masqué** dans l'environnement de test (0 × 0 px).
Les animations de sortie ne s'y jouent jamais : une modale fermée reste montée et
bloque la suivante, un toast ne disparaît pas. Trois fois durant ce passage, ce
symptôme a été distingué d'un vrai défaut en rejouant la séquence dans un onglet
neuf — où elle passe. Seul le défaut n° 3 s'est révélé réel à ce test.

## Données de recette

Les deux dossiers créés pour ce passage (`RECETTE 5 SARL`, `REPRISE AUTO SARL`) et
leurs brouillons ont été retirés. L'application repart sur son jeu de démonstration :
10 sociétés, aucun brouillon.
