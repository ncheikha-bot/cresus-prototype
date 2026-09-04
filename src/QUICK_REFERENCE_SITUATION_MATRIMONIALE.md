# ⚡ Quick Reference - Situation Matrimoniale

## 📍 Localisation
**Étape 2** → Répartition du capital → Après "Profession"

---

## 🎯 3 champs conditionnels

```
1️⃣ Situation matrimoniale (TOUJOURS)
    └─ Single, Married, Divorced, Widowed

2️⃣ Régime matrimonial (SI MARRIED)
    └─ Community, Separation

3️⃣ Infos conjoint (SI MARRIED + COMMUNITY)
    └─ Prénom, Nom, Naissance, Profession
```

---

## 💻 Code rapide

### Interface
```typescript
interface Associate {
  // ... champs existants
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced';
  matrimonialRegime?: 'community' | 'separation';
  spouseInfo?: {
    firstName: string;
    lastName: string;
    birthDate: string;
    profession: string;
  };
}
```

### Initialisation
```typescript
const newAssociate = {
  maritalStatus: undefined,
  matrimonialRegime: undefined,
  spouseInfo: undefined
};
```

### Update
```typescript
updateAssociate(id, 'maritalStatus', 'married');
updateAssociate(id, 'matrimonialRegime', 'community');
updateAssociate(id, 'spouseInfo', { ... });
```

---

## 🔄 Réinitialisation auto

```
Married → Other     ⟹  Efface régime + conjoint
Community → Separation  ⟹  Efface conjoint uniquement
```

---

## 🎨 Design tokens

```css
/* Couleurs */
--text-primary: #273A7A
--accent-gold: #D6A93A
--bg-spouse: rgba(214, 169, 58, 0.05)

/* Section conjoint */
background: #D6A93A/5
border: #D6A93A/20
icon: Users (lucide-react)
```

---

## ✅ Validations essentielles

| ✓ | Validation | Type |
|---|-----------|------|
| 1 | Régime si marié | Error |
| 2 | Infos conjoint si communauté | Error |
| 3 | Date naissance valide | Error |
| 4 | Conjoint majeur (18+) | Warning |

---

## 🧪 Tests rapides

**Test 1** : Célibataire
```json
{ "maritalStatus": "single" }
```
✓ 1 champ visible

**Test 2** : Marié séparation
```json
{ 
  "maritalStatus": "married",
  "matrimonialRegime": "separation"
}
```
✓ 2 champs visibles

**Test 3** : Marié communauté
```json
{
  "maritalStatus": "married",
  "matrimonialRegime": "community",
  "spouseInfo": {
    "firstName": "Fatou",
    "lastName": "Diop",
    "birthDate": "1990-03-15",
    "profession": "Comptable"
  }
}
```
✓ 6 champs visibles (2 + 4)

---

## 📁 Fichiers modifiés

```
✏️ /types/index.ts
✏️ /components/mobile/CreateCompany.tsx
✏️ /components/web/WebCreateCompany.tsx
```

---

## 🚀 3 étapes pour tester

1. Créer une nouvelle société
2. Aller à l'étape 2
3. Tester les 3 cas ci-dessus

---

## 📚 Documentation complète

| Doc | Description |
|-----|-------------|
| [INDEX](./INDEX_SITUATION_MATRIMONIALE.md) | Navigation complète |
| [README](./README_SITUATION_MATRIMONIALE.md) | Vue d'ensemble |
| [GUIDE](./GUIDE_SITUATION_MATRIMONIALE.md) | Guide utilisateur |
| [TEST](./TEST_SITUATION_MATRIMONIALE.md) | Tests détaillés |
| [FLOWCHART](./FLOWCHART_SITUATION_MATRIMONIALE.md) | Flux visuels |
| [VALIDATION](./VALIDATION_SITUATION_MATRIMONIALE.md) | Validations |

---

## 💡 Tips

✨ **Affichage progressif** : Seuls les champs nécessaires s'affichent

🔄 **Réinitialisation intelligente** : Pas de données orphelines

🎨 **Section dorée** : Conjoint facile à identifier

📱 **Responsive** : Fonctionne mobile & web

---

## 🐛 Debug rapide

**Problème** : Champs ne s'affichent pas  
**Solution** : Vérifier maritalStatus === 'married'

**Problème** : Section conjoint ne s'affiche pas  
**Solution** : Vérifier matrimonialRegime === 'community'

**Problème** : Données perdues au changement  
**Solution** : C'est normal, réinitialisation auto active

---

## 📞 Support express

💬 Slack : #dev-cresus-v2  
🐛 Issues : GitHub  
📧 Email : support@cresus.sn

---

**Version** : 1.0.0 | **Date** : 10 Déc 2025 | **Status** : ✅ Production
