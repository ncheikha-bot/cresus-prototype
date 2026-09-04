# Harmonisation Web ↔️ Mobile - Crésus V2

## 📋 Vue d'ensemble

Ce document détaille l'harmonisation des fonctionnalités entre le client web et l'application mobile pour garantir une expérience utilisateur cohérente sur toutes les plateformes.

---

## ✅ Modules harmonisés

### 1. 🏢 Création d'entreprise

#### ⚠️ IMPORTANT : Module complet intégré
La signature électronique et la libération de capital sont **intégrées dans le flux de création d'entreprise**. Elles ne sont **PAS accessibles séparément** depuis la navigation principale.

#### Fonctionnalités communes :
- ✅ Canvas de signature interactif
- ✅ Liste des documents à signer
- ✅ Statut de signature (signé/en attente)
- ✅ Validation et sauvegarde de signature
- ✅ Affichage du montant à payer
- ✅ Sélection du mode de paiement
- ✅ Support Orange Money, Wave, Free Money, Carte bancaire
- ✅ État de traitement avec loader
- ✅ Notifications après signature/paiement

#### Modes de paiement :
1. **Orange Money** 🟠 - Paiement instantané
2. **Wave** 💙 - Paiement instantané
3. **Free Money** 📲 - Paiement instantané
4. **Carte bancaire** 💳 - Paiement par carte

#### Fichiers :
- 📱 `/components/mobile/CreateCompany.tsx` (inclut signature & capital)
- 💻 `/components/web/WebCreateCompany.tsx` (inclut signature & capital)
- 📱 `/components/mobile/SignDocuments.tsx` (utilisé uniquement pour accès séparé si nécessaire)
- 📱 `/components/mobile/CapitalPayment.tsx` (utilisé uniquement pour accès séparé si nécessaire)
- 💻 `/components/web/WebSignDocuments.tsx` (non utilisé - intégré dans création)
- 💻 `/components/web/WebCapitalPayment.tsx` (non utilisé - intégré dans création)

---

### 2. 🏢 Flux de création d'entreprise détaillé

#### Flux complet (5 étapes identiques) :

**Étape 1 : Informations générales**
- ✅ Nom de l'entreprise
- ✅ Forme juridique (SARL, SA, SAS, SUARL)
- ✅ Activité principale
- ✅ Capital social (FCFA)
- ✅ Adresse du siège social

**Étape 2 : Documents**
- ✅ Upload CNI du gérant
- ✅ Upload Casier judiciaire
- ✅ Upload Justificatif de domicile
- ✅ Validation des documents (tous requis)

**Étape 3 : Libération du capital** 💰
- ✅ Affichage du montant total (capital + frais)
- ✅ Sélection mode de paiement (4 options)
- ✅ Saisie numéro de téléphone
- ✅ Traitement paiement avec loader
- ✅ Confirmation paiement
- ✅ Notification de succès

**Étape 4 : Signature électronique** ✍️
- ✅ Liste des 3 documents à signer
- ✅ Canvas de signature interactif
- ✅ Modal signature (bottom sheet mobile / centrée web)
- ✅ Sauvegarde signature par document
- ✅ Compteur progression (X/3 signés)
- ✅ Notification après chaque signature

**Étape 5 : Validation** ✅
- ✅ Récapitulatif complet
- ✅ Statut de tous les éléments
- ✅ Soumission du dossier
- ✅ Écran de confirmation finale
- ✅ Notification WhatsApp promise

#### Différences adaptatives :
| Fonctionnalité | Mobile | Web |
|----------------|--------|-----|
| **Progression** | Progress bar + stepper | Progress bar + stepper horizontal |
| **Formulaire** | Stack vertical | Grid 2 colonnes |
| **Navigation** | Boutons fixed bottom | Boutons en bas du formulaire |
| **Canvas signature** | 350x200px, touch | 700x300px, mouse |
| **Modal signature** | Bottom sheet | Modal centrée |
| **Layout paiement** | Stack vertical | Grid avec récapitulatif |

#### Comportement identique :
- ✅ Validation à chaque étape
- ✅ Impossible de passer sans compléter
- ✅ Étape 3 bloquée tant que paiement non validé
- ✅ Étape 4 bloquée tant que tous docs non signés
- ✅ Même écran final de succès

#### Fichiers principaux :
- 📱 `/components/mobile/CreateCompany.tsx` - **Flux complet intégré**
- 💻 `/components/web/WebCreateCompany.tsx` - **Flux complet intégré**

---

### 3. 📅 Rendez-vous signature

#### Fonctionnalités communes :
- ✅ Sélection de la date
- ✅ Sélection de l'heure (créneaux)
- ✅ Choix du lieu (bureaux Crésus)
- ✅ Confirmation de RDV
- ✅ Notifications de rappel
- ✅ Annulation/Modification

