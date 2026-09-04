# 📦 Guide du Système de Livrables - Crésus V2

## 🎯 Vue d'ensemble

Le module **Branding & Communication** fonctionne avec un système de **paiement à la commande** (pas de devis). Une fois le paiement effectué, le projet démarre et l'équipe envoie des **livrables** que le client peut **approuver** ou demander une **révision**.

---

## 🔄 Workflow

```
1. Client sélectionne un service → Paie le forfait
2. Projet démarre → Status: "in-progress"
3. Équipe travaille et prépare les livrables
4. Équipe envoie un livrable → Ajouté au fil de discussion
5. Client reçoit notification
6. Client consulte le livrable et ses fichiers
7. Client donne son avis:
   ├─ ✅ Approuve → Livrable validé, projet continue
   └─ 🔄 Demande révision → Équipe reçoit feedback détaillé
8. Si révision: Équipe corrige → Renvoie version 2
9. Répéter jusqu'à approbation finale
10. Tous livrables approuvés → Projet livré ✨
```

---

## 📁 Architecture des Fichiers

### Fichiers créés

```
/data/brandingData.ts                    ← Types et données (mis à jour)
/components/DeliverableCard.tsx          ← Carte d'affichage d'un livrable
/components/modals/DeliverableModals.tsx ← Modal de review
/hooks/useDeliverableActions.ts          ← Hook personnalisé
```

### Fichiers à intégrer

```
/components/mobile/Branding.tsx          ← Vue mobile du module
/components/web/WebBranding.tsx          ← Vue web du module
/components/admin/AdminBranding.tsx      ← Interface admin
```

---

## 🧩 Types TypeScript

### Nouveaux types dans `brandingData.ts`

```typescript
// Statut des livrables
export type DeliverableStatus = 
  | 'pending-review'      // En attente de validation client
  | 'approved'            // Approuvé par le client
  | 'revision-requested'; // Client a demandé des modifications

// Type de message
export type MessageType = 
  | 'text'              // Message texte normal
  | 'delivery'          // Envoi d'un livrable
  | 'approval'          // Approbation d'un livrable
  | 'revision-request'  // Demande de révision
  | 'system';           // Message système

// Fichier d'un livrable
export interface DeliverableFile {
  id: string;
  name: string;         // Ex: "Logo_Final.ai"
  type: string;         // Ex: "AI", "PDF", "ZIP"
  size: string;         // Ex: "2.4 MB"
  url: string;          // URL de téléchargement
}

// Feedback client sur un livrable
export interface DeliverableFeedback {
  approved: boolean;
  comment?: string;           // Commentaire positif si approuvé
  revisionNotes?: string;     // Notes de révision si refusé
  timestamp: Date;
}

// Livrable complet
export interface ProjectDeliverable {
  id: string;
  name: string;               // Ex: "Propositions de logo"
  description: string;        // Description courte
  version: number;            // Version du livrable (1, 2, 3...)
  files: DeliverableFile[];   // Liste des fichiers
  status: DeliverableStatus;
  uploadedAt: Date;
  uploadedBy: string;         // Nom du designer
  feedback?: DeliverableFeedback; // Feedback client si déjà donné
}

// Message enrichi
export interface ProjectMessage {
  id: string;
  type: MessageType;
  author: 'client' | 'team';
  authorName: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
  deliverableId?: string;     // ID du livrable lié (si applicable)
  metadata?: Record<string, any>; // Métadonnées additionnelles
}
```

### BrandingProject mis à jour

```typescript
export interface BrandingProject {
  id: string;
  service: BrandingService;  // Service contient maintenant `revisionsIncluded`
  status: ProjectStatus;
  clientBrief: {...};
  
  // ✅ NOUVEAU: Paiement au lieu de devis
  payment: {
    amount: number;
    status: 'pending' | 'completed' | 'refunded';
    paidAt?: Date;
    method?: string; // Ex: "Orange Money", "Wave", "Carte bancaire"
  };
  
  appointment?: {...};
  messages: ProjectMessage[];        // Messages enrichis avec types
  deliverables: ProjectDeliverable[]; // Liste des livrables
  revisionsUsed: number;             // Nombre de révisions déjà utilisées
  createdAt: Date;
  updatedAt: Date;
}
```

### BrandingService mis à jour

```typescript
export interface BrandingService {
  id: string;
  // ... autres champs ...
  revisionsIncluded: number; // ✅ NOUVEAU: Ex: 2, 3, etc.
}
```

