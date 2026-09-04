# 📄 Système de Documents par Société - Crésus V2

## 🎯 Vue d'ensemble

Les documents légaux sont maintenant **liés à chaque société créée** et suivent un workflow complet entre l'admin et le client avec versionnage.

---

## 🔄 Workflow complet

### 1️⃣ Création de l'entreprise (Client)
Le client crée son entreprise via le formulaire en 5 étapes.

### 2️⃣ Préparation des documents (Admin)
- L'admin accède au dossier de la société
- L'admin prépare les documents légaux :
  - Statuts
  - Attestation de dépôt de capital
  - Formulaire M0
  - PV d'assemblée générale
  - Contrat de domiciliation
  - etc.
- L'admin upload chaque document
- **Le document est automatiquement lié à la société** (`companyId`)

### 3️⃣ Notification client
Le client reçoit une notification : "Vos documents sont prêts"

### 4️⃣ Signature (Client)
- Le client accède à "Signature & Validation"
- Il voit uniquement les documents de SES sociétés
- Il signe chaque document électroniquement
- Statut → `awaiting_validation`

### 5️⃣ Validation ou Rejet (Client)
**Option A : Validation ✅**
- Le client valide le document
- Peut ajouter un commentaire optionnel
- Statut → `validated`
- L'admin reçoit une notification

**Option B : Rejet ❌**
- Le client rejette avec un commentaire obligatoire
- Exemple : "La date de création page 3 est incorrecte"
- Statut → `under_revision`
- L'admin reçoit une notification avec le commentaire

### 6️⃣ Correction (Admin - si rejet)
- L'admin voit le commentaire du client
- L'admin corrige le document
- L'admin upload la **version 2**
- Le document conserve l'historique complet
- Statut → `awaiting_validation`
- Le client est notifié

### 7️⃣ Boucle jusqu'à validation
Le processus continue jusqu'à ce que le client valide tous les documents.

---

## 🗂️ Structure des données

### Document lié à une société

```typescript
{
  id: "doc123",
  companyId: "company456",  // ← Lien avec la société
  name: "Statuts de la société",
  type: "STATUTS",
  status: "awaiting_validation",
  currentVersion: 2,
  versions: [
    {
      versionNumber: 1,
      uploadedAt: "2024-11-01",
      uploadedBy: "admin1",
      url: "/docs/statuts_v1.pdf"
    },
    {
      versionNumber: 2,
      uploadedAt: "2024-11-03",
      uploadedBy: "admin1",
      url: "/docs/statuts_v2.pdf",
      comment: "Correction de la date de création"
    }
  ],
  reviews: [
    {
      id: "r1",
      reviewedAt: "2024-11-02",
      status: "rejected",
      comment: "La date de création page 3 est incorrecte",
      reviewedBy: "client123"
    }
  ]
}
```

---

## 📱 Interface Client

### Accès aux documents
Le client voit UNIQUEMENT les documents de ses sociétés :

```typescript
// Filtrage automatique
const userCompanies = companies.filter(c => c.clientId === currentUser.id);
const userDocuments = documents.filter(d => 
  userCompanies.some(c => c.id === d.companyId)
);
```

### Vue par société (optionnel)
Dans l'écran de détail d'une société, afficher uniquement ses documents :

```typescript
<SignDocuments companyId="company456" />
```

Ou voir tous les documents de toutes les sociétés :

```typescript
<SignDocuments />
```

---

## 💼 Interface Admin

### Module Documents Admin

**Vue globale :**
- Tous les documents de toutes les sociétés
- Filtres :
  - Par statut (À corriger, En validation, Validés)
  - Par société
  - Par date

**Vue par dossier :**
- Dans l'onglet "Dossiers"
- Cliquer sur une société
- Voir tous ses documents
- Uploader de nouveaux documents
- Corriger les documents rejetés

### Upload de document (Admin)

```typescript
addDocument({
  companyId: "company456",  // ID de la société
  name: "Statuts de la société",
  type: "STATUTS",
  url: "/path/to/file.pdf",
  status: "pending",
  size: "245 KB",
  pages: 12,
  description: "Statuts constitutifs"
});
```

### Upload nouvelle version (Admin)

```typescript
addDocumentVersion(
  "doc123",  // ID du document
  "Correction de la date de création page 3"  // Commentaire
);
```

---

## 🔐 Sécurité & Permissions

### Client
- **Peut voir** : Uniquement les documents de SES sociétés
- **Peut faire** :
  - Signer les documents
  - Valider les documents signés
  - Rejeter avec commentaire
  - Voir l'historique complet

### Admin
- **Peut voir** : Tous les documents de toutes les sociétés
- **Peut faire** :
  - Uploader de nouveaux documents
  - Uploader des nouvelles versions
  - Voir tous les commentaires clients
  - Voir l'historique complet
  - Télécharger toutes les versions

---

## 📊 Types de documents

