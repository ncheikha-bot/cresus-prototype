# Guide du Module Domiciliation Admin - Crésus V2

## 📋 Vue d'ensemble

Le module **AdminDomiciliation** permet aux administrateurs de gérer l'ensemble des demandes de domiciliation commerciale, les contrats, les adresses disponibles et les paiements associés.

## 🎯 Fonctionnalités principales

### 1. **Vue d'ensemble (Dashboard)**
- **Statistiques clés** :
  - Contrats actifs
  - Revenus générés (FCFA)
  - Contrats en attente
  - Taux d'occupation des adresses
- **Accès rapide** aux 3 sections principales
- **Liste des derniers contrats** avec aperçu rapide

### 2. **Gestion des contrats**

#### Filtres et recherche
- Recherche par : nom d'entreprise, adresse, ID de contrat
- Filtrage par statut :
  - Brouillon
  - Envoyé
  - Validé
  - Signé
  - Actif
  - Suspendu
  - Résilié
  - Expiré

#### Informations affichées pour chaque contrat
- Nom de l'entreprise cliente
- Adresse de domiciliation
- Dates (début, fin)
- Période (mensuel, trimestriel, annuel)
- Montants (mensuel et total)
- Statut du contrat
- Indicateur de retard de paiement

#### Actions disponibles
- **Pour contrats "Envoyé"** :
  - ✅ Approuver la demande
  - ❌ Rejeter la demande (avec motif obligatoire)
- **Pour contrats "Actif"** :
  - ⏸️ Suspendre le contrat
  - 🗑️ Résilier le contrat
- **Pour tous** :
  - 💬 Envoyer un message au client
  - 👁️ Voir les détails complets

### 3. **Gestion des adresses**

#### Informations par adresse
- Nom du centre (ex: "Plateau Business Center")
- Localisation (zone, ville)
- Description
- Services inclus
- Prix (mensuel, trimestriel, annuel)
- Taux d'occupation en temps réel
- Nombre de contrats actifs

#### Actions
- ✏️ Modifier une adresse
- ⚙️ Paramètres de l'adresse
- ➕ Ajouter une nouvelle adresse

#### 4 Adresses disponibles par défaut
1. **Plateau Business Center** - Quartier d'affaires (50,000 FCFA/mois)
2. **Almadies Corporate Hub** - Zone résidentielle huppée (75,000 FCFA/mois)
3. **Mermoz Tech Park** - Centre tech pour startups (60,000 FCFA/mois)
4. **Point E Business Center** - Économique et accessible (35,000 FCFA/mois)

### 4. **Détails d'un contrat**

#### Section financière
- Période du contrat
- Montant mensuel
- Montant total
- Caution (si applicable)
- Mode de renouvellement (automatique/manuel)

#### Section contractuelle
- Date de début
- Date de fin
- Version du contrat
- Date de signature
- Préavis de résiliation

#### Section adresse
- Nom du centre
- Adresse complète
- Liste des services inclus

#### Paiements associés
- Liste de tous les paiements (caution, loyer, pénalités)
- Statut de chaque paiement :
  - À émettre
  - Émise
  - Payée
  - En retard
  - Partielle
  - Annulée
- Méthode de paiement utilisée
- Rappels envoyés (pour paiements en retard)

#### Documents
- Documents fournis par le client
- Statut de validation de chaque document
- Actions : Voir, Télécharger

## 🎨 Design & UX

### Palette de couleurs Crésus
- **Bleu nuit** : `#1A2753` - Titres, textes principaux
- **Or impérial** : `#D6A93A` - Boutons d'action, accents
- **Bleu acier** : `#273A7A` - Textes secondaires, gradients
- **Blanc** : `#FFFFFF` - Fond des cartes
- **Gris perle** : `#F5F6FA` - Fond de page, zones désactivées

### Indicateurs visuels
- **Vert** : Contrats actifs, paiements validés
- **Orange** : Contrats suspendus, paiements en attente
- **Rouge** : Contrats résiliés, paiements en retard
- **Bleu** : Contrats en cours de validation

### Animations
- Hover sur les cartes : légère élévation (scale 1.02)
- Transitions fluides : 300ms
- Layout animations avec Framer Motion

## 🔔 Notifications automatiques

L'admin peut déclencher des notifications vers le client lors de :
- Approbation d'une demande
- Rejet d'une demande (avec motif)
- Suspension du contrat (avec motif)
- Résiliation du contrat (avec motif)
- Envoi de messages personnalisés

## 📊 Statistiques temps réel

