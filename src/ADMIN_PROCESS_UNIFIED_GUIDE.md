# Guide du Processus Unifié Admin - Crésus V2

## 📋 Vue d'ensemble

Le module **AdminCompanyProcess** regroupe désormais la gestion complète du processus de création d'entreprise ET la gestion des documents dans une interface unifiée et cohérente.

### ✅ Objectifs atteints

- ✅ **Une seule interface** pour gérer les dossiers ET les documents
- ✅ **Processus de création en 5 étapes** visuellement clair
- ✅ **Validation des documents** intégrée dans le flow
- ✅ **Échanges avec le client** (upload, validation, commentaires, versionnage)
- ✅ **Historique complet** de chaque document
- ✅ **Notifications automatiques** au client

---

## 🎯 Architecture du Processus

### Les 5 Étapes du Processus

```
1. SOUMIS (submitted)
   ↓ Client soumet son dossier
   
2. EN RÉVISION (in_review)
   ↓ Admin vérifie les informations et prépare les documents
   
3. DOCUMENTS PRÊTS (documents_ready)
   ↓ Documents générés et envoyés au client pour validation
   
4. SIGNÉ (signed)
   ↓ Client signe et valide tous les documents
   
5. TERMINÉ (completed)
   ✓ Dossier finalisé
```

### Statuts des Documents

| Statut | Description | Action Admin |
|--------|-------------|--------------|
| `pending` | En attente signature | - |
| `awaiting_validation` | En validation client | Attendre retour client |
| `validated` | Validé par le client | ✅ Document OK |
| `under_revision` | À corriger (rejeté) | 🔧 Uploader correction |
| `signed` | Signé électroniquement | ✅ Signé |

---

## 🖥️ Interface Admin

### Vue Liste des Dossiers

```tsx
// Affichage en tableau avec :
- Nom de la société + Activité
- Forme juridique
- Statut actuel (badge coloré)
- Stats documents (validés/total)
- Nombre de documents à corriger
- Date de dernière mise à jour
- Bouton "Gérer" → Vue détails
```

**Fonctionnalités :**
- 🔍 **Recherche** par nom ou forme juridique
- 🎯 **Filtre** par statut
- 📊 **Stats rapides** : nombre de documents validés/à corriger

### Vue Détails d'un Dossier

#### 1. Stepper de Progression

Un stepper horizontal visuel avec 5 étapes :

```tsx
// Chaque étape affiche :
- Numéro de l'étape
- Label (ex: "En révision")
- Description (ex: "Vérification des informations")
- État : Complété (✓) | En cours (cercle actif) | À venir (grisé)

// Barre de progression :
- Ligne jaune/or qui se remplit au fur et à mesure
```

**Action disponible :**
- Bouton "Passer à l'étape suivante : [Nom étape]"
- Notifie automatiquement le client

#### 2. Stats Globales des Documents

Quatre cartes avec :
- 📄 **Total documents** (gris)
- ✅ **Validés** (vert)
- 👁️ **En validation** (violet)
- 🔧 **À corriger** (rouge)

#### 3. Liste Détaillée des Documents

Chaque document affiche :

```tsx
// En-tête du document :
- Badge statut (couleur + icon selon état)
- Nom du document
- Infos : Taille, pages, version

// Si rejeté par le client :
- Encadré rouge avec le commentaire de rejet
- Date et heure du retour

// Actions disponibles :
- 📜 Historique (versions + reviews)
- 📤 Uploader correction (si rejeté)
- 💾 Télécharger
- 👁️ Prévisualiser
```

---

## 🔄 Workflows Principaux

### 1. Upload Initial d'un Document

```tsx
// Admin clique "Ajouter un document"
1. Modal d'upload s'ouvre
2. Drag & drop ou sélection fichier (PDF max 10 MB)
3. Ajout note optionnelle
4. Upload → Document créé avec status 'awaiting_validation'
5. Notification envoyée au client
```

### 2. Correction d'un Document Rejeté

```tsx
// Le client a rejeté un document avec commentaire
1. Document apparaît en rouge avec badge "À corriger"
2. Commentaire de rejet affiché en évidence
3. Admin clique "Uploader correction"
4. Modal affiche :
   - Le commentaire de rejet du client
   - Version actuelle
   - Zone d'upload pour nouvelle version
   - Champ note pour expliquer les corrections
5. Upload → Nouvelle version créée (v2, v3...)
6. Status redevient 'awaiting_validation'
7. Client notifié automatiquement
```

### 3. Consultation de l'Historique

```tsx
// Admin clique "Historique" sur un document
Modal en 2 colonnes :

Colonne GAUCHE - Versions :
- Liste toutes les versions uploadées
- Version actuelle marquée en jaune/or
- Date d'upload + heure
- Note de l'admin (si ajoutée)
- Bouton télécharger PDF pour chaque version

Colonne DROITE - Retours Client :
- Liste chronologique des validations/rejets
- Badge vert (validé) ou rouge (rejeté)
- Commentaire du client (si ajouté)
- Date + heure du retour
```

### 4. Message au Client

