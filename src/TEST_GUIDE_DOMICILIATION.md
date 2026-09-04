# 🧪 Guide de Test - Module Domiciliation

**Date**: 10 décembre 2024  
**Module**: Domiciliation d'Entreprise  
**Versions**: Mobile + Web + Admin

---

## 🎯 Objectif

Vérifier que le module de domiciliation fonctionne correctement sur toutes les interfaces (mobile, web, admin) et que tous les parcours utilisateur se déroulent sans erreur.

---

## 📱 Tests Mobile

### Test 1 : Accès au module
```
✓ Ouvrir l'application mobile
✓ Cliquer sur "Domiciliation" dans le dashboard
✓ Vérifier que la page s'ouvre correctement
✓ Vérifier le header avec gradient bleu
✓ Vérifier la barre de progression (5 étapes)
```

**Résultat attendu** :
- ✅ Page chargée avec header "Domiciliation"
- ✅ Sous-titre "Choisissez votre adresse"
- ✅ 4 offres affichées avec photos et prix
- ✅ Animation d'entrée fluide

---

### Test 2 : Sélection d'une offre
```
✓ Cliquer sur "Plateau Business Center"
✓ Vérifier l'affichage des détails
✓ Scroll pour voir tous les services
✓ Vérifier les équipements (tags)
✓ Vérifier capacité et disponibilité
✓ Cliquer sur "Continuer"
```

**Résultat attendu** :
- ✅ Transition fluide vers détails offre
- ✅ Tous les services listés avec checkmarks verts
- ✅ Tags des équipements visibles
- ✅ Capacité : 50 courriers/mois
- ✅ Disponibilité : 45 places
- ✅ Bouton "Continuer" fonctionnel

---

### Test 3 : Choix de la période
```
✓ Vérifier l'affichage des 3 options
✓ Vérifier les prix affichés
✓ Vérifier les badges de remise (10%, 20%)
✓ Cliquer sur "Annuel"
✓ Vérifier le calcul du prix
✓ Vérifier l'alerte dépôt de garantie
```

**Résultat attendu** :
- ✅ Mensuel : 50 000 FCFA
- ✅ Trimestriel : 135 000 FCFA (badge -10%)
- ✅ Annuel : 480 000 FCFA (badge -20%)
- ✅ Alerte bleue pour dépôt 50 000 FCFA
- ✅ Sélection visuelle (border doré)
- ✅ Transition automatique vers étape documents

---

### Test 4 : Upload documents
```
✓ Vérifier la liste des documents
✓ Vérifier les badges "Optionnel"
✓ Cliquer sur le bouton upload CNI
✓ Vérifier le changement de statut
✓ Cliquer sur le bouton upload Statuts
✓ Vérifier que "Continuer" se débloque
✓ Cliquer sur "Continuer"
```

**Résultat attendu** :
- ✅ 2 docs obligatoires (CNI, Statuts)
- ✅ 1 doc optionnel (RC)
- ✅ Bouton upload devient checkmark vert
- ✅ Texte passe de "En attente" à "Téléversé"
- ✅ Border vert autour du doc uploadé
- ✅ Bouton "Continuer" activé après 2 uploads
- ✅ Transition vers révision contrat

---

### Test 5 : Révision du contrat
```
✓ Vérifier l'aperçu du contrat
✓ Cliquer sur "Voir" pour modal complet
✓ Scroll dans le modal pour lire
✓ Fermer le modal
✓ Cliquer sur "Télécharger"
✓ Ajouter un commentaire
✓ Cliquer sur "Valider"
```

**Résultat attendu** :
- ✅ Aperçu du contrat visible (6 lignes)
- ✅ Période, Montant, Services affichés
- ✅ Modal s'ouvre en bottom sheet
- ✅ Contrat complet avec tous les articles
- ✅ Fermeture du modal fluide
- ✅ Commentaire enregistré
- ✅ Transition vers paiement

---

