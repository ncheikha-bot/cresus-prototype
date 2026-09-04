# Les trois points restants — 5 août 2026

Solde du plan d'optimisation ouvert dans
[OPTIMISATIONS_PARCOURS_CLIENT.md](OPTIMISATIONS_PARCOURS_CLIENT.md) et poursuivi dans
[DECOUPAGE_ETAPE_2.md](DECOUPAGE_ETAPE_2.md). `npm run build` est vert, `tsc --noEmit`
renvoie 0 erreur, les correctifs ont été vérifiés dans le navigateur.

---

## 1. Les champs non essentiels sont demandés après le devis

**Le problème.** Profession, situation matrimoniale, régime matrimonial et informations du
conjoint ne servent qu'à la rédaction des statuts. Ils étaient pourtant exigés à la saisie
des associés, avant même que le client ait vu le prix. Or personne ne connaît de tête la
profession exacte de son associé, son régime matrimonial ou la date de naissance de son
conjoint : le dossier s'arrêtait là, avant le devis.

**Ce qui change.** Ces champs sont demandés à l'étape 5, sous le devis, dans un bloc
« Informations pour les statuts ».

| | Avant | Après |
|---|---|---|
| Étape 3 « Coordonnées » | 5 champs par associé | **3 champs** : adresse, email, téléphone |
| Deux associés | 10 champs, 1,4 écran | **6 champs, 1,07 écran** |
| État civil | Bloquant avant le devis | Demandé à l'étape 5, sous le devis |

L'attente du devis — l'écran « Devis en cours d'établissement » — devient utile : le client
remplit ces mentions pendant que l'administrateur établit le devis.

**Les garde-fous.** On ne quitte pas l'étape 5 sans ces informations : le message au-dessus
du bouton passe de « Validez le devis pour continuer. » à « Champs manquants pour Amadou
Diallo : profession, situation matrimoniale », puis désigne l'associé suivant. Surtout,
**la validation du devis n'avance plus automatiquement d'une étape** quand il reste des
champs à remplir : elle sautait purement et simplement le nouveau bloc. Le message de
confirmation le dit maintenant — « Complétez les informations pour les statuts ci-dessous
pour passer au versement du capital. »

**Le code.** `validateStep3` ne contrôle plus que l'adresse, l'email et le téléphone ; la
nouvelle `validateStatutsInfo` porte l'état civil, régime et conjoint compris. Le formulaire
correspondant est isolé dans un composant par interface —
[AssociateStatutsFields.tsx](src/components/mobile/AssociateStatutsFields.tsx) et
[WebAssociateStatutsFields.tsx](src/components/web/WebAssociateStatutsFields.tsx) — au lieu
des 155 lignes de JSX recopiées au milieu de chaque tunnel.

**Au passage** : le contrôle « le téléphone du gérant doit être un numéro sénégalais » vivait
à l'étape 2, où le téléphone n'est pas encore saisi — il ne se déclenchait jamais. Il est
passé à l'étape 3, où le champ existe. Vérifié : saisir `06 12 34 56 78` pour le gérant
affiche désormais le message.

## 2. « Prénom » et « Nom » ont un libellé

Sur mobile, ces deux champs n'avaient qu'un placeholder : il disparaissait à la première
lettre et plus rien ne distinguait les deux cases, alors que tous les autres champs du même
formulaire portent un libellé. Ils suivent maintenant la même règle — libellé « Prénom * » et
« Nom * » au-dessus, exemple (`Amadou`, `Diallo`) en placeholder.

## 3. L'écran de connexion n'annonce plus qu'un seul canal

Il demandait un « numéro WhatsApp », promettait un code « envoyé par SMS », affichait
« Connexion sécurisée par SMS » et un bouton « Recevoir le code OTP » — trois canaux et un
sigle technique pour une seule action.

| | Avant | Après |
|---|---|---|
| Sous-titre | Entrez votre numéro WhatsApp… | *(inchangé)* |
| Bouton | Recevoir le code **OTP** | **Recevoir le code** |
| Mention de sécurité | Connexion sécurisée par **SMS** | Connexion sécurisée par **WhatsApp** |
| Écran de vérification | code à 4 chiffres envoyé par **SMS** | code à 4 chiffres reçu **sur WhatsApp** |

---

## Vérifications

**Parcours mobile complet** — étapes 1 à 6 : répartition 60/40 sur 1 000 000 FCFA,
coordonnées à l'étape 3 (3 champs par associé, message de gérant non sénégalais testé),
documents, puis étape 5 : le bloc « Informations pour les statuts » s'affiche sous le devis,
la validation du devis n'avance plus, le message nomme les champs manquants associé par
associé. Un associé marié en communauté de biens fait apparaître le régime puis les quatre
champs du conjoint. Une fois tout rempli, « Continuer » mène à l'étape 6.

**Tunnel web** — étape 3 réduite aux trois mêmes champs, bloc « Informations pour les
statuts » présent à l'étape 5 avec la même mécanique de blocage et le même dépliement
conjoint.

**Écran de connexion** — les trois écrans (saisie du numéro, bouton, vérification) annoncent
WhatsApp et rien d'autre.

## Ce qui reste

Les deux premiers points ont été traités depuis :
[PERSISTANCE_SESSION_ET_BROUILLONS.md](PERSISTANCE_SESSION_ET_BROUILLONS.md).

- ~~**Session non persistée**~~ : la session est relue au montage, un rechargement ne renvoie
  plus à la connexion.
- ~~**Reprise de brouillon incomplète**~~ : devis, statuts, mode de signature et rendez-vous
  sont enregistrés avec le brouillon.
- **Simulation de téléversement web** bloquée à 80 % lorsque l'onglet n'est pas au premier
  plan (minuteur ralenti par le navigateur) — sans effet sur un usage réel.