```tsx
// Admin clique "Contacter le client"
1. Modal de message s'ouvre
2. Textarea pour écrire le message
3. Envoi → Notification créée dans le système
4. Client reçoit dans son centre de notifications
```

### 5. Avancement du Processus

```tsx
// Admin clique "Passer à l'étape suivante"
1. Statut de la company mis à jour
2. Stepper progresse visuellement
3. Client reçoit notification de mise à jour
4. Nouvelle action débloquée selon l'étape
```

---

## 💬 Système de Notifications

### Notifications Envoyées Automatiquement

| Événement | Titre | Message |
|-----------|-------|---------|
| Document uploadé | "Document mis à jour" | "Une nouvelle version de [Nom doc] a été uploadée" |
| Statut avancé | "Mise à jour de votre dossier" | "Le statut de [Société] a été mis à jour : [Nouveau statut]" |
| Message admin | "Message de Crésus" | [Contenu du message] |

---

## 🎨 Codes Couleur

### Statuts Processus

- 🟡 **Soumis** : `bg-yellow-100 text-yellow-700`
- 🟠 **En révision** : `bg-orange-100 text-orange-700`
- 🟣 **Documents prêts** : `bg-purple-100 text-purple-700`
- 🔵 **Signé** : `bg-blue-100 text-blue-700`
- 🟢 **Terminé** : `bg-green-100 text-green-700`

### Statuts Documents

- 🟡 **En attente** : `bg-amber-50 border-amber-200 text-amber-600`
- 🟣 **En validation** : `bg-purple-50 border-purple-200 text-purple-600`
- 🟢 **Validé** : `bg-green-50 border-green-200 text-green-600`
- 🔴 **À corriger** : `bg-red-50 border-red-200 text-red-600`
- 🔵 **Signé** : `bg-blue-50 border-blue-200 text-blue-600`

---

## 📦 Structure des Données

### Company

```typescript
interface Company {
  id: string;
  name: string;
  legalForm: string;
  activity: string;
  clientId: string;
  status: 'draft' | 'submitted' | 'in_review' | 'documents_ready' | 'signed' | 'completed';
  createdAt: string;
  updatedAt: string;
}
```

### Document

```typescript
interface Document {
  id: string;
  companyId: string;               // Lié à la company
  name: string;
  type: 'CNI' | 'CASIER' | 'JUSTIFICATIF' | 'STATUTS' | 'ATTESTATION' | 'CONTRAT' | 'RC' | 'NINEA' | 'PV_AG' | 'FORMULAIRE_M0';
  url: string;
  status: 'pending' | 'signed' | 'awaiting_validation' | 'validated' | 'rejected' | 'under_revision';
  uploadedAt: string;
  signedAt?: string;
  currentVersion: number;          // Version actuelle (1, 2, 3...)
  versions: DocumentVersion[];     // Historique de toutes les versions
  reviews: DocumentReview[];       // Historique validation/rejet client
  size?: string;                   // Ex: "245 KB"
  pages?: number;                  // Ex: 12
  description?: string;
}
```

### DocumentVersion

```typescript
interface DocumentVersion {
  versionNumber: number;           // 1, 2, 3...
  url: string;                     // URL du PDF
  uploadedAt: string;              // ISO date
  uploadedBy: string;              // Admin user id
  comment?: string;                // Note de l'admin
}
```

### DocumentReview

```typescript
interface DocumentReview {
  id: string;
  documentId: string;
  reviewedAt: string;              // ISO date + time
  status: 'validated' | 'rejected';
  comment?: string;                // Commentaire du client
  reviewedBy: string;              // User id
}
```

---

## 🔧 Fonctions Clés

### `handleUploadNewVersion()`

```typescript
// Crée une nouvelle version du document
const newVersion: DocumentVersion = {
  versionNumber: selectedDoc.currentVersion + 1,
  url: '#',
  uploadedAt: new Date().toISOString(),
  uploadedBy: 'admin_current',
  comment: uploadComment || undefined,
};

// Met à jour le document
setDocuments(docs => docs.map(d =>
  d.id === selectedDoc.id
    ? {
        ...d,
        currentVersion: newVersion.versionNumber,
        versions: [...d.versions, newVersion],
        status: 'awaiting_validation', // Reset en attente validation
      }
    : d
));

// Notifie le client
addNotification({...});
```

### `handleAdvanceStatus()`

```typescript
// Fait progresser le dossier à l'étape suivante
const currentStepIndex = PROCESS_STEPS.findIndex(s => s.key === company.status);
const nextStatus = PROCESS_STEPS[currentStepIndex + 1].key;

updateCompanyStatus(company.id, nextStatus);

// Notifie le client
addNotification({...});
```

### `getDocumentStats()`

```typescript
// Calcule les stats des documents d'une company
const docs = getCompanyDocuments(companyId);
return {
  total: docs.length,
  validated: docs.filter(d => d.status === 'validated').length,
  awaiting: docs.filter(d => d.status === 'awaiting_validation').length,
  toCorrect: docs.filter(d => d.status === 'under_revision').length,
};
```

