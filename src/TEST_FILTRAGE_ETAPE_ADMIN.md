# Guide de Test - Filtrage Intelligent par Étape (Admin Modifications)

## 🎯 Objectif
Tester le système de filtrage intelligent qui affiche uniquement les éléments pertinents pour chaque étape du workflow des modifications statutaires.

## 🚀 Démarrage Rapide

### 1. Accéder à l'interface Admin
```
1. Ouvrir l'application
2. Se connecter en tant qu'admin
3. Naviguer vers "Modifications post-statutaires"
```

### 2. Vue Overview (Aperçu)
Cette vue affiche les statistiques globales.

**✓ Points à vérifier :**
- [ ] Carte "Demandes totales" affiche le bon nombre
- [ ] Carte "En attente" affiche la somme de (submitted + waiting_quote + quote_sent + in_review)
- [ ] Carte "Docs prêts" affiche le nombre de demandes en status `documents_ready`
- [ ] Carte "Finalisés" affiche la somme de (signed + completed)

**📝 Statistiques attendues avec les données de test :**
- Total : 7 demandes
- En attente : 4 (mod-1: in_review, mod-2: waiting_quote, mod-5: quote_sent, mod-6: quote_validated)
- Docs prêts : 1 (mod-3)
- Finalisés : 2 (mod-4: signed, aucun completed)

## 📋 Scénarios de Test par Étape

### Scénario 1 : Étape "Waiting Quote" (Attente devis)
**Demande de test** : mod-2 (Augmentation du capital - Baobab Tech SA)

**Accès** :
1. Vue Overview → "Gérer les demandes"
2. Cliquer sur la demande "Baobab Tech SA"

**✓ Vérifications** :
- [ ] Badge de statut affiche "Attente devis" (orange)
- [ ] Timeline : Étape 2 "Établissement devis" est active (icône Clock)
- [ ] **Documents** :
  - [ ] Seuls les documents client sont visibles
  - [ ] Filtres affichés : "Tous" et "Client" uniquement
  - [ ] Pas de filtre "Modification" ou "Officiels"
  - [ ] Bouton "Ajouter un document" est ABSENT
- [ ] **Actions disponibles** :
  - [ ] Bouton "Message" présent
  - [ ] Bouton "Passer à l'étape suivante" présent

**Aide contextuelle attendue** (⏳ à implémenter) :
```
🟠 Action requise : Établir le devis
Le client a soumis sa demande de modification. Examinez les 
documents fournis et établissez un devis d'immatriculation détaillé.
```

---

### Scénario 2 : Étape "Quote Sent" (Devis envoyé)
**Demande de test** : mod-5 (Modification objet social - Keur Gui SARL)

**Accès** :
1. Vue Requests → Chercher "Keur Gui"
2. Cliquer sur la demande

**✓ Vérifications** :
- [ ] Badge de statut affiche "Devis envoyé" (bleu)
- [ ] Timeline : Étape 3 "Devis envoyé" est active (icône Send)
- [ ] **Documents** :
  - [ ] Seuls les documents client sont visibles
  - [ ] Filtres : "Tous" et "Client" uniquement
  - [ ] Bouton "Ajouter un document" est ABSENT
- [ ] **Informations du devis** (⏳ à implémenter) :
  - [ ] Section "Devis d'immatriculation" affichée
  - [ ] Montant : 125 000 FCFA
  - [ ] Détails : "Modification statuts + Formalités APIX + Publication légale"
  - [ ] Valide jusqu'au : 20/11/2024

**Aide contextuelle attendue** (⏳ à implémenter) :
```
🔵 En attente de la validation du client
Le devis a été envoyé au client. Il examinera la proposition 
et la validera ou la rejettera.
```

---

### Scénario 3 : Étape "Quote Validated" (Devis validé)
**Demande de test** : mod-6 (Transfert siège - Ngor Solutions SA)

**Accès** :
1. Vue Requests → Chercher "Ngor Solutions"
2. Cliquer sur la demande

**✓ Vérifications** :
- [ ] Badge de statut affiche "Devis validé" (vert)
- [ ] Timeline : Étape 4 "Devis validé" est active (icône ThumbsUp)
- [ ] **Documents** :
  - [ ] Documents client ET admin sont visibles
  - [ ] Filtres : "Tous", "Client", ET "Modification" affichés
  - [ ] Pas de filtre "Officiels" (pas encore)
  - [ ] Bouton "Ajouter un document" est PRÉSENT ✨
