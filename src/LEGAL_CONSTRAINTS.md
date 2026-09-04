# Contraintes Légales des Formes de Sociétés - Crésus V2

## Vue d'ensemble

Ce document détaille les contraintes légales intégrées dans la plateforme Crésus V2 pour chaque forme de société selon la législation sénégalaise.

## Formes de Sociétés Supportées

### 1. SARL - Société à Responsabilité Limitée

**Contraintes légales:**
- **Capital minimum:** 100 000 FCFA
- **Nombre d'associés:** 2 à 50 associés maximum
- **Gérance:** Gérant obligatoire
- **Responsabilité:** Limitée aux apports

**Validations appliquées:**
- ✅ Vérification du capital minimum (100 000 FCFA)
- ✅ Validation du nombre d'associés (min 2, max 50)
- ✅ Répartition du capital à 100%

**Recommandation:** Idéale pour les PME et projets familiaux

---

### 2. SUARL - Société Unipersonnelle à Responsabilité Limitée

**Contraintes légales:**
- **Capital minimum:** 100 000 FCFA
- **Nombre d'associés:** 1 seul associé unique
- **Gérance:** Gérant obligatoire
- **Responsabilité:** Limitée aux apports

**Validations appliquées:**
- ✅ Vérification du capital minimum (100 000 FCFA)
- ✅ Blocage à 1 seul associé (associesMax: 1)
- ✅ Empêche l'ajout d'associés supplémentaires

**Recommandation:** Idéale pour l'entrepreneur solo classique

---

### 3. SA - Société Anonyme

**Contraintes légales:**
- **Capital minimum:** 10 000 000 FCFA
- **Nombre d'associés:** Minimum 2 associés
- **Gouvernance:** PDG + Conseil d'administration obligatoire
- **Responsabilité:** Limitée aux apports

**Validations appliquées:**
- ✅ Vérification du capital minimum élevé (10M FCFA)
- ✅ Validation du nombre d'associés (min 2)
- ✅ Documents supplémentaires requis (CNI des administrateurs)

**Recommandation:** Pour les grands projets et entreprises d'envergure

---

### 4. SAS - Société par Actions Simplifiée

**Contraintes légales:**
- **Capital minimum:** Capital libre (pas de minimum)
- **Nombre d'associés:** 1 actionnaire minimum
- **Gouvernance:** Président obligatoire
- **Responsabilité:** Limitée aux apports
- **Particularité:** Statuts libres et sur mesure

**Validations appliquées:**
- ✅ Capital libre (capitalMin: 0)
- ✅ Validation du nombre d'associés (min 1)
- ✅ Pas de maximum d'associés

**Recommandation:** Parfaite pour les startups et projets innovants

---

### 5. SASU - Société par Actions Simplifiée Unipersonnelle

**Contraintes légales:**
- **Capital minimum:** Capital libre (pas de minimum)
- **Nombre d'associés:** 1 seul associé unique
- **Gouvernance:** Président obligatoire
- **Responsabilité:** Limitée aux apports
- **Particularité:** Grande liberté statutaire

**Validations appliquées:**
- ✅ Capital libre (capitalMin: 0)
- ✅ Blocage à 1 seul associé (associesMax: 1)
- ✅ Empêche l'ajout d'associés supplémentaires

**Recommandation:** Idéale pour l'entrepreneur solo innovant

---

### 6. SNC - Société en Nom Collectif

**Contraintes légales:**
- **Capital minimum:** Capital libre (pas de minimum)
- **Nombre d'associés:** Minimum 2 associés
- **Gérance:** Gérant associé obligatoire
- **Responsabilité:** ⚠️ **ILLIMITÉE ET SOLIDAIRE**
- **Particularité:** Tous les associés ont la qualité de commerçant

**Validations appliquées:**
- ✅ Capital libre (capitalMin: 0)
- ✅ Validation du nombre d'associés (min 2)
- ⚠️ Avertissement sur la responsabilité illimitée

**Recommandation:** Réservée aux associés qui se connaissent très bien

---

### 7. SCI - Société Civile Immobilière

**Contraintes légales:**
- **Capital minimum:** Capital libre (pas de minimum)
- **Nombre d'associés:** Minimum 2 associés
- **Objet:** Strictement immobilier (gestion de patrimoine)
- **Régime fiscal:** IR (Impôt sur le Revenu) avec option IS (Impôt sur les Sociétés)
- **Responsabilité:** Limitée
- **Restriction:** ⚠️ Interdiction d'activité commerciale

**Validations appliquées:**
- ✅ Capital libre (capitalMin: 0)
- ✅ Validation du nombre d'associés (min 2)
- ⚠️ Avertissement sur l'objet exclusivement immobilier

**Recommandation:** Exclusivement pour la gestion immobilière