### Dashboard Overview
- **Contrats actifs** : Nombre total de contrats en cours
- **Revenus FCFA** : Somme des paiements reçus
- **En attente** : Demandes à traiter + paiements en retard
- **Taux d'occupation** : Calcul automatique basé sur toutes les adresses

### Par adresse
- **Taux d'occupation** : (places occupées / places totales) × 100
- **Contrats actifs** : Nombre de contrats liés à cette adresse
- **Visualisation** : Barre de progression

## 🔄 Workflow de validation

1. **Client soumet une demande** (statut: "sent")
2. **Admin examine la demande** dans la vue contrats
3. **Admin approuve ou rejette** :
   - ✅ **Approuvé** → Statut passe à "validated" → Client reçoit notification pour signer
   - ❌ **Rejeté** → Statut passe à "terminated" → Client reçoit notification avec motif
4. **Client signe le contrat** → Statut passe à "signed"
5. **Début du contrat** → Statut passe à "active"
6. **Gestion continue** :
   - Suspendre si problème
   - Résilier si demandé
   - Renouveler automatiquement ou manuellement

## 📁 Structure des données

### DomiciliationContract
```typescript
{
  id: string;
  offerId: string;           // Référence à l'adresse
  userId: string;            // ID du client
  companyId?: string;        // ID de l'entreprise
  status: ContractStatus;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  totalAmount: number;
  deposit?: number;
  autoRenewal: boolean;
  renewalNotice: number;     // En jours
  contractUrl?: string;
  version: number;
  signedAt?: string;
  signedBy?: string[];
  comments: ContractComment[];
  documents: ContractDocument[];
  createdAt: string;
  updatedAt: string;
}
```

### DomiciliationOffer
```typescript
{
  id: string;
  name: string;
  address: string;
  zone: string;
  city: string;
  postalCode: string;
  description: string;
  services: string[];
  receptionCapacity: number;
  prices: {
    monthly: number;
    quarterly: number;        // -10% discount
    yearly: number;           // -20% discount
  };
  deposit?: number;
  quota: number;              // Capacité totale
  available: number;          // Places disponibles
  status: 'draft' | 'published' | 'suspended';
  features: string[];
  images?: string[];
}
```

### DomiciliationPayment
```typescript
{
  id: string;
  contractId: string;
  userId: string;
  type: 'deposit' | 'rent' | 'penalty';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method?: 'orange_money' | 'wave' | 'card';
  transactionId?: string;
  receiptUrl?: string;
  reminders: PaymentReminder[];
}
```

## 🚀 Évolutions futures possibles

1. **Gestion des courriers**
   - Scanner et notifier les clients
   - Suivi des colis
   - Archive digitale

2. **Réservation de salles**
   - Calendrier de disponibilité
   - Système de réservation en ligne
   - Confirmation automatique

3. **Analytics avancés**
   - Prévisions de revenus
   - Analyse de rétention
   - Rapports mensuels automatiques

4. **Intégration paiements**
   - Génération automatique de factures
   - Relances automatiques
   - Paiements récurrents

5. **Multi-signatures**
   - Workflow de signature pour plusieurs parties
   - Documents juridiques

## 📝 Notes techniques

### Fichiers concernés
- `/components/admin/AdminDomiciliation.tsx` - Composant principal
- `/data/domiciliationData.ts` - Types et données mock
- `/App.tsx` - Intégration dans le routing admin

### Dépendances
- `motion/react` - Animations
- `lucide-react` - Icônes
- `AppContext` - État global et notifications

### État local géré
- Vue active (overview/contracts/offers/details)
- Contrat sélectionné
- Filtres et recherche
- Modals (actions, messages)

## ✅ Checklist d'implémentation

- [x] Vue d'ensemble avec statistiques
- [x] Liste des contrats avec filtres
- [x] Gestion des adresses
- [x] Détails complets d'un contrat
- [x] Actions d'approbation/rejet/suspension
- [x] Système de notifications client
- [x] Affichage des paiements
- [x] Gestion des documents
- [x] Design responsive
- [x] Animations fluides
- [x] Palette de couleurs Crésus
- [x] Intégration dans AdminLayout

## 🎯 Points d'attention

1. **Validation des données** : Toujours vérifier que les montants et dates sont cohérents
2. **Notifications** : S'assurer que le client reçoit bien les notifications importantes
3. **Motifs obligatoires** : Pour les rejets/suspensions/résiliations
4. **Calcul des remises** : Appliquer correctement les -10% et -20% pour trimestre/annuel
5. **Gestion de la capacité** : Vérifier qu'une adresse ne dépasse pas son quota

---

**Développé pour Crésus V2** - Plateforme sénégalaise de création et gestion d'entreprise 100% en ligne
