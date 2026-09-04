# Validations - Situation Matrimoniale des Associés

## 🎯 Objectif

Ce document détaille toutes les validations recommandées pour garantir la qualité et la cohérence des données matrimoniales collectées.

---

## ✅ Validations actuellement implémentées

### 1. Réinitialisation automatique
- ✅ Effacement du régime et des infos conjoint si on change de "Marié" à autre chose
- ✅ Effacement des infos conjoint si on passe de "Communauté" à "Séparation"

### 2. Affichage conditionnel
- ✅ Le champ régime n'apparaît que si marié
- ✅ La section conjoint n'apparaît que si marié en communauté

---

## 🚀 Validations recommandées à implémenter

### Priorité 1 : Validations essentielles (bloquantes)

#### V1.1 - Régime matrimonial obligatoire si marié
```typescript
// Dans la validation avant passage à l'étape suivante
const validateAssociate = (associate: Associate): ValidationResult => {
  if (associate.maritalStatus === 'married' && !associate.matrimonialRegime) {
    return {
      valid: false,
      error: 'Le régime matrimonial est obligatoire pour les associés mariés',
      field: 'matrimonialRegime'
    };
  }
  return { valid: true };
};
```

**Message d'erreur** :
```
⚠️ Régime matrimonial requis
Veuillez sélectionner le régime matrimonial de l'associé marié.
```

---

#### V1.2 - Informations du conjoint complètes
```typescript
const validateSpouseInfo = (associate: Associate): ValidationResult => {
  if (
    associate.maritalStatus === 'married' && 
    associate.matrimonialRegime === 'community'
  ) {
    const spouse = associate.spouseInfo;
    
    if (!spouse) {
      return {
        valid: false,
        error: 'Les informations du conjoint sont obligatoires en régime de communauté de biens'
      };
    }
    
    if (!spouse.firstName?.trim()) {
      return {
        valid: false,
        error: 'Le prénom du conjoint est obligatoire',
        field: 'spouseInfo.firstName'
      };
    }
    
    if (!spouse.lastName?.trim()) {
      return {
        valid: false,
        error: 'Le nom du conjoint est obligatoire',
        field: 'spouseInfo.lastName'
      };
    }
    
    if (!spouse.birthDate) {
      return {
        valid: false,
        error: 'La date de naissance du conjoint est obligatoire',
        field: 'spouseInfo.birthDate'
      };
    }
    
    if (!spouse.profession?.trim()) {
      return {
        valid: false,
        error: 'La profession du conjoint est obligatoire',
        field: 'spouseInfo.profession'
      };
    }
  }
  
  return { valid: true };
};
```

**Message d'erreur** :
```
⚠️ Informations du conjoint incomplètes
Tous les champs du conjoint sont obligatoires pour les associés mariés en communauté de biens.
```

---

#### V1.3 - Date de naissance du conjoint valide
```typescript
const validateBirthDate = (birthDate: string): ValidationResult => {
  const date = new Date(birthDate);
  const today = new Date();
  
  // Vérifier que ce n'est pas dans le futur
  if (date > today) {
    return {
      valid: false,
      error: 'La date de naissance ne peut pas être dans le futur',
      field: 'spouseInfo.birthDate'
    };
  }
  
  // Vérifier que le conjoint est majeur (18 ans)
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const isAdult = age > 18 || (age === 18 && monthDiff >= 0);
  
  if (!isAdult) {
    return {
      valid: false,
      error: 'Le conjoint doit être majeur (18 ans minimum)',
      field: 'spouseInfo.birthDate',
      severity: 'warning' // Peut-être autorisé dans certains cas
    };
  }
  
  // Vérifier que ce n'est pas une date trop ancienne (ex: > 100 ans)
  if (age > 100) {
    return {
      valid: false,
      error: 'Veuillez vérifier la date de naissance du conjoint',
      field: 'spouseInfo.birthDate',
      severity: 'warning'
    };
  }
  
  return { valid: true };
};
```

**Messages d'erreur** :
```
⚠️ Date invalide
La date de naissance ne peut pas être dans le futur.

⚠️ Conjoint mineur
Le conjoint doit être majeur (18 ans minimum).

⚠️ Date suspecte
Veuillez vérifier la date de naissance saisie (âge supérieur à 100 ans).
```

---

### Priorité 2 : Validations de cohérence (warnings)

