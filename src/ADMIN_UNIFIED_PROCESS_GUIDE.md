# Guide Complet - Processus de Création d'Entreprise Unifié Admin

## 📋 Vue d'ensemble

Le système **AdminCompanyProcess** unifie la gestion complète des dossiers de création d'entreprise en intégrant :

1. ✅ **Suivi du processus en 5 étapes**
2. ✅ **Gestion des documents** (upload, validation, versionnage)
3. ✅ **Échanges avec le client** (retours, commentaires, notifications)
4. ✅ **Validation des documents par le client**
5. ✅ **Documents requis dynamiques** selon la forme juridique sénégalaise

## 🎯 Architecture du Système

### Composants
```
AdminDossiers.tsx (Point d'entrée)
    └── AdminCompanyProcess.tsx (Composant unifié)
```

### Flux de données
```
Liste des dossiers → Détails du dossier → Gestion des documents → Échanges client
```

## 🔄 Processus en 5 Étapes

### 1. **Dossier soumis** (`submitted`)
- Informations reçues du client
- Dossier en attente de traitement
- Action : Passer en révision

### 2. **En révision** (`in_review`)
- Vérification des informations
- Upload des premiers documents
- Validation de la cohérence
- Action : Générer les documents

### 3. **Documents prêts** (`documents_ready`)
- Documents générés et uploadés
- Envoi au client pour validation
- Gestion des retours client
- Action : Attendre signatures

### 4. **Signé** (`signed`)
- Documents signés par le client
- Validation finale
- Préparation des livrables
- Action : Finaliser

### 5. **Finalisé** (`completed`)
- Dossier terminé
- Entreprise créée
- Livrables remis au client

## 📄 Gestion des Documents

### Documents Requis par Forme Juridique

#### SARL / SUARL
```typescript
- CNI du gérant / associé unique
- Extrait de casier judiciaire (< 3 mois)
- Justificatif de domicile (facture récente)
- Statuts de la société (signés)
- Attestation de dépôt du capital
```

#### SA
```typescript
- CNI des administrateurs (tous)
- Extraits de casier (chaque admin)
- Justificatif de domicile du siège
- Statuts de la SA (signés par fondateurs)
- PV d'assemblée générale (nomination conseil)
- Attestation de dépôt (minimum 25% libéré)
```

#### SAS
```typescript
- CNI du président
- Extrait de casier du président
- Justificatif de domicile du siège
- Statuts de la SAS (signés)
- Attestation de dépôt du capital
```

#### SNC
```typescript
- CNI de tous les associés
- Extraits de casier (chaque associé)
- Justificatif de domicile du siège
- Statuts de la SNC (signés)
```

#### SCI
```typescript
- CNI de tous les associés
- Extraits de casier (chaque associé)
- Justificatif de domicile du bien immobilier
- Statuts de la SCI (signés)
```

### Statuts des Documents

#### `pending` 
- Document en attente d'upload
- Pas encore disponible
- Badge gris

#### `awaiting_validation`
- Document uploadé par l'admin
- En attente de validation par le client
- Badge violet
- Notification envoyée au client

#### `validated`
- Document validé par le client
- Approuvé et conforme
- Badge vert
- Peut être signé

#### `under_revision`
- Document refusé par le client
- Corrections nécessaires
- Badge rouge
- Commentaire client visible

#### `signed`
- Document signé électroniquement
- Finalisé
- Badge bleu
- Prêt pour archivage

## 🔄 Cycle de Vie d'un Document

### 1. Upload Initial (Admin → Client)
```typescript
Admin upload document
  ↓
Status: awaiting_validation
  ↓
Notification envoyée au client
  ↓
Client reçoit le document pour validation
```

### 2. Validation Client (Client → Admin)

#### Cas 1 : Document validé
```typescript
Client valide le document
  ↓
Status: validated
  ↓
Review ajouté (status: validated)
  ↓
Notification admin (optionnelle)
  ↓
Document prêt pour signature
```

#### Cas 2 : Document refusé
```typescript
Client refuse avec commentaire
  ↓
Status: under_revision
  ↓
Review ajouté (status: rejected, comment: "raison")
  ↓
Notification admin avec le retour
  ↓
Admin doit uploader nouvelle version
```

### 3. Nouvelle Version (Admin → Client)
```typescript
Admin upload nouvelle version
  ↓
Version incrémantée (v1 → v2)
  ↓
Status: awaiting_validation
  ↓
Historique des versions conservé
  ↓
Client valide la nouvelle version
```

### 4. Signature (Client → Admin)
```typescript
Tous les documents validés
  ↓
Client accède à la signature électronique
  ↓
Signature de chaque document
  ↓
Status: signed
  ↓
Notification admin
  ↓
Dossier peut être finalisé
```

## 💬 Échanges Admin ↔ Client

### Notifications Automatiques