#### Lieux disponibles :
1. **Plateau** - Immeuble Fahd
2. **Almadies** - Résidence Atlantic
3. **Mermoz** - Centre d'affaires

#### Créneaux horaires :
- Matin : 9h00, 10h30, 12h00
- Après-midi : 14h00, 15h30, 17h00

#### Fichiers :
- 📱 `/components/mobile/Appointment.tsx`
- 💻 `/components/web/WebAppointment.tsx`

---

### 4. 🎨 Branding & Communication

#### Services proposés :

**1. Logo & Identité visuelle**
- Forfait Basic : 75 000 FCFA
- Forfait Premium : 150 000 FCFA
- Forfait Ultimate : 300 000 FCFA

**2. Site web**
- Site vitrine : 200 000 FCFA
- Site e-commerce : 500 000 FCFA
- Application web : 800 000 FCFA

**3. Charte graphique**
- Complète : 250 000 FCFA

**4. Vidéo promotionnelle**
- 30 secondes : 150 000 FCFA
- 1 minute : 250 000 FCFA
- 2-3 minutes : 400 000 FCFA

**5. Réseaux sociaux**
- Pack starter : 100 000 FCFA/mois
- Pack business : 200 000 FCFA/mois
- Pack premium : 350 000 FCFA/mois

#### Système de livrables harmonisé :
- ✅ Upload de fichiers par l'admin
- ✅ Gestion de versions (v1, v2, v3...)
- ✅ Système d'approbation/révision
- ✅ Fil de discussion par livrable
- ✅ États : pending-review, approved, revision-requested
- ✅ Composants partagés : `DeliverableCard`, modals

#### Fichiers :
- 📱 `/components/mobile/Branding.tsx`
- 💻 `/components/web/WebBranding.tsx`
- 🔧 `/components/DeliverableCard.tsx`
- 🔧 `/components/modals/DeliverableModals.tsx`

---

### 5. 🏢 Domiciliation

#### Adresses disponibles :

**Plateau - Immeuble Fahd**
- Prix : 50 000 FCFA/mois
- Services : Adresse fiscale, Réception courrier, Salle réunion 2h/mois

**Almadies - Résidence Atlantic**
- Prix : 75 000 FCFA/mois
- Services : Adresse fiscale, Réception courrier, Salle réunion 4h/mois, Bureau partagé

**Mermoz - Centre Affaires**
- Prix : 60 000 FCFA/mois
- Services : Adresse fiscale, Réception courrier, Salle réunion 3h/mois

#### Fonctionnalités :
- ✅ Sélection d'adresse
- ✅ Comparaison des offres
- ✅ Paiement mensuel
- ✅ Gestion du contrat
- ✅ Renouvellement automatique

#### Fichiers :
- 📱 `/components/mobile/Domiciliation.tsx`
- 💻 `/components/web/WebDomiciliation.tsx`

---

### 6. ✏️ Modifications post-statutaires

#### Types de modifications :

**1. Changement de gérant**
- Documents requis : Procès-verbal AG, CNI nouveau gérant
- Délai : 15 jours
- Prix : 75 000 FCFA

**2. Changement de siège social**
- Documents requis : Justificatif nouvelle adresse, Procès-verbal AG
- Délai : 15 jours
- Prix : 75 000 FCFA

**3. Augmentation/Réduction capital**
- Documents requis : Procès-verbal AG, Attestation bancaire
- Délai : 20 jours
- Prix : 100 000 FCFA

**4. Changement d'objet social**
- Documents requis : Procès-verbal AG, Nouveaux statuts
- Délai : 20 jours
- Prix : 100 000 FCFA

#### Statuts :
- `submitted` - Soumis
- `in_review` - En révision
- `documents_ready` - Documents prêts
- `signed` - Signé
- `completed` - Complété

#### Fichiers :
- 📱 `/components/mobile/Modification.tsx`
- 💻 `/components/web/WebModification.tsx`

---

## 🎯 Principes d'harmonisation

### 1. **Fonctionnalités core identiques**
Toutes les fonctionnalités business sont identiques entre web et mobile :
- Mêmes étapes de processus
- Mêmes validations
- Mêmes notifications
- Mêmes données

### 2. **Adaptations UX/UI**
Les différences concernent uniquement l'expérience utilisateur :
- **Mobile** : Stack vertical, touch-first, modals bottom-sheet
- **Web** : Grid layouts, mouse-first, modals centrées

### 3. **Composants partagés**
Certains composants sont partagés entre web et mobile :
- `DeliverableCard` - Cartes de livrables
- Modals de révision/approbation
- Types TypeScript communs

### 4. **Context partagé**
Toutes les données passent par le même contexte React :
```typescript
const { 
  currentUser,
  companies,
  notifications,
  addNotification,
  // ...
} = useApp();
```

---