### Test 6 : Paiement
```
✓ Vérifier le récapitulatif
✓ Vérifier le calcul total
✓ Vérifier les 3 méthodes de paiement
✓ Sélectionner "Orange Money"
✓ Cliquer sur "Confirmer le paiement"
✓ Attendre le loader (2 secondes)
```

**Résultat attendu** :
- ✅ Période : Annuel
- ✅ Montant : 480 000 FCFA
- ✅ Dépôt : 50 000 FCFA
- ✅ Total : 530 000 FCFA
- ✅ 3 cartes méthodes (Orange, Wave, Carte)
- ✅ Loader avec animation rotation
- ✅ Transition vers confirmation

---

### Test 7 : Confirmation
```
✓ Vérifier l'icône de succès
✓ Vérifier le message de confirmation
✓ Vérifier le récapitulatif
✓ Cliquer sur "Contrat"
✓ Cliquer sur "Quittance"
✓ Cliquer sur "Retour au tableau de bord"
```

**Résultat attendu** :
- ✅ Icône verte checkmark animée
- ✅ Titre "Domiciliation confirmée !"
- ✅ Message explicatif
- ✅ Récapitulatif complet
- ✅ Boutons de téléchargement fonctionnels
- ✅ Retour au dashboard

---

### Test 8 : Rejet du contrat
```
✓ Arriver à l'étape "Révision du contrat"
✓ Cliquer sur "Rejeter"
✓ Vérifier l'ouverture du modal de rejet
✓ Sélectionner "Tarifs trop élevés"
✓ Ajouter un commentaire personnalisé
✓ Cliquer sur "Confirmer le rejet"
```

**Résultat attendu** :
- ✅ Modal de rejet s'ouvre
- ✅ Liste de 6 raisons pré-définies
- ✅ Option "Autre (précisez)" disponible
- ✅ Zone de commentaire visible
- ✅ Retour à l'étape "Liste des offres"
- ✅ Possibilité de recommencer

---

### Test 9 : Navigation arrière
```
✓ Commencer un parcours
✓ Avancer jusqu'à l'étape 3
✓ Cliquer sur le bouton retour (ArrowLeft)
✓ Vérifier retour à l'étape 2
✓ Cliquer encore sur retour
✓ Vérifier retour à l'étape 1
✓ Cliquer sur retour
✓ Vérifier retour au dashboard
```

**Résultat attendu** :
- ✅ Navigation arrière fluide
- ✅ État préservé (sélections gardées)
- ✅ Animations de sortie/entrée
- ✅ Aucune perte de données
- ✅ Retour final au dashboard

---

### Test 10 : Responsive mobile
```
✓ Tester sur iPhone (375px)
✓ Tester sur Android standard (360px)
✓ Tester sur grand écran (428px)
✓ Vérifier le scroll vertical
✓ Vérifier que rien ne dépasse
```

**Résultat attendu** :
- ✅ Tout le contenu visible
- ✅ Pas de scroll horizontal
- ✅ Textes lisibles
- ✅ Boutons accessibles
- ✅ Header fixe en haut

---

## 💻 Tests Web

### Test 11 : Interface web desktop
```
✓ Ouvrir la version web (≥768px)
✓ Naviguer vers Domiciliation
✓ Refaire le parcours complet
✓ Vérifier le layout 2 colonnes
✓ Vérifier les hovers sur cards
✓ Tester les modals
```

**Résultat attendu** :
- ✅ Layout adapté au desktop
- ✅ Cartes plus larges
- ✅ Effets hover visibles
- ✅ Modals centrés
- ✅ Texte plus lisible
- ✅ Animations fluides

---

### Test 12 : Comparaison mobile/web
```
✓ Ouvrir mobile et web côte à côte
✓ Vérifier cohérence des prix
✓ Vérifier cohérence des textes
✓ Vérifier cohérence des couleurs
✓ Vérifier cohérence des fonctionnalités
```

**Résultat attendu** :
- ✅ Prix identiques
- ✅ Même contenu
- ✅ Palette Crésus respectée
- ✅ Toutes les fonctionnalités présentes
- ✅ UX adaptée à chaque plateforme

---

## 🔧 Tests Admin

