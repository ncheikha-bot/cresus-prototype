# Parcours client — ce qui freine l'utilisateur

Test réalisé le 5 août 2026 en parcourant les écrans client mobile (375 × 812) et web
(1440 × 900) comme un utilisateur réel : connexion, tableau de bord, création d'entreprise,
domiciliation, compte bancaire, comptabilité, modifications, rendez-vous, branding, documents.

Les constats sont mesurés, pas estimés. Ils sont classés par ce qu'ils coûtent à l'utilisateur.

---

## 1. Deux parcours ne se terminent pas

**Domiciliation (mobile)** — l'utilisateur répond « Ma société est immatriculée », l'en-tête
passe à « Choisissez votre adresse »… et l'écran reste sur la question précédente. Les offres
ne s'affichent jamais.

**Prise de rendez-vous (mobile)** — même symptôme : l'en-tête avance, le contenu non.

C'est le bug corrigé au sprint 1 sur le tunnel de création, qui subsiste ailleurs :
`AnimatePresence mode="wait"` recevant plusieurs enfants conditionnels frères. L'étape sortante
n'est jamais démontée, donc l'entrante n'est jamais montée.

Mesure au moment du blocage : le bloc sortant reste à `opacity: 0` avec un `transform` figé à
mi-course, et le contenu suivant est absent du DOM. Vérifié par test réversible : en retirant
`mode="wait"`, « Nos offres de domiciliation — Pack ESSENTIEL » apparaît immédiatement.
*(Le fichier a été restauré à l'identique après ce test.)*

**Le motif subsiste dans 15 fichiers**, dont les deux versions de Domiciliation, Rendez-vous,
Modifications, Comptabilité et Branding. Deux blocages sont reproduits ; les autres sont exposés
au même risque sur d'autres transitions.

> **Correction** — appliquer aux 15 fichiers le traitement déjà retenu pour le tunnel :
> un rendu direct keyé, sans dépendre de la fin d'une animation de sortie. Prioriser
> Domiciliation et Rendez-vous, dont le blocage est avéré.

## 2. L'étape 2 de la création est une impasse silencieuse

À l'étape « Répartition du capital », le bouton **« Suivant » est désactivé** et **rien
n'explique pourquoi**.

Ce que voit l'utilisateur : un encart « 2 à 50 associés maximum », un seul bloc « Associé 1 »,
et un bouton gris. Le message qui explique la règle — « Le total doit être 100 % et correspondre
au capital social » — se trouve **en fin de page**, après les 21 champs, donc hors de vue quand
on regarde le bouton bloqué. Et il ne parle pas du nombre d'associés, qui est justement ce qui
bloque au départ.

Le bouton pour ajouter un associé est une icône « + » sans libellé, en haut à droite du bloc.

> **Correction** — trois gestes simples :
> 1. ne jamais laisser un bouton désactivé sans motif : afficher juste au-dessus « Il vous faut
>    au moins 2 associés pour une SARL — ajoutez-en un » ;
> 2. remonter le récapitulatif (total des parts, total des montants, écart au capital) **au-dessus**
>    de la liste des associés, ou le figer près du bouton ;
> 3. donner un libellé au bouton d'ajout : « + Ajouter un associé ».
>
> Alternative plus ambitieuse : garder « Suivant » actif et afficher les erreurs au clic. Un
> bouton actif qui explique vaut mieux qu'un bouton gris qui se tait.

## 3. Les chiffres se contredisent entre mobile et web

Pour le **même utilisateur, au même instant** :

| | Web | Mobile |
|---|---|---|
| Sociétés | **3** | **10** |
| Dossiers en cours | **7** | **4** |

L'utilisateur ne sait pas quel chiffre croire. Sur une plateforme qui gère des créations
d'entreprise, c'est un problème de confiance avant d'être un problème d'affichage.

Le tableau de bord web affiche par ailleurs **deux fois la même information** à 200 px d'écart :
l'encart « Aperçu rapide » (3 / 7 / 1) puis les tuiles (3 / 7 / 0) — avec un écart sur les
brouillons.

> **Correction** — dériver ces compteurs d'une seule source dans le contexte, comme cela a été
> fait pour les sociétés et les rendez-vous, et supprimer l'un des deux blocs sur le web.

## 4. Aucun prix, presque aucun délai

Sur les cinq services testés — création, domiciliation, compte bancaire, comptabilité,
modifications — **aucun prix n'est affiché** sur l'écran d'entrée. Un seul délai apparaît dans
toute l'application (« 48 h en moyenne », sur le web).

L'utilisateur doit s'engager dans un parcours de plusieurs étapes pour découvrir ce qu'il va
payer. C'est le frein commercial le plus coûteux : il produit des abandons qu'aucune amélioration
d'interface ne rattrapera.

> **Correction** — afficher sur chaque carte de service, dès le tableau de bord, un prix
> d'appel et un délai : « Création d'entreprise — à partir de 200 000 FCFA · 48 h »,
> « Domiciliation — à partir de X FCFA/mois ». Les montants existent déjà dans
> `src/domain/pricing.ts` et `src/data/domiciliationData.ts` ; il s'agit de les remonter.

## 5. L'étape 2 demande trop, d'un coup

| Mesure | Valeur |
|---|---|
| Champs sur la seule étape 2 | **21** |
| Champs par associé | **10** |
| Défilements nécessaires | **2,2 écrans** |
| Hauteur du pied de page fixe | **145 px** (18 % de l'écran) |

Dix champs par associé — prénom, nom, parts, montant, adresse, profession, situation
matrimoniale, courriel, téléphone, gérant — dont plusieurs ne sont pas indispensables à ce stade.

> **Correction** — deux pistes, cumulables :
> - scinder l'étape : d'abord la répartition (qui, combien), puis les informations détaillées
>   de chaque associé ;
> - distinguer clairement l'obligatoire du facultatif, et différer ce qui peut l'être
>   (profession, situation matrimoniale ne servent qu'à la rédaction des statuts).

## 6. Détails qui usent

| Constat | Mesure | Effet |
|---|---|---|
| Cible tactile « Notifications » | 35 × 35 px | Sous le seuil de 44 px, difficile à viser |
| Lien « Voir tout » | 16 px de haut | Quasi impossible à toucher au pouce |
| Champs « Prénom » / « Nom » | Placeholder seul | Le libellé disparaît dès qu'on saisit, alors que « Parts (%) » a un vrai libellé |
| Écran de connexion | « numéro **WhatsApp** » puis « Connexion sécurisée par **SMS** » | L'utilisateur ne sait pas où arrivera son code |
| Contenu tronqué sous le pied de page | « Profession * » coupé | Oblige à deviner qu'il faut défiler |

## 7. Ce qui fonctionne bien

À conserver tel quel :

- **L'aide contextuelle sur la forme juridique** — « Idéale pour les PME et projets familiaux »
  sous le sélecteur, et le rappel du capital minimum. C'est exactement la bonne information au
  bon moment.
- **Le tunnel de création** depuis les corrections : erreurs sous les champs, focus posé sur le
  premier champ fautif, capital formaté « 1 000 000 » pendant la frappe.
- **La reprise de brouillon** — visible sur le tableau de bord avec le bon compteur d'étape,
  et restauration complète des champs.
- **La barre de navigation mobile** — cibles de 48 × 54 px, libellés lisibles depuis la
  correction de contraste.
- **Les états vides**, présents sur 41 % des écrans, souvent bien rédigés
  (« Aucune notification — Vous êtes à jour ! »).

---

## Par quoi commencer

| Ordre | Action | Effort | Ce que ça débloque |
|---|---|---|---|
| 1 | Corriger `AnimatePresence` sur Domiciliation et Rendez-vous | Faible | Deux parcours qui ne se terminent pas |
| 2 | Expliquer le blocage de l'étape 2 et remonter le récapitulatif | Faible | La principale sortie de route du tunnel |
| 3 | Unifier les compteurs mobile / web | Faible | La confiance dans les chiffres affichés |
| 4 | Afficher prix et délais sur les cartes de service | Moyen | Le frein commercial le plus coûteux |
| 5 | Traiter les 13 autres `AnimatePresence mode="wait"` | Moyen | Le risque résiduel sur les autres parcours |
| 6 | Scinder l'étape 2 de la création | Élevé | La charge de saisie |

Les trois premières lignes se traitent en une journée et retirent les frictions les plus
visibles. La quatrième est celle qui aura le plus d'effet sur la conversion.