- [ ] **Informations du devis** (⏳ à implémenter) :
  - [ ] Section "Devis d'immatriculation" affichée
  - [ ] Montant : 95 000 FCFA
  - [ ] Détails : "Transfert siège social + Mise à jour RC/NINEA"
  - [ ] Valide jusqu'au : 25/11/2024

**Test d'ajout de document** :
1. Cliquer sur "Ajouter un document"
2. Dans le dropdown, vérifier les options disponibles :
   - [ ] Section "Documents de modification (à valider)" visible
   - [ ] Section "Documents officiels finaux" visible
3. Sélectionner "Statuts modifiés (brouillon)"
4. Ajouter un commentaire : "Première version des statuts modifiés"
5. Cliquer "Ajouter le document"
6. Vérifier que le document apparaît dans la liste avec :
   - [ ] Type : "Statuts modifiés (brouillon)"
   - [ ] Statut : "À valider client" (badge purple)
   - [ ] Uploadé par : "admin"
   - [ ] Bouton "Nouvelle version" présent

---

### Scénario 4 : Étape "Quote Rejected" (Devis rejeté)
**Demande de test** : mod-7 (Changement de gérant - Dakar Services SARL)

**Accès** :
1. Vue Requests → Chercher "Dakar Services"
2. Cliquer sur la demande

**✓ Vérifications** :
- [ ] Badge de statut affiche "Devis rejeté" (rouge)
- [ ] Timeline : Étape "Quote Rejected" n'apparaît PAS dans la timeline standard
  - Note : C'est un état transitoire, pas une étape linéaire
- [ ] **Documents** :
  - [ ] Seuls les documents client sont visibles
  - [ ] Bouton "Ajouter un document" est ABSENT
- [ ] **Informations du devis** (⏳ à implémenter) :
  - [ ] Section "Devis d'immatriculation" affichée
  - [ ] Montant : 110 000 FCFA
- [ ] **Commentaires du rejet** (⏳ à implémenter) :
  - [ ] Section affichant les commentaires du client
  - [ ] Texte : "Le prix est trop élevé. Pouvez-vous revoir à la baisse ou proposer un échelonnement du paiement ?"
  - [ ] Style visuel distinctif (fond rouge, bordure rouge)

**Aide contextuelle attendue** (⏳ à implémenter) :
```
🔴 Devis rejeté par le client
Le client a rejeté le devis. Examinez ses commentaires et proposez une révision :

"Le prix est trop élevé. Pouvez-vous revoir à la baisse ou 
proposer un échelonnement du paiement ?"
```

**Actions attendues** (⏳ à implémenter) :
- [ ] Bouton "Réviser le devis" présent
- [ ] Bouton "Message" présent

---

### Scénario 5 : Étape "In Review" (En révision)
**Demande de test** : mod-1 (Transfert siège - Teranga Digital SARL)

**Accès** :
1. Vue Requests → Chercher "Teranga Digital"
2. Cliquer sur la demande avec status "En révision"

**✓ Vérifications** :
- [ ] Badge de statut affiche "En révision" (purple)
- [ ] Timeline : Étape 5 "En révision" est active (icône Eye)
- [ ] **Documents** :
  - [ ] Documents client ET admin visibles
  - [ ] Filtres : "Tous", "Client", et "Modification"
  - [ ] Bouton "Ajouter un document" présent
- [ ] **Documents affichés** :
  - [ ] "Statuts modifiés - Nouveau siège" (admin, awaiting_validation)
  - [ ] "PV AGE - Transfert siège" (admin, awaiting_validation)
  - [ ] "CNI du nouveau gérant" (client, validated)

**Test de validation de document** :
1. Cliquer sur un document uploadé par le client
2. Cliquer "Examiner"
3. Vérifier que la modale s'ouvre
4. Ajouter un commentaire
5. Cliquer "Valider" ou "Refuser"
6. Vérifier que le statut du document change

---

### Scénario 6 : Étape "Documents Ready" (Documents prêts)
**Demande de test** : mod-3 (Nomination gérant - Teranga Digital SARL)

**Accès** :
1. Vue Requests → Chercher la demande en status "Docs prêts"
2. Cliquer dessus

**✓ Vérifications** :
- [ ] Badge de statut affiche "Docs prêts" (indigo)
- [ ] Timeline : Étape 6 "Docs de modification prêts" est active
- [ ] **Documents** :
  - [ ] Documents client ET admin visibles
  - [ ] Filtres : "Tous", "Client", et "Modification"
  - [ ] Bouton "Ajouter un document" présent
