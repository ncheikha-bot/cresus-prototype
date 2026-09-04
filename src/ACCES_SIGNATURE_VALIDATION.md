# 📍 Comment accéder à la Signature & Validation des documents

## 🎯 La fonctionnalité est maintenant accessible !

La fonctionnalité **Signature & Validation des documents** est désormais complètement intégrée et accessible depuis plusieurs endroits dans l'application.

---

## 📱 Version Mobile

### 1️⃣ Depuis le Dashboard (Écran principal)
- **Action rapide** en haut de la liste
- Badge rouge avec le nombre de documents en attente (3)
- Cliquez sur **"Signature & Validation"**

### 2️⃣ Depuis le menu Documents
- Accessible via la barre de navigation en bas (icône dossier)
- Bouton doré en haut **"Signature & Validation"**
- Badge indiquant "3 documents en attente"

### 3️⃣ Navigation rapide
Le composant `SignDocuments` est accessible via :
```
Dashboard → Signature & Validation
ou
Documents → Signature & Validation
```

### Fonctionnalités disponibles (Mobile)
✅ **Signer les documents** - Canvas tactile pour signature
✅ **Valider un document** - Après signature
✅ **Rejeter un document** - Avec commentaire obligatoire
✅ **Voir l'historique** - Toutes les versions et retours
✅ **Badges de statut** - Visuels clairs et colorés

---

## 💻 Version Web

### 1️⃣ Depuis le Dashboard
- **Carte de service** dédiée avec icône signature
- Badge rouge (3) en haut à droite de la carte
- Section "Nos services" → **"Signature & Validation"**
- Description : "Signez et validez vos documents légaux"

### 2️⃣ Depuis le menu latéral (Sidebar)
- Élément du menu **"Signature & Validation"**
- Icône signature (✍️)
- Badge rouge (3) visible même quand le menu est réduit

### 3️⃣ Navigation rapide
```
Dashboard → Signature & Validation (carte ou menu)
```

### Fonctionnalités disponibles (Web)
✅ **Signer les documents** - Canvas souris + option upload image
✅ **Valider un document** - Avec aperçu complet
✅ **Rejeter un document** - Commentaires détaillés
✅ **Voir l'historique** - Vue côte à côte versions/retours
✅ **Filtrer par statut** - En attente, validés, etc.
✅ **Télécharger** - Chaque version individuellement

---

## 👨‍💼 Version Admin

### Accès depuis le Dashboard Admin
- Menu latéral → **"Documents"**
- Icône grille (LayoutGrid)
- Compteur visible sur l'onglet "À corriger"

### Fonctionnalités Admin
✅ **Voir tous les documents clients**
✅ **Filtrer** - Tous / À corriger / En validation / Validés
✅ **Lire les retours clients** - Commentaires de rejet
✅ **Uploader nouvelle version** - Avec note de modification
✅ **Historique complet** - Versions et retours clients
✅ **Notifications** - Alertes pour actions requises

---

## 🔄 Flux complet d'utilisation

### Pour le client (Mobile/Web)

1. **Accéder** : Dashboard → Signature & Validation
   
2. **Voir les documents** :
   - Documents en attente de signature (jaune/amber)
   - Documents signés, en attente de validation (violet)
   - Documents validés (vert)
   - Documents en révision (orange)

3. **Signer un document** :
   - Cliquer sur un document en attente
   - Bouton "Signer"
   - Dessiner la signature
   - Valider

4. **Valider ou Rejeter** :
   - Cliquer sur un document signé
   - Bouton "Valider / Rejeter"
   - Pour validation : cliquer "Valider" (commentaire optionnel)
   - Pour rejet : ajouter commentaire + cliquer "Rejeter"

5. **Consulter l'historique** :
   - Bouton "Historique" sur chaque document
   - Voir toutes les versions
   - Voir tous les retours (validations/rejets)

### Pour l'admin

1. **Accéder** : Menu Admin → Documents