#### Upload de document
```
Titre: "Document mis à jour"
Message: "Une nouvelle version de '[nom]' a été uploadée et attend votre validation."
Type: info
```

#### Nouveau document ajouté
```
Titre: "Nouveau document disponible"
Message: "Le document '[nom]' a été uploadé et attend votre validation."
Type: info
```

#### Avancement du processus
```
Titre: "Mise à jour de votre dossier"
Message: "Le statut de [entreprise] a été mis à jour : [nouveau statut]"
Type: info
```

#### Message personnalisé
```
Titre: "Message de Crésus"
Message: [texte libre de l'admin]
Type: info
```

### Interface Admin

#### Contacter le client
- Bouton "Contacter le client" dans la vue détails
- Modal avec textarea pour message libre
- Envoi de notification au client
- Historique des messages (à implémenter)

#### Retours client visibles
- Commentaires affichés sur chaque document
- Badge rouge pour documents à corriger
- Citation du commentaire client
- Date et heure du retour

## 📊 Statistiques du Dossier

### Stats Globales (Vue Liste)
```typescript
- Total dossiers par statut
- Barre de progression (%)
- Documents validés / total
- Alertes documents à corriger
```

### Stats Détails (Vue Dossier)
```typescript
- Total documents uploadés
- Documents validés (vert)
- Documents en validation (violet)
- Documents à corriger (rouge)
- Documents signés (bleu)
```

### Indicateurs Visuels
```typescript
- Documents manquants (alerte orange)
- Progression du processus (stepper)
- État de chaque document (badges couleur)
- Retours client (encadrés rouge/vert)
```

## 🎨 Interface Utilisateur

### Vue Liste des Dossiers

```
┌─────────────────────────────────────────────────────────┐
│ [Recherche...] [Filtrer par statut ▼]                  │
├─────────────────────────────────────────────────────────┤
│ Soumis: 3  │ Révision: 5  │ Docs prêts: 2  │ etc.     │
├─────────────────────────────────────────────────────────┤
│ [📋 SARL Tech Innovation]                               │
│ SARL • Commerce • 1M FCFA                               │
│ ▓▓▓▓▓▓░░░░ 60%                                          │
│ 📄 5 docs • ✓ 3 validés • ⏱ 2 en validation           │
└─────────────────────────────────────────────────────────┘
```

### Vue Détails du Dossier

```
┌─────────────────────────────────────────────────────────┐
│ [←] SARL Tech Innovation            [Contacter client]  │
│ SARL • Commerce • 1M FCFA                               │
├─────────────────────────────────────────────────────────┤
│ PROGRESSION DU DOSSIER                                  │
│ ◉───●───○───○───○                                       │
│ Soumis  En révision  Docs prêts  Signé  Finalisé       │
│              [Passer à l'étape suivante]                │
├─────────────────────────────────────────────────────────┤
│ STATS DOCUMENTS                                          │
│ 📄 5  │  ✓ 3  │  ⏱ 1  │  ⚠ 1  │  🔐 0                 │
├─────────────────────────────────────────────────────────┤
│ ⚠ DOCUMENTS MANQUANTS (2)                               │
│ [CNI du gérant] [Casier judiciaire]                    │
├─────────────────────────────────────────────────────────┤
│ DOCUMENTS DU DOSSIER (5/7)          [+ Ajouter]        │
│                                                          │
│ [📄] Statuts de la société          [✓ Validé]         │
│      245 KB • 12 pages • v1                             │
│      [Historique] [Aperçu] [Télécharger]               │
│                                                          │
│ [⚠] CNI du gérant                  [⚠ À corriger]      │
│      128 KB • 2 pages • v2                              │
│      💬 "Document illisible. Meilleure qualité SVP."    │
│      [Historique] [Aperçu] [Télécharger] [Nouvelle v.] │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Actions Disponibles

### Vue Liste
- ✅ Rechercher par nom/forme juridique
- ✅ Filtrer par statut
- ✅ Cliquer sur dossier → Voir détails
- ✅ Stats globales par statut

### Vue Détails - Actions Dossier
- ✅ Avancer au statut suivant
- ✅ Contacter le client (message libre)
- ✅ Voir la progression (stepper)
- ✅ Consulter les stats documents

### Vue Détails - Actions Documents
- ✅ Ajouter un nouveau document
- ✅ Uploader une nouvelle version
- ✅ Consulter l'historique des versions
- ✅ Voir les retours client
- ✅ Télécharger le document
- ✅ Aperçu du document

## 📱 Notifications Client

### Types de notifications générées
1. **Document uploadé** → Client doit valider
2. **Changement de statut** → Client informé de l'avancement
3. **Message admin** → Communication libre
4. **Document signé** → Confirmation de signature

### Accès client aux documents
- **Mobile** : `/components/mobile/Documents.tsx`
- **Web** : `/components/web/WebDocuments.tsx` (à créer si manquant)
- Client peut :
  - Voir tous ses documents
  - Valider ou refuser avec commentaire
  - Télécharger les documents
  - Consulter l'historique

## 🎯 Workflow Complet Exemple

### Création SARL "Tech Innovation"

#### Étape 1 : Dossier soumis
```
1. Client soumet le formulaire de création
2. Admin reçoit le dossier (status: submitted)
3. Admin vérifie les informations
4. Admin clique "Passer à l'étape suivante"
   → Status: in_review