### Test 13 : Dashboard admin
```
✓ Se connecter en admin
✓ Naviguer vers "Domiciliation"
✓ Vérifier les métriques
✓ Vérifier les graphiques
✓ Vérifier la liste des contrats
```

**Résultat attendu** :
- ✅ Métriques affichées (contrats, revenus, etc.)
- ✅ Graphiques visuels
- ✅ Liste des contrats
- ✅ Filtres fonctionnels
- ✅ Actions rapides disponibles

---

### Test 14 : Gestion des offres (admin)
```
✓ Aller dans "Gestion des offres"
✓ Cliquer sur "Nouvelle offre"
✓ Remplir le formulaire
✓ Sauvegarder
✓ Vérifier la création
✓ Modifier une offre existante
✓ Suspendre une offre
✓ Réactiver une offre
```

**Résultat attendu** :
- ✅ Formulaire de création complet
- ✅ Validation des champs
- ✅ Offre créée visible dans la liste
- ✅ Modification possible
- ✅ Suspension change le statut
- ✅ Offre suspendue invisible côté client

---

### Test 15 : Gestion des contrats (admin)
```
✓ Voir un contrat "sent"
✓ Valider les documents
✓ Générer le contrat
✓ L'envoyer au client
✓ Voir un contrat "validated"
✓ Le marquer comme "signed"
✓ L'activer
```

**Résultat attendu** :
- ✅ Documents visibles
- ✅ Validation doc par doc
- ✅ Génération PDF
- ✅ Envoi notification client
- ✅ Changements d'état fluides
- ✅ Historique des actions enregistré

---

### Test 16 : Gestion des paiements (admin)
```
✓ Voir la liste des paiements
✓ Filtrer par "En retard"
✓ Envoyer un rappel
✓ Voir un paiement "paid"
✓ Télécharger la quittance
✓ Voir l'historique de paiement d'un contrat
```

**Résultat attendu** :
- ✅ Liste complète des paiements
- ✅ Filtres fonctionnels
- ✅ Badge rouge pour retards
- ✅ Rappels envoyés (email/SMS)
- ✅ Quittance téléchargeable
- ✅ Historique complet

---

## 🔍 Tests Edge Cases

### Test 17 : Offre sans places disponibles
```
✓ Admin : Mettre available = 0 sur une offre
✓ Client mobile : Voir la liste des offres
✓ Vérifier que l'offre est grisée
✓ Essayer de la sélectionner
```

**Résultat attendu** :
- ✅ Offre visible mais grisée
- ✅ Badge "Complet" ou "0 place"
- ✅ Non cliquable
- ✅ Message d'info si tentative de clic

---

### Test 18 : Upload document déjà uploadé
```
✓ Uploader un document
✓ Revenir en arrière
✓ Revenir sur documents
✓ Vérifier que le doc est toujours marqué "Téléversé"
✓ Re-uploader le même doc
```

**Résultat attendu** :
- ✅ État préservé
- ✅ Document toujours "Téléversé"
- ✅ Possibilité de remplacer
- ✅ Confirmation de remplacement

---

### Test 19 : Connexion perdue pendant paiement
```
✓ Arriver à l'étape paiement
✓ Simuler déconnexion réseau
✓ Cliquer sur "Confirmer"
✓ Vérifier le message d'erreur
```

**Résultat attendu** :
- ✅ Message d'erreur clair
- ✅ Possibilité de réessayer
- ✅ Données non perdues
- ✅ Retour au paiement

---

### Test 20 : Période déjà expirée
```
✓ Admin : Créer un contrat avec endDate passée
✓ Vérifier le statut "expired"
✓ Vérifier la couleur grise
✓ Vérifier l'action "Renouveler"
```

**Résultat attendu** :
- ✅ Statut "Expiré" visible
- ✅ Badge gris
- ✅ Bouton "Renouveler" affiché
- ✅ Workflow de renouvellement fonctionnel

---

## 📊 Tests de Performance

### Test 21 : Chargement initial
```
✓ Ouvrir DevTools (Performance)
✓ Charger la page Domiciliation
✓ Mesurer le temps de chargement
✓ Vérifier les animations
```

