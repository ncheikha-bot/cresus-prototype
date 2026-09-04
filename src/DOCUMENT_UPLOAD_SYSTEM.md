# Système de Téléversement et Validation de Documents

## 📋 Vue d'ensemble

Le système de gestion de documents de Crésus V2 permet un téléversement multiple de fichiers avec un workflow complet de validation et de versionnage. Ce système garantit que tous les documents juridiques nécessaires sont vérifiés par l'équipe avant de passer à la signature électronique.

## ✨ Fonctionnalités

### 1. Multi-Upload par Type de Document
- **Upload multiple** : Possibilité de téléverser plusieurs fichiers par catégorie de document
- **Limite configurable** : Chaque type de document a un nombre maximum de fichiers définissable
- **Formats supportés** : PDF, JPG, PNG (max 5 Mo par fichier)
- **Barre de progression** : Feedback visuel en temps réel pendant l'upload

### 2. Statuts des Documents
Chaque document passe par différents statuts :

- **`pending`** : Document uploadé, en attente de traitement
- **`awaiting_validation`** : Document en attente de validation par l'admin
- **`validated`** ✅ : Document approuvé par l'équipe Crésus
- **`rejected`** ❌ : Document rejeté avec raison explicite
- **`under_revision`** 🔄 : Document en cours de correction par le client

### 3. Versionnage Automatique
- **Historique complet** : Chaque modification crée une nouvelle version
- **Traçabilité** : Date, heure et commentaire pour chaque version
- **Version courante** : Affichage clair de la version active
- **Accès aux versions précédentes** : Consultation de tout l'historique

### 4. Interface Client (WebCreateCompany.tsx)

#### Affichage par Document
```typescript
<DocumentUploadManager
  documentType={{
    id: 'cni_gerant',
    name: 'CNI du gérant/président',
    description: 'Copie recto-verso de la carte d\'identité nationale',
    required: true,
    maxFiles: 1
  }}
  onFilesChange={(files) => {
    // Callback avec la liste des fichiers uploadés
  }}
/>
```

#### Fonctionnalités Client
- ✅ Upload de fichiers avec drag & drop
- ✅ Prévisualisation des documents
- ✅ Téléchargement des documents
- ✅ Suivi du statut de validation
- ✅ Visualisation des raisons de rejet
- ✅ Re-upload en cas de rejet
- ✅ Historique des versions
- ✅ Progression globale

### 5. Interface Admin (AdminDocumentReview.tsx)

#### Fonctionnalités Admin
- 📋 Liste de tous les documents en attente
- 👁️ Prévisualisation des documents
- ✅ Validation avec commentaire optionnel
- ❌ Rejet avec raison obligatoire
- 📝 Raisons de rejet prédéfinies
- 📊 Statistiques par dossier
- 🔔 Notifications automatiques au client

## 🎯 Flux de Travail

### Côté Client

1. **Upload Initial**
   ```
   Client téléverse un document
   ↓
   Statut: awaiting_validation
   ↓
   Notification admin : "Nouveau document à valider"
   ```

2. **Validation Admin**
   ```
   Admin valide le document
   ↓
   Statut: validated ✅
   ↓
   Notification client : "Document validé"
   ```

3. **Rejet Admin**
   ```
   Admin rejette avec raison
   ↓
   Statut: rejected ❌
   ↓
   Notification client : "Document rejeté - [raison]"
   ↓
   Client voit la raison et peut re-uploader
   ```

4. **Re-upload**
   ```
   Client téléverse une nouvelle version
   ↓
   Version incrémentée (v2, v3, etc.)
   ↓
   Statut: awaiting_validation
   ↓
   Notification admin : "Nouvelle version disponible"
   ```

## 🔧 Configuration des Documents

### Documents par Forme Juridique

#### SARL / SUARL
```typescript
[
  { id: 'cni_gerant', name: 'CNI du gérant', required: true, maxFiles: 1 },
  { id: 'casier', name: 'Casier judiciaire', required: true, maxFiles: 1 },
  { id: 'justificatif', name: 'Justificatif domicile', required: true, maxFiles: 2 },
  { id: 'cni_associes', name: 'CNI associés', required: true, maxFiles: 50 }
]
```

#### SA (Société Anonyme)
```typescript
[
  // Documents de base +
  { id: 'cni_administrateurs', name: 'CNI administrateurs CA', required: true, maxFiles: 7 }
]
```

#### SAS
```typescript
[
  { id: 'cni_president', name: 'CNI du président', required: true, maxFiles: 1 },
  // + documents de base
]
```

