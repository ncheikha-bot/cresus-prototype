# Exemples de Test - Situation Matrimoniale

## 📊 Données de test complètes

### Exemple 1 : SARL avec 3 associés (situations variées)

```typescript
const exampleCompany = {
  name: "TECH SOLUTIONS SARL",
  legalForm: "SARL",
  activity: "Services informatiques",
  capital: "5000000", // 5 millions FCFA
  address: "Cité Keur Gorgui, Dakar",
  associates: [
    {
      id: "1",
      firstName: "Amadou",
      lastName: "Diallo",
      percentage: "50",
      amount: "2500000",
      address: "Parcelles Assainies, Dakar",
      profession: "Ingénieur informatique",
      phone: "+221 77 123 45 67",
      email: "amadou.diallo@gmail.com",
      isManager: true,
      maritalStatus: "married",
      matrimonialRegime: "community",
      spouseInfo: {
        firstName: "Aïssatou",
        lastName: "Sow",
        birthDate: "1988-06-15",
        profession: "Comptable"
      }
    },
    {
      id: "2",
      firstName: "Fatou",
      lastName: "Ndiaye",
      percentage: "30",
      amount: "1500000",
      address: "Mermoz, Dakar",
      profession: "Designer graphique",
      phone: "+221 76 234 56 78",
      email: "fatou.ndiaye@gmail.com",
      isManager: false,
      maritalStatus: "married",
      matrimonialRegime: "separation",
      spouseInfo: undefined // Pas d'infos conjoint car séparation de biens
    },
    {
      id: "3",
      firstName: "Moussa",
      lastName: "Ba",
      percentage: "20",
      amount: "1000000",
      address: "Grand Yoff, Dakar",
      profession: "Développeur web",
      phone: "+221 78 345 67 89",
      email: "moussa.ba@gmail.com",
      isManager: false,
      maritalStatus: "single",
      matrimonialRegime: undefined,
      spouseInfo: undefined
    }
  ]
};
```

### Exemple 2 : SA avec 5 associés (tous les cas)

```typescript
const exampleSA = {
  name: "COMMERCE INTERNATIONAL SA",
  legalForm: "SA",
  activity: "Import-export",
  capital: "10000000", // 10 millions FCFA
  address: "Plateau, Dakar",
  associates: [
    {
      id: "1",
      firstName: "Ibrahima",
      lastName: "Fall",
      percentage: "25",
      amount: "2500000",
      address: "Almadies, Dakar",
      profession: "Entrepreneur",
      phone: "+221 77 111 22 33",
      email: "ibrahima.fall@gmail.com",
      isManager: true,
      maritalStatus: "married",
      matrimonialRegime: "community",
      spouseInfo: {
        firstName: "Mariama",
        lastName: "Diop",
        birthDate: "1985-03-20",
        profession: "Avocate"
      }
    },
    {
      id: "2",
      firstName: "Khadija",
      lastName: "Thiam",
      percentage: "25",
      amount: "2500000",
      address: "Fann, Dakar",
      profession: "Médecin",
      phone: "+221 76 222 33 44",
      email: "khadija.thiam@gmail.com",
      isManager: false,
      maritalStatus: "divorced",
      matrimonialRegime: undefined,
      spouseInfo: undefined
    },
    {
      id: "3",
      firstName: "Oumar",
      lastName: "Sarr",
      percentage: "20",
      amount: "2000000",
      address: "Sacré-Cœur, Dakar",
      profession: "Ingénieur",
      phone: "+221 78 333 44 55",
      email: "oumar.sarr@gmail.com",
      isManager: false,
      maritalStatus: "married",
      matrimonialRegime: "separation",
      spouseInfo: undefined
    },
    {
      id: "4",
      firstName: "Awa",
      lastName: "Seck",
      percentage: "15",
      amount: "1500000",
      address: "Point E, Dakar",
      profession: "Consultante",
      phone: "+221 77 444 55 66",
      email: "awa.seck@gmail.com",
      isManager: false,
      maritalStatus: "widowed",
      matrimonialRegime: undefined,
      spouseInfo: undefined
    },
    {
      id: "5",
      firstName: "Cheikh",
      lastName: "Mbaye",
      percentage: "15",
      amount: "1500000",
      address: "Ouakam, Dakar",
      profession: "Commerçant",
      phone: "+221 76 555 66 77",
      email: "cheikh.mbaye@gmail.com",
      isManager: false,
      maritalStatus: "single",
      matrimonialRegime: undefined,
      spouseInfo: undefined
    }
  ]
};
```

### Exemple 3 : SARL U (Associé unique marié)