---

## 🎯 Points d'Attention

### ⚠️ Règles de Gestion

1. **Un document ne peut passer à 'validated' que si le client l'a validé**
2. **Si rejeté, le status devient 'under_revision' et ne peut être changé que par upload d'une nouvelle version**
3. **Chaque nouvelle version incrémente automatiquement le numéro de version**
4. **Une notification est TOUJOURS envoyée au client lors d'un changement**
5. **Le client ne peut avancer dans son processus que si tous les documents requis sont validés**

### ✅ Bonnes Pratiques

- **Toujours ajouter une note** lors de l'upload d'une correction pour expliquer les modifications
- **Vérifier que le client a bien reçu la notification** avant de relancer
- **Utiliser le stepper** pour avoir une vision claire de l'avancement
- **Consulter l'historique** avant de contacter le client pour comprendre le contexte
- **Filtrer par "À corriger"** en priorité pour traiter les urgences

---

## 📊 KPIs et Métriques

### Métriques Suivies par Dossier

```typescript
// Par dossier :
- Statut actuel du processus
- Nombre total de documents
- Nombre de documents validés
- Nombre de documents en attente de validation
- Nombre de documents à corriger
- Délai moyen de traitement (créatedAt → updatedAt)

// Globalement :
- Nombre de dossiers par statut
- Temps moyen par étape
- Taux de rejet des documents
- Nombre de versions moyennes par document
```

---

## 🚀 Évolutions Futures

### Phase 2 - Automatisations

- [ ] **Auto-génération** des documents selon la forme juridique
- [ ] **Rappels automatiques** si pas de retour client après X jours
- [ ] **Validation en masse** de plusieurs documents d'un coup
- [ ] **Templates de messages** pour les communications récurrentes
- [ ] **Signature électronique** intégrée directement dans l'interface

### Phase 3 - Analytics

- [ ] **Dashboard analytics** avec graphiques d'avancement
- [ ] **Alertes** sur les dossiers bloqués
- [ ] **Export PDF** du dossier complet
- [ ] **Timeline visuelle** de toutes les actions sur un dossier
- [ ] **Commentaires internes** entre admins sur un dossier

---

## 📚 Navigation

### Structure du Menu Admin

```
📊 Dashboard                    → Vue d'ensemble + stats
📁 Dossiers & Documents        → AdminCompanyProcess (UNIFIÉ)
💳 Paiements                   → Gestion paiements
🏢 Domiciliation              → À développer
⚙️  Modifications              → À développer
🎨 Branding                    → Projets branding
📅 Rendez-vous                 → Gestion RDV
```

### Fichiers Clés

```
/components/admin/
  ├── AdminCompanyProcess.tsx    ← Composant UNIFIÉ (dossiers + documents)
  ├── AdminLayout.tsx            ← Layout avec sidebar
  ├── AdminDashboard.tsx         ← Dashboard principal
  └── ...

/types/index.ts                  ← Définitions TypeScript
/context/AppContext.tsx          ← Context global
/App.tsx                         ← Routing admin
```

---

## 🎓 Exemples d'Usage

### Scénario 1 : Document Rejeté par le Client

```
1. Client valide son dossier mais rejette le document "Statuts"
   avec commentaire : "L'adresse du siège est incorrecte"

2. Dans AdminCompanyProcess :
   - Document "Statuts" apparaît en rouge avec badge "À corriger"
   - Commentaire affiché : "L'adresse du siège est incorrecte"

3. Admin clique "Uploader correction"
   - Modal affiche le commentaire de rejet
   - Admin upload version corrigée avec note : "Correction adresse siège page 3"

4. Système :
   - Crée version 2 du document
   - Status → 'awaiting_validation'
   - Notifie le client

5. Client reçoit notification et valide la v2
   - Document passe à 'validated'
   - Admin voit le document en vert
```

### Scénario 2 : Avancement du Processus

```
1. Dossier en statut "En révision"
   - Admin a fini de vérifier les infos
   - Tous les documents requis sont préparés

2. Admin clique "Passer à l'étape suivante : Documents prêts"

3. Système :
   - Status → 'documents_ready'
   - Stepper progresse visuellement
   - Client notifié

4. Dans le dashboard client :
   - Section "Documents à valider" s'affiche
   - Client peut consulter et valider chaque document
```

---

## 🔐 Sécurité et Permissions

### Règles d'Accès

- ✅ **Admin** peut :
  - Voir tous les dossiers
  - Uploader/modifier documents
  - Faire avancer le processus
  - Contacter les clients

- ❌ **Client** ne peut PAS :
  - Modifier le statut du processus
  - Uploader de documents côté admin
  - Voir les dossiers des autres clients

### Audit Trail

Chaque action est tracée :
- Upload de document → `versions[]` avec `uploadedBy` et `uploadedAt`
- Validation/Rejet → `reviews[]` avec `reviewedBy` et `reviewedAt`
- Changement de status → `updatedAt` mis à jour

---

**Version** : 1.0  
**Date** : Novembre 2024  
**Statut** : ✅ Implémenté et fonctionnel
