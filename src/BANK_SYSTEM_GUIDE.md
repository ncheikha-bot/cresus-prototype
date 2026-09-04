# Guide du Système Bancaire - Crésus V2

## 📋 Vue d'ensemble

Le système bancaire de Crésus V2 permet aux banques partenaires de gérer les demandes d'ouverture de compte entreprise via une interface dédiée.

## 🏗️ Architecture

### Composants créés

1. **Interfaces Mobile**
   - `BankAuth.tsx` - Écran de connexion mobile pour les banques
   - `BankDashboard.tsx` - Dashboard mobile des demandes

2. **Interfaces Web**
   - `WebBankAuth.tsx` - Écran de connexion web pour les banques
   - `WebBankDashboard.tsx` - Dashboard web des demandes
   - `WebBankInterface.tsx` - Container principal pour le mode web

3. **Interface Admin**
   - `AdminBanks.tsx` - Gestion complète des banques partenaires

## 🎯 Fonctionnalités

### Pour l'Admin

#### Gestion des Banques
- **Création de banques** : Ajouter une nouvelle banque partenaire
  - Informations générales (nom, logo, description)
  - Coordonnées (email, téléphone, personne de contact)
  - Tarifs et délais
  - Services proposés
  - Documents requis
  - Génération automatique de mot de passe

- **Modification de banques** : Mettre à jour les informations
- **Activation/Désactivation** : Contrôler la visibilité des banques
- **Suppression** : Retirer une banque du système

#### Statistiques
- Nombre total de banques
- Banques actives/inactives
- Comptes bancaires créés

### Pour les Banques

#### Authentification
- Connexion via email et mot de passe
- Détection automatique mobile/web
- Interface adaptée à chaque plateforme

#### Dashboard
- **Vue d'ensemble** : Statistiques des demandes
  - Total des demandes
  - Nouveaux dossiers
  - Dossiers en révision
  - Dossiers approuvés

- **Gestion des demandes**
  - Liste filtrée par statut
  - Recherche par nom de société
  - Messages non lus
  - Détails de chaque demande

#### Statuts disponibles
- `pending` - En attente
- `documents_review` - Vérification documents
- `approved` - Approuvé
- `appointment_scheduled` - RDV programmé
- `completed` - Compte ouvert
- `rejected` - Rejeté

## 🔐 Accès

### Accès Admin
Depuis le dashboard admin :
1. Menu latéral > "Banques"
2. Gérer les banques partenaires

### Accès Banque

**Accès direct sans identifiants !** 🚀

Depuis l'écran d'accueil :
1. Cliquer sur "Espace Banque" (carte verte)
2. ✅ Vous êtes directement dans le dashboard

**Aucune authentification requise** - L'accès est immédiat pour faciliter la démonstration.

Par défaut, vous accédez au compte démo **Bank of Africa** avec toutes les demandes d'ouverture de compte visibles.

## 📊 Flux de travail

### 1. Création d'une banque par l'admin
```
Admin Dashboard > Banques > Ajouter une banque
↓
Formulaire de création (nom, email, services, etc.)
↓
Génération automatique du mot de passe
↓
Création du compte utilisateur bancaire
↓
Banque disponible pour les clients
```

### 2. Accès à l'espace banque
```
Écran d'accueil > Espace Banque
↓
Accès direct (aucune authentification)
↓
Dashboard bancaire (mobile ou web selon l'appareil)
```

### 3. Traitement d'une demande
```
Client soumet demande d'ouverture de compte
↓
Demande apparaît dans le dashboard bancaire (status: pending)
↓
Banque vérifie les documents (status: documents_review)
↓
Banque approuve ou rejette (status: approved/rejected)
↓
Programmation RDV si approuvé (status: appointment_scheduled)
↓
Finalisation (status: completed)
```

## 🎨 Design

### Couleurs
- **Banques** : Thème vert émeraude (`emerald-600`, `emerald-700`)
- **Admin** : Thème Crésus (`#1A2753`, `#D6A93A`)

### Responsive
- Mobile : Interface verticale optimisée
- Web : Layout en grille avec tableau

## 🔧 Intégration

### Dans AppContext.tsx

Nouvelles fonctions disponibles :
```typescript
// Gestion des banques
banks: BankPartner[]
addBank(bank: BankPartner): void
updateBank(bank: BankPartner): void
deleteBank(bankId: string): void

// Authentification bancaire
loginBank(email: string, password: string): User | null

// Liste des utilisateurs (incluant les comptes banques)
users: User[]
```

### Dans les types

```typescript
// UserRole étendu
type UserRole = 'client' | 'admin' | 'bank';

// User étendu
interface User {
  // ... champs existants
  bankId?: string;
  bankPassword?: string; // Pour démo seulement
}

// BankPartner étendu
interface BankPartner {
  // ... champs existants
  email?: string;
  active?: boolean;
  contactPerson?: string;
  contactPhone?: string;
  createdAt?: string;
}
```

## 📱 Navigation

### Routes App.tsx
- Mode `bank` pour l'interface bancaire
- Détection automatique mobile/web
- Redirection vers `IntroScreen` au logout

### Menu Admin
Nouveau item dans `AdminLayout.tsx` :
- Icon : `Landmark`
- Label : "Banques"
- Route : `banks`

## 🚀 Prochaines étapes

### Fonctionnalités à ajouter
1. **Vue détaillée des demandes** pour les banques
   - Visualisation complète des documents
   - Système de messagerie intégré
   - Gestion des rendez-vous
   
2. **Notifications en temps réel**
   - Alert des nouvelles demandes
   - Rappels de rendez-vous
   
3. **Statistiques avancées**
   - Graphiques d'activité
   - Rapport mensuel
   - Taux de conversion

4. **Export de données**
   - Export PDF des demandes
   - Rapports Excel
   
5. **Gestion des documents**
   - Upload de documents additionnels
   - Signature électronique

## 📝 Notes importantes

1. **Sécurité** : Les mots de passe sont actuellement en clair pour la démo. En production, utiliser un système de hachage.

2. **Permissions** : Chaque banque ne voit que ses propres demandes (filtrage par `bankId`)

3. **Notifications** : Le système notifie automatiquement les clients lors des changements de statut

4. **Données** : Les banques initiales sont chargées depuis `data/bankData.ts`

## 🛠️ Fichiers modifiés

- ✅ `/types/index.ts` - Types étendus
- ✅ `/context/AppContext.tsx` - Gestion banques + auth
- ✅ `/data/bankData.ts` - Données initiales
- ✅ `/components/admin/AdminBanks.tsx` - CRUD banques
- ✅ `/components/admin/AdminLayout.tsx` - Menu mis à jour
- ✅ `/components/mobile/BankAuth.tsx` - Auth mobile
- ✅ `/components/mobile/BankDashboard.tsx` - Dashboard mobile
- ✅ `/components/web/WebBankAuth.tsx` - Auth web
- ✅ `/components/web/WebBankDashboard.tsx` - Dashboard web
- ✅ `/components/web/WebBankInterface.tsx` - Container web
- ✅ `/components/IntroScreen.tsx` - Carte "Espace Banque"
- ✅ `/App.tsx` - Routes bancaires

## 📞 Support

Pour toute question sur le système bancaire, référez-vous à ce guide ou consultez les composants individuels pour plus de détails.
