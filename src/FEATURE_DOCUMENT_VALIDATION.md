# Système de Validation/Rejet des Documents - Crésus V2

## 📋 Vue d'ensemble

Le système de validation/rejet des documents permet une interaction complète entre le client et l'équipe administrative pour garantir la qualité et l'exactitude de tous les documents légaux avant leur finalisation.

## 🔄 Flux de travail complet

### Étape 1 : Génération et signature
1. **Admin** génère et upload un document
2. **Client** reçoit une notification
3. **Client** visualise et signe le document électroniquement
4. Le document passe au statut `awaiting_validation`

### Étape 2 : Validation par le client
Le client a deux options :

#### Option A : Validation ✅
- Le client valide le document
- Peut ajouter un commentaire optionnel
- Le document passe au statut `validated`
- L'admin reçoit une notification de validation

#### Option B : Rejet ❌
- Le client rejette le document
- **Doit** ajouter un commentaire expliquant le problème
- Le document passe au statut `under_revision`
- L'admin reçoit une notification avec les commentaires du client

### Étape 3 : Correction (si rejet)
1. **Admin** consulte les commentaires de rejet
2. **Admin** corrige le document
3. **Admin** upload une nouvelle version avec commentaire optionnel
4. Le numéro de version s'incrémente automatiquement
5. Le document repasse au statut `awaiting_validation`
6. **Client** est notifié de la nouvelle version
7. Le cycle recommence jusqu'à validation finale

## 🎯 Statuts des documents

| Statut | Description | Côté client | Côté admin |
|--------|-------------|-------------|------------|
| `pending` | Document en attente de signature | Peut signer | En attente |
| `signed` | Document signé mais pas encore en validation | - | - |
| `awaiting_validation` | Document signé, attend validation client | Peut valider/rejeter | En attente |
| `validated` | Document validé par le client | Validé ✓ | Accepté |
| `under_revision` | Document rejeté, nécessite correction | En révision | Action requise |
| `rejected` | Document rejeté définitivement | Rejeté | - |

## 📱 Interface Client (Mobile & Web)

### Composants mis à jour
- `/components/mobile/SignDocuments.tsx` - Interface mobile
- `/components/web/WebSignDocuments.tsx` - Interface web

### Fonctionnalités client
1. **Signature électronique**
   - Zone de dessin tactile/souris
   - Possibilité d'effacer et recommencer
   - Validation de la signature

2. **Validation/Rejet**
   - Modal dédiée avec aperçu du document
   - Zone de commentaire (requis pour rejet)
   - Boutons d'action clairs (Valider/Rejeter)
   - Message d'aide sur le processus

3. **Historique complet**
   - Liste de toutes les versions
   - Historique des validations/rejets
   - Affichage des commentaires
   - Dates et heures précises
   - Téléchargement de chaque version

4. **Indicateurs visuels**
   - Badges de statut colorés
   - Icônes explicites pour chaque état
   - Affichage du numéro de version
   - Dernier commentaire visible directement

## 💼 Interface Admin

### Nouveau composant
- `/components/admin/AdminDocuments.tsx` - Gestion complète des documents

### Fonctionnalités admin

1. **Dashboard de documents**
   - Vue d'ensemble de tous les documents
   - Filtres par statut :
     - Tous
     - À corriger (priorité haute)
     - En validation
     - Validés
   - Compteur d'actions requises

2. **Gestion des rejets**
   - Liste des documents rejetés avec badge orange
   - Affichage du commentaire de rejet
   - Bouton "Corriger" direct
   - Alerte visuelle pour les actions urgentes

3. **Upload de nouvelles versions**
   - Modal dédié avec rappel du commentaire client
   - Zone d'upload du document corrigé
   - Champ commentaire pour expliquer les modifications
   - Incrémentation automatique du numéro de version
   - Notification automatique au client

4. **Historique administrateur**
   - Vue côte à côte : versions uploadées vs retours clients
   - Détails de chaque upload (date, auteur, commentaire)
   - Tous les retours clients avec dates précises
   - Téléchargement de toutes les versions

## 🗂️ Structure de données

### Type Document
```typescript
interface Document {
  id: string;
  name: string;
  type: 'CNI' | 'CASIER' | 'JUSTIFICATIF' | 'STATUTS' | 'ATTESTATION' | 'CONTRAT' | 'RC' | 'NINEA';
  url: string;
  status: 'pending' | 'signed' | 'awaiting_validation' | 'validated' | 'rejected' | 'under_revision';
  uploadedAt: string;
  signedAt?: string;
  currentVersion: number;
  versions: DocumentVersion[];
  reviews: DocumentReview[];
  size?: string;
  pages?: number;
}
```

