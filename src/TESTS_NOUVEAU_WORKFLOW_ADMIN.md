# Guide de Test : Nouveau Workflow Admin Aligné Client

## 🎯 Objectif des tests

Valider que le nouveau workflow admin fonctionne correctement avec :
- Les 7 étapes renommées et réorganisées
- La modale de visualisation du dossier complet
- Les blocages et déblocages logiques
- L'alignement avec le workflow client

---

## ✅ Tests Étape 1 : Dossier soumis

### Test 1.1 : Affichage de l'étape
- [ ] L'étape 1 s'affiche avec le titre "Dossier soumis"
- [ ] La description indique "Informations complètes reçues du client"
- [ ] L'icône `FileText` s'affiche
- [ ] Le statut est automatiquement "Complété" (vert) car le dossier est soumis

### Test 1.2 : Bouton "Consulter le dossier complet"
- [ ] Le bouton "Consulter le dossier complet" s'affiche dans la section "Action requise"
- [ ] Le bouton a le style Crésus (gradient bleu #1A2753 → #273A7A)
- [ ] L'icône `Eye` s'affiche à côté du texte
- [ ] Au clic, la modale s'ouvre avec une animation fluide

### Test 1.3 : Contenu de la modale "Dossier soumis"
**Informations entreprise :**
- [ ] Le nom de l'entreprise s'affiche dans le header de la modale
- [ ] La dénomination sociale s'affiche
- [ ] La forme juridique s'affiche (SARL, SAS, etc.)
- [ ] Le secteur d'activité s'affiche
- [ ] Le capital social s'affiche formaté (ex: 1 000 000 FCFA)
- [ ] L'adresse du siège social s'affiche

**Représentant légal :**
- [ ] Le prénom s'affiche
- [ ] Le nom s'affiche
- [ ] L'email s'affiche
- [ ] Le téléphone s'affiche
- [ ] L'adresse s'affiche

**Documents soumis :**
- [ ] La liste des documents uploadés s'affiche
- [ ] Chaque document affiche son nom, type et date d'upload
- [ ] Le bouton "Télécharger" s'affiche pour chaque document
- [ ] Si aucun document, le message "Aucun document soumis" s'affiche

**Déclaration sur l'honneur :**
- [ ] Si `company.useHonorDeclaration === true`, l'alerte bleue s'affiche
- [ ] Le message indique que le client utilise une déclaration sur l'honneur

**Chronologie :**
- [ ] La date de création du dossier s'affiche au bon format français
- [ ] La date de dernière mise à jour s'affiche

### Test 1.4 : Fermeture de la modale
- [ ] Le bouton "Fermer" fonctionne
- [ ] Le bouton X en haut à droite fonctionne
- [ ] Cliquer à l'extérieur de la modale la ferme
- [ ] L'animation de fermeture est fluide

---

## ✅ Tests Étape 2 : Examen du dossier

### Test 2.1 : Affichage de l'étape
- [ ] L'étape 2 s'affiche avec le titre "Examen du dossier"
- [ ] La description indique "Vérification et validation des documents"
- [ ] L'icône `Eye` s'affiche
- [ ] Le statut est "En cours" (bleu) par défaut

### Test 2.2 : Validation des documents
- [ ] Le bouton "Valider les documents" s'affiche si des documents ne sont pas validés
- [ ] La modale de validation s'ouvre au clic
- [ ] Chaque document peut être validé individuellement
- [ ] Le bouton "Valider" marque le document comme validé (vert)
- [ ] Le bouton "Rejeter" affiche un champ de motif
- [ ] Le rejet d'un document affiche une notification
- [ ] Une fois tous les documents validés, l'action admin affiche "Documents validés ✓"

---

## ✅ Tests Étape 3 : Devis d'immatriculation

### Test 3.1 : Affichage de l'étape
- [ ] L'étape 3 s'affiche avec le titre "Devis d'immatriculation"
- [ ] La description indique "Création et envoi du devis"
- [ ] L'icône `DollarSign` s'affiche

### Test 3.2 : Création du devis
- [ ] Le bouton "Créer le devis" s'affiche si le devis n'est pas encore envoyé
- [ ] La modale de création du devis s'ouvre au clic
- [ ] Les champs du formulaire sont pré-remplis avec les valeurs par défaut
- [ ] Le total se calcule automatiquement
- [ ] Le bouton "Envoyer au client" envoie le devis
- [ ] Une notification de succès s'affiche
- [ ] Après envoi, l'action admin affiche "Devis envoyé ✓"

### Test 3.3 : États côté client
- [ ] Si le devis n'est pas envoyé : "En attente du devis"
- [ ] Si le devis est envoyé mais pas validé : "Devis reçu"
- [ ] Si le devis est validé : "Devis validé ✓"

---

## ✅ Tests Étape 4 : Validation devis

### Test 4.1 : Affichage de l'étape
- [ ] L'étape 4 s'affiche avec le titre "Validation devis"
- [ ] La description indique "Validation du devis par le client"
- [ ] L'icône `ClipboardCheck` s'affiche

### Test 4.2 : Statut bloqué
- [ ] Si le devis n'est pas validé, le statut est "Bloqué" (orange)
- [ ] L'alerte orange s'affiche : "En attente du client"
- [ ] Le message indique que le client doit valider le devis
- [ ] Aucun bouton d'action n'est disponible pour l'admin

### Test 4.3 : Déblocage après validation
- [ ] Dès que le devis est validé, le statut passe à "Complété" (vert)
- [ ] L'action admin affiche "Devis validé par le client ✓"
- [ ] L'action client affiche "Devis validé ✓"
- [ ] L'alerte orange disparaît

---

## ✅ Tests Étape 5 : Libération du capital

### Test 5.1 : Affichage de l'étape
- [ ] L'étape 5 s'affiche avec le titre "Libération du capital"
- [ ] La description indique "Versement du capital social"
- [ ] L'icône `Landmark` s'affiche

### Test 5.2 : Statut bloqué si devis non validé
- [ ] Si le devis n'est pas validé, le statut est "Bloqué" (orange)
- [ ] L'alerte orange s'affiche : "En attente du client"
- [ ] Le message indique que le client doit d'abord valider le devis

### Test 5.3 : Déblocage après validation du devis
- [ ] Dès que le devis est validé, le statut passe à "En attente" (gris)
- [ ] L'action admin affiche "Attendre la confirmation de paiement"
- [ ] Aucune action bloquée, l'étape est accessible

---

## ✅ Tests Étape 6 : Validation statuts

### Test 6.1 : Affichage de l'étape
- [ ] L'étape 6 s'affiche avec le titre "Validation statuts"
- [ ] La description indique "Génération et validation des statuts"
- [ ] L'icône `FileCheck` s'affiche

### Test 6.2 : Génération des statuts
- [ ] Le bouton "Générer les statuts V1" s'affiche
- [ ] La modale d'upload s'ouvre
- [ ] Zone d'upload pour les statuts PDF
- [ ] Bouton "Prévisualiser" pour la déclaration sur l'honneur
- [ ] Bouton "Envoyer au client" envoie les statuts
- [ ] Notification de succès
- [ ] L'action admin affiche "Statuts V1 envoyés"

### Test 6.3 : Rejet et correction des statuts
- [ ] Bouton de simulation "Client rejette statuts" disponible (DEV)
- [ ] Après rejet, l'alerte orange s'affiche avec le motif
- [ ] Le bouton change en "Corriger et envoyer V2"
- [ ] La version incrémente correctement (V1 → V2 → V3...)

### Test 6.4 : Validation des statuts
- [ ] Bouton de simulation "Client valide statuts" disponible (DEV)
- [ ] Après validation, l'action client affiche "Statuts validés ✓"
- [ ] Options de signature s'activent (RV ou signature en ligne)

### Test 6.5 : Rendez-vous physique
- [ ] Bouton de simulation "Client demande RV" disponible (DEV)
- [ ] L'alerte bleue s'affiche avec la date et le créneau
- [ ] Le bouton "Valider le RV" apparaît
- [ ] La modale de validation du RV s'ouvre
- [ ] Boutons "Rejeter" et "Confirmer" fonctionnent
- [ ] Après confirmation, l'action admin affiche "RV confirmé ✓"

### Test 6.6 : Signature en ligne
- [ ] Bouton de simulation "Client signe en ligne" disponible (DEV)
- [ ] L'alerte verte s'affiche avec les documents signés
- [ ] L'action admin affiche "Signatures reçues ✓"

---

## ✅ Tests Étape 7 : Signature et finalisation

### Test 7.1 : Affichage de l'étape
- [ ] L'étape 7 s'affiche avec le titre "Signature et finalisation"
- [ ] La description indique "Signature finale et documents officiels"
- [ ] L'icône `PenTool` s'affiche

### Test 7.2 : Finalisation de la société
- [ ] Le bouton "Finaliser la société" apparaît après signature (RV ou en ligne)
- [ ] La modale de finalisation s'ouvre
- [ ] Alerte verte confirme la signature effectuée
- [ ] 4 boutons d'upload pour les documents officiels :
  - [ ] RCCM
  - [ ] Statuts signés
  - [ ] NINEA
  - [ ] Dépôt capital
- [ ] Au clic sur chaque bouton, le document s'ajoute à la liste
- [ ] Le bouton "Finaliser la société" est désactivé si aucun document uploadé
- [ ] Après upload d'au moins 1 document, le bouton s'active
- [ ] Au clic sur "Finaliser la société", une notification de succès s'affiche
- [ ] L'action admin affiche "Documents officiels uploadés ✓"
- [ ] L'action client affiche "Société créée ✓"

---

## ✅ Tests Généraux

### Test G.1 : Header du workflow
- [ ] Le titre "Workflow de traitement du dossier" s'affiche
- [ ] L'étape actuelle s'affiche : "Étape X/7 - Titre"
- [ ] La date de soumission du dossier s'affiche : "Dossier soumis le ..."
- [ ] La progression en pourcentage s'affiche et se calcule correctement

### Test G.2 : Boutons de simulation (DEV)
- [ ] Le bandeau jaune "Mode développement" s'affiche
- [ ] Tous les boutons de simulation fonctionnent :
  - [ ] ✓ Client valide statuts
  - [ ] ✗ Client rejette statuts
  - [ ] 📅 Client demande RV
  - [ ] ✍️ Client signe en ligne

### Test G.3 : Navigation entre étapes
- [ ] Toutes les étapes s'affichent dans l'ordre
- [ ] Les cartes d'étapes ont une animation d'entrée progressive
- [ ] Au hover, la carte a un effet shadow

### Test G.4 : Responsive
- [ ] Sur mobile, les modales s'affichent correctement
- [ ] Les grids (2 colonnes) passent en 1 colonne sur mobile
- [ ] Les boutons restent accessibles
- [ ] Le scroll vertical fonctionne dans les modales

### Test G.5 : Couleurs et design
- [ ] La palette Crésus est respectée :
  - [ ] Bleu nuit #1A2753
  - [ ] Or impérial #D6A93A
  - [ ] Bleu acier #273A7A
  - [ ] Gris perle #F5F6FA
- [ ] Les états de couleur sont corrects :
  - [ ] Vert = Complété
  - [ ] Bleu = En cours
  - [ ] Orange = Bloqué / En attente
  - [ ] Gris = Pas encore commencé

---

## 🧪 Scénarios de test complets

### Scénario 1 : Parcours nominal complet
1. [ ] Ouvrir un dossier d'entreprise depuis l'admin
2. [ ] **Étape 1** : Cliquer sur "Consulter le dossier complet"
3. [ ] Vérifier que toutes les informations s'affichent
4. [ ] Fermer la modale
5. [ ] **Étape 2** : Cliquer sur "Valider les documents"
6. [ ] Valider tous les documents un par un
7. [ ] Vérifier que l'action admin passe à "Documents validés ✓"
8. [ ] **Étape 3** : Cliquer sur "Créer le devis"
9. [ ] Remplir le formulaire et envoyer
10. [ ] Vérifier la notification de succès
11. [ ] **Étape 4** : Vérifier que l'étape est bloquée
12. [ ] (Simulation) Valider le devis côté client
13. [ ] Vérifier que l'étape 4 se débloque
14. [ ] **Étape 5** : Vérifier que l'étape est débloquée
15. [ ] **Étape 6** : Générer et envoyer les statuts
16. [ ] (Simulation) Client valide les statuts
17. [ ] (Simulation) Client signe en ligne
18. [ ] **Étape 7** : Finaliser la société
19. [ ] Uploader tous les documents officiels
20. [ ] Cliquer sur "Finaliser la société"
21. [ ] Vérifier la notification finale

### Scénario 2 : Parcours avec rejet de statuts
1. [ ] Arriver à l'étape 6
2. [ ] Générer et envoyer les statuts V1
3. [ ] (Simulation) Client rejette les statuts
4. [ ] Vérifier l'alerte orange avec le motif de rejet
5. [ ] Cliquer sur "Corriger et envoyer V2"
6. [ ] Renvoyer les statuts V2
7. [ ] (Simulation) Client valide les statuts V2
8. [ ] Continuer jusqu'à la finalisation

### Scénario 3 : Parcours avec RV physique
1. [ ] Arriver à l'étape 6 avec statuts validés
2. [ ] (Simulation) Client demande RV
3. [ ] Vérifier l'alerte bleue avec date et créneau
4. [ ] Cliquer sur "Valider le RV"
5. [ ] Confirmer le rendez-vous
6. [ ] Vérifier que l'action admin affiche "RV confirmé ✓"
7. [ ] Continuer vers l'étape 7

---

## 📊 Checklist de validation finale

### Fonctionnel
- [ ] Toutes les étapes s'affichent correctement
- [ ] Toutes les modales s'ouvrent et se ferment
- [ ] Tous les boutons d'action fonctionnent
- [ ] Les notifications apparaissent au bon moment
- [ ] Les blocages et déblocages fonctionnent
- [ ] Les simulations DEV fonctionnent

### UX/UI
- [ ] Les animations sont fluides
- [ ] Les couleurs sont cohérentes
- [ ] Le design est responsive
- [ ] Les textes sont lisibles
- [ ] Les icônes sont appropriées

### Données
- [ ] Toutes les données de l'entreprise s'affichent
- [ ] Les dates sont au bon format français
- [ ] Les montants FCFA sont formatés
- [ ] Les statuts se mettent à jour correctement

### Performance
- [ ] Les modales s'ouvrent rapidement
- [ ] Le scroll est fluide
- [ ] Pas de lag sur les animations
- [ ] Les images/icônes se chargent bien

---

## 🐛 Bugs connus à vérifier

- [ ] Vérifier que les fragments React sont bien remplacés par des éléments HTML
- [ ] Vérifier qu'il n'y a pas d'erreurs de console
- [ ] Vérifier que les types TypeScript sont corrects
- [ ] Vérifier que les imports sont tous présents

---

## 📝 Rapport de test

**Testé par :** _________________  
**Date :** _________________  
**Environnement :** _________________

**Nombre de tests réussis :** _____ / _____  
**Nombre de bugs trouvés :** _____

**Commentaires :**
________________________________________________________________
________________________________________________________________
________________________________________________________________

**Validation finale :** ✅ Approuvé / ❌ Refusé
