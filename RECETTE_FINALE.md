# Recette — 5 août 2026

> Une seconde recette complète a suivi ces correctifs :
> [RECETTE_FINALE_2.md](RECETTE_FINALE_2.md).

Passage sur **47 écrans** et les parcours multi-étapes des quatre espaces, console ouverte.
`tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Couverture

| Espace | Écrans | Résultat |
|---|---|---|
| Client mobile (`/app`) | 16 | Tous rendus, 0 erreur console |
| Client web (`/web`) | 15 | Tous rendus, 0 erreur console |
| Administration (`/admin`) | 11 | Tous rendus, 0 erreur console |
| Comptable (`/comptable`) | 5 | Tous rendus, 0 erreur console |

**Parcours joués de bout en bout** : création d'entreprise (étapes 1 à 8), reprise de
brouillon, domiciliation (mobile et web), ouverture de compte bancaire, modification
post-statutaire, comptabilité, connexion / déconnexion, et côté administration l'ouverture
d'un dossier avec validation de ses pièces.

## Dix défauts trouvés et corrigés

### 1. Identifiants de notification en doublon

`addNotification` posait `id: Date.now().toString()`. Deux notifications émises dans la même
milliseconde — ce qui arrive à chaque enchaînement du tunnel, « devis créé » puis « statuts
reçus » — recevaient le même identifiant. React signalait deux enfants de même clé, et
marquer l'une comme lue marquait l'autre.

`nouvelId()` ([lib/id.ts](src/lib/id.ts)) combine horodatage et compteur.
**Vérifié** : six notifications émises en rafale, aucun avertissement ; « marquer comme lu »
fait passer le compteur de 5 à 4 non lues, et non de 5 à 3.

### 2. Composants non référençables sous `AnimatePresence`

`AccountingDashboardImproved` et son équivalent web étaient des enfants directs d'un
`AnimatePresence mode="popLayout"`. Ce mode mesure l'enfant sortant via une `ref`, qu'un
composant fonction ne peut pas recevoir : React avertissait à chaque affichage et l'animation
de sortie ne pouvait pas être mesurée. Les deux sont désormais enveloppés dans un
`motion.div` keyé. C'est une conséquence du passage de `mode="wait"` à `popLayout` — les 13
autres fichiers concernés n'exposaient que des `motion.*`, un balayage l'a confirmé.

### 3. La timeline mobile montrait les dossiers des autres clients

`Timeline.tsx` parcourait `companies` en entier, sans filtre sur l'utilisateur. Pire, les
statuts étaient calculés **une seule fois**, sur le premier dossier en cours, puis appliqués à
toutes les cartes : deux sociétés à des stades différents affichaient la même progression.

La liste porte maintenant sur les sociétés de l'utilisateur, et chaque carte calcule son
propre avancement. **Vérifié** sur les 10 dossiers du compte de démonstration, qui affichent
enfin des progressions distinctes (4 étapes faites pour l'une, 3 pour l'autre, 8 pour une
société finalisée).

### 4. L'écran de suivi n'avait pas d'état vide

Conséquence du filtre ci-dessus : sans dossier, l'écran se réduisait à son bandeau. Il
affiche désormais « Aucun dossier en cours », une phrase d'explication et un bouton vers la
création.

### 5. L'espace client acceptait une session non cliente

Les espaces administration et comptable connectent d'office leur propre utilisateur. Depuis
que la session survit au rechargement, passer par `/comptable` puis revenir sur `/app`
laissait l'application ouverte sur l'espace client **avec le compte du comptable** — donc
aucun dossier, sans que rien ne propose de se reconnecter. `/app` exige maintenant un compte
de rôle client et réaffiche l'écran de connexion sinon.

## Ce qui a été confirmé au passage

- **Chaînage administration → client** : la validation des trois pièces de TECH SOLUTIONS
  côté admin fait passer « Documents justificatifs » au vert dans la timeline du client et
  déplace l'étape en cours sur « Validation du devis ». Les décisions sont bien persistées
  dans `cresus_company_processes`.
- **Tunnel de création** : 8 étapes, découpage associés / coordonnées, informations pour les
  statuts à l'étape 5, blocages explicités.
- **Reprise de brouillon** : devis, statuts, mode de signature et rendez-vous rétablis.
- **Session** : rechargement direct sur `/app/dashboard` sans repasser par la connexion ;
  déconnexion propre.
- **Écran de connexion** : WhatsApp annoncé sur les trois écrans.

## Points relevés en fin de recette, corrigés dans la foulée

### 6. Deux nombres pour « en cours »

Le tableau de bord annonçait 8 dossiers en cours, l'écran « Mes sociétés » 7. L'écart, c'était
le brouillon : `getClientCounters` l'ajoutait aux dossiers en cours alors que les deux
tableaux de bord lui consacrent déjà une section « Brouillons en cours ». Il y était donc
compté deux fois, et la liste des sociétés — où un brouillon n'a pas sa place — ne pouvait pas
suivre.

« En cours » ne compte plus que les dossiers soumis et non terminés ; les brouillons sont
comptés dans leur propre section, dont le titre porte désormais le nombre.

**Vérifié** : mobile et web affichent tous deux **3 créées / 7 en cours** et
**« Brouillons en cours (1) »**, en accord avec « Toutes (10) · Actives (3) · En cours (7) »
sur l'écran des sociétés.

### 7. Progression en dents de scie

`getStepStatuses` marquait chaque étape indépendamment : un dossier portant un statut avancé
sans devis validé affichait une étape terminée *après* une étape en attente, que le fil
vertical reliait en zigzag. La progression est maintenant strictement séquentielle — terminé
jusqu'à la première étape manquante, celle-ci en cours, le reste en attente.

**Vérifié** : KEUR SANTÉ PHARMACIE passe de `✓✓✓○✓✓··` à `✓✓✓○····`, et les dix dossiers du
compte de démonstration affichent une progression continue.

### 8. Téléversement figé quand l'onglet passe à l'arrière-plan

Les quatre simulations d'envoi de fichiers avançaient d'un pas par tic de minuteur. Or un
navigateur ralentit fortement les minuteurs d'un onglet en arrière-plan — ce que fait tout
utilisateur qui change d'application pendant l'envoi : la barre se figeait en chemin et le
fichier n'arrivait jamais dans la liste. Ce n'était donc pas seulement un artefact de test.

La progression se déduit maintenant du temps écoulé : un tic tardif termine l'envoi au lieu de
le faire avancer d'un cran. Corrigé dans les quatre fichiers concernés — documents du tunnel
web, envoi de pièces comptables (mobile et web), livrables côté administration.

**Vérifié** dans la condition qui posait problème, onglet en arrière-plan : le fichier passe à
« 1 téléversé · 1 en attente de validation » en quelques secondes, là où il restait bloqué à
80 % indéfiniment.

### 9. `Date.now()` comme identifiant, partout ailleurs

Le correctif n° 1 ne portait que sur les notifications. Le même motif servait en réalité à
**28 endroits** : brouillons, sociétés, rendez-vous, documents, avis, demandes bancaires,
messages de discussion, fichiers en cours d'envoi, offres de domiciliation, banques
partenaires, déclarations fiscales. Partout où deux entités naissent dans la même
milliseconde — les messages d'une conversation, les fichiers d'un même lot — les
identifiants entraient en collision.

Tous passent par `nouvelId()`. **Vérifié** : 500 identifiants générés dans le même tic, tous
distincts.

### 10. Des références qui changeaient à chaque rendu

Trois numéros affichés — devis `DEV-`, déclaration sur l'honneur `DH-`, paiement `PAY-` —
étaient calculés en plein rendu à partir de l'horloge. Ils changeaient donc à chaque
re-rendu du composant, sous les yeux de l'utilisateur, et rouvrir le même devis donnait un
autre numéro. C'était plus gênant qu'une collision d'identifiants : une référence qui bouge
n'est plus une référence.

`referenceCourte()` les dérive d'une graine stable du dossier — nom de la société et email du
client pour le devis, société et nom du client pour la déclaration ; la référence de paiement
est fixée une fois au montage de l'écran.

**Vérifié** : la référence de paiement reste `PAY-155107` à travers plusieurs rendus
successifs, là où elle changeait à chacun ; et deux dossiers distincts obtiennent bien deux
numéros de devis distincts.

---

Après ces deux correctifs, **plus aucun `Date.now()` ne sert à fabriquer un identifiant ou une
référence** dans `src/`. Les occurrences restantes sont des calculs de durée (progression d'un
envoi, échéances fiscales) et des horodatages de données de démonstration.
