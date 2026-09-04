# Les deux réserves de la troisième recette — 6 août 2026

Solde de [RECETTE_FINALE_3.md](RECETTE_FINALE_3.md). `tsc --noEmit` : 0 erreur.
`npm run build` : vert.

---

## 1. Les modifications des sociétés de démonstration survivent au rechargement

**Ce qui change.** Le stockage ne retenait que les sociétés créées ; il retient désormais
**tout ce qui s'écarte des données de référence** — sociétés créées et sociétés de
démonstration modifiées. Au démarrage, chaque société de référence est reprise depuis
`mockCompanies` *sauf* si une version modifiée a été enregistrée, auquel cas celle-ci
l'emporte.

Le compromis reste explicite : une société de démonstration laissée intacte est relue à
chaque démarrage, donc une évolution du jeu de données reste visible ; celle que
l'utilisateur a modifiée garde son état, parce que ses changements doivent primer.

**Vérifié** : avec une version modifiée de TECH SOLUTIONS enregistrée (statut « Finalisé »),
l'administration l'affiche bien comme finalisée après rechargement, tandis que SEETAL
TRANSPORT, intacte, conserve son statut de référence.

**À noter, et c'est la raison pour laquelle la réserve était théorique** : aucun écran ne
modifie aujourd'hui une société de référence. `updateCompanyStatus` existe dans le contexte
mais n'est appelé nulle part, et les décisions de l'administration sur les documents passent
par `companyProcesses`, persisté à part depuis plus longtemps. Le correctif est donc une
mise en cohérence : le jour où une action modifiera un dossier existant, elle survivra.

## 2. Les trois écrans web non couverts, et ce qu'ils cachaient

Les écrans `my-domiciliations`, `my-bank-requests` et `modification` ont été rouverts et
parcourus, mobile compris. Deux se comportent correctement :

- **Mes demandes de compte** : 6 demandes, filtres par statut, banques et sociétés affichées.
- **Modification post-statutaire** : enchaînement forme juridique → type de modification →
  détail (« 5 documents • 2 informations »), sur les deux interfaces.

Le troisième cachait un défaut.

### Les contrats de domiciliation pointaient vers des offres inexistantes

Les deux contrats de démonstration portaient `offerId: 'dom-1'` et `'dom-2'`, alors que les
offres s'appellent `dom-essentiel`, `dom-business` et `dom-premium`. La recherche renvoyait
donc `undefined`, et la carte s'affichait **sans nom d'offre et sans adresse** — un titre
vide suivi d'une virgule orpheline : « , Actif ». Leurs montants ne correspondaient à aucune
grille tarifaire (75 000 F CFA/mois pour un pack qui n'existe pas).

Les contrats sont rattachés aux offres réelles, avec les montants de la grille en vigueur :

| Contrat | Avant | Après |
|---|---|---|
| contract-1 | `dom-1`, 75 000/mois, 720 000/an | **Pack BUSINESS**, 50 000/mois, 528 000/an |
| contract-2 | `dom-2`, 35 000/mois, 94 500/trim. | **Pack ESSENTIEL**, 25 000/mois, 71 250/trim. |

Leurs `userId` et `companyId` — `user-123`, `company-456` — ne désignaient personne ; ils
pointent maintenant sur le client de démonstration et deux de ses sociétés.

**Vérifié** sur les deux interfaces : les cartes affichent « Pack BUSINESS — Bourguiba
(Business Center), Dakar » et « Pack ESSENTIEL », le total mensuel tombe à 75 000 F CFA, et
le détail d'un contrat est cohérent (numéro, période, montants, dates).

---

## Couverture après ce passage

Les 47 écrans des quatre espaces ont été ouverts au moins une fois dans les trois recettes,
et les trois écrans laissés de côté l'ont été dans celle-ci — console vide, à chaque fois.