**Critères de succès** :
- ⏱️ First Contentful Paint < 1s
- ⏱️ Time to Interactive < 2s
- ✅ Animations fluides 60fps
- ✅ Pas de lag au scroll

---

### Test 22 : Navigation rapide
```
✓ Naviguer rapidement entre les étapes
✓ Cliquer plusieurs fois sur "Retour"
✓ Cliquer plusieurs fois sur "Continuer"
✓ Vérifier l'absence de bugs
```

**Critères de succès** :
- ✅ Pas de double soumission
- ✅ Débounce sur les boutons
- ✅ État cohérent
- ✅ Pas de crash

---

## 🎨 Tests Visuels

### Test 23 : Palette de couleurs
```
✓ Vérifier que tous les éléments utilisent la palette Crésus
✓ Vérifier les gradients
✓ Vérifier les ombres
✓ Vérifier la lisibilité
```

**Palette attendue** :
- 🔵 Bleu nuit : #1A2753
- 🟡 Or impérial : #D6A93A
- 🔷 Bleu acier : #273A7A
- ⚪ Blanc : #FFFFFF
- ⚫ Gris perle : #F5F6FA

---

### Test 24 : Animations
```
✓ Vérifier les transitions entre étapes
✓ Vérifier l'animation du loader
✓ Vérifier l'animation de succès
✓ Vérifier les hovers
✓ Vérifier les tap effects
```

**Résultat attendu** :
- ✅ Transitions fluides (300ms)
- ✅ Loader rotation infinie
- ✅ Success checkmark scale spring
- ✅ Hovers subtils
- ✅ Tap scale 0.98

---

## ✅ Checklist Finale

### Fonctionnel
- [ ] ✅ Toutes les étapes accessibles
- [ ] ✅ Navigation avant/arrière
- [ ] ✅ Upload documents
- [ ] ✅ Validation contrat
- [ ] ✅ Rejet contrat
- [ ] ✅ Paiement simulé
- [ ] ✅ Confirmation affichée
- [ ] ✅ Retour dashboard

### UX/UI
- [ ] ✅ Design cohérent
- [ ] ✅ Palette Crésus respectée
- [ ] ✅ Animations fluides
- [ ] ✅ Textes lisibles
- [ ] ✅ Icônes appropriées
- [ ] ✅ Responsive mobile
- [ ] ✅ Responsive web

### Admin
- [ ] ✅ Dashboard fonctionnel
- [ ] ✅ Gestion offres
- [ ] ✅ Gestion contrats
- [ ] ✅ Gestion paiements
- [ ] ✅ Audit trail
- [ ] ✅ Notifications

### Technique
- [ ] ✅ Pas d'erreurs console
- [ ] ✅ Pas de warnings React
- [ ] ✅ Types TypeScript OK
- [ ] ✅ Performance acceptable
- [ ] ✅ Gestion erreurs
- [ ] ✅ Accessibilité

---

## 🐛 Bugs connus

| # | Description | Priorité | Statut |
|---|-------------|----------|--------|
| - | Aucun bug connu | - | ✅ |

---

## 📝 Notes de test

### Environnement de test
```
- Browser : Chrome 120+, Safari 17+, Firefox 121+
- Résolution mobile : 360x800, 375x812, 428x926
- Résolution web : 1920x1080, 1440x900
- OS : iOS 17+, Android 13+, macOS, Windows 11
```

### Données de test
```typescript
// Offres mock disponibles
mockDomiciliationOffers (4 offres)
├── dom-1 : Plateau Business Center (50K)
├── dom-2 : Almadies Corporate Hub (75K)
├── dom-3 : Mermoz Tech Park (60K)
└── dom-4 : Point E Business Center (35K)
```

---

## 🚀 Validation finale

**Testé par** : _________________  
**Date** : _________________  
**Signature** : _________________

**Status** : 🟢 Approuvé / 🔴 À corriger

---

**Version** : 1.0  
**Dernière mise à jour** : 10 décembre 2024
