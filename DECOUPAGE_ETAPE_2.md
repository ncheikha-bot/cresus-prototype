# Découpage de l'étape 2 en deux étapes — 5 août 2026

Dernier point ouvert du plan d'optimisation
([OPTIMISATIONS_PARCOURS_CLIENT.md](OPTIMISATIONS_PARCOURS_CLIENT.md), § « Ce qui reste »).
Le tunnel de création passe de **7 à 8 étapes**. `npm run build` est vert, `tsc --noEmit`
renvoie 0 erreur, les deux tunnels ont été parcourus dans le navigateur de l'étape 1 à
l'étape 8.

---

## 1. Pourquoi

L'ancienne étape 2 demandait **21 champs** pour deux associés — 10 par associé plus le
capital — sur **2,2 écrans de défilement**. Elle mélangeait deux natures de travail :

| Nature | Champs | Ce que fait l'utilisateur |
|---|---|---|
| Une décision | prénom, nom, parts, montant, gérant | Il arbitre : qui entre au capital, pour combien |
| Une saisie administrative | adresse, profession, situation matrimoniale, email, téléphone | Il recopie des informations d'état civil |

Une décision et une recopie ne se font pas dans le même état d'esprit. Les réunir obligeait
à interrompre l'arbitrage sur la répartition pour aller chercher un numéro de téléphone.

## 2. Ce que voit l'utilisateur

| | Avant | Après |
|---|---|---|
| Étape 2 | 21 champs, 2,2 écrans | **6 champs**, 1 écran — « Répartition du capital » |
| Étape 3 | *(documents)* | **11 champs**, 1,4 écran — « Coordonnées des associés » |
| Total | 7 étapes | **8 étapes** |

Les messages de blocage suivent le même découpage :

| Étape | Message |
|---|---|
| 2 | « Une SARL requiert au moins 2 associés. Ajoutez-en 1 pour continuer. » |
| 2 | « Il reste 40 % de parts à répartir entre les associés. » |
| 3 | « Champs manquants pour Amadou Diallo : adresse, profession, email, téléphone, situation matrimoniale » |

Le message d'écart de parts affiche désormais la virgule décimale française (il annonçait
« Il reste 99.98 % »).

## 3. Ce qui a changé dans le code

### Le domaine

`src/domain/companySteps.ts` — `COMPANY_CREATION_STEPS` compte 8 entrées, « Coordonnées des
associés » en position 3. `getStepStatuses` gagne un statut correspondant : les coordonnées
sont réputées saisies dès que chaque associé porte une adresse.

`src/domain/companyValidation.ts` — la validation, jusque-là écrite deux fois dans les
composants, est découpée en `validateStep2` (identité, répartition, gérant) et
`validateStep3` (adresse, profession, état civil, conjoint en communauté de biens).

### Les deux tunnels

Dans `CreateCompany.tsx` et `WebCreateCompany.tsx`, le bloc des associés est rendu pour
`currentStep === 2 || currentStep === 3` ; à l'intérieur, chaque champ est rattaché à son
étape. Ne restent à l'étape 2 que ce qui relève de la composition du capital : la règle du
nombre d'associés, la cogérance, le bouton d'ajout, le récapitulatif des parts et le conseil
sur la désignation du gérant.

Toutes les étapes suivantes sont décalées de +1 : Documents 3→4, Validation devis 4→5,
Versement 5→6, Validation statuts 6→7, Signature 7→8.

## 4. Ce que le décalage a révélé

Le décalage touche plus de choses que les numéros d'étape. Chaque point ci-dessous a été
trouvé en parcourant réellement les deux tunnels, pas à la lecture du code.