## 📊 Matrice de compatibilité

| Module | Mobile | Web | Partagé | État |
|--------|--------|-----|---------|------|
| Dashboard | ✅ | ✅ | Context | ✅ Harmonisé |
| Création entreprise | ✅ | ✅ | Flux | ✅ Harmonisé |
| Signature électronique | ✅ | ✅ | Logic | ✅ Harmonisé |
| Libération capital | ✅ | ✅ | Logic | ✅ Harmonisé |
| Rendez-vous | ✅ | ✅ | Data | ✅ Harmonisé |
| Branding | ✅ | ✅ | Components | ✅ Harmonisé |
| Domiciliation | ✅ | ✅ | Data | ✅ Harmonisé |
| Modifications | ✅ | ✅ | Data | ✅ Harmonisé |
| Timeline | ✅ | ✅ | Data | ✅ Harmonisé |
| Documents | ✅ | ✅ | Data | ✅ Harmonisé |
| Notifications | ✅ | ✅ | Context | ✅ Harmonisé |
| Profile | ✅ | ✅ | Context | ✅ Harmonisé |

---

## 🔄 Flux de données unifié

```
┌─────────────────────────────────────────┐
│           AppContext (Global)           │
│  - currentUser                          │
│  - companies                            │
│  - notifications                        │
│  - brandingProjects                     │
│  - domiciliations                       │
│  - modifications                        │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────┐    ┌──────▼────────┐
│    Mobile    │    │      Web      │
│  Components  │    │  Components   │
│              │    │               │
│ - Auth       │    │ - WebAuth     │
│ - Dashboard  │    │ - WebDashboard│
│ - Branding   │    │ - WebBranding │
│ - etc...     │    │ - etc...      │
└──────────────┘    └───────────────┘
```

---

## 🎨 Design System harmonisé

### Palette de couleurs Crésus :
```css
--bleu-nuit: #1A2753
--or-imperial: #D6A93A
--bleu-acier: #273A7A
--blanc: #FFFFFF
--gris-perle: #F5F6FA
```

### Composants UI :
- Boutons : Même border-radius (12px web, 16px mobile)
- Cards : Même shadow et padding
- Inputs : Même style et validation
- Modals : Même animations (adaptées)
- Toasts : Même positionnement et style

### Typographie :
- Headers : Même hiérarchie
- Body : Même line-height
- Labels : Même sizing
- Mobile : Légèrement plus grand (16px base)
- Web : Standard (14px base)

---

## 📱 Responsive Design

### Breakpoints :
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Adaptations automatiques :
- Grids : 1 col mobile → 2-3 cols web
- Spacing : Plus compact mobile
- Navigation : Bottom bar mobile → Sidebar web
- Modals : Bottom sheet mobile → Centered web

---

## ✅ Checklist d'harmonisation

### Pour chaque nouveau module :

- [ ] Fonctionnalités identiques web/mobile
- [ ] Même flux de données (AppContext)
- [ ] Même système de notifications
- [ ] Même validation de formulaires
- [ ] Mêmes messages d'erreur
- [ ] Mêmes états de chargement
- [ ] Design adaptatif (non identique)
- [ ] Composants partagés si possible
- [ ] TypeScript interfaces communes
- [ ] Tests des deux versions
- [ ] Documentation mise à jour

---

## 🚀 Améliorations futures

### 1. **Progressive Web App (PWA)**
- Service Worker
- Cache intelligent
- Mode offline
- Installation sur mobile

### 2. **Synchronisation temps réel**
- WebSockets
- Live updates
- Collaboration multi-device

### 3. **Optimisations**
- Code splitting
- Lazy loading
- Image optimization
- Bundle size reduction

### 4. **Tests**
- Unit tests partagés
- E2E tests web/mobile
- Visual regression tests
- Performance tests

---

## 📚 Documentation associée

- [START_HERE.md](./START_HERE.md) - Guide de démarrage
- [HARMONISATION_LIVRABLES.md](./HARMONISATION_LIVRABLES.md) - Système de livrables
- [DELIVERABLES_SYSTEM_GUIDE.md](./DELIVERABLES_SYSTEM_GUIDE.md) - Guide technique
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - État d'avancement

---

## 🎯 Conclusion

L'harmonisation web ↔️ mobile de Crésus V2 garantit :

✅ **Cohérence** : Même expérience utilisateur sur toutes les plateformes
✅ **Maintenabilité** : Code partagé et logique centralisée
✅ **Scalabilité** : Facile d'ajouter de nouveaux modules
✅ **Performance** : Optimisations spécifiques par plateforme
✅ **UX** : Adaptations natives à chaque device

**Statut global : 100% harmonisé** 🎉

Tous les modules principaux sont maintenant parfaitement synchronisés entre le client web et l'application mobile, avec des adaptations UX appropriées pour chaque plateforme.