---

## 🎨 Composants UI

### 1. DeliverableCard

**Carte d'affichage d'un livrable**

```typescript
import { DeliverableCard } from '../components/DeliverableCard';

<DeliverableCard
  deliverable={deliverable}
  onReview={(deliv) => handleOpenReview(deliv)}
  onDownloadFile={(fileId, fileName) => handleDownload(fileId, fileName)}
  onDownloadAll={(deliv) => handleDownloadAll(deliv)}
  mode="mobile" // ou "desktop"
/>
```

**Fonctionnalités:**
- Affiche nom, description, version
- Statut avec badge coloré (pending/approved/revision)
- Liste des fichiers avec bouton télécharger
- Bouton "Donner mon avis" si `status === 'pending-review'`
- Affiche le feedback si déjà donné
- Bouton "Tout télécharger" si plusieurs fichiers

### 2. DeliverableReviewModal

**Modal pour approuver ou demander une révision**

```typescript
import { DeliverableReviewModal } from '../components/modals/DeliverableModals';

<DeliverableReviewModal
  show={showReviewModal}
  onClose={() => setShowReviewModal(false)}
  deliverable={selectedDeliverable}
  onApprove={(comment) => handleApprove(comment)}
  onRequestRevision={(notes) => handleRequestRevision(notes)}
  mode="mobile" // ou "desktop"
  revisionsRemaining={project.service.revisionsIncluded - project.revisionsUsed}
/>
```

**Fonctionnalités:**
- Liste les fichiers du livrable
- 2 options: Approuver ✅ ou Demander révision 🔄
- Si approbation: Champ commentaire optionnel
- Si révision: Champ notes obligatoire + affiche révisions restantes
- Validation automatique
- Animations fluides (bottom sheet mobile, modal desktop)
- Désactive révision si aucune révision restante

---

## ⚙️ Hook: useDeliverableActions

**Hook personnalisé pour gérer toute la logique**

```typescript
import { useDeliverableActions } from '../hooks/useDeliverableActions';

const deliverableActions = useDeliverableActions(
  selectedProject,
  messages,
  setMessages,
  {
    onSuccess: () => toast.success('Action réussie !'),
    onError: (error) => toast.error(error),
  }
);
```

**Ce qu'il retourne:**

```typescript
{
  // États
  showReviewModal: boolean;
  selectedDeliverable: ProjectDeliverable | null;
  isSubmitting: boolean;
  revisionsRemaining: number;

  // Actions
  openReviewModal: (deliverable: ProjectDeliverable) => void;
  closeReviewModal: () => void;
  handleApproveDeliverable: (comment?: string) => Promise<void>;
  handleRequestRevision: (notes: string) => Promise<void>;
  handleDownloadFile: (fileId: string, fileName: string) => void;
  handleDownloadAll: (deliverable: ProjectDeliverable) => void;
}
```

**Fonctionnalités:**
- ✅ Gère l'ouverture/fermeture du modal
- ✅ Calcule automatiquement les révisions restantes
- ✅ Ajoute des messages dans le fil de discussion
- ✅ Logs console pour debugging
- ✅ Callbacks onSuccess/onError
- ✅ Loading states
- ✅ Validation automatique

---

## 🚀 Intégration Rapide

### Étape 1: Imports

```typescript
// Dans Branding.tsx ou WebBranding.tsx
import { DeliverableCard } from '../components/DeliverableCard';
import { DeliverableReviewModal } from '../components/modals/DeliverableModals';
import { useDeliverableActions } from '../../hooks/useDeliverableActions';
```

### Étape 2: Hook

```typescript
const [selectedProject, setSelectedProject] = useState<BrandingProject | null>(null);
const [messages, setMessages] = useState<ProjectMessage[]>(selectedProject?.messages || []);

const deliverableActions = useDeliverableActions(
  selectedProject,
  messages,
  setMessages
);
```

### Étape 3: Affichage des livrables

```typescript
{/* Section Livrables */}
{selectedProject && selectedProject.deliverables.length > 0 && (
  <div className="p-6 space-y-4">
    <h3 className="text-[#1A2753] font-medium">Livrables</h3>
    
    <div className="space-y-3">
      {selectedProject.deliverables.map((deliverable) => (
        <DeliverableCard
          key={deliverable.id}
          deliverable={deliverable}
          onReview={deliverableActions.openReviewModal}
          onDownloadFile={deliverableActions.handleDownloadFile}
          onDownloadAll={deliverableActions.handleDownloadAll}
          mode="mobile"
        />
      ))}
    </div>
  </div>
)}
```

