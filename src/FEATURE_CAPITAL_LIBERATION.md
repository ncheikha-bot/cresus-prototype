# Fonctionnalité : Libération du Capital

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de choisir entre une **libération totale** ou **partielle** du capital social lors de la création d'entreprise, conformément aux pratiques juridiques sénégalaises.

## Implémentation

### 📱 Mobile (`/components/mobile/CreateCompany.tsx`)

**États ajoutés** :
- `liberationType`: `'total' | 'partial'` - Type de libération choisi
- `liberationMethod`: `'amount' | 'percentage'` - Méthode de calcul pour libération partielle
- `liberationValue`: `string` - Valeur saisie (montant ou pourcentage)

**Fonctions de calcul** :
- `getCapitalNumber()`: Récupère le capital social en nombre
- `getLiberatedAmount()`: Calcule le montant à libérer selon le type et la méthode
- `getRemainingAmount()`: Calcule le solde restant

### 💻 Web (`/components/web/WebCreateCompany.tsx`)

Même implémentation que mobile pour garantir l'harmonisation complète.

## Interface utilisateur

### Étape 3 : Capital

#### 1. Choix du type de libération

```
┌─────────────────────────────────┐
│  Type de libération             │
├─────────────────────────────────┤
│  ✓ Libération totale            │
│    Versement intégral du capital│
├─────────────────────────────────┤
│    Libération partielle         │
│    Versement d'une partie       │
└─────────────────────────────────┘
```

#### 2. Options de libération partielle

Si **partielle** est sélectionné :

**Mode de calcul** :
- `Pourcentage` : Saisir un % du capital (ex: 25%)
- `Montant fixe` : Saisir un montant en FCFA (ex: 250000)

**Champ de saisie** :
- Pour pourcentage : input number (1-99%)
- Pour montant : input text formaté en FCFA

#### 3. Résumé visuel

Carte récapitulative (fond or impérial #D6A93A) :
```
Capital social       1 000 000 FCFA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Montant à libérer      250 000 FCFA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solde restant          750 000 FCFA
```

### Étape 5 : Validation - Récapitulatif

Affichage dans le résumé final :

**Mobile** :
```
📊 Capital social: 1 000 000 FCFA
  ✓ Libéré: 250 000 FCFA
  Solde: 750 000 FCFA
```

**Web** :
```
┌─────────────────────────────────┐
│  Libération du capital          │
├─────────────────────────────────┤
│  Type: Libération partielle     │
│  Montant libéré: 250 000 FCFA   │
│  Solde restant: 750 000 FCFA    │
└─────────────────────────────────┘
```

### Écran de confirmation finale

Après validation complète :
```
Capital social      1 000 000 FCFA
Capital libéré        250 000 FCFA ✓
Solde à libérer       750 000 FCFA
```

## Logique de calcul

### Libération totale
```typescript
getLiberatedAmount() = getCapitalNumber()
getRemainingAmount() = 0
```

### Libération partielle - Pourcentage
```typescript
percentage = parseFloat(liberationValue)
getLiberatedAmount() = Math.round(getCapitalNumber() * percentage / 100)
getRemainingAmount() = getCapitalNumber() - getLiberatedAmount()
```

### Libération partielle - Montant fixe
```typescript
getLiberatedAmount() = parseFloat(liberationValue)
getRemainingAmount() = getCapitalNumber() - getLiberatedAmount()
```

## Messages utilisateur

### Succès du paiement

**Libération totale** :
> "Votre dépôt de capital de **1 000 000 FCFA** a été validé."

**Libération partielle** :
> "Votre dépôt de capital de **250 000 FCFA** a été validé."
> "Solde restant: 750 000 FCFA"

### Information importante

💡 **Info affichée à l'étape Capital** :
> "Le dépôt de capital sera effectué sur un compte séquestre sécurisé et sera libéré après l'immatriculation de votre entreprise."

## Validation

Aucune validation supplémentaire requise car :
- La libération totale est automatique
- La libération partielle permet toute valeur (le cadre légal sénégalais sera géré côté admin)

## Harmonisation Mobile/Web

✅ **100% harmonisé** entre les deux plateformes :
- Mêmes états
- Mêmes fonctions de calcul
- Même logique métier
- Interface adaptée au contexte (mobile vs desktop)

## Affichage des associés

En bonus, les associés sont maintenant affichés dans le récapitulatif final :

### Mobile
```
👥 Associés
  • Amadou Diop - 60.0%
  • Fatou Sall - 40.0%
```

### Web
```
┌─────────────────────────────────┐
│  Associés                       │
├─────────────────────────────────┤
│  Amadou Diop          60.0%     │
│  Fatou Sall           40.0%     │
└─────────────────────────────────┘
```

## Palette de couleurs utilisée

- **Fond carte récapitulatif** : `from-[#D6A93A] to-[#b8902f]` (Or impérial → Or foncé)
- **Texte validation** : `text-green-600` (Succès)
- **Bordures actives** : `border-[#D6A93A]` (Or impérial)
- **Fond actif** : `bg-[#D6A93A]/10` (Or impérial transparent)

## Prochaines étapes possibles

1. Ajouter une validation minimale (ex: minimum 25% du capital à libérer)
2. Permettre un calendrier de libération du solde
3. Générer un plan de libération téléchargeable
4. Envoyer des rappels pour libération du solde

---

**Date d'implémentation** : 4 novembre 2025
**Harmonisation** : Mobile ✅ | Web ✅
**Tests** : À effectuer