## 💻 Utilisation dans le Code

### 1. Import du Composant
```typescript
import { DocumentUploadManager } from './DocumentUploadManager';
```

### 2. État Local
```typescript
const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedDocument[]>>({});
```

### 3. Intégration
```typescript
{getRequiredDocuments().map((doc) => (
  <DocumentUploadManager
    key={doc.id}
    documentType={doc}
    onFilesChange={(files) => {
      setUploadedFiles(prev => ({
        ...prev,
        [doc.id]: files
      }));
    }}
    companyId={companyId}
  />
))}
```

### 4. Validation avant Passage à l'Étape Suivante
```typescript
const requiredDocs = getRequiredDocuments();
const missingDocs = requiredDocs.filter(doc => 
  !uploadedFiles[doc.id] || uploadedFiles[doc.id].length === 0
);

const rejectedDocs = Object.values(uploadedFiles)
  .flat()
  .filter(doc => doc?.status === 'rejected');

if (missingDocs.length > 0 || rejectedDocs.length > 0) {
  // Bloquer la progression
}
```

## 📊 Statistiques de Progression

### Métriques Affichées
- **Catégories complétées** : X/Y catégories de documents
- **Documents validés** : Nombre de documents avec statut validated
- **En attente** : Nombre de documents awaiting_validation
- **Rejetés** : Nombre de documents rejected nécessitant correction

### Barre de Progression
```typescript
const progress = (
  Object.values(uploadedFiles).filter(files => files?.length > 0).length / 
  getRequiredDocuments().length
) * 100;
```

## 🔔 Notifications

### Événements Déclenchant des Notifications

1. **Upload document** → Admin notifié
2. **Validation document** → Client notifié
3. **Rejet document** → Client notifié avec raison
4. **Re-upload document** → Admin notifié

### Exemple de Notification
```typescript
addNotification({
  userId: client.id,
  title: '✅ Document validé',
  message: `Le document "${documentName}" a été approuvé par notre équipe.`,
  type: 'success',
  read: false,
});
```

## 🎨 Design et UX

### Indicateurs Visuels
- 🟢 **Vert** : Document validé
- 🟠 **Orange** : En attente de validation
- 🔴 **Rouge** : Document rejeté
- 🔵 **Bleu** : En cours de révision

### Animations
- Barres de progression lors de l'upload
- Transitions fluides entre les états
- Feedback immédiat sur les actions

### Accessibilité
- Messages clairs et explicites
- Raisons de rejet détaillées
- Guides visuels pour chaque étape

## 🚀 Bonnes Pratiques

### Pour les Clients
1. ✅ Téléverser des documents clairs et lisibles
2. ✅ Respecter les formats demandés (PDF, JPG, PNG)
3. ✅ Vérifier la validité des documents (dates non expirées)
4. ✅ Lire attentivement les raisons de rejet
5. ✅ Re-uploader rapidement en cas de rejet

### Pour les Admins
1. ✅ Valider/Rejeter rapidement les documents
2. ✅ Fournir des raisons de rejet claires et constructives
3. ✅ Utiliser les raisons prédéfinies quand applicable
4. ✅ Ajouter des commentaires pour guider le client
5. ✅ Vérifier l'historique avant validation

## 📝 Types TypeScript

```typescript
interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'pending' | 'awaiting_validation' | 'validated' | 'rejected' | 'under_revision';
  version: number;
  rejectionReason?: string;
  versions?: DocumentVersionHistory[];
}

interface DocumentVersionHistory {
  version: number;
  uploadedAt: string;
  status: 'pending' | 'awaiting_validation' | 'validated' | 'rejected';
  comment?: string;
}
```

## 🔒 Sécurité

- ✅ Validation côté serveur des formats de fichiers
- ✅ Limite de taille par fichier (5 Mo)
- ✅ Scan antivirus recommandé
- ✅ Stockage sécurisé des documents
- ✅ Accès restreint aux documents validés uniquement

## 📈 Évolutions Futures

- [ ] Signature électronique intégrée
- [ ] OCR pour extraction automatique des données
- [ ] Validation automatique basée sur l'IA
- [ ] Compression intelligente des images
- [ ] Support de formats supplémentaires (DOC, DOCX)
- [ ] Annotations sur les documents
- [ ] Comparaison visuelle entre versions

---

**Version** : 1.0  
**Dernière mise à jour** : Novembre 2025  
**Auteur** : Équipe Crésus V2
