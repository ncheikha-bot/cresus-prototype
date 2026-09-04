# 🏦 Fonctionnalité Bancaire - Guide Complet

## 📋 Vue d'ensemble

La nouvelle fonctionnalité d'**ouverture de compte bancaire** permet aux clients de Crésus V2 d'ouvrir un compte professionnel directement depuis l'écran "Mes Sociétés". Cette intégration facilite le processus en transférant automatiquement tous les documents de la société à la banque sélectionnée.

## 🎯 Fonctionnalités principales

### 1. **Sélection de la banque partenaire**
- 6 banques sénégalaises partenaires disponibles :
  - Bank of Africa (BOA)
  - Société Générale (SGBS)
  - Ecobank Sénégal
  - CBAO Groupe Attijariwafa
  - UBA Sénégal
  - BICIS (Groupe BNP Paribas)

- Chaque banque affiche :
  - Logo et description
  - Note client (rating)
  - Délai de traitement
  - Frais d'ouverture
  - Services inclus
  - Documents requis supplémentaires

### 2. **Transfert automatique des documents**
Les documents suivants de la société sont automatiquement transférés :
- ✅ Statuts signés
- ✅ RC (Registre de Commerce)
- ✅ NINEA
- ✅ KBIS
- ✅ Certificat d'immatriculation

### 3. **Messagerie intégrée avec la banque**
- Chat en temps réel avec le conseiller bancaire
- Historique complet des messages
- Notifications automatiques
- Réponses simulées de la banque (pour la démo)

### 4. **Suivi du processus**
Barre de progression avec 4 étapes :
1. **En attente** - Demande soumise
2. **Vérification** - Documents en cours de vérification
3. **Approuvé** - Demande validée par la banque
4. **RDV** - Rendez-vous programmé pour signature

### 5. **Prise de rendez-vous**
- Sélection de date et heure
- Confirmation automatique
- Rappel dans l'interface
- Localisation de l'agence bancaire

## 📱 Accès à la fonctionnalité

### Version Mobile
1. Ouvrir l'application mobile
2. Accéder à "Mes sociétés"
3. Sélectionner une société
4. Cliquer sur le service **"Banque"** (icône 🏦 verte)
5. Suivre le processus guidé

### Version Web
1. Se connecter au dashboard web
2. Naviguer vers "Mes sociétés"
3. Sélectionner une société dans la liste
4. Dans les services disponibles, cliquer sur **"Compte bancaire"**
5. Compléter le processus

## 🔄 Processus étape par étape

### Étape 1 : Sélection
1. Choisir la société concernée (si plusieurs)
2. Parcourir les banques partenaires
3. Comparer les offres (délais, frais, services)
4. Sélectionner la banque souhaitée

### Étape 2 : Confirmation
1. Vérifier les informations de la société
2. Consulter la liste des services inclus
3. Voir les documents transférés automatiquement
4. Lire les documents requis supplémentaires
5. Soumettre la demande

### Étape 3 : Suivi et chat
1. Recevoir le message de bienvenue de la banque
2. Suivre la progression (barre de statut)
3. Échanger avec le conseiller via chat
4. Joindre des documents supplémentaires si besoin
5. Attendre l'approbation

### Étape 4 : Rendez-vous
1. Une fois approuvé, prendre rendez-vous
2. Choisir date et heure parmi les créneaux disponibles
3. Recevoir la confirmation
4. Se présenter à l'agence pour finaliser

## 💾 Structure des données

### BankPartner (Banque partenaire)
```typescript
{
  id: string;
  name: string;
  logo: string;
  description: string;
  services: string[];
  processingTime: string;
  fees: number;
  requirements: string[];
  rating: number;
  color: string;
}
```

### BankAccountRequest (Demande d'ouverture)
```typescript
{
  id: string;
  companyId: string;
  bankId: string;
  status: 'pending' | 'documents_review' | 'approved' | 'appointment_scheduled' | 'completed' | 'rejected';
  documentsTransferred: boolean;
  messages: BankMessage[];
  appointment?: {
    date: string;
    time: string;
    location: string;
    type: 'signature' | 'consultation';
    status: 'pending' | 'confirmed' | 'cancelled';
  };
  createdAt: string;
  updatedAt: string;
}
```