### Étape 4: Modal

```typescript
{/* Modal de Review */}
<DeliverableReviewModal
  show={deliverableActions.showReviewModal}
  onClose={deliverableActions.closeReviewModal}
  deliverable={deliverableActions.selectedDeliverable}
  onApprove={deliverableActions.handleApproveDeliverable}
  onRequestRevision={deliverableActions.handleRequestRevision}
  mode="mobile"
  revisionsRemaining={deliverableActions.revisionsRemaining}
/>
```

**C'est tout ! 🎉**

---

## 📱 Intégration dans le fil de discussion

Les messages de type `delivery`, `approval` et `revision-request` peuvent être affichés différemment dans le chat:

```typescript
{messages.map((msg) => {
  // Message de livraison
  if (msg.type === 'delivery' && msg.deliverableId) {
    const deliverable = selectedProject?.deliverables.find(
      d => d.id === msg.deliverableId
    );
    
    return (
      <div key={msg.id} className="bg-blue-50 rounded-xl p-4">
        <p className="text-blue-900 font-medium mb-2">
          📦 {msg.authorName} a envoyé un livrable
        </p>
        <p className="text-blue-800 text-sm mb-3">{msg.content}</p>
        {deliverable && (
          <DeliverableCard
            deliverable={deliverable}
            onReview={deliverableActions.openReviewModal}
            mode="mobile"
          />
        )}
      </div>
    );
  }
  
  // Message d'approbation
  if (msg.type === 'approval') {
    return (
      <div key={msg.id} className="bg-green-50 rounded-xl p-4">
        <p className="text-green-900 font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {msg.authorName} a approuvé un livrable
        </p>
        <p className="text-green-800 text-sm mt-2">{msg.content}</p>
      </div>
    );
  }
  
  // Message de demande de révision
  if (msg.type === 'revision-request') {
    return (
      <div key={msg.id} className="bg-orange-50 rounded-xl p-4">
        <p className="text-orange-900 font-medium flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          {msg.authorName} a demandé des modifications
        </p>
        <p className="text-orange-800 text-sm mt-2 whitespace-pre-wrap">
          {msg.content}
        </p>
      </div>
    );
  }
  
  // Message texte normal
  return (
    <div key={msg.id} className={/* style normal */}>
      {msg.content}
    </div>
  );
})}
```

---

## 🎨 Design System

Toutes les couleurs respectent la charte Crésus:

```css
/* Statuts des livrables */
pending-review  → Bleu    → bg-blue-50 border-blue-200 text-blue-900
approved        → Vert    → bg-green-50 border-green-200 text-green-900
revision        → Orange  → bg-orange-50 border-orange-200 text-orange-900

/* Actions */
Approuver       → Vert    → bg-green-600 hover:bg-green-700
Révision        → Orange  → bg-orange-600 hover:bg-orange-700
Télécharger     → Bleu    → bg-[#273A7A]/10 hover:bg-[#273A7A]/20
Valider         → Or      → bg-[#D6A93A] hover:bg-[#D6A93A]/90
```

---

## 🔧 Backend (à implémenter)

### Endpoints nécessaires

```typescript
// Approuver un livrable
POST /api/branding/projects/:projectId/deliverables/:deliverableId/approve
Body: { comment?: string }

// Demander une révision
POST /api/branding/projects/:projectId/deliverables/:deliverableId/request-revision
Body: { revisionNotes: string }

// Télécharger un fichier
GET /api/files/:fileId/download

// Télécharger tous les fichiers (ZIP)
GET /api/deliverables/:deliverableId/download-all

// [Admin] Envoyer un livrable
POST /api/branding/projects/:projectId/deliverables
Body: {
  name: string;
  description: string;
  files: Array<{ name, type, size, url }>;
}
```

### Schéma BDD