#### V2.1 - Situation matrimoniale non renseignée
```typescript
const checkMaritalStatusPresence = (associate: Associate): ValidationResult => {
  if (!associate.maritalStatus) {
    return {
      valid: true, // Ne bloque pas
      warning: 'La situation matrimoniale n\'est pas renseignée',
      message: 'Pour un dossier complet, nous recommandons de renseigner la situation matrimoniale de tous les associés.',
      severity: 'info'
    };
  }
  return { valid: true };
};
```

**Message de warning** :
```
ℹ️ Recommandation
Pour un dossier complet, nous recommandons de renseigner la situation matrimoniale de tous les associés.
```

---

#### V2.2 - Cohérence des noms (conjoint vs associé)
```typescript
const checkNameCoherence = (associate: Associate): ValidationResult => {
  if (
    associate.maritalStatus === 'married' &&
    associate.matrimonialRegime === 'community' &&
    associate.spouseInfo
  ) {
    // Vérifier si le conjoint a le même nom complet que l'associé
    if (
      associate.firstName.toLowerCase() === associate.spouseInfo.firstName.toLowerCase() &&
      associate.lastName.toLowerCase() === associate.spouseInfo.lastName.toLowerCase()
    ) {
      return {
        valid: true,
        warning: 'Le conjoint semble avoir le même nom que l\'associé',
        message: 'Veuillez vérifier les informations saisies.',
        severity: 'warning'
      };
    }
  }
  return { valid: true };
};
```

**Message de warning** :
```
⚠️ Attention
Le conjoint semble avoir le même nom que l'associé. Veuillez vérifier les informations saisies.
```

---

#### V2.3 - Âge du conjoint cohérent avec l'associé
```typescript
const checkAgeCoherence = (
  associateBirthDate: string, 
  spouseBirthDate: string
): ValidationResult => {
  const associateDate = new Date(associateBirthDate);
  const spouseDate = new Date(spouseBirthDate);
  
  const ageDiff = Math.abs(
    associateDate.getFullYear() - spouseDate.getFullYear()
  );
  
  // Différence d'âge supérieure à 30 ans
  if (ageDiff > 30) {
    return {
      valid: true,
      warning: `Différence d'âge importante entre l'associé et le conjoint (${ageDiff} ans)`,
      message: 'Veuillez vérifier les dates de naissance.',
      severity: 'info'
    };
  }
  
  return { valid: true };
};
```

**Message d'info** :
```
ℹ️ Information
Différence d'âge importante détectée. Veuillez vérifier les dates de naissance.
```

---

### Priorité 3 : Validations de format (temps réel)

#### V3.1 - Format du prénom/nom du conjoint
```typescript
const validateNameFormat = (name: string, fieldName: string): ValidationResult => {
  // Vérifier que ce n'est pas vide
  if (!name.trim()) {
    return {
      valid: false,
      error: `Le ${fieldName} est requis`,
      severity: 'error'
    };
  }
  
  // Vérifier qu'il contient au moins 2 caractères
  if (name.trim().length < 2) {
    return {
      valid: false,
      error: `Le ${fieldName} doit contenir au moins 2 caractères`,
      severity: 'error'
    };
  }
  
  // Vérifier qu'il ne contient pas de chiffres
  if (/\d/.test(name)) {
    return {
      valid: false,
      error: `Le ${fieldName} ne peut pas contenir de chiffres`,
      severity: 'error'
    };
  }
  
  // Vérifier qu'il ne contient pas de caractères spéciaux (sauf tiret, apostrophe, espace)
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
    return {
      valid: false,
      error: `Le ${fieldName} contient des caractères non autorisés`,
      severity: 'error'
    };
  }
  
  return { valid: true };
};
```

**Messages d'erreur** :
```
⚠️ Format invalide
Le prénom/nom doit contenir au moins 2 caractères.

⚠️ Caractères non autorisés
Le prénom/nom ne peut pas contenir de chiffres.
```

---

#### V3.2 - Format de la profession
```typescript
const validateProfession = (profession: string): ValidationResult => {
  if (!profession.trim()) {
    return {
      valid: false,
      error: 'La profession est requise',
      severity: 'error'
    };
  }
  
  if (profession.trim().length < 3) {
    return {
      valid: false,
      error: 'La profession doit contenir au moins 3 caractères',
      severity: 'error'
    };
  }
  
  // Liste noire de valeurs non acceptables
  const invalidValues = ['xxx', 'test', 'aucun', 'none', 'n/a'];
  if (invalidValues.includes(profession.toLowerCase().trim())) {
    return {
      valid: false,
      error: 'Veuillez renseigner une profession valide',
      severity: 'error'
    };
  }
  
  return { valid: true };
};
```

