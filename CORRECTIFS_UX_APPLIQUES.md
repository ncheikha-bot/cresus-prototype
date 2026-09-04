# Correctifs UX appliqués — 5 août 2026

Suite du test des parcours client documenté dans
[OPTIMISATIONS_PARCOURS_CLIENT.md](OPTIMISATIONS_PARCOURS_CLIENT.md).
`npm run build` est vert, chaque correctif a été vérifié dans le navigateur.

---

## 1. Les parcours bloqués sont débloqués

**15 occurrences** de `AnimatePresence mode="wait"` sont passées en `mode="popLayout"`, dans
13 fichiers : Domiciliation, Rendez-vous, Modifications, Comptabilité, Branding et Envoi de
documents comptables (mobile et web), plus le suivi comptable admin.

Avec `mode="wait"`, l'étape suivante n'est montée qu'une fois la sortie de la précédente
terminée — et cette sortie ne se terminait jamais avec plusieurs enfants conditionnels frères.
Avec `popLayout`, l'étape entrante est montée immédiatement et la sortante est retirée du flux,
donc sans saut de mise en page.

**Deux cas ont été laissés tels quels**, après vérification qu'ils sont corrects :

| Fichier | Motif |
|---|---|
| `AccountantCalendar.tsx:507` | Ternaire à deux branches keyées : un seul enfant à la fois |
| `AdminCompanySteps.tsx:432` | `steps.map()` qui ne rend que l'étape courante |

**Vérifié** : en domiciliation, le choix d'adresse (« Nos offres de domiciliation — Pack
ESSENTIEL ») s'affiche maintenant après la question sur l'immatriculation. Avant, ce contenu
n'était jamais monté.

## 2. Le blocage de l'étape 2 s'explique

`getStep2BlockingReason()` a été ajouté à `src/domain/companyValidation.ts`. Il renvoie la
raison précise pour laquelle « Suivant » est inactif, affichée **juste au-dessus du bouton**,
dans les deux tunnels.

Le message suit la situation réelle :

| Situation | Message affiché |
|---|---|
| 1 associé pour une SARL | « Une SARL requiert au moins 2 associés. Ajoutez-en 1 pour continuer. » |
| 2 associés, rien de réparti | « Il reste 100 % de parts à répartir entre les associés. » |
| Parts dépassant 100 % | « Les parts dépassent 100 % de X %. Ajustez la répartition. » |
| Apports ≠ capital | « Il manque X FCFA pour atteindre le capital social. » |
| Tout est valide | *(aucun message, bouton actif)* |

**Vérifié** : les trois premiers cas s'enchaînent correctement, et le bouton redevient actif dès
que la répartition est complète.

## 3. Les compteurs ne se contredisent plus

`src/domain/clientDashboard.ts` définit une fois pour toutes ce que comptent « sociétés créées »
et « en cours ». Les deux tableaux de bord y puisent.

| | Avant | Après |
|---|---|---|
| Sociétés — web | 3 | **3** |
| Sociétés — mobile | **10** | **3** |
| En cours — web | 7 | **8** |
| En cours — mobile | **4** | **8** |

Le mobile comptait *toutes* les sociétés sous le libellé « créées », là où le web ne comptait que
les immatriculées. Et « en cours » additionnait les brouillons et les demandes bancaires d'un
côté, les dossiers non terminés de l'autre. La définition retenue : **créées** = sociétés
immatriculées ; **en cours** = dossiers non terminés, brouillons compris.

## 4. Les prix et délais sont visibles avant de s'engager

`src/domain/servicePricing.ts` remonte sur les cartes de service les montants qui existaient
déjà dans les données de référence.

| Service | Affiché |
|---|---|
| Créer une entreprise | dès 200 000 FCFA · 48 h |
| Domiciliation | dès 25 000 FCFA / mois · 24 h |
| Compte bancaire | 5 à 10 j |
| Comptabilité | dès 80 000 FCFA / mois |
| Branding | dès 50 000 FCFA |
| Modifications | Sur devis |

Le tarif de création est calculé depuis `REGISTRATION_FEES`, donc il suivra automatiquement toute
évolution du barème. L'ouverture de compte n'affiche pas de prix : elle est gratuite côté Crésus,
les frais éventuels relevant de la banque.

**Détail corrigé au test** : le libellé « dès 200 000 FCFA · 48 h en moyenne » était tronqué sur
mobile. Les délais ont été raccourcis et la troncature retirée.

---

## Ce qui reste

- ~~**Scinder l'étape 2** de la création (21 champs, 10 par associé, 2,2 écrans de
  défilement).~~ Fait : voir [DECOUPAGE_ETAPE_2.md](DECOUPAGE_ETAPE_2.md). Le tunnel compte
  désormais 8 étapes, l'étape 2 en demande 6.
- **Différer les champs non essentiels** : profession et situation matrimoniale ne servent qu'à
  la rédaction des statuts.
- **Détails** : les champs « Prénom » et « Nom » n'ont qu'un placeholder, sans libellé
  persistant ; le lien « Voir tout » fait 16 px de haut ; l'écran de connexion annonce un
  « numéro WhatsApp » puis une « connexion sécurisée par SMS ».
- **Remonter le récapitulatif des parts** au-dessus de la liste des associés : il reste en fin
  de page, même si le message de blocage compense désormais son éloignement.
