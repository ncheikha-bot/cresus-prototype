# Guide - Étapes de Processus Unifiées

## 📋 Vue d'ensemble

Le système d'étapes de processus a été **complètement unifié** entre l'admin et le client, avec des labels spécifiques pour chaque contexte.

## 🎯 Fichiers concernés

### 1. **Configuration centrale** : `/data/processSteps.ts`
- Contient toutes les définitions d'étapes
- Labels séparés pour admin et client
- Helpers pour la gestion des états

### 2. **Composant réutilisable** : `/components/ProcessTimeline.tsx`
- Composant de timeline horizontal et vertical
- Version mini pour petits écrans
- Utilise automatiquement les bons labels

### 3. **Intégrations**
- `/components/admin/AdminCompanyProcess.tsx` - Création entreprise (admin)
- `/components/admin/AdminModifications.tsx` - Modifications (admin)
- `/components/web/WebTimeline.tsx` - Timeline web (client)
- `/components/mobile/Timeline.tsx` - Timeline mobile (client)

---

## 🔄 Étapes du Processus de Création

### Étape 1️⃣ : Dossier soumis
- **Admin** : "Dossier soumis" - Informations reçues
- **Client** : "Dossier soumis" - Votre demande a été envoyée
- **Icône** : FileText
- **Statut** : `submitted`

### Étape 2️⃣ : En révision
- **Admin** : "En révision" - Vérification en cours
- **Client** : "Examen du dossier" - Vérification de vos documents
- **Icône** : Eye
- **Statut** : `in_review`

### Étape 3️⃣ : Documents prêts
- **Admin** : "Documents prêts" - Documents générés
- **Client** : "Documents disponibles" - Vos statuts sont prêts
- **Icône** : FileCheck
- **Statut** : `documents_ready`

### Étape 4️⃣ : Signé
- **Admin** : "Signé" - Signatures obtenues
- **Client** : "Signature effectuée" - Documents signés électroniquement
- **Icône** : PenTool
- **Statut** : `signed`

### Étape 5️⃣ : Finalisé
- **Admin** : "Finalisé" - Dossier terminé
- **Client** : "Entreprise créée" - Votre entreprise est créée
- **Icône** : Building
- **Statut** : `completed`

---

## 🔧 Étapes du Processus de Modification

### Étape 1️⃣ : Demande soumise
- **Admin** : "Demande soumise" - Documents reçus
- **Client** : "Demande envoyée" - Votre demande a été envoyée
- **Icône** : FileText
- **Statut** : `submitted`

### Étape 2️⃣ : En révision
- **Admin** : "En révision" - Vérification documents
- **Client** : "Examen en cours" - Examen de votre demande
- **Icône** : Eye
- **Statut** : `in_review`

### Étape 3️⃣ : Documents de modification prêts
- **Admin** : "Docs de modification prêts" - Envoyés au client
- **Client** : "Documents disponibles" - Documents à valider
- **Icône** : FileCheck
- **Statut** : `documents_ready`

### Étape 4️⃣ : Signé/Validé
- **Admin** : "Signé" - Validé par le client
- **Client** : "Validation effectuée" - Documents validés
- **Icône** : CheckCircle
- **Statut** : `signed`

### Étape 5️⃣ : Finalisé
- **Admin** : "Finalisé" - Docs officiels envoyés
- **Client** : "Modification complétée" - Modification finalisée
- **Icône** : Building
- **Statut** : `completed`

---

## 💻 Utilisation dans le code

### Import des étapes

```typescript
import { 
  ADMIN_CREATION_PROCESS_STEPS,
  ADMIN_MODIFICATION_PROCESS_STEPS,
  getClientLabel,
  getClientDescription,
  getCurrentStepIndex,
  isStepCompleted,
  isStepActive
} from '../data/processSteps';
```

### Utilisation côté Admin

```typescript
// AdminCompanyProcess.tsx ou AdminModifications.tsx
const PROCESS_STEPS = ADMIN_CREATION_PROCESS_STEPS;

// Afficher les labels admin
{PROCESS_STEPS.map(step => (
  <div key={step.id}>
    <h3>{step.label}</h3>
    <p>{step.description}</p>
  </div>
))}
```

### Utilisation côté Client

```typescript
// Dans un composant client (web ou mobile)
import { ProcessTimeline } from '../components/ProcessTimeline';

// Timeline horizontale
<ProcessTimeline 
  currentStatus="in_review" 
  type="creation"
  variant="horizontal"
  showDescriptions={true}
/>

// Timeline verticale (mobile)
<ProcessTimeline 
  currentStatus="documents_ready" 
  type="modification"
  variant="vertical"
  showDescriptions={true}
/>

// Version mini (dashboard)
<ProcessTimelineMini 
  currentStatus="signed" 
  type="creation"
/>
```

### Helpers disponibles

```typescript
// Obtenir le label côté client
const clientLabel = getClientLabel(step);
// "Examen du dossier" au lieu de "En révision"

// Obtenir la description côté client
const clientDesc = getClientDescription(step);
// "Vérification de vos documents" au lieu de "Vérification en cours"

// Index de l'étape courante
const currentIndex = getCurrentStepIndex(ADMIN_CREATION_PROCESS_STEPS, 'in_review');
// Retourne 1

// Vérifier si complété
const completed = isStepCompleted(ADMIN_CREATION_PROCESS_STEPS, 0, 'in_review');
// true pour l'index 0 si on est à 'in_review'

// Vérifier si actif
const active = isStepActive(ADMIN_CREATION_PROCESS_STEPS, 1, 'in_review');
// true pour l'index 1 si on est à 'in_review'
```

---

## 📱 Timeline détaillée (Client)

Pour les clients, une timeline plus détaillée est disponible :