```typescript
const exampleSARLU = {
  name: "CONSULTING SERVICES SARL U",
  legalForm: "SARL U",
  activity: "Conseil en management",
  capital: "1000000", // 1 million FCFA
  address: "Liberté 6, Dakar",
  associates: [
    {
      id: "1",
      firstName: "Seydou",
      lastName: "Niang",
      percentage: "100",
      amount: "1000000",
      address: "HLM Grand Yoff, Dakar",
      profession: "Consultant",
      phone: "+221 77 999 88 77",
      email: "seydou.niang@gmail.com",
      isManager: true,
      maritalStatus: "married",
      matrimonialRegime: "community",
      spouseInfo: {
        firstName: "Ndèye",
        lastName: "Faye",
        birthDate: "1990-11-25",
        profession: "Enseignante"
      }
    }
  ]
};
```

---

## 🧪 Scénarios de test

### Test 1 : Associé célibataire (cas simple)
```json
{
  "id": "1",
  "firstName": "Modou",
  "lastName": "Gueye",
  "maritalStatus": "single",
  "matrimonialRegime": undefined,
  "spouseInfo": undefined
}
```
**Résultat attendu** : Seul le champ situation matrimoniale est renseigné

---

### Test 2 : Associé marié - séparation de biens
```json
{
  "id": "2",
  "firstName": "Aminata",
  "lastName": "Diop",
  "maritalStatus": "married",
  "matrimonialRegime": "separation",
  "spouseInfo": undefined
}
```
**Résultat attendu** : 
- Situation matrimoniale = "Marié(e)"
- Régime matrimonial = "Séparation de biens"
- Pas d'infos conjoint

---

### Test 3 : Associé marié - communauté de biens (cas complet)
```json
{
  "id": "3",
  "firstName": "Binta",
  "lastName": "Kane",
  "maritalStatus": "married",
  "matrimonialRegime": "community",
  "spouseInfo": {
    "firstName": "Omar",
    "lastName": "Sy",
    "birthDate": "1987-08-10",
    "profession": "Architecte"
  }
}
```
**Résultat attendu** : 
- Situation matrimoniale = "Marié(e)"
- Régime matrimonial = "Communauté de biens"
- Section conjoint visible avec tous les champs remplis

---

### Test 4 : Associé divorcé
```json
{
  "id": "4",
  "firstName": "Alioune",
  "lastName": "Cissé",
  "maritalStatus": "divorced",
  "matrimonialRegime": undefined,
  "spouseInfo": undefined
}
```
**Résultat attendu** : Seul le champ situation matrimoniale = "Divorcé(e)"

---

### Test 5 : Associé veuf
```json
{
  "id": "5",
  "firstName": "Mame",
  "lastName": "Diarra",
  "maritalStatus": "widowed",
  "matrimonialRegime": undefined,
  "spouseInfo": undefined
}
```
**Résultat attendu** : Seul le champ situation matrimoniale = "Veuf/Veuve"

---

## 🔄 Tests de réinitialisation

### Scénario A : Changement de marié à célibataire

**État initial** :
```json
{
  "maritalStatus": "married",
  "matrimonialRegime": "community",
  "spouseInfo": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "birthDate": "1980-05-15",
    "profession": "Médecin"
  }
}
```

**Action** : Sélectionner "Célibataire"

**État final attendu** :
```json
{
  "maritalStatus": "single",
  "matrimonialRegime": undefined,
  "spouseInfo": undefined
}
```

---

### Scénario B : Changement de communauté à séparation

**État initial** :
```json
{
  "maritalStatus": "married",
  "matrimonialRegime": "community",
  "spouseInfo": {
    "firstName": "Marie",
    "lastName": "Martin",
    "birthDate": "1985-07-20",
    "profession": "Avocate"
  }
}
```

**Action** : Sélectionner "Séparation de biens"

**État final attendu** :
```json
{
  "maritalStatus": "married",
  "matrimonialRegime": "separation",
  "spouseInfo": undefined
}
```

---

### Scénario C : Changement de célibataire à marié en communauté

**État initial** :
```json
{
  "maritalStatus": "single",
  "matrimonialRegime": undefined,
  "spouseInfo": undefined
}
```

**Actions** :
1. Sélectionner "Marié(e)"
2. Sélectionner "Communauté de biens"
3. Remplir les infos du conjoint

**État final attendu** :
```json
{
  "maritalStatus": "married",
  "matrimonialRegime": "community",
  "spouseInfo": {
    "firstName": "Sophie",
    "lastName": "Bernard",
    "birthDate": "1992-03-10",
    "profession": "Infirmière"
  }
}
```

---

## 🎯 Cas limites à tester

### Cas 1 : Modification après validation
**Test** : Essayer de modifier la situation matrimoniale après avoir validé l'étape 2
**Résultat attendu** : Pouvoir revenir et modifier

---

### Cas 2 : Brouillon avec situation matrimoniale
**Test** : 
1. Remplir partiellement avec situation matrimoniale "marié/communauté"
2. Sauvegarder en brouillon
3. Recharger

**Résultat attendu** : Toutes les données matrimoniales sont restaurées

