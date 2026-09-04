# 📖 Guide Admin - Parcours Step-by-Step

## 🎯 Vue d'Ensemble

Le nouveau système de gestion des dossiers de création d'entreprise dans l'admin affiche maintenant **une étape à la fois**, comme dans la version client. Cela simplifie le travail et permet de se concentrer sur les actions essentielles.

---

## 🚀 Accès au Parcours

### Depuis le Dashboard Admin:
1. Cliquez sur **"Dossiers de création"** dans le menu
2. Sélectionnez une entreprise dans la liste
3. Le parcours s'ouvre automatiquement à l'étape 1

### Navigation:
- **Bouton ← Précédent**: Retourner à l'étape précédente
- **Bouton Suivant →**: Passer à l'étape suivante
- **Bouton ← (en haut)**: Retourner à la liste des dossiers

---

## 📋 Les 7 Étapes du Parcours

### 🏢 Étape 1: Informations Générales
**Objectif**: Visualiser les informations de base de l'entreprise

**Affichage**:
- Dénomination sociale
- Forme juridique (SARL, SA, SAS, etc.)
- Activité
- Adresse
- Capital social

**Statut**: ✅ Validé automatiquement (le client a déjà complété)

**Action**: Aucune action requise - Cliquez sur **"Suivant"**

---

### 👥 Étape 2: Associés & Capital
**Objectif**: Vérifier la liste des associés et la répartition du capital

**Affichage**:
- Liste de tous les associés
- Pour chaque associé:
  - Nom et prénom
  - Email
  - Badge "Gérant" si applicable
  - Pourcentage de capital
  - Montant en FCFA
- Total de la répartition (doit être 100%)

**Statut**: ✅ Validé automatiquement si total = 100%

**Action**: Vérification visuelle - Cliquez sur **"Suivant"**

---

### 📄 Étape 3: Documents Justificatifs
**Objectif**: Valider ou rejeter les documents uploadés par le client

**Documents à vérifier**:
- CNI du gérant
- Casier judiciaire
- Autres documents selon la forme juridique

**Actions disponibles**:
Pour chaque document:
- 👁️ **Aperçu**: Visualiser le document
- ✅ **Valider**: Accepter le document (passe en vert)
- ❌ **Rejeter**: Refuser le document (passe en rouge, client notifié)

**Statut**:
- 🟠 **En attente**: Document non encore traité
- 🟢 **Validé**: Document accepté
- 🔴 **Rejeté**: Document refusé, client doit soumettre à nouveau

**Progression**: Tous les documents doivent être validés avant de continuer

---

### 💰 Étape 4: Validation du Devis
**Objectif**: Créer et envoyer le devis d'immatriculation au client

**Formulaire de devis**:
Remplissez les montants pour:
1. **Frais d'immatriculation**: Ex: 75 000 FCFA
2. **Frais juridiques**: Ex: 50 000 FCFA
3. **Frais de publication**: Ex: 25 000 FCFA
4. **Droits de timbre**: Ex: 30 000 FCFA
5. **Frais administratifs Crésus**: Ex: 20 000 FCFA

**Calcul automatique**: Le total s'affiche en temps réel

**Action**: Cliquez sur **"Envoyer le devis au client"**

**Après envoi**:
- Affichage du message "Devis envoyé"
- Le client reçoit une notification
- En attente de validation par le client
- ⚠️ **Important**: Le client doit valider avant de continuer

---

### 🏦 Étape 5: Libération du Capital
**Objectif**: Confirmer la réception du paiement du capital social

**Affichage**:
- Montant du capital à libérer
- Méthodes de paiement acceptées:
  - Orange Money
  - Wave
  - Virement bancaire
  - Chèque/Espèces en agence

**Action**: Une fois le paiement reçu, cliquez sur:
✅ **"Confirmer la réception du paiement"**

**Statut**:
- 🔵 **En attente**: Paiement non reçu
- 🟢 **Confirmé**: Paiement reçu et validé

---

### 📜 Étape 6: Validation des Statuts
**Objectif**: Générer, envoyer et faire valider les statuts par le client

**Workflow**:

#### 6.1. Génération
- Cliquez sur **"Générer et envoyer les statuts V1"**
- Les statuts sont créés automatiquement
- Le client reçoit une notification

#### 6.2. Validation Client
Le client peut:
- ✅ **Valider**: Les statuts sont acceptés → Passer à la signature
- ❌ **Rejeter**: Les statuts ont des erreurs

#### 6.3. Si rejet (corrections nécessaires)
- Un message orange s'affiche avec le motif du rejet
- Corrigez les statuts
- Cliquez sur **"Corriger et envoyer V2"**
- Le numéro de version s'incrémente automatiquement

#### 6.4. Simulation (DEV)
Pour tester, utilisez le bouton:
- **"✓ Client valide les statuts"** (vert)