---

### Priorité 4 : Validations d'intégrité globale

#### V4.1 - Validation multi-associés
```typescript
const validateAllAssociates = (associates: Associate[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  associates.forEach((associate, index) => {
    const associateNum = index + 1;
    
    // Valider chaque associé
    const validation = validateAssociate(associate);
    if (!validation.valid) {
      errors.push(`Associé ${associateNum}: ${validation.error}`);
    }
    
    // Valider les infos du conjoint si nécessaire
    const spouseValidation = validateSpouseInfo(associate);
    if (!spouseValidation.valid) {
      errors.push(`Associé ${associateNum}: ${spouseValidation.error}`);
    }
    
    // Vérifier la présence de la situation matrimoniale
    const statusCheck = checkMaritalStatusPresence(associate);
    if (statusCheck.warning) {
      warnings.push(`Associé ${associateNum}: ${statusCheck.warning}`);
    }
  });
  
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings
    };
  }
  
  return {
    valid: true,
    warnings
  };
};
```

---

#### V4.2 - Vérification des doublons de conjoint
```typescript
const checkDuplicateSpouses = (associates: Associate[]): ValidationResult => {
  const spouses = associates
    .filter(a => a.spouseInfo)
    .map(a => ({
      firstName: a.spouseInfo!.firstName.toLowerCase(),
      lastName: a.spouseInfo!.lastName.toLowerCase(),
      birthDate: a.spouseInfo!.birthDate
    }));
  
  // Vérifier les doublons
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  spouses.forEach(spouse => {
    const key = `${spouse.firstName}|${spouse.lastName}|${spouse.birthDate}`;
    if (seen.has(key)) {
      duplicates.push(`${spouse.firstName} ${spouse.lastName}`);
    }
    seen.add(key);
  });
  
  if (duplicates.length > 0) {
    return {
      valid: true,
      warning: 'Le même conjoint semble être déclaré pour plusieurs associés',
      message: `Conjoint(s) en doublon : ${duplicates.join(', ')}`,
      severity: 'warning'
    };
  }
  
  return { valid: true };
};
```

**Message de warning** :
```
⚠️ Doublon détecté
Le même conjoint semble être déclaré pour plusieurs associés. Veuillez vérifier.
```

---

## 🎯 Implémentation recommandée

### Structure de validation
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: string[];
  warning?: string;
  warnings?: string[];
  field?: string;
  severity?: 'error' | 'warning' | 'info';
  message?: string;
}
```

### Point d'entrée principal
```typescript
const validateMaritalStatus = (associate: Associate): ValidationResult => {
  // Priorité 1 : Validations bloquantes
  const v1_1 = validateMatrimonialRegime(associate);
  if (!v1_1.valid) return v1_1;
  
  const v1_2 = validateSpouseInfo(associate);
  if (!v1_2.valid) return v1_2;
  
  const v1_3 = validateBirthDate(associate.spouseInfo?.birthDate);
  if (!v1_3.valid) return v1_3;
  
  // Priorité 2 : Warnings
  const warnings: string[] = [];
  
  const v2_1 = checkMaritalStatusPresence(associate);
  if (v2_1.warning) warnings.push(v2_1.warning);
  
  const v2_2 = checkNameCoherence(associate);
  if (v2_2.warning) warnings.push(v2_2.warning);
  
  // Retourner le résultat
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};
```

---

## 🔔 Notifications utilisateur

### Types de notifications

#### 1. Erreurs bloquantes (rouge)
```typescript
addNotification({
  userId: currentUser?.id || '',
  title: 'Champ obligatoire',
  message: 'Le régime matrimonial est obligatoire pour les associés mariés',
  type: 'error',
  read: false,
});
```

#### 2. Avertissements (orange)
```typescript
addNotification({
  userId: currentUser?.id || '',
  title: 'Attention',
  message: 'Le conjoint doit être majeur (18 ans minimum)',
  type: 'warning',
  read: false,
});
```

#### 3. Informations (bleu)
```typescript
addNotification({
  userId: currentUser?.id || '',
  title: 'Recommandation',
  message: 'Pour un dossier complet, renseignez la situation matrimoniale',
  type: 'info',
  read: false,
});
```

#### 4. Succès (vert)
```typescript
addNotification({
  userId: currentUser?.id || '',
  title: 'Validation réussie',
  message: 'Les informations matrimoniales sont complètes',
  type: 'success',
  read: false,
});
```

---

## 📊 Tableau récapitulatif des validations

| ID | Validation | Priorité | Type | Bloquante | Implémenté |
|----|-----------|----------|------|-----------|------------|
| V1.1 | Régime matrimonial obligatoire | 1 | Error | ✅ Oui | ❌ Non |
| V1.2 | Infos conjoint complètes | 1 | Error | ✅ Oui | ❌ Non |
| V1.3 | Date de naissance valide | 1 | Error | ✅ Oui | ❌ Non |
| V2.1 | Situation non renseignée | 2 | Warning | ❌ Non | ❌ Non |
| V2.2 | Cohérence des noms | 2 | Warning | ❌ Non | ❌ Non |
| V2.3 | Cohérence des âges | 2 | Info | ❌ Non | ❌ Non |
| V3.1 | Format prénom/nom | 3 | Error | ✅ Oui | ❌ Non |
| V3.2 | Format profession | 3 | Error | ✅ Oui | ❌ Non |
| V4.1 | Validation globale | 4 | Mixed | Selon cas | ❌ Non |
| V4.2 | Doublons conjoints | 4 | Warning | ❌ Non | ❌ Non |

---

## 🚀 Plan d'implémentation

### Phase 1 : Validations essentielles (Sprint 1)
```
Semaine 1 :
✓ Implémenter V1.1, V1.2, V1.3
✓ Ajouter notifications d'erreur
✓ Tests unitaires

