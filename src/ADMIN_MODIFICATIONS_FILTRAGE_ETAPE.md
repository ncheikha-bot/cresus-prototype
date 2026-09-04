# Filtrage Intelligent par Étape - Admin Modifications

## Vue d'ensemble

L'interface admin des modifications statutaires affiche maintenant uniquement les éléments pertinents pour l'étape actuelle du workflow. Ce système intelligent adapte l'affichage des documents, actions et informations selon le statut de la demande.

## Statuts du Workflow

Le workflow de modification statutaire comprend désormais 9 statuts :

1. **submitted** - Demande soumise
2. **waiting_quote** - En attente de devis
3. **quote_sent** - Devis envoyé au client
4. **quote_validated** - Devis validé par le client
5. **quote_rejected** - Devis rejeté par le client
6. **in_review** - En révision
7. **documents_ready** - Documents de modification prêts
8. **signed** - Documents signés
9. **completed** - Processus terminé

## Configuration du Filtrage par Étape

### Constante `STEP_RELEVANT_ELEMENTS`

Cette constante définit pour chaque étape :
- **documentsToShow** : Quels types de documents afficher (`'client'`, `'admin'`, `'official'`, `'all'`)
- **adminDocumentsAllowed** : Si l'admin peut ajouter des documents de modification
- **officialDocumentsAllowed** : Si l'admin peut ajouter des documents officiels
- **actions** : Actions disponibles pour l'étape
- **infoSections** : Sections d'information à afficher
- **showQuoteInfo** : Afficher les informations du devis
- **showRejectionReason** : Afficher les raisons de rejet

### Détail par Étape

#### 1. Submitted (Demande soumise)
```javascript
submitted: {
  documentsToShow: ['client'], // Uniquement documents client
  adminDocumentsAllowed: false,
  officialDocumentsAllowed: false,
  actions: ['review', 'message'],
  infoSections: ['company', 'modification', 'clientDocuments'],
}
```

#### 2. Waiting Quote (En attente de devis)
```javascript
waiting_quote: {
  documentsToShow: ['client'],
  adminDocumentsAllowed: false,
  officialDocumentsAllowed: false,
  actions: ['sendQuote', 'message'],
  infoSections: ['company', 'modification', 'clientDocuments'],
}
```

#### 3. Quote Sent (Devis envoyé)
```javascript
quote_sent: {
  documentsToShow: ['client'],
  adminDocumentsAllowed: false,
  officialDocumentsAllowed: false,
  actions: ['message'],
  infoSections: ['company', 'modification', 'quote', 'clientDocuments'],
  showQuoteInfo: true,
}
```

#### 4. Quote Validated (Devis validé)
```javascript
quote_validated: {
  documentsToShow: ['client', 'admin'],
  adminDocumentsAllowed: true, // Admin peut ajouter des docs
  officialDocumentsAllowed: false,
  actions: ['uploadModificationDocs', 'message'],
  infoSections: ['company', 'modification', 'quote', 'clientDocuments'],
  showQuoteInfo: true,
}
```

#### 5. Quote Rejected (Devis rejeté)
```javascript
quote_rejected: {
  documentsToShow: ['client'],
  adminDocumentsAllowed: false,
  officialDocumentsAllowed: false,
  actions: ['reviseQuote', 'message'],
  infoSections: ['company', 'modification', 'quote', 'clientDocuments', 'rejectionReason'],
  showQuoteInfo: true,
  showRejectionReason: true,
}
```

#### 6. In Review (En révision)
```javascript
in_review: {
  documentsToShow: ['client', 'admin'],
  adminDocumentsAllowed: true,
  officialDocumentsAllowed: false,
  actions: ['uploadModificationDocs', 'review', 'message'],
  infoSections: ['company', 'modification', 'clientDocuments', 'adminDocuments'],
}
```

#### 7. Documents Ready (Documents prêts)
```javascript
documents_ready: {
  documentsToShow: ['client', 'admin'],
  adminDocumentsAllowed: true,
  officialDocumentsAllowed: false,
  actions: ['uploadModificationDocs', 'message'],
  infoSections: ['company', 'modification', 'clientDocuments', 'adminDocuments'],
}
```

#### 8. Signed (Signé)
```javascript
signed: {
  documentsToShow: ['client', 'admin', 'official'],
  adminDocumentsAllowed: true,
  officialDocumentsAllowed: true, // Admin peut ajouter docs officiels
  actions: ['uploadOfficialDocs', 'message'],
  infoSections: ['company', 'modification', 'allDocuments'],
}
```

#### 9. Completed (Complété)
```javascript
completed: {
  documentsToShow: ['all'], // Tout afficher
  adminDocumentsAllowed: false,
  officialDocumentsAllowed: false,
  actions: ['message', 'viewHistory'],
  infoSections: ['company', 'modification', 'allDocuments', 'completionInfo'],
}
```

## Fonction de Filtrage

### `getRelevantElements(status)`

Retourne la configuration de l'étape actuelle.

```javascript
const getRelevantElements = (status: Modification['status']) => {
  return STEP_RELEVANT_ELEMENTS[status as keyof typeof STEP_RELEVANT_ELEMENTS] || STEP_RELEVANT_ELEMENTS.submitted;
};
```

### `getStepFilteredDocs()`

Filtre les documents selon :
1. L'étape actuelle (via `documentsToShow`)
2. Le filtre utilisateur (via `docFilter`)

