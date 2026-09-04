# Recette — modification, domiciliation, banque, branding — 7 août 2026

Les quatre parcours hors création, jamais exécutés jusqu'ici — seulement affichés
(voir la réserve finale de [RECETTE_FINALE_6.md](RECETTE_FINALE_6.md)). Chacun a été
joué de bout en bout, du premier écran client jusqu'à l'administration.

`tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Le constat d'ensemble

Trois parcours sur quatre s'arrêtaient au bord : ils affichaient un écran de
succès — « Demande soumise », « Votre domiciliation est active », « Commande
envoyée » — sans rien enregistrer. Fermer l'onglet effaçait tout, et
l'administration ne voyait jamais rien arriver.

| Parcours | Conservé | Atteint l'administration |
|---|---|---|
| Modification | non → **corrigé** | non → **corrigé** |
| Domiciliation | non → **corrigé** | non → **corrigé** |
| Branding | non → **corrigé** | non → **corrigé** |
| Banque | oui | oui |

Le parcours bancaire, lui, était complet : demande enregistrée, visible côté
administration, avec son fil de discussion. Il a servi de modèle.

## Les défauts, parcours par parcours

### Modification

**1. La demande n'existait nulle part.** `handleSubmitRequest` posait un objet dans
l'état du composant et affichait l'écran de suivi. Rien d'autre. Les demandes
rejoignent maintenant le référentiel partagé
([`addModification`](src/context/AppContext.tsx)), persistées et synchronisées
entre onglets comme les dossiers de création.

**2. Le mobile ne demandait jamais les informations.** Le web fait renseigner ce
qui sert à rédiger l'acte — nouvelle adresse, date d'effet, type de local, commune.
Le mobile passait de la sélection de la société **directement à la confirmation** :
un transfert de siège partait sans sa nouvelle adresse, une augmentation de capital
sans son montant. L'étape manquante a été créée, avec son récapitulatif avant envoi.

**3. L'administration ne voyait pas ce que le client avait saisi.** Même une fois la
demande transmise, l'écran de détail montrait le type et la date, jamais les
informations — c'est-à-dire la matière même de l'acte. Elles y figurent désormais.

**4. Aucun moyen de chiffrer un devis.** Le bouton « Passer à l'étape suivante »
faisait glisser le statut jusqu'à « Devis envoyé » sans qu'aucun montant n'ait
jamais été saisi ; le client voyait alors un devis d'exemple à 85 000 FCFA. Un
formulaire de chiffrage a été ajouté, avec montant, détail des prestations et une
validité de trente jours.

**5. L'administration validait le devis à la place du client.** Le compteur
avançait sans condition. Un garde-fou refuse maintenant de franchir l'étape tant que
le devis n'est pas chiffré, puis tant que le client ne l'a pas validé.

**6. Le client suivait la demande d'un autre.** L'écran de suivi lisait un exemple
figé — une nomination de gérant — quelle que soit la demande soumise.

**7. Six boutons de simulation en anglais** (`Pending Admin`, `Documents Ready`,
`Validated`, `Rejected`, `Signed`, `Completed`) étaient visibles par le client, sous
le suivi de sa demande. Le nettoyage d'une session précédente les avait manqués.

**8. Le récapitulatif affichait les valeurs techniques.** « Type de local : **bail** »
au lieu de « Bail commercial » : les choix des listes étaient écrits dans le JSX,
hors d'atteinte du récapitulatif. Ils sont passés dans les données.

**9. Un statut en clé brute** — « TECH SOLUTIONS SARL **submitted** » — dans le
sélecteur de société, à côté de « En cours » et « Signé ».

### Domiciliation

**10. Le parcours s'écroulait en pleine souscription.** Au passage à l'étape des
pièces justificatives, **écran blanc**. Deux entrées du catalogue portaient
`icon: ''` — une chaîne vide utilisée comme composant React, reliquat de la
migration des icônes où l'emoji retiré n'avait pas été remplacé. `<doc.icon />`
levait une exception et démontait toute la page. Trois occurrences au total, sur les
deux plateformes, plus une quatrième dans le simulateur de comptabilité.

**11. Le contrat n'était pas enregistré.** Paiement effectué, référence affichée,
« Votre domiciliation est active » — et « Mes domiciliations » ne montrait que deux
contrats de démonstration datés de 2024.

### Branding

**12. La commande partait dans la console.** `handleSubmitOrder` faisait un
`console.log` du brief, puis affichait l'écran de confirmation. L'onglet
« Mes projets » n'a jamais rien reçu.

## Vérifications

- **Modification** : demande soumise depuis le mobile avec ses quatre informations →
  reçue par l'administration avec l'adresse, la date d'effet, le type de local et la
  commune → devis chiffré à 145 000 FCFA, valable jusqu'au 06/09/2026 → reçu par le
  client → validé. Le garde-fou refuse l'avancement sans devis.
- **Domiciliation** : pack Essentiel, trimestriel, quatre pièces, contrat lu et
  accepté, signature tracée, paiement Orange Money → contrat enregistré à
  71 250 FCFA, échéance au 07/11/2026, en tête de « Mes domiciliations ».
- **Banque** : demande soumise pour DIGITAL SERVICES SARL → 6 puis 7 demandes
  enregistrées, visible en administration avec son fil de discussion.
- **Branding** : commande « Identité Teranga Foods » → conservée, « Mes projets »
  passe de 3 à 4 et le projet survit à la navigation.

Dix écrans client repassés après coup : aucune erreur console, aucun `undefined`,
`NaN` ni `Invalid Date`.

## La reprise côté administration

Les deux écrans qui restaient sur leurs jeux d'exemples ont été branchés à leur tour.

**Domiciliation.** Les contrats souscrits arrivent en tête de la liste
d'administration, avec leur pack, leur période, leurs montants et leurs échéances
réelles. Les décisions — suspendre, résilier — sont écrites dans le référentiel et
redescendent au client. Deux corrections au passage :

- La liste affichait **« Entreprise »** pour tout le monde : un contrat souscrit
  avant l'immatriculation n'a pas de société rattachée. Elle nomme désormais la
  société quand elle existe, le client sinon.
- L'administration lisait **« Société non immatriculée / En attente d'acceptation »**
  sur un contrat pourtant signé et payé : le parcours client connaissait ces deux
  faits mais ne les transmettait pas.

**Branding.** Les commandes rejoignent la liste des projets, avec leur brief, leur
client et leur montant. Un bouton d'avancement les fait passer de « Prendre en
charge » à « Marquer comme livré » puis « Clôturer », chaque étape notifiant le
client. Une correction au passage : la correspondance entre l'avancement d'une
commande et le statut affiché était écrite des deux côtés et avait aussitôt
divergé — l'administration passait le projet « En cours », le client lisait
toujours « En attente de paiement ». Elle vit maintenant dans
[`brandingStatus.ts`](src/domain/brandingStatus.ts).

**Vérifié de bout en bout** : contrat Pack Business annuel à 528 000 FCFA souscrit,
lu par l'administration avec « Société immatriculée / Mentions légales acceptées »,
suspendu pour impayé → le client voit « Suspendu » et reçoit le motif. Commande
« Charte Sunu Bio » passée, prise en charge par l'administration → « En cours » des
deux côtés.

## La société à domicilier

Une adresse de domiciliation devient le siège statutaire d'une société précise. Le
parcours ne demandait jamais laquelle : l'administration recevait un contrat sans
savoir quoi domicilier, et se rabattait sur le nom du client.

Une étape s'intercale désormais après « Oui, ma société est immatriculée », dans les
deux parcours. Elle ne liste que les sociétés dont la création est **achevée** —
proposer un dossier encore en révision contredirait la réponse que le client vient
de donner — et offre une échappatoire, « Une autre société », pour celles créées
ailleurs. Un client sans société immatriculée ne voit pas l'étape ; le parcours
« pas encore immatriculée » l'ignore aussi.

**Un défaut découvert en chemin** : le parcours de domiciliation **mobile**
n'enregistrait rien du tout. Il affichait « Domiciliation confirmée » et la
souscription disparaissait — absente de « Mes domiciliations » comme de
l'administration. Le parcours web souffrait du même mal, corrigé plus haut ; le
mobile ne l'avait jamais été. Il écrit maintenant le contrat, avec la société
rattachée, l'état d'immatriculation et l'acceptation des conditions.

**Vérifié** : souscription web pour CONSULTING EXPERT SUARL (Pack Essentiel
trimestriel) et souscription mobile pour DIGITAL SERVICES SARL (Pack Business
annuel) — toutes deux nommées par leur société dans la liste d'administration.

Les données de recette ont été retirées.
