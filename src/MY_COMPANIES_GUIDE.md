# Guide - Menu "Mes Sociétés"

## 📋 Vue d'ensemble

Le menu **"Mes sociétés"** permet aux clients de gérer facilement toutes leurs entreprises créées et finalisées sur la plateforme Crésus.

---

## 🎯 Fonctionnalités principales

### ✅ **Affichage des sociétés finalisées**
- Seules les sociétés avec le statut `completed` sont affichées
- Tri et filtrage automatique
- Vue en grille (web) et liste (mobile)

### ✅ **Informations de la société**
Chaque société affiche :
- **Nom de l'entreprise**
- **Forme juridique** (SARL, SA, SAS, etc.)
- **Capital social**
- **Secteur d'activité**
- **Adresse**
- **Date de création**
- **Badge "Active"** (statut)

### ✅ **Services disponibles**
Accès direct aux services pour chaque société :

1. **🔵 Modification statutaire**
   - Changer le capital social
   - Modifier le siège social
   - Changer le gérant
   - Modifier l'objet social

2. **🟣 Domiciliation**
   - Domicilier l'entreprise à Dakar
   - Gestion de l'adresse de domiciliation

3. **🌸 Branding & Communication**
   - Création de logo
   - Site web
   - Cartes de visite
   - Charte graphique

### ✅ **Documents officiels**
Téléchargement direct de :
- 📄 **Statuts signés**
- 🛡️ **Registre de Commerce (RC)**
- 📄 **NINEA**
- 🛡️ **Certificat d'immatriculation**
- 📄 **Extrait KBIS**

### ✅ **Actions rapides**
- 👁️ **Voir les détails** de la société
- ✏️ **Modifier** (accès modification)
- 📥 **Télécharger** les documents
- 📊 **Voir la timeline** complète
- ⭐ **Services premium**

---

## 🖥️ Version Web

### **Fichier** : `/components/web/WebMyCompanies.tsx`

#### **Vue Liste**
- Grille de cartes (3 colonnes sur desktop)
- Hover effect avec bordure dorée
- Quick actions en bas de chaque carte
- Transition fluide vers la vue détails

#### **Vue Détails**
Structure en 2 colonnes :

**Colonne gauche (1/3)** :
- Informations de la société
- Statistiques (documents, modifications, services)
- Documents officiels téléchargeables

**Colonne droite (2/3)** :
- Services disponibles (3 cartes)
- Timeline récente
- Actions supplémentaires

#### **Navigation**
```typescript
// Accès depuis le menu
onNavigate('my-companies')

// Navigation vers un service avec ID société
onNavigate('modification', companyId)
onNavigate('domiciliation', companyId)
onNavigate('branding', companyId)
```

---

## 📱 Version Mobile

### **Fichier** : `/components/mobile/MyCompanies.tsx`

#### **Liste des sociétés**
- Cards empilées verticalement
- Statistiques en grille 3x1 (Capital, Docs, Année)
- Tap pour ouvrir les détails
- ChevronRight pour indiquer interactivité

#### **Modal de détails**
Modal bottom sheet avec :
- Header fixe avec nom + type + statut
- Informations complètes
- Services en cards tactiles
- Documents en liste téléchargeable
- Actions rapides (2 colonnes)

#### **Animations**
- `whileTap={{ scale: 0.98 }}` sur les cards
- Modal slide-up depuis le bas
- Transitions fluides

---

## 🎨 Design System

### **Couleurs par forme juridique**
```typescript
SARL    → bg-blue-100 text-blue-700
SUARL   → bg-green-100 text-green-700
SA      → bg-purple-100 text-purple-700
SAS     → bg-orange-100 text-orange-700
SNC     → bg-pink-100 text-pink-700
SCI     → bg-indigo-100 text-indigo-700
```

### **Couleurs des services**
```typescript
Modification    → from-blue-600 to-blue-700
Domiciliation   → from-purple-600 to-purple-700
Branding        → from-pink-600 to-pink-700
```

### **Statut "Active"**
- Badge vert avec icône CheckCircle
- `text-green-600` avec `CheckCircle` icon

---

## 🔄 Intégration

### **1. App.tsx**
```typescript
// Import
import { WebMyCompanies } from './components/web/WebMyCompanies';
import { MyCompanies } from './components/mobile/MyCompanies';

// Web route
{webPage === 'my-companies' && (
  <WebMyCompanies 
    onBack={() => setWebPage('dashboard')} 
    onNavigate={setWebPage} 
  />
)}

// Mobile route
case 'companies':
  return <MyCompanies 
    onBack={() => setMobileScreen('dashboard')} 
    onNavigate={setMobileScreen} 
  />;
```

### **2. WebLayout.tsx**
```typescript
// Menu item
{ id: 'my-companies', icon: Building, label: 'Mes sociétés' }
```

### **3. BottomBar.tsx (Mobile)**
```typescript
// Nav item
{ id: 'companies', icon: Building, label: 'Sociétés' }
```

### **4. Dashboard**
- **Web** : Stat card cliquable "Mes sociétés" avec `onClick`
- **Mobile** : Card cliquable dans le header

---

## 📊 État des données

### **Filtrage des sociétés**
```typescript
const completedCompanies = companies.filter(
  (c) => c.userId === currentUser?.id && c.status === 'completed'
);
```