```typescript
import { CLIENT_CREATION_TIMELINE_EVENTS } from '../data/processSteps';

// 7 événements détaillés :
// 1. Dossier créé
// 2. Documents soumis
// 3. Examen par Crésus
// 4. Documents prêts
// 5. Signature électronique
// 6. Documents officiels
// 7. Entreprise créée
```

---

## 🎨 Composant ProcessTimeline

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `currentStatus` | `string` | - | Statut actuel (`submitted`, `in_review`, etc.) |
| `type` | `'creation' \| 'modification'` | `'creation'` | Type de processus |
| `variant` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation de la timeline |
| `showDescriptions` | `boolean` | `true` | Afficher les descriptions |

### Variants

#### Horizontal (Desktop)
```typescript
<ProcessTimeline 
  currentStatus="in_review"
  variant="horizontal"
/>
```
- Étapes en ligne horizontale
- Idéal pour grands écrans
- Barres de connexion entre les étapes

#### Vertical (Mobile)
```typescript
<ProcessTimeline 
  currentStatus="documents_ready"
  variant="vertical"
/>
```
- Étapes empilées verticalement
- Optimisé pour mobile
- Ligne verticale de connexion

#### Mini (Dashboard)
```typescript
<ProcessTimelineMini 
  currentStatus="signed"
/>
```
- Affiche uniquement l'étape courante
- Barre de progression globale
- Compact pour les dashboards

---

## 🔄 Workflow complet

### Création d'entreprise

```
Client soumet le dossier
    ↓
[submitted] Dossier soumis
    ↓
Admin examine les documents
    ↓
[in_review] En révision / Examen du dossier
    ↓
Admin génère les documents (statuts, etc.)
    ↓
[documents_ready] Documents prêts / Documents disponibles
    ↓
Client signe électroniquement
    ↓
[signed] Signé / Signature effectuée
    ↓
Admin envoie les documents officiels (RC, NINEA)
    ↓
[completed] Finalisé / Entreprise créée
```

### Modification post-statutaire

```
Client soumet la demande
    ↓
[submitted] Demande soumise / Demande envoyée
    ↓
Admin vérifie les documents client
    ↓
[in_review] En révision / Examen en cours
    ↓
Admin prépare les documents de modification
    ↓
[documents_ready] Docs de modification prêts / Documents disponibles
    ↓
Client valide et signe
    ↓
[signed] Signé / Validation effectuée
    ↓
Admin envoie les documents officiels modifiés
    ↓
[completed] Finalisé / Modification complétée
```

---

## 🎯 Avantages du système unifié

### ✅ Cohérence
- Mêmes statuts partout dans l'application
- Logique unique pour la progression
- Code réutilisable

### ✅ Clarté
- Labels adaptés au contexte (admin vs client)
- Descriptions explicites pour chaque rôle
- Timeline visuelle intuitive

### ✅ Maintenabilité
- Configuration centralisée dans `/data/processSteps.ts`
- Composants réutilisables
- Facile à modifier ou étendre

### ✅ Notifications automatiques
- Les notifications utilisent automatiquement les bons labels
- Messages adaptés au contexte du client
- Cohérence dans toute l'expérience utilisateur

---

## 🚀 Extension du système

### Ajouter une nouvelle étape

```typescript
// Dans /data/processSteps.ts
export const ADMIN_CREATION_PROCESS_STEPS: ProcessStep[] = [
  // ... étapes existantes
  { 
    id: 6, 
    key: 'nouvelle_etape', 
    label: 'Label Admin', 
    labelClient: 'Label Client',
    description: 'Description admin',
    descriptionClient: 'Description client',
    icon: NouvelleIcone 
  },
];
```

### Ajouter un nouveau type de processus

```typescript
// Exemple : Processus de domiciliation
export const ADMIN_DOMICILIATION_PROCESS_STEPS: ProcessStep[] = [
  { id: 1, key: 'requested', label: 'Demande reçue', ... },
  { id: 2, key: 'address_assigned', label: 'Adresse attribuée', ... },
  { id: 3, key: 'contract_ready', label: 'Contrat prêt', ... },
  { id: 4, key: 'active', label: 'Domiciliation active', ... },
];
```

---

## 📝 Bonnes pratiques

### ✅ À faire
- Toujours utiliser les constantes de `/data/processSteps.ts`
- Utiliser `getClientLabel()` pour les interfaces client
- Utiliser le composant `ProcessTimeline` quand possible
- Tester les transitions entre étapes

### ❌ À éviter
- Ne pas créer de nouvelles définitions d'étapes en local
- Ne pas dupliquer la logique de progression
- Ne pas afficher les labels admin au client
- Ne pas hardcoder les statuts en string

---

## 🔍 Débogage

### Vérifier l'étape courante

```typescript
console.log('Étape courante:', currentStatus);
console.log('Index:', getCurrentStepIndex(ADMIN_CREATION_PROCESS_STEPS, currentStatus));
```

### Vérifier les labels

```typescript
const step = ADMIN_CREATION_PROCESS_STEPS.find(s => s.key === currentStatus);
console.log('Label admin:', step?.label);
console.log('Label client:', step?.labelClient);
```

---

## 📚 Ressources

- **Configuration** : `/data/processSteps.ts`
- **Composant Timeline** : `/components/ProcessTimeline.tsx`
- **Admin Création** : `/components/admin/AdminCompanyProcess.tsx`
- **Admin Modifications** : `/components/admin/AdminModifications.tsx`
- **Client Web** : `/components/web/WebTimeline.tsx`
- **Client Mobile** : `/components/mobile/Timeline.tsx`

---

**Date de mise à jour** : 5 novembre 2024  
**Version** : 1.0.0