| Point | Symptôme | Correction |
|---|---|---|
| **Tunnel web jamais renuméroté** | « Documents » restait conditionné à `currentStep === 3` : il s'affichait **en même temps** que les coordonnées, et sa validation se déclenchait dans la foulée | 22 conditions décalées, plus les `setCurrentStep()` littéraux, les libellés de boutons et les commentaires |
| **Icônes du fil d'étapes** | `STEP_ICONS` comptait 7 entrées pour 8 étapes : la 8ᵉ recevait `undefined` | Ajout de `MapPin` en position 3 |
| **Navigation absente à l'étape 7** | Le garde `currentStep < 7` masquait les boutons sur l'étape devenue « Validation des statuts » | Porté à `< 8` dans les deux tunnels |
| **Collision de clés d'erreurs** | Les documents écrivaient `errors.step3`, désormais occupé par les coordonnées : un manque d'adresse s'affichait sous « Documents incomplets » | Renommé en `step4` ; le bloc d'erreurs de l'étape 2 ne s'affiche plus qu'à l'étape 2 |
| **`currentStep` transmis à l'admin** | Le tunnel écrivait son propre numéro d'étape dans la fiche société, que l'administration relit sur **sa** grille de 7 étapes : à 8, toutes les étapes admin apparaissaient terminées | Un dossier soumis entre à `currentStep: 1`, comme dans les données de référence |
| **Timeline client désalignée** | `MOBILE_TIMELINE_STEPS` (7 libellés) était apparié par index aux 8 statuts : à partir de l'étape 3, chaque libellé affichait le statut du voisin | Liste portée à 8 entrées, alignée sur `COMPANY_CREATION_STEPS` ; dates et descriptions du suivi web ajustées |
| **Renvois d'étape dans les textes** | « déclaration sur l'honneur à l'étape 3 », « signer à l'étape 6 », « validation à l'étape 6 » | Corrigés en 4, 7 et 7 |
| **Éléments restés sur la mauvaise étape** | Règle du nombre d'associés, cogérance et conseil sur le gérant s'affichaient encore à l'étape 3 | Conditionnés à l'étape 2 |

## 5. Deux corrections d'ergonomie au passage

- **Bouton d'ajout d'associé (mobile)** : c'était un rond doré de 32 px sans libellé, alors
  que le message juste au-dessus demande « Ajoutez-en 1 pour continuer ». Il porte
  maintenant le mot « Ajouter » et mesure 87 × 44 px, soit la cible tactile minimale.
- **Titre de l'étape 2 (mobile)** : « Associés et répartition du capital » ne correspondait
  pas au nom de l'étape affiché ailleurs. Aligné sur « Répartition du capital ».

## 6. Vérifications faites dans le navigateur

**Mobile** — étapes 1 → 8 parcourues : saisie de deux associés à 60/40 sur un capital de
1 000 000 FCFA, blocage puis déblocage de l'étape 2, coordonnées à l'étape 3, arrivée sur
« Documents requis — Étape 4 sur 8 ». Les étapes 5 à 8 ont été ouvertes par reprise de
brouillon : devis, versement, statuts (boutons de navigation présents) et signature.

**Web** — même parcours jusqu'à « Documents requis — Étape 4/8 », puis étapes 5 à 8 par
reprise de brouillon. Le fil d'étapes affiche bien les 8 titres.

**Suivi client** — la timeline mobile montre « Informations générales », « Répartition du
capital » et « Coordonnées des associés » en vert, puis « Documents justificatifs » en
cours : les libellés correspondent aux statuts.

---

## Ce qui reste du plan initial

Les trois premiers points ont été traités depuis :
[DERNIERS_CORRECTIFS_UX.md](DERNIERS_CORRECTIFS_UX.md).

- ~~**Différer les champs non essentiels**~~ : profession et état civil sont demandés à
  l'étape 5, sous le devis.
- ~~**Libellés persistants** sur « Prénom » et « Nom »~~ du tunnel mobile.
- ~~**Écran de connexion**~~ : un seul canal annoncé, WhatsApp.
- **Session non persistée** : un rechargement de page renvoie à l'écran de connexion, alors
  que les brouillons, eux, survivent dans le `localStorage`.