---

### Cas 3 : Multi-associés avec situations différentes
**Test** : Créer une société avec :
- Associé 1 : Célibataire
- Associé 2 : Marié en communauté
- Associé 3 : Marié en séparation
- Associé 4 : Divorcé

**Résultat attendu** : Chaque associé conserve sa propre situation

---

### Cas 4 : Suppression d'un associé avec infos conjoint
**Test** :
1. Créer un associé marié en communauté avec infos conjoint
2. Supprimer cet associé

**Résultat attendu** : L'associé et toutes ses données (y compris conjoint) sont supprimés

---

### Cas 5 : Ajout d'un nouvel associé
**Test** : Ajouter un nouvel associé via le bouton "+"

**Résultat attendu** : 
- Tous les champs sont vides
- `maritalStatus: undefined`
- `matrimonialRegime: undefined`
- `spouseInfo: undefined`

---

## 📋 Checklist de validation

### Pour chaque type de situation

**Célibataire** :
- [ ] Seul le dropdown situation est visible
- [ ] Aucun autre champ matrimonial ne s'affiche
- [ ] Peut passer à l'associé suivant

**Marié - Séparation** :
- [ ] Le dropdown régime matrimonial apparaît
- [ ] La section conjoint n'apparaît PAS
- [ ] Peut passer à l'associé suivant

**Marié - Communauté** :
- [ ] Le dropdown régime matrimonial apparaît
- [ ] La section conjoint apparaît avec fond doré
- [ ] Les 4 champs du conjoint sont visibles
- [ ] L'icône Users est présente
- [ ] Peut passer à l'associé suivant après remplissage

**Divorcé** :
- [ ] Seul le dropdown situation est visible
- [ ] Traité comme célibataire

**Veuf** :
- [ ] Seul le dropdown situation est visible
- [ ] Traité comme célibataire

---

## 🔍 Tests de validation (recommandés)

### Validation champs obligatoires

**Test** : Essayer de valider l'étape 2 avec un associé marié en communauté mais infos conjoint incomplètes

**Résultat attendu** :
```javascript
// Message d'erreur attendu
{
  type: 'warning',
  title: 'Informations incomplètes',
  message: 'Veuillez renseigner toutes les informations du conjoint pour l\'associé en régime de communauté de biens'
}
```

---

### Validation date de naissance

**Test 1** : Date de naissance du conjoint dans le futur
**Résultat attendu** : Message d'erreur "La date de naissance ne peut pas être dans le futur"

**Test 2** : Conjoint mineur (< 18 ans)
**Résultat attendu** : Message d'avertissement "Le conjoint doit être majeur"

---

## 📊 Données statistiques pour tests

### Distribution réaliste
Dans un échantillon de 100 associés :
- 45 célibataires (45%)
- 35 mariés en communauté (35%)
- 15 mariés en séparation (15%)
- 3 divorcés (3%)
- 2 veufs (2%)

### Génération de données de test
```typescript
function generateRandomAssociate(id: string) {
  const situations = ['single', 'married', 'married', 'divorced', 'widowed'];
  const regimes = ['community', 'separation'];
  const randomSituation = situations[Math.floor(Math.random() * situations.length)];
  
  const associate: Associate = {
    id,
    firstName: generateRandomFirstName(),
    lastName: generateRandomLastName(),
    percentage: generateRandomPercentage(),
    amount: calculateAmount(),
    address: generateRandomAddress(),
    profession: generateRandomProfession(),
    phone: generateRandomPhone(),
    email: generateRandomEmail(),
    isManager: id === '1',
    maritalStatus: randomSituation as any
  };

  if (randomSituation === 'married') {
    const randomRegime = regimes[Math.floor(Math.random() * 2)];
    associate.matrimonialRegime = randomRegime as any;
    
    if (randomRegime === 'community') {
      associate.spouseInfo = {
        firstName: generateRandomFirstName(),
        lastName: generateRandomLastName(),
        birthDate: generateRandomBirthDate(),
        profession: generateRandomProfession()
      };
    }
  }

  return associate;
}
```

---

## ✅ Critères de succès

### Fonctionnels
- [x] Tous les types de situation matrimoniale sont supportés
- [x] L'affichage conditionnel fonctionne correctement
- [x] La réinitialisation automatique fonctionne
- [x] Les données sont bien persistées
- [x] La validation des champs fonctionne

### Design
- [x] Cohérence avec la palette Crésus
- [x] Section conjoint bien identifiable (fond doré)
- [x] Transitions fluides
- [x] Responsive mobile et web

### Performance
- [x] Pas de ralentissement avec 50 associés
- [x] Mise à jour instantanée de l'affichage
- [x] Pas de perte de données lors des changements

---

**Dernière mise à jour** : 10 Décembre 2025  
**Version de test** : Crésus V2 - Situation Matrimoniale v1.0