```

#### Étape 2 : En révision
```
1. Admin upload CNI du gérant
   → Notification au client
2. Admin upload Statuts
   → Notification au client
3. Client valide CNI ✓
4. Client refuse Statuts ✗ 
   "Erreur sur l'adresse page 3"
5. Admin voit le retour (badge rouge)
6. Admin upload nouvelle version des Statuts
   → v2, notification au client
7. Client valide nouvelle version ✓
8. Admin upload les autres documents requis
9. Tous documents validés
10. Admin clique "Passer à l'étape suivante"
    → Status: documents_ready
```

#### Étape 3 : Documents prêts
```
1. Client accède à la signature électronique
2. Client signe tous les documents
3. Notifications envoyées à l'admin
4. Admin vérifie les signatures
5. Admin clique "Passer à l'étape suivante"
   → Status: signed
```

#### Étape 4 : Signé
```
1. Admin finalise le dossier
2. Admin upload les livrables finaux
3. Admin clique "Passer à l'étape suivante"
   → Status: completed
```

#### Étape 5 : Finalisé
```
1. Dossier terminé
2. Entreprise créée
3. Client accède aux livrables
4. Fin du processus
```

## 🔐 Sécurité et Permissions

### Admin peut :
- ✅ Voir tous les dossiers
- ✅ Uploader des documents
- ✅ Avancer les statuts
- ✅ Contacter les clients
- ✅ Voir tous les retours clients

### Admin ne peut PAS :
- ❌ Supprimer un dossier
- ❌ Modifier les informations client
- ❌ Supprimer l'historique des versions
- ❌ Forcer une validation client

### Client peut :
- ✅ Voir ses propres dossiers
- ✅ Valider/Refuser les documents
- ✅ Télécharger les documents
- ✅ Signer électroniquement
- ✅ Envoyer des commentaires

### Client ne peut PAS :
- ❌ Uploader lui-même les documents officiels
- ❌ Modifier le statut du dossier
- ❌ Voir les autres dossiers
- ❌ Supprimer des documents

## 📊 Métriques et Suivi

### KPIs à suivre
- Temps moyen par étape
- Taux de refus de documents
- Nombre de versions par document
- Délai de validation client
- Taux de complétion des dossiers

### Rapports possibles
- Dossiers en cours par statut
- Documents les plus souvent refusés
- Performance par type de société
- Volume de dossiers par mois

## 🚀 Améliorations Futures

### Court terme
- [ ] Prévisualisation des documents (PDF viewer)
- [ ] Signature électronique intégrée
- [ ] Historique des messages admin-client
- [ ] Export PDF du dossier complet

### Moyen terme
- [ ] Templates de messages personnalisables
- [ ] Workflow automatisé (rappels, relances)
- [ ] Scan qualité automatique des documents
- [ ] OCR pour extraction d'informations

### Long terme
- [ ] IA pour validation automatique
- [ ] Intégration API APIX Sénégal
- [ ] Génération automatique des documents
- [ ] Blockchain pour traçabilité

## 🎓 Best Practices

### Pour l'Admin
1. ✅ Toujours commenter les nouvelles versions
2. ✅ Vérifier la qualité avant upload
3. ✅ Répondre rapidement aux retours client
4. ✅ Uploader tous les documents requis
5. ✅ Valider la cohérence des informations

### Pour le Client
1. ✅ Valider rapidement les documents
2. ✅ Donner des commentaires précis en cas de refus
3. ✅ Vérifier toutes les pages du document
4. ✅ Télécharger et archiver les documents
5. ✅ Signer dès que tous les documents sont validés

## 📞 Support et Documentation

### Fichiers Principaux
- `/components/admin/AdminCompanyProcess.tsx` - Composant principal
- `/components/admin/AdminDossiers.tsx` - Point d'entrée
- `/types/index.ts` - Définitions TypeScript
- `/context/AppContext.tsx` - État global

### Guides Associés
- `LEGAL_CONSTRAINTS.md` - Contraintes juridiques sénégalaises
- `DOCUMENTS_PAR_SOCIETE.md` - Documents requis détaillés
- `ADMIN_UNIFIED_PROCESS_GUIDE.md` - Ce guide

### Contact
- Documentation technique : Voir fichiers MD à la racine
- Questions : Consulter les commentaires dans le code
- Bugs : Vérifier la console et les logs

---

**Version** : 2.0  
**Date** : Novembre 2025  
**Plateforme** : Crésus V2 - Sénégal  
**Status** : ✅ Production Ready