- [ ] **Actions** :
  - [ ] Bouton "Message" présent
  - [ ] Bouton "Passer à l'étape suivante" présent

---

### Scénario 7 : Étape "Signed" (Signé)
**Demande de test** : mod-4 (Modification objet social - Baobab Tech SA)

**Accès** :
1. Vue Requests → Chercher la demande en status "Signé"
2. Cliquer dessus

**✓ Vérifications** :
- [ ] Badge de statut affiche "Signé" (teal)
- [ ] Timeline : Étape 7 "Signé" est active (icône CheckCircle)
- [ ] **Documents** :
  - [ ] TOUS les types de documents visibles (client, admin, officiels)
  - [ ] Filtres : "Tous", "Client", "Modification", ET "Officiels" ✨
  - [ ] Bouton "Ajouter un document" présent
- [ ] **Documents affichés** :
  - [ ] "RC modifié" (admin, validated, official)
  - [ ] "NINEA mis à jour" (admin, validated, official)

**Test d'ajout de document officiel** :
1. Cliquer "Ajouter un document"
2. Vérifier que la section "Documents officiels finaux" est disponible :
   - [ ] RC modifié
   - [ ] NINEA mis à jour
   - [ ] Certificat de modification
   - [ ] KBIS modifié
3. Sélectionner "Certificat de modification"
4. Ajouter le document
5. Vérifier qu'il apparaît avec le badge "Officiel" (vert)

---

### Scénario 8 : Étape "Completed" (Complété)
**Demande de test** : Créer ou modifier une demande existante

**Simulation** :
1. Sélectionner mod-4 (Signed)
2. Cliquer "Passer à l'étape suivante"
3. Le statut devient "Complété"

**✓ Vérifications** :
- [ ] Badge de statut affiche "Complété" (emerald)
- [ ] Timeline : Étape 8 "Finalisé" est active (icône Building)
- [ ] **Documents** :
  - [ ] TOUS les documents visibles (documentsToShow: ['all'])
  - [ ] Tous les filtres disponibles
  - [ ] Bouton "Ajouter un document" est ABSENT (adminDocumentsAllowed: false)
- [ ] **Actions** :
  - [ ] Bouton "Message" présent
  - [ ] Bouton "Passer à l'étape suivante" ABSENT (dernière étape)

---

## 🔄 Tests de Transition d'Étapes

### Test 1 : Workflow Normal
```
submitted → waiting_quote → quote_sent → quote_validated → 
in_review → documents_ready → signed → completed
```

**Procédure** :
1. Créer une nouvelle demande (status: submitted)
2. Pour chaque transition :
   - Cliquer "Passer à l'étape suivante"
   - Vérifier que l'affichage se met à jour
   - Vérifier que les filtres de documents changent
   - Vérifier que le badge de statut change
   - Vérifier la timeline

**✓ Points critiques** :
- [ ] submitted → waiting_quote : Pas de changement dans les docs visibles (tous client)
- [ ] waiting_quote → quote_sent : Pas de changement (tous client)
- [ ] quote_sent → quote_validated : Nouveaux filtres apparaissent (admin devient visible)
- [ ] quote_validated → in_review : Continuité (client + admin)
- [ ] in_review → documents_ready : Pas de changement
- [ ] documents_ready → signed : Nouveau filtre "Officiels" apparaît
- [ ] signed → completed : Bouton "Ajouter" disparaît

### Test 2 : Workflow avec Rejet
```
submitted → waiting_quote → quote_sent → quote_rejected → 
waiting_quote → quote_sent → quote_validated → ...
```

**Procédure** :
1. Utiliser mod-7 (status: quote_rejected)
2. Simuler l'action "Réviser le devis" (⏳ à implémenter)
3. Le statut revient à waiting_quote
4. Continuer le workflow normal

---

## 📊 Tests de Filtrage Combiné

### Test Combinaison 1 : Étape + Filtre Utilisateur
**Contexte** : Étape `quote_validated` (docs: client + admin visibles)

**Tests** :
1. Sélectionner filtre "Tous"
   - [ ] Documents client ET admin affichés
2. Sélectionner filtre "Client"
   - [ ] Seuls les documents client affichés
3. Sélectionner filtre "Modification"
   - [ ] Seuls les documents admin (non-officiels) affichés
4. Essayer de sélectionner filtre "Officiels"
   - [ ] Ce filtre n'est PAS disponible à cette étape

### Test Combinaison 2 : Étape Restrictive
**Contexte** : Étape `waiting_quote` (docs: client uniquement)