**Statut**:
- ⚪ **Non envoyé**: Statuts pas encore générés
- 🔵 **Envoyé**: En attente de validation client
- 🟢 **Validé**: Statuts approuvés par le client
- 🟠 **Rejeté**: Corrections nécessaires (nouvelle version à envoyer)

---

### ✍️ Étape 7: Signature & Finalisation
**Objectif**: Finaliser la création et uploader les documents officiels

**Informations**:
Une fois les statuts validés, le client choisit:
- **Signature en ligne** (électronique)
- **Rendez-vous physique** pour signature à l'agence

**Documents officiels à uploader**:
Après la signature, uploadez:
- 📋 Registre de Commerce (RC)
- 🏢 NINEA
- 📄 Certificat d'immatriculation
- 📰 Extrait KBIS

**Action finale**: Cliquez sur:
✅ **"Finaliser la création de société"**

**Écran de succès**:
- 🎉 Message de félicitations
- Tous les documents sont disponibles pour le client
- Le dossier est marqué comme complété

**Retour**: Cliquez sur **"Retour à la liste des dossiers"**

---

## 🎨 Codes Couleurs

### Statuts des Étapes:
- 🟢 **Vert**: Étape complétée
- 🔵 **Bleu**: Étape en cours
- ⚪ **Gris**: Étape en attente
- 🔴 **Rouge**: Étape bloquée (action requise)

### Alertes:
- 🟢 **Vert**: Succès, validation
- 🔵 **Bleu**: Information
- 🟠 **Orange**: Attention, en attente
- 🔴 **Rouge**: Erreur, rejet
- 🟡 **Jaune**: Mode développement (simulations)

---

## 🔔 Notifications

Chaque action déclenche une notification au client:

| Action | Notification Client |
|--------|-------------------|
| Documents validés | "Vos documents ont été validés" |
| Document rejeté | "Document refusé: [raison]. Veuillez soumettre à nouveau" |
| Devis envoyé | "Nouveau devis à valider: [montant] FCFA" |
| Paiement confirmé | "Votre paiement a été reçu et confirmé" |
| Statuts envoyés | "Vos statuts V[X] sont prêts à valider" |
| Société finalisée | "Félicitations ! Votre société [nom] est créée" |

---

## ⚡ Raccourcis Clavier (à venir)

| Touche | Action |
|--------|--------|
| ← | Étape précédente |
| → | Étape suivante |
| Esc | Retour à la liste |

---

## 🐛 Troubleshooting

### Le bouton "Suivant" est grisé
✅ **Solution**: Complétez l'action requise à l'étape actuelle
- Étape 3: Tous les documents doivent être validés
- Étape 4: Le devis doit être envoyé
- Étape 5: Le paiement doit être confirmé
- Étape 6: Les statuts doivent être validés par le client

### Les statuts sont rejetés plusieurs fois
✅ **Solution**:
1. Lisez attentivement le motif de rejet
2. Corrigez les erreurs mentionnées
3. Vérifiez la répartition du capital
4. Envoyez la nouvelle version

### Le client ne reçoit pas les notifications
✅ **Solution**:
1. Vérifiez l'email du client dans l'étape 1
2. Vérifiez le numéro de téléphone
3. Contactez le support technique

---

## 💡 Bonnes Pratiques

### ✅ À FAIRE:
- Vérifier minutieusement chaque document avant validation
- Utiliser des montants réalistes pour les devis
- Ajouter des notes explicatives si nécessaire
- Confirmer le paiement uniquement après vérification bancaire
- Relire les statuts avant envoi au client

### ❌ À ÉVITER:
- Valider des documents illisibles ou incomplets
- Envoyer un devis sans vérifier les montants
- Confirmer un paiement non reçu
- Envoyer des statuts non vérifiés
- Finaliser sans avoir tous les documents officiels

---

## 📞 Support

En cas de problème ou de question:
- 📧 Email: support@cresus.sn
- 📱 WhatsApp: +221 XX XXX XX XX
- 💬 Chat interne (à venir)

---

## 🎯 Objectifs de Performance

### Temps moyen par étape (cible):
- Étape 1-2: 2 minutes (lecture)
- Étape 3: 10 minutes (validation documents)
- Étape 4: 5 minutes (création devis)
- Étape 5: 2 minutes (confirmation paiement)
- Étape 6: 15 minutes (génération statuts)
- Étape 7: 10 minutes (upload documents officiels)

**Total**: ~45 minutes par dossier

---

## 🔄 Mises à Jour

Ce guide sera mis à jour régulièrement pour refléter les nouvelles fonctionnalités et améliorations du système.

**Dernière mise à jour**: Décembre 2024
**Version**: 2.0 (Step-by-Step)