### **Empty State**
Si aucune société créée :
- Icône Building en gris
- Message "Aucune société créée"
- Bouton CTA "Créer ma première société"

---

## 🎯 Cas d'usage

### **1. Client avec 1+ société(s)**
1. Clic sur "Mes sociétés" (menu ou dashboard)
2. Voit la liste de ses sociétés finalisées
3. Clic sur une société
4. Voit les détails + services disponibles
5. Clic sur un service (ex: Modification)
6. Redirigé vers le module avec `companyId`

### **2. Client sans société**
1. Clic sur "Mes sociétés"
2. Voit l'empty state
3. Clic sur "Créer ma première société"
4. Redirigé vers la création d'entreprise

### **3. Téléchargement de documents**
1. Ouvre les détails d'une société
2. Scroll vers "Documents officiels"
3. Clic sur l'icône Download
4. Document téléchargé

### **4. Accès à un service**
1. Dans les détails d'une société
2. Clic sur une carte service (ex: Branding)
3. Redirigé vers `/branding` avec `companyId`
4. Le service charge automatiquement les infos de la société

---

## 🚀 Fonctionnalités futures

### **Phase 2**
- [ ] Recherche et filtres (par forme juridique, date, etc.)
- [ ] Tri (alphabétique, date de création, etc.)
- [ ] Vue en tableau (alternative à la grille)
- [ ] Export PDF des informations société
- [ ] Partage de documents par email
- [ ] Archivage de sociétés
- [ ] Tags personnalisés

### **Phase 3**
- [ ] Statistiques avancées par société
- [ ] Comparaison entre sociétés
- [ ] Notifications spécifiques par société
- [ ] Gestion des associés
- [ ] Tableau de bord financier
- [ ] Calendrier des échéances
- [ ] Intégration comptabilité

---

## 🔧 Personnalisation

### **Ajouter un nouveau service**
```typescript
// Dans serviceCards
{
  id: 'nouveau-service',
  title: 'Nouveau Service',
  description: 'Description du service',
  icon: IconeComponent,
  color: 'from-color-500 to-color-600',
  bgColor: 'bg-color-50',
  iconColor: 'text-color-600',
  screen: 'nom-ecran',
}
```

### **Ajouter un nouveau document**
```typescript
// Dans la section documents
{ 
  name: 'Nouveau Document', 
  icon: FileText, 
  size: '1.5 MB' 
}
```

---

## 📝 Props des composants

### **WebMyCompanies**
```typescript
interface WebMyCompaniesProps {
  onBack: () => void;
  onNavigate: (screen: string, companyId?: string) => void;
}
```

### **MyCompanies (Mobile)**
```typescript
interface MyCompaniesProps {
  onBack: () => void;
  onNavigate: (screen: string, companyId?: string) => void;
}
```

---

## 🎨 Exemples de code

### **Naviguer vers modification avec companyId**
```typescript
// Web
<button onClick={() => onNavigate('modification', company.id)}>
  Modifier
</button>

// Mobile
<button onClick={() => {
  setShowDetailsModal(false);
  onNavigate('modification', selectedCompany.id);
}}>
  Modifier
</button>
```

### **Afficher le nombre de sociétés**
```typescript
const completedCompanies = companies.filter(
  (c) => c.userId === currentUser?.id && c.status === 'completed'
);

<p>{completedCompanies.length} entreprise(s) créée(s)</p>
```

### **Formatter le capital**
```typescript
// Millions
{(company.capital || 0) >= 1000000
  ? `${((company.capital || 0) / 1000000).toFixed(1)}M`
  : `${((company.capital || 0) / 1000).toFixed(0)}K`}

// Complet
{company.capital?.toLocaleString()} FCFA
```

---

## 🐛 Debugging

### **Société n'apparaît pas**
Vérifier :
- `company.status === 'completed'` ✅
- `company.userId === currentUser?.id` ✅
- Société existe dans le contexte ✅

### **Navigation ne fonctionne pas**
Vérifier :
- Route définie dans `App.tsx` ✅
- `onNavigate` passé en props ✅
- `companyId` passé correctement ✅

### **Documents ne chargent pas**
Vérifier :
- Mock data présents ✅
- Filtrage par `companyId` correct ✅
- URLs des documents valides ✅

---

## 📚 Ressources

- **Web Component** : `/components/web/WebMyCompanies.tsx`
- **Mobile Component** : `/components/mobile/MyCompanies.tsx`
- **Types** : `/types/index.ts`
- **Context** : `/context/AppContext.tsx`
- **Layout** : `/components/web/WebLayout.tsx`
- **BottomBar** : `/components/mobile/BottomBar.tsx`

---

## ✅ Checklist d'intégration

- [x] Composant web créé
- [x] Composant mobile créé
- [x] Intégré dans App.tsx
- [x] Menu web mis à jour
- [x] BottomBar mobile mis à jour
- [x] Dashboard mis à jour (accès rapide)
- [x] Navigation fonctionnelle
- [x] Filtrage des sociétés complétées
- [x] Services accessibles
- [x] Documents affichés
- [x] Empty state géré
- [x] Responsive design
- [x] Animations fluides
- [x] Design system respecté

---

**Date de création** : 5 novembre 2024  
**Version** : 1.0.0  
**Statut** : ✅ Complété