### BankMessage (Message)
```typescript
{
  id: string;
  requestId: string;
  sender: 'client' | 'bank';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}
```

## 🎨 Design et UX

### Palette de couleurs
- **Service "Banque"** : Vert émeraude (`from-emerald-600 to-emerald-700`)
- **Statut En attente** : Orange (`bg-orange-100 text-orange-700`)
- **Statut Vérification** : Bleu (`bg-blue-100 text-blue-700`)
- **Statut Approuvé** : Vert (`bg-green-100 text-green-700`)
- **Statut RDV** : Violet (`bg-purple-100 text-purple-700`)

### Icônes
- Service bancaire : `Landmark` (🏦)
- Rendez-vous : `Calendar` 
- Messages : `MessageSquare`
- Documents : `FileText`
- Localisation : `MapPin`

## 🔔 Notifications

Les notifications sont automatiquement envoyées pour :
- ✉️ Demande d'ouverture envoyée
- 📄 Documents en cours de vérification
- ✅ Demande approuvée
- 📅 Rendez-vous programmé
- 💬 Nouveau message de la banque
- 🎉 Compte ouvert

## 🛠️ Fonctions du contexte

### `addBankRequest(request)`
Crée une nouvelle demande d'ouverture de compte

### `sendBankMessage(requestId, message)`
Envoie un message dans le chat avec la banque

### `updateBankRequest(requestId, updates)`
Met à jour le statut ou les détails d'une demande

### `getBankRequestsByCompany(companyId)`
Récupère toutes les demandes pour une société donnée

## 📂 Fichiers créés/modifiés

### Nouveaux fichiers
- `/types/index.ts` - Ajout des types BankPartner, BankAccountRequest, BankMessage
- `/components/web/WebBankAccountOpening.tsx` - Version web du composant bancaire
- `/FEATURE_BANK_INTEGRATION.md` - Cette documentation

### Fichiers modifiés
- `/context/AppContext.tsx` - Ajout des fonctions de gestion bancaire
- `/components/mobile/MyCompanies.tsx` - Ajout du service "Banque"
- `/components/web/WebMyCompanies.tsx` - Ajout du service "Banque"
- `/App.tsx` - Ajout des routes pour les composants bancaires

### Fichiers existants utilisés
- `/components/mobile/BankAccountOpening.tsx` - Composant mobile existant
- `/data/bankData.ts` - Données des banques partenaires

## 🚀 Comment tester

1. **Créer ou avoir une société avec statut "completed"**
2. **Accéder à "Mes sociétés"**
3. **Sélectionner une société**
4. **Cliquer sur le service "Banque"** (nouvelle carte verte avec icône 🏦)
5. **Suivre le processus** :
   - Choisir une banque partenaire
   - Valider la demande
   - Échanger via le chat
   - Prendre rendez-vous si approuvé

## ⚠️ Limitations actuelles

- Les réponses de la banque sont simulées (automatiques après 2 secondes)
- Les documents ne sont pas réellement envoyés (transfert simulé)
- Les rendez-vous ne sont pas connectés à un calendrier réel
- Une seule demande en cours par société est autorisée

## 🔮 Évolutions futures possibles

- [ ] Intégration avec les API bancaires réelles
- [ ] Upload de documents supplémentaires
- [ ] Signature électronique du contrat bancaire
- [ ] Suivi des frais et virements
- [ ] Gestion multi-comptes (plusieurs comptes par société)
- [ ] Historique des transactions
- [ ] Alertes SMS/Email pour les étapes importantes
- [ ] Vidéo-conférence avec le conseiller

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation technique dans `/types/index.ts`
- Vérifier les données de démonstration dans `/data/bankData.ts`
- Tester avec différentes banques pour comparer les offres

---

**Dernière mise à jour** : 5 novembre 2025  
**Version** : 1.0  
**Auteur** : Équipe Crésus V2