**Tests** :
1. Vérifier filtres disponibles
   - [ ] "Tous" et "Client" uniquement
   - [ ] "Modification" et "Officiels" absents
2. Sélectionner "Tous"
   - [ ] Seuls les documents client s'affichent (car l'étape restreint)
3. Sélectionner "Client"
   - [ ] Même résultat (seuls docs client)

### Test Combinaison 3 : Étape Permissive
**Contexte** : Étape `completed` (docs: all)

**Tests** :
1. Vérifier filtres disponibles
   - [ ] Tous les filtres présents
2. Tester chaque filtre
   - [ ] "Tous" : Tous les documents
   - [ ] "Client" : Seulement client
   - [ ] "Modification" : Seulement admin non-officiels
   - [ ] "Officiels" : Seulement officiels

---

## 🐛 Tests de Cas Limites

### Cas 1 : Demande Sans Documents
**Procédure** :
1. Créer une demande sans aucun document
2. Accéder aux détails

**✓ Vérifications** :
- [ ] Message "Aucun document dans cette catégorie" affiché
- [ ] Filtres toujours affichés selon l'étape
- [ ] Bouton "Ajouter" affiché si l'étape le permet

### Cas 2 : Transition Rapide
**Procédure** :
1. Cliquer rapidement sur "Passer à l'étape suivante" 3 fois
2. Observer le comportement

**✓ Vérifications** :
- [ ] L'interface se met à jour à chaque fois
- [ ] Pas d'erreur JavaScript
- [ ] Les filtres changent correctement

### Cas 3 : Retour Arrière
**Procédure** :
1. Ouvrir une demande en détails
2. Cliquer "Retour"
3. Ouvrir une autre demande avec un statut différent

**✓ Vérifications** :
- [ ] Les filtres se réinitialisent correctement
- [ ] Pas de "fuite" de configuration entre demandes

---

## 📝 Checklist Globale

### Fonctionnalités Implémentées
- [x] Extension des types de statut
- [x] Constante `STEP_RELEVANT_ELEMENTS`
- [x] Fonction `getRelevantElements()`
- [x] Fonction `getStepFilteredDocs()`
- [x] Timeline avec 8 étapes
- [x] Labels et couleurs pour tous les statuts
- [x] Statistiques étendues
- [x] Données de test complètes

### Fonctionnalités À Implémenter
- [ ] Aide contextuelle par étape
- [ ] Section d'affichage du devis
- [ ] Filtres de documents conditionnels
- [ ] Bouton "Ajouter document" conditionnel
- [ ] Modale de création/envoi de devis
- [ ] Modale de révision de devis
- [ ] Actions contextuelles dans le header

---

## 🎨 Tests Visuels

### Couleurs des Badges de Statut
- [ ] waiting_quote : Orange (🟠)
- [ ] quote_sent : Bleu (🔵)
- [ ] quote_validated : Vert (🟢)
- [ ] quote_rejected : Rouge (🔴)
- [ ] in_review : Violet/Purple (🟣)
- [ ] documents_ready : Indigo (🔵)
- [ ] signed : Teal (🟦)
- [ ] completed : Emerald (🟩)

### Timeline
- [ ] Étapes complétées : Fond vert, icône verte
- [ ] Étape actuelle : Fond doré (#D6A93A), ombre, scale 110%
- [ ] Étapes futures : Fond gris, icône grisée
- [ ] Connecteurs : Verts si complétés, gris sinon

---

## 📋 Résumé des Résultats de Test

### Template de Rapport

```
Date du test : ___/___/_____
Testeur : _________________

Scénarios testés :
□ Scénario 1 : waiting_quote
□ Scénario 2 : quote_sent  
□ Scénario 3 : quote_validated
□ Scénario 4 : quote_rejected
□ Scénario 5 : in_review
□ Scénario 6 : documents_ready
□ Scénario 7 : signed
□ Scénario 8 : completed

Tests de transition :
□ Workflow normal
□ Workflow avec rejet

Tests de filtrage :
□ Combinaison étape + filtre
□ Étape restrictive
□ Étape permissive

Tests de cas limites :
□ Sans documents
□ Transition rapide
□ Retour arrière

Bugs identifiés :
1. ___________________
2. ___________________
3. ___________________

Améliorations suggérées :
1. ___________________
2. ___________________
3. ___________________

Statut global : □ Réussi  □ Réussi avec réserves  □ Échec
```

---

**Bonne chance pour les tests ! 🚀**
