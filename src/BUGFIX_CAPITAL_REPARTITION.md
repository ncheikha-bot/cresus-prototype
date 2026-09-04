# Correction du parcours de création de société - Répartition du capital

## Problème identifié

Le parcours de création de société ne permettait pas d'avancer au niveau de l'étape de **répartition du capital** (Étape 2).

### Cause racine

Deux problèmes ont été identifiés :

1. **Validation insuffisante** : La validation ne vérifiait pas explicitement si chaque associé avait renseigné un pourcentage OU un montant de capital. Les associés pouvaient être créés avec des champs vides (`percentage: ''` et `amount: ''`), ce qui faisait échouer silencieusement la validation.

2. **UX non optimale** : Le bouton "Suivant" n'était pas désactivé visuellement à l'étape 2 quand la répartition du capital n'était pas valide, laissant l'utilisateur cliquer sans feedback visuel clair.

## Corrections apportées

### 1. Ajout d'une validation stricte des champs de capital

**Fichiers modifiés :**
- `/components/mobile/CreateCompany.tsx`
- `/components/web/WebCreateCompany.tsx`

**Changement :**

Ajout d'une nouvelle validation après la vérification du nom/prénom, et avant la validation globale de la répartition :

```typescript
// Vérification que chaque associé a un pourcentage ou un montant renseigné
const associateWithoutCapital = associates.find(a => 
  (!a.percentage || parseFloat(a.percentage) === 0) && 
  (!a.amount || parseFloat(a.amount.replace(/\s/g, '')) === 0)
);
if (associateWithoutCapital) {
  addNotification({
    userId: currentUser?.id || '',
    title: 'Répartition incomplète',
    message: `Veuillez renseigner le pourcentage ou le montant pour ${associateWithoutCapital.firstName} ${associateWithoutCapital.lastName}`,
    type: 'warning',
    read: false,
  });
  return;
}
```

**Bénéfice :**
- Message d'erreur explicite indiquant quel associé n'a pas de répartition de capital
- Empêche l'avancement si un associé n'a ni pourcentage ni montant renseigné

### 2. Amélioration visuelle du bouton "Suivant"

**Fichiers modifiés :**
- `/components/mobile/CreateCompany.tsx` (ligne 3174-3194)
- `/components/web/WebCreateCompany.tsx` (ligne 3080-3101)

**Changement :**

Ajout d'une condition `disabled` sur le bouton "Suivant" à l'étape 2 :

```typescript
disabled={
  (currentStep === 2 && !isCapitalDistributionValid()) ||
  (currentStep === 4 && quote.status !== 'validated') ||
  // ... autres conditions
}
```

**Bénéfice :**
- Le bouton est maintenant grisé et non cliquable tant que la répartition n'est pas valide (100% et montant correct)
- Feedback visuel immédiat pour l'utilisateur

## Flux de validation de l'étape 2 (ordre)

Voici l'ordre des validations effectuées à l'étape 2 :

1. ✅ **Nombre d'associés** : Vérifie que le nombre d'associés respecte les contraintes de la forme juridique
2. ✅ **Nom et prénom** : Vérifie que chaque associé a un nom et un prénom renseigné
3. ✅ **Capital renseigné** : **[NOUVEAU]** Vérifie que chaque associé a un pourcentage OU un montant renseigné
4. ✅ **Répartition à 100%** : Vérifie que le total des pourcentages = 100% ET que le total des montants = capital social
5. ✅ **Email valide** : Vérifie le format des emails (si renseignés)
6. ✅ **Téléphone du gérant** : Vérifie le format du téléphone du gérant/président (si désigné et renseigné)

## Tests recommandés

### Cas de test 1 : Associé sans capital
1. Aller à l'étape 2 - Répartition du capital
2. Remplir le nom et prénom d'un associé
3. Laisser les champs "Parts (%)" et "Montant (FCFA)" vides
4. Cliquer sur "Suivant"

**Résultat attendu :**
- ❌ Le bouton "Suivant" est grisé
- ❌ Notification : "Répartition incomplète - Veuillez renseigner le pourcentage ou le montant pour [Nom Prénom]"
- ❌ L'utilisateur reste sur l'étape 2

### Cas de test 2 : Répartition incorrecte (< 100%)
1. Aller à l'étape 2
2. Créer 2 associés avec 40% et 50% (total = 90%)
3. Cliquer sur "Suivant"

**Résultat attendu :**
- ❌ Le bouton "Suivant" est grisé
- ❌ Notification : "La répartition doit totaliser 100% (actuellement: 90.00%)"
- ❌ L'utilisateur reste sur l'étape 2

### Cas de test 3 : Répartition valide
1. Aller à l'étape 2
2. Créer 2 associés avec 50% et 50% (ou montants équivalents)
3. Cliquer sur "Suivant"

**Résultat attendu :**
- ✅ Le bouton "Suivant" est actif et cliquable
- ✅ L'utilisateur passe à l'étape 3 (Documents)

## Impact

### Fichiers modifiés
- `/components/mobile/CreateCompany.tsx` : Validation + UX bouton
- `/components/web/WebCreateCompany.tsx` : Validation + UX bouton

### Code ajouté
- +15 lignes de validation dans la fonction `handleNext()`
- +2 lignes dans la condition `disabled` du bouton "Suivant"

### Compatibilité
- ✅ Aucun breaking change
- ✅ Les données existantes continuent de fonctionner
- ✅ Amélioration de l'expérience utilisateur

## Notes techniques

### Auto-calcul existant
Le système conserve son auto-calcul existant :
- Si l'utilisateur saisit un **pourcentage**, le **montant** est calculé automatiquement
- Si l'utilisateur saisit un **montant**, le **pourcentage** est calculé automatiquement

### Indicateur visuel de répartition
Le résumé de répartition affiche en temps réel :
- **Total parts** : En vert si = 100%, en orange sinon
- **Total montant** : En vert si = capital social, en orange sinon

## Date de correction
29 janvier 2026

## Version
Crésus V2 - Build du 29/01/2026