| Type | Description | Requis pour |
|------|-------------|-------------|
| `STATUTS` | Statuts de la société | Création |
| `ATTESTATION` | Attestation de dépôt | Création |
| `CONTRAT` | Contrat de domiciliation | Domiciliation |
| `FORMULAIRE_M0` | Formulaire M0 | Immatriculation |
| `PV_AG` | PV d'assemblée générale | Modifications |
| `RC` | Registre du commerce | Post-création |
| `NINEA` | NINEA | Post-création |
| `CNI` | CNI du gérant | Vérification |
| `CASIER` | Casier judiciaire | Vérification |
| `JUSTIFICATIF` | Justificatif de domicile | Vérification |

---

## 🔄 Statuts des documents

| Statut | Signification | Qui peut agir |
|--------|---------------|---------------|
| `pending` | Document uploadé, en attente de signature | Client doit signer |
| `signed` | Document signé | - |
| `awaiting_validation` | Signé, attend validation client | Client doit valider/rejeter |
| `validated` | Validé par le client | Aucune action requise |
| `under_revision` | Rejeté, en cours de correction | Admin doit corriger |
| `rejected` | Rejeté définitivement | - |

---

## 🎨 Interface utilisateur

### Carte document (Client)

```
┌────────────────────────────────────┐
│ 👁️ Statuts de la société           │
│    En attente de validation        │
│    Version 2                       │
│    ─────────────────────────       │
│    💬 Commentaire admin :          │
│    "Correction de la date de       │
│     création page 3"               │
│    ─────────────────────────       │
│    [Voir] [Historique]             │
│    [✅ Valider] [❌ Rejeter]       │
└────────────────────────────────────┘
```

### Carte document (Admin)

```
┌────────────────────────────────────┐
│ [🔧 À corriger]                    │
│                                    │
│ Statuts - SARL Tech Innovation     │
│ 245 KB • 12 pages • v1             │
│                                    │
│ 💬 Commentaire client :            │
│ "La date de création page 3 est    │
│  incorrecte"                       │
│ 📅 3 nov 2024 à 10:30              │
│                                    │
│ [Historique] [Corriger] [📥]       │
└────────────────────────────────────┘
```

---

## 🔔 Notifications

### Admin reçoit :
- ✅ "Document validé par [Client] - [Société] - [Document]"
- ❌ "Document rejeté par [Client] - [Société] - [Document]"
  - Avec le commentaire de rejet

### Client reçoit :
- 📄 "Nouveaux documents disponibles pour [Société]"
- 🔄 "Document mis à jour : [Document] - Version [X]"
  - Avec la note de l'admin sur les modifications

---

## 💻 Utilisation dans le code

### AppContext - Fonctions disponibles

```typescript
// Récupérer les documents d'une société
const docs = getDocumentsByCompany("company456");

// Ajouter un nouveau document (Admin)
addDocument({
  companyId: "company456",
  name: "Statuts",
  type: "STATUTS",
  url: "/path/file.pdf",
  status: "pending"
});

// Ajouter une nouvelle version (Admin)
addDocumentVersion(
  "doc123",
  "Commentaire sur les modifications"
);

// Ajouter un retour client (Client)
addDocumentReview(
  "doc123",
  "validated", // ou "rejected"
  "Commentaire optionnel"
);

// Changer le statut
updateDocumentStatus("doc123", "signed");
```

---

## 📂 Organisation dans les composants

### Mobile
- `/components/mobile/SignDocuments.tsx` - Signature & validation client
- Peut filtrer par société : `<SignDocuments companyId="123" />`
- Par défaut : montre tous les documents des sociétés du client

### Web
- `/components/web/WebSignDocuments.tsx` - Version web
- Même fonctionnement que mobile

### Admin
- `/components/admin/AdminDocuments.tsx` - Gestion tous documents
- `/components/admin/AdminDossiers.tsx` - Peut contenir section documents par dossier

---

## ✅ Checklist d'intégration

### Côté Admin
- [ ] Dans AdminDossiers, ajouter un bouton "Préparer les documents"
- [ ] Modal d'upload de document avec sélection du type
- [ ] Lier automatiquement au companyId
- [ ] Notifier le client après upload
- [ ] Afficher les documents rejetés en priorité
- [ ] Permettre l'upload de nouvelles versions

### Côté Client
- [ ] Filtrer automatiquement par sociétés du client
- [ ] Afficher uniquement les documents de SES sociétés
- [ ] Badge avec nombre de documents en attente
- [ ] Possibilité de filtrer par société dans l'interface
- [ ] Historique complet accessible

---

## 🚀 Évolutions futures

- [ ] Génération automatique des documents (templates)
- [ ] Signature multiple (plusieurs associés)
- [ ] Workflow de validation interne admin
- [ ] Envoi par email des documents validés
- [ ] Archivage automatique
- [ ] OCR pour extraction de données
- [ ] Templates personnalisables
- [ ] Export ZIP de tous les documents d'une société

---

**Date de création** : 4 novembre 2024  
**Version** : 1.0  
**Statut** : ✅ Implémenté dans AppContext et composants