---

## Système de Validation Dynamique

### Étape 1: Informations de l'entreprise
```typescript
// Validation du capital minimum
if (getCapitalNumber() < currentLegalFormInfo.capitalMin) {
  // Erreur: Capital insuffisant
}

// Validation du nombre d'associés
if (associates.length < currentLegalFormInfo.associesMin) {
  // Erreur: Pas assez d'associés
}

if (currentLegalFormInfo.associesMax && associates.length > currentLegalFormInfo.associesMax) {
  // Erreur: Trop d'associés
}
```

### Étape 2: Répartition du capital
```typescript
// Validation de la répartition à 100%
const totalPercentage = associates.reduce((sum, a) => sum + parseFloat(a.percentage), 0);
if (Math.abs(totalPercentage - 100) >= 0.01) {
  // Erreur: La répartition doit totaliser 100%
}
```

### Ajustement automatique des associés
Lorsque l'utilisateur change de forme juridique, le système ajuste automatiquement le nombre d'associés :

```typescript
onChange={(e) => {
  setFormData({ ...formData, legalForm: e.target.value });
  const newFormInfo = legalFormInfo[e.target.value];
  
  // Si la nouvelle forme est unipersonnelle (max 1 associé)
  if (newFormInfo.associesMax === 1 && associates.length > 1) {
    setAssociates([associates[0]]); // Garde uniquement le premier
  }
  
  // Si pas assez d'associés pour la nouvelle forme
  if (associates.length < newFormInfo.associesMin) {
    // Ajoute automatiquement des associés vides
  }
}}
```

---

## Interface Utilisateur

### Indicateurs visuels

1. **Capital minimum**
   - ✅ Vert si capital >= minimum requis
   - ⚠️ Ambre si capital < minimum requis

2. **Nombre d'associés**
   - ℹ️ Info-bulle indiquant le nombre requis
   - 🚫 Bouton "Ajouter associé" désactivé si maximum atteint
   - 🚫 Bouton "Retirer associé" désactivé si minimum atteint

3. **Répartition du capital**
   - ✅ Vert si total = 100%
   - ⚠️ Ambre si total ≠ 100%

### Modal d'aide au choix

Affiche pour chaque forme :
- 📝 Description détaillée
- 💰 Capital minimum requis
- 👥 Nombre d'associés requis
- ✅ Liste des avantages
- ⚠️ Liste des inconvénients
- 💡 Recommandation d'usage

---

## Documents Requis par Forme

### Documents de base (toutes formes)
1. CNI du gérant/président
2. Casier judiciaire (bulletin n°3, < 3 mois)
3. Justificatif de domicile (< 3 mois)

### Documents supplémentaires SA
4. CNI de tous les administrateurs (min 3, max 7)

### Documents supplémentaires si plusieurs associés
5. CNI de tous les associés

---

## Synchronisation Web/Mobile

Les contraintes légales sont **identiques** dans les deux versions :
- ✅ `/components/web/WebCreateCompany.tsx`
- ✅ `/components/mobile/CreateCompany.tsx`

Toute modification doit être appliquée aux **deux fichiers** simultanément.

---

## Tests de Validation

### Cas de test SARL
- [ ] Capital < 100 000 FCFA → Erreur
- [ ] 1 associé → Erreur (min 2)
- [ ] 51 associés → Erreur (max 50)
- [ ] 2-50 associés + capital >= 100 000 → ✅

### Cas de test SUARL
- [ ] Capital < 100 000 FCFA → Erreur
- [ ] 2 associés → Ajustement automatique à 1
- [ ] Tentative d'ajouter un 2e associé → Bouton désactivé

### Cas de test SA
- [ ] Capital < 10 000 000 FCFA → Erreur
- [ ] 1 associé → Erreur (min 2)
- [ ] 2 associés + capital >= 10M → ✅

### Cas de test SAS/SASU
- [ ] Capital = 0 → ✅ (capital libre)
- [ ] Capital = 1 FCFA → ✅ (capital libre)
- [ ] SAS: 1+ associés → ✅
- [ ] SASU: 2 associés → Ajustement automatique à 1

### Cas de test SNC/SCI
- [ ] Capital = 0 → ✅ (capital libre)
- [ ] 1 associé → Erreur (min 2)
- [ ] 2+ associés → ✅

---

## Mise à jour future

Pour ajouter ou modifier une forme juridique :

1. Mettre à jour `legalFormInfo` dans les deux fichiers
2. Spécifier `capitalMin`, `associesMin`, `associesMax`
3. Ajouter l'option dans les `<select>`
4. Tester tous les cas de validation
5. Mettre à jour ce document

---

**Dernière mise à jour:** 4 novembre 2025
**Version:** 2.0
**Conformité:** Code OHADA et législation sénégalaise