```sql
-- Table deliverables
CREATE TABLE branding_deliverables (
  id VARCHAR PRIMARY KEY,
  project_id VARCHAR REFERENCES branding_projects(id),
  name VARCHAR NOT NULL,
  description TEXT,
  version INT DEFAULT 1,
  status VARCHAR CHECK (status IN ('pending-review', 'approved', 'revision-requested')),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table deliverable_files
CREATE TABLE deliverable_files (
  id VARCHAR PRIMARY KEY,
  deliverable_id VARCHAR REFERENCES branding_deliverables(id),
  name VARCHAR NOT NULL,
  type VARCHAR,
  size VARCHAR,
  url VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table deliverable_feedback
CREATE TABLE deliverable_feedback (
  id VARCHAR PRIMARY KEY,
  deliverable_id VARCHAR REFERENCES branding_deliverables(id),
  approved BOOLEAN NOT NULL,
  comment TEXT,
  revision_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ajouter à branding_projects
ALTER TABLE branding_projects ADD COLUMN revisions_used INT DEFAULT 0;

-- Messages enrichis
ALTER TABLE branding_messages ADD COLUMN type VARCHAR DEFAULT 'text';
ALTER TABLE branding_messages ADD COLUMN deliverable_id VARCHAR;
ALTER TABLE branding_messages ADD COLUMN metadata JSONB;
```

---

## 🧪 Données de test

3 projets mock sont disponibles dans `mockBrandingProjects`:

1. **proj-001**: Identité visuelle
   - 1 livrable `pending-review`
   - 3 fichiers PDF
   - 0 révisions utilisées

2. **proj-002**: Logo
   - 1 livrable `approved`
   - 3 fichiers AI
   - Feedback positif
   - 0 révisions utilisées

3. **proj-003**: Pack réseaux sociaux
   - 1 livrable `revision-requested`
   - 2 fichiers (ZIP + PDF)
   - Feedback avec notes de révision
   - 1 révision utilisée

---

## ✅ Checklist d'intégration

### Frontend Mobile
- [ ] Importer `DeliverableCard` et `DeliverableReviewModal`
- [ ] Utiliser le hook `useDeliverableActions`
- [ ] Afficher les livrables dans l'interface projet
- [ ] Intégrer modal de review
- [ ] Enrichir le fil de discussion avec types de messages
- [ ] Tester le flux complet

### Frontend Web
- [ ] Mêmes étapes que mobile
- [ ] Utiliser `mode="desktop"` pour les composants
- [ ] Adapter le layout pour grands écrans

### Admin Dashboard
- [ ] Créer interface d'envoi de livrables
- [ ] Afficher les feedbacks des clients
- [ ] Gérer les versions de livrables
- [ ] Dashboard analytics (taux d'approbation, délais)

### Backend
- [ ] Créer les endpoints API
- [ ] Implémenter schéma BDD
- [ ] Gérer upload de fichiers (S3/Cloud Storage)
- [ ] Générer les ZIP pour "Télécharger tout"
- [ ] Notifications email/push
- [ ] Webhooks pour synchronisation

---

## 💡 Bonnes pratiques

### UX
1. **Toujours notifier** le client quand un livrable est envoyé
2. **Afficher clairement** le nombre de révisions restantes
3. **Bloquer les révisions** si aucune restante (avec message explicatif)
4. **Confirmer les actions** (approbation/révision) avant envoi
5. **Donner du feedback visuel** (loading, success, error)

### Performance
1. **Lazy load** les fichiers lourds
2. **Thumbnail preview** pour images/PDFs
3. **Pagination** si beaucoup de livrables
4. **Cache** les fichiers téléchargés côté client

### Sécurité
1. **URLs signées** pour téléchargements (expiration 1h)
2. **Validation côté serveur** du nombre de révisions
3. **Limiter taille** des uploads (ex: 50 MB max par fichier)
4. **Scan antivirus** sur fichiers uploadés

---

## 📊 Métriques à tracker

- Temps moyen avant première approbation
- Taux d'approbation au premier envoi
- Nombre moyen de révisions par projet
- Types de révisions les plus fréquentes
- Délai moyen de livraison par service
- Satisfaction client sur livrables

---

## 🎯 Prochaines améliorations

1. **Comparaison versions** (side-by-side avant/après révision)
2. **Annotations** sur fichiers (dessiner, commenter)
3. **Historique versions** complet avec diff
4. **Templates de feedback** pour accélérer les révisions
5. **Prévisualisation** intégrée (PDF, images) sans télécharger
6. **Collaboration** temps réel (commentaires en direct)

---

**Version:** 1.0.0  
**Date:** 4 novembre 2025  
**Status:** ✅ Prêt à l'emploi