Semaine 2 :
✓ Intégrer dans le flux de validation
✓ Tests d'intégration
✓ Déploiement en staging
```

### Phase 2 : Validations de cohérence (Sprint 2)
```
Semaine 3 :
✓ Implémenter V2.1, V2.2, V2.3
✓ Ajouter notifications de warning
✓ Tests unitaires

Semaine 4 :
✓ Tests utilisateurs
✓ Ajustements UX
✓ Déploiement en production
```

### Phase 3 : Validations avancées (Sprint 3)
```
Semaine 5-6 :
✓ Implémenter V3.1, V3.2
✓ Validation en temps réel
✓ Amélioration UX

Semaine 7-8 :
✓ Implémenter V4.1, V4.2
✓ Validation globale
✓ Documentation finale
```

---

## 🧪 Tests recommandés

### Tests unitaires
```typescript
describe('Marital Status Validation', () => {
  test('should require matrimonial regime for married associates', () => {
    const associate = {
      maritalStatus: 'married',
      matrimonialRegime: undefined
    };
    const result = validateAssociate(associate);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('régime matrimonial');
  });
  
  test('should require spouse info for community regime', () => {
    const associate = {
      maritalStatus: 'married',
      matrimonialRegime: 'community',
      spouseInfo: undefined
    };
    const result = validateSpouseInfo(associate);
    expect(result.valid).toBe(false);
  });
  
  test('should reject future birth dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = validateBirthDate(futureDate.toISOString());
    expect(result.valid).toBe(false);
  });
});
```

### Tests d'intégration
```typescript
describe('Complete Marital Status Flow', () => {
  test('should validate complete married community associate', () => {
    const associate = {
      firstName: 'Amadou',
      lastName: 'Diallo',
      maritalStatus: 'married',
      matrimonialRegime: 'community',
      spouseInfo: {
        firstName: 'Fatou',
        lastName: 'Sow',
        birthDate: '1990-03-15',
        profession: 'Comptable'
      }
    };
    const result = validateMaritalStatus(associate);
    expect(result.valid).toBe(true);
  });
});
```

---

## 📈 Métriques de succès

### Objectifs
- **100%** des associés mariés ont un régime matrimonial renseigné
- **100%** des associés en communauté ont les infos du conjoint complètes
- **< 1%** de dates de naissance invalides
- **> 95%** de satisfaction utilisateur sur cette étape

### Suivi
```typescript
const metrics = {
  totalAssociates: 0,
  marriedAssociates: 0,
  withMatrimonialRegime: 0,
  withSpouseInfo: 0,
  validationErrors: 0,
  completionRate: 0
};
```

---

**Dernière mise à jour** : 10 Décembre 2025  
**Version** : Crésus V2 - Validation v1.0  
**Statut** : 📋 Spécifications (à implémenter)