2. **Filtrer les urgences** :
   - Cliquer sur l'onglet "À corriger"
   - Voir les documents rejetés par les clients

3. **Corriger un document** :
   - Lire le commentaire du client
   - Cliquer "Corriger"
   - Uploader la nouvelle version
   - Ajouter une note sur les modifications
   - Soumettre

4. **Suivre** :
   - Le client est notifié automatiquement
   - Attendre la validation du client

---

## 🎨 Codes couleur (Statuts)

| Statut | Couleur | Signification | Action requise |
|--------|---------|---------------|----------------|
| ⏰ En attente | Amber | À signer | Client doit signer |
| 🔵 Signé | Bleu | Signé non validé | - |
| 👁️ En validation | Violet | Attend validation client | Client doit valider/rejeter |
| ✅ Validé | Vert | Approuvé par le client | Aucune |
| ❌ Rejeté | Rouge | Refusé définitivement | - |
| 🔧 En révision | Orange | À corriger | Admin doit uploader nouvelle version |

---

## 🔔 Notifications

### Le client reçoit :
- 📄 **Document prêt à signer** - Quand admin upload
- ✍️ **Signature effectuée** - Confirmation
- 🔄 **Nouvelle version disponible** - Après correction admin
- ✅ **Document validé** - Confirmation de validation

### L'admin reçoit :
- ✅ **Document validé** - Client a approuvé
- ❌ **Document rejeté** - Client demande correction (avec commentaire)
- ⏰ **Rappel correction** - Si délai > 24h

---

## 📊 Exemples de documents

Dans les données de démo actuelles, vous trouverez :

### Document 1 : Statuts de la société
- Statut : En attente de validation (violet)
- Version actuelle : 1
- Signé le : 2 novembre 2024

### Document 2 : Attestation de dépôt
- Statut : En attente de validation (violet)
- Version actuelle : 1
- Signé le : 2 novembre 2024

### Document 3 : Contrat de domiciliation
- Statut : Validé (vert)
- Version actuelle : 2
- Historique :
  - v1 : Rejetée - "Date de début incorrecte"
  - v2 : Validée par le client

---

## 🚀 Prochaines améliorations possibles

- [ ] Notification email lors de nouvelles versions
- [ ] Signature par SMS/OTP pour sécurité renforcée
- [ ] Annotation directe sur les PDF
- [ ] Chat intégré par document
- [ ] Délais maximum de réponse
- [ ] Templates de commentaires pour rejets fréquents
- [ ] Signature multiple (plusieurs associés)
- [ ] Export PDF avec historique complet

---

## ✅ Checklist de vérification

Pour tester la fonctionnalité :

### Mobile
- [ ] Ouvrir l'app en mode mobile
- [ ] Connecter en tant que client
- [ ] Aller au Dashboard
- [ ] Cliquer sur "Signature & Validation" (action rapide)
- [ ] Voir la liste des 3 documents
- [ ] Essayer de valider un document en attente
- [ ] Essayer de rejeter avec commentaire
- [ ] Consulter l'historique

### Web
- [ ] Ouvrir l'app en mode web
- [ ] Se connecter en tant que client
- [ ] Depuis le Dashboard, cliquer sur la carte "Signature & Validation"
- [ ] Ou depuis le menu latéral, cliquer sur "Signature & Validation"
- [ ] Sélectionner un document
- [ ] Tester la validation/rejet
- [ ] Voir l'historique complet

### Admin
- [ ] Se connecter en tant qu'admin
- [ ] Aller dans le menu "Documents"
- [ ] Filtrer par "À corriger"
- [ ] Voir un document rejeté avec commentaire client
- [ ] Simuler l'upload d'une nouvelle version
- [ ] Vérifier l'historique

---

**Date de création** : 4 novembre 2024  
**Dernière mise à jour** : 4 novembre 2024  
**Version** : 1.0  
**Statut** : ✅ Fonctionnalité complètement intégrée et accessible