### Type DocumentVersion
```typescript
interface DocumentVersion {
  versionNumber: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string; // ID de l'admin
  comment?: string; // Note sur les modifications
}
```

### Type DocumentReview
```typescript
interface DocumentReview {
  id: string;
  documentId: string;
  reviewedAt: string;
  status: 'validated' | 'rejected';
  comment?: string; // Requis pour rejet
  reviewedBy: string; // ID du client
}
```

## 🎨 Design & UX

### Codes couleur par statut
- **En attente** : Amber (#F59E0B)
- **Signé** : Blue (#3B82F6)
- **En validation** : Purple (#A855F7)
- **Validé** : Green (#10B981)
- **Rejeté/Révision** : Orange (#F97316) / Red (#EF4444)

### Principes UX
1. **Clarté** : Chaque statut est clairement identifié
2. **Guidage** : Messages d'aide et tooltips
3. **Transparence** : Historique complet accessible
4. **Feedback** : Notifications à chaque action
5. **Prévention** : Validation requise pour actions critiques

## 🔔 Notifications

### Client reçoit :
- Document prêt à signer
- Nouvelle version après correction
- Confirmation de validation
- Rappel si action en attente > 48h

### Admin reçoit :
- Document validé par client
- Document rejeté avec commentaires
- Signature effectuée (en attente validation)
- Rappel si correction en attente > 24h

## ✅ Harmonisation Mobile/Web

Le système est **100% harmonisé** entre mobile et web :
- ✅ Mêmes fonctionnalités
- ✅ Même flux de validation
- ✅ Même structure de données
- ✅ Mêmes statuts et couleurs
- ✅ Interface adaptée au device

### Différences d'interface uniquement
- **Mobile** : Modales en bas de l'écran (bottom sheet)
- **Web** : Modales centrées
- **Mobile** : Signature tactile
- **Web** : Signature à la souris + option upload
- **Mobile** : Liste verticale compacte
- **Web** : Grille responsive avec sidebar

## 🚀 Intégration dans le flux global

### Dans la création d'entreprise
1. Client complète les étapes 1-5
2. Admin génère les documents juridiques
3. Client signe les documents (module actuel)
4. **NOUVEAU** : Client valide ou rejette chaque document
5. Si rejet : Admin corrige et resoume
6. Une fois tous validés : Dossier finalisé

### Dans le dashboard
- Section "Documents" accessible à tout moment
- Badge avec nombre de documents en attente
- Accès rapide aux documents nécessitant action
- Timeline mise à jour avec événements de validation

## 📊 Métriques & Reporting (Admin)

Données disponibles pour analyse :
- Taux de validation au premier upload
- Temps moyen de correction
- Nombre moyen de versions par document
- Types d'erreurs les plus fréquentes (via commentaires)
- Documents avec le plus de rejets
- Performance par type de document

## 🔐 Sécurité & Conformité

- ✅ Signature électronique conforme eIDAS
- ✅ Horodatage de chaque action
- ✅ Traçabilité complète (audit trail)
- ✅ Conservation de toutes les versions
- ✅ Identification de tous les acteurs
- ✅ Commentaires non modifiables après soumission

## 🎓 Guide utilisateur

### Pour le client
1. **Signer** : Dessinez votre signature dans la zone prévue
2. **Valider** : Vérifiez le document et cliquez "Valider"
3. **Rejeter** : Expliquez le problème dans le commentaire
4. **Attendre** : L'équipe corrigera et vous soumettra une nouvelle version

### Pour l'admin
1. **Surveiller** : Vérifiez régulièrement l'onglet "À corriger"
2. **Analyser** : Lisez attentivement le commentaire du client
3. **Corriger** : Modifiez le document selon les demandes
4. **Uploader** : Soumettez la nouvelle version avec explication
5. **Suivre** : Vérifiez la validation finale

## 🔄 Évolutions futures possibles

- [ ] Annotation directe sur le PDF
- [ ] Signature par OTP SMS
- [ ] Chat en temps réel sur chaque document
- [ ] IA pour détecter les erreurs courantes
- [ ] Templates de commentaires prédéfinis
- [ ] Signature multiple (plusieurs associés)
- [ ] Export PDF avec historique complet
- [ ] Validation par étapes (partielle)
- [ ] Délais maximum de révision
- [ ] Escalade automatique si délais dépassés

---

**Date de mise en œuvre** : 4 novembre 2024  
**Version** : 1.0  
**Statut** : ✅ Implémenté et harmonisé Mobile/Web