```javascript
const getStepFilteredDocs = () => {
  let docs = requestDocs;
  
  // Filtrage selon l'étape
  const { documentsToShow } = relevantElements;
  if (!documentsToShow.includes('all')) {
    docs = docs.filter(doc => {
      if (documentsToShow.includes('client') && doc.uploadedBy === 'client') return true;
      if (documentsToShow.includes('admin') && doc.uploadedBy === 'admin' && !doc.isOfficial) return true;
      if (documentsToShow.includes('official') && doc.isOfficial) return true;
      return false;
    });
  }

  // Filtrage selon le filtre utilisateur
  if (docFilter !== 'all') {
    docs = docs.filter(doc => {
      if (docFilter === 'client') return doc.uploadedBy === 'client';
      if (docFilter === 'admin') return doc.uploadedBy === 'admin' && !doc.isOfficial;
      if (docFilter === 'official') return doc.isOfficial;
      return true;
    });
  }

  return docs;
};
```

## Modifications Apportées

### 1. Types mis à jour

**`/types/index.ts`** - Interface `Modification`
```typescript
status: 'submitted' | 'waiting_quote' | 'quote_sent' | 'quote_validated' | 
        'quote_rejected' | 'in_review' | 'documents_ready' | 'signed' | 'completed';
```

**`ModificationRequest`** - Ajout de propriétés
```typescript
quote?: {
  amount: number;
  details: string;
  validUntil: string;
};
clientComments?: string;
```

### 2. Fonctions de statut enrichies

**`getStatusLabel`** - Labels pour tous les statuts
```typescript
waiting_quote: 'Attente devis',
quote_sent: 'Devis envoyé',
quote_validated: 'Devis validé',
quote_rejected: 'Devis rejeté',
```

**`getStatusColor`** - Couleurs adaptées
```typescript
waiting_quote: 'bg-orange-100 text-orange-700 border-orange-200',
quote_sent: 'bg-blue-100 text-blue-700 border-blue-200',
quote_validated: 'bg-green-100 text-green-700 border-green-200',
quote_rejected: 'bg-red-100 text-red-700 border-red-200',
```

### 3. Statistiques étendues

```typescript
const stats = {
  total: modificationRequests.length,
  submitted: ...,
  waiting_quote: ...,
  quote_sent: ...,
  quote_validated: ...,
  quote_rejected: ...,
  in_review: ...,
  documents_ready: ...,
  signed: ...,
  completed: ...,
  pending: modificationRequests.filter((r) => 
    ['submitted', 'waiting_quote', 'quote_sent', 'in_review'].includes(r.status)
  ).length,
};
```

### 4. Filtrage intelligent des documents

- Seuls les types de documents pertinents pour l'étape sont affichés
- Les filtres de catégorie s'adaptent selon l'étape
- Le bouton "Ajouter un document" n'apparaît que si autorisé pour l'étape

### 5. Sections contextuelles (à implémenter)

#### Aide contextuelle
Affiche un bandeau d'information selon l'étape :
- **waiting_quote** : "Établir le devis"
- **quote_sent** : "En attente validation client"
- **quote_rejected** : Affiche les commentaires du client

#### Informations du devis
Visible uniquement pour les étapes avec `showQuoteInfo: true` :
- Montant total
- Détails
- Validité

## Avantages du Système

### 1. Clarté
L'admin ne voit que ce qui est pertinent pour l'étape actuelle, évitant la surcharge d'information.

### 2. Guidage
Chaque étape indique clairement les actions attendues de l'admin.

### 3. Cohérence
Le système utilise la même nomenclature que le workflow client.

### 4. Flexibilité
Facile d'ajouter de nouvelles étapes ou de modifier les règles de filtrage.

### 5. Sécurité
Empêche l'ajout de documents inappropriés à une étape donnée.

## Prochaines Étapes Recommandées

### 1. Ajout des aides contextuelles
Implémenter les bandeaux d'aide après la timeline pour guider l'admin.

### 2. Affichage conditionnel du devis
Ajouter la section d'affichage du devis pour les étapes pertinentes.

### 3. Actions contextuelles
Adapter les boutons d'action selon `relevantElements.actions`.

### 4. Timeline étendue
Mettre à jour `ADMIN_MODIFICATION_PROCESS_STEPS` dans `/data/processSteps.ts` pour inclure toutes les étapes du workflow de devis.

### 5. Modal de devis
Créer une modale pour créer/envoyer/réviser un devis.

## Exemple d'utilisation

```typescript
// Dans la vue details
const relevantElements = getRelevantElements(selectedRequest.status);

// Filtrer les documents
const filteredDocs = getStepFilteredDocs();

// Afficher conditionnellement les filtres
{relevantElements.documentsToShow.includes('client') && (
  <button>Client ({clientDocs.length})</button>
)}

// Afficher conditionnellement le bouton d'ajout
{relevantElements.adminDocumentsAllowed && (
  <button>Ajouter un document</button>
)}

// Afficher les informations du devis
{relevantElements.showQuoteInfo && selectedRequest.quote && (
  <div>Devis : {selectedRequest.quote.amount} FCFA</div>
)}
```

## Tests Recommandés

1. **Test de filtrage** : Vérifier que seuls les documents pertinents s'affichent par étape
2. **Test des transitions** : Vérifier que le passage d'une étape à l'autre met à jour correctement l'affichage
3. **Test du workflow devis** : Simuler le parcours complet depuis waiting_quote jusqu'à quote_validated
4. **Test de rejet** : Simuler un rejet de devis et vérifier l'affichage des commentaires

## Documentation Associée

- `/CHANGELOG.md` - Historique des modifications
- `/types/index.ts` - Types TypeScript
- `/data/processSteps.ts` - Étapes du processus
- `/components/mobile/Modification.tsx` - Workflow client mobile
- `/components/web/WebModification.tsx` - Workflow client web
