# 🔄 Mises à jour du Module Domiciliation

**Date**: 10 décembre 2024  
**Version**: 2.0  
**Plateforme**: Crésus V2

---

## ✅ Modifications implémentées

### 1. 🚫 **Suppression du dépôt de garantie**

#### Fichiers modifiés :
- ✅ `/data/domiciliationData.ts` - Interface `DomiciliationContract` (suppression du champ `deposit`)
- ✅ `/data/domiciliationData.ts` - Mock data `mockDomiciliationOffers` (champ `deposit` retiré)
- ✅ `/components/mobile/Domiciliation.tsx` - Alerte dépôt supprimée (étape période)
- ✅ `/components/mobile/Domiciliation.tsx` - Calcul paiement simplifié (étapes payment & confirmation)

#### Impacts :
- Le montant total à payer = prix de la période uniquement
- Pas d'affichage d'alerte "Dépôt de garantie requis" après sélection période
- Contrat simplifié sans mention de dépôt
- Calcul plus simple et transparent pour le client

---

### 2. 📅 **Ajout de la facturation semestrielle**

#### Fichiers modifiés :
- ✅ `/data/domiciliationData.ts` - Type `PeriodType` étendu : `'monthly' | 'quarterly' | 'biannual' | 'yearly'`
- ✅ `/data/domiciliationData.ts` - Interface `DomiciliationOffer` - ajout prix `biannual`
- ✅ `/data/domiciliationData.ts` - Fonction `calculatePeriodPrice()` - logique semestrielle (remise 15%)
- ✅ `/data/domiciliationData.ts` - Fonction `getPeriodLabel()` - label "Semestriel"
- ✅ `/data/domiciliationData.ts` - Fonction `getPeriodDuration()` - durée 6 mois
- ✅ `/data/domiciliationData.ts` - Mock data - prix semestriels ajoutés pour les 4 offres
- ✅ `/components/mobile/Domiciliation.tsx` - Liste des périodes étape 3 (`biannual` ajouté)

#### Nouveaux prix semestriels :
| Offre | Prix mensuel | Prix semestriel | Remise |
|-------|--------------|-----------------|--------|
| **Plateau Business Center** | 50 000 FCFA | 270 000 FCFA | 10 000 (15%) |
| **Almadies Corporate Hub** | 75 000 FCFA | 405 000 FCFA | 45 000 (15%) |
| **Mermoz Tech Park** | 60 000 FCFA | 324 000 FCFA | 36 000 (15%) |
| **Point E Business Center** | 35 000 FCFA | 189 000 FCFA | 21 000 (15%) |

#### Logique de remises :
```typescript
case 'monthly':   return prix × 1        // 0% remise
case 'quarterly': return prix × 3 × 0.9  // 10% remise
case 'biannual':  return prix × 6 × 0.85 // 15% remise
case 'yearly':    return prix × 12 × 0.8 // 20% remise
```

---

### 3. 📄 **Documents obligatoires (RC & NINEA)**

#### Fichiers modifiés :
- ✅ `/data/domiciliationData.ts` - `documentChecklistBySocietyType` - `required: true` pour RC et NINEA
- ✅ `/components/mobile/Domiciliation.tsx` - Liste `requiredDocs` - 4 documents sans badge "Optionnel"
- ✅ `/components/mobile/Domiciliation.tsx` - Bouton "Continuer" étape documents - validation des 4 docs

#### Ancienne checklist (3 docs) :
```typescript
✅ CNI (obligatoire)
✅ Statuts (obligatoire)
📋 RC (optionnel)  ❌
```

#### Nouvelle checklist (4 docs obligatoires) :
```typescript
✅ CNI du gérant/président (obligatoire)
✅ Statuts (obligatoire)
✅ Registre de Commerce (obligatoire)  ✅ NOUVEAU
✅ NINEA (obligatoire)  ✅ NOUVEAU
```

#### Validation dans le code :
```typescript
// Avant
disabled={!uploadedDocs.includes('cni') || !uploadedDocs.includes('statuts')}

// Après
disabled={
  !uploadedDocs.includes('cni') || 
  !uploadedDocs.includes('statuts') || 
  !uploadedDocs.includes('rc') || 
  !uploadedDocs.includes('ninea')
}
```

---

### 4. 🪪 **Précision CNI (gérant/président)**

#### Fichiers modifiés :
- ✅ `/data/domiciliationData.ts` - Labels documents par type de société
- ✅ `/components/mobile/Domiciliation.tsx` - Label document "Carte d'identité (gérant/président)"

#### Labels par forme juridique :
| Forme juridique | Label CNI |
|-----------------|-----------|
| **SARL** | Carte d'identité du gérant |
| **SA** | Carte d'identité du DG |
| **SAS** | Carte d'identité du président |
| **SASU** | Carte d'identité du président |
| **SUARL** | Carte d'identité du gérant unique |

#### Dans le composant mobile (générique) :
```typescript
{ 
  id: 'cni', 
  label: 'Carte d\'identité (gérant/président)', 
  icon: '🪪', 
  uploaded: uploadedDocs.includes('cni') 
}
```

---

## 📊 Tableau comparatif avant/après

| Aspect | Avant | Après | Statut |
|--------|-------|-------|--------|
| **Dépôt de garantie** | Requis (50-75K) | Supprimé | ✅ |
| **Périodes disponibles** | 3 (Mensuel, Trimestriel, Annuel) | 4 (+ Semestriel) | ✅ |
| **Remise semestrielle** | N/A | 15% | ✅ |
| **Documents requis** | 2-3 | 4 (tous obligatoires) | ✅ |
| **RC obligatoire** | ❌ Optionnel | ✅ Obligatoire | ✅ |
| **NINEA obligatoire** | ❌ Optionnel | ✅ Obligatoire | ✅ |
| **Label CNI** | "Carte d'identité" | "Carte d'identité (gérant/président)" | ✅ |

---

## 🧪 Tests recommandés

### Test 1 : Vérifier absence dépôt
```
✓ Sélectionner n'importe quelle offre
✓ Choisir n'importe quelle période
✓ Vérifier qu'il n'y a PAS d'alerte "Dépôt de garantie"
✓ Arriver à l'étape paiement
✓ Vérifier que le total = prix période (sans dépôt)
```

### Test 2 : Tester période semestrielle
```
✓ Sélectionner "Plateau Business Center" (50K/mois)
✓ Choisir "Semestriel"
✓ Vérifier le prix affiché : 255 000 FCFA
✓ Vérifier le badge "-15%"
✓ Vérifier le texte "Paiement tous les 6 mois"
✓ Continuer jusqu'au paiement
✓ Vérifier total = 255 000 FCFA
```

### Test 3 : Documents obligatoires
```
✓ Arriver à l'étape "Pièces justificatives"
✓ Vérifier 4 documents listés
✓ Vérifier aucun badge "Optionnel"
✓ Uploader CNI seulement
✓ Vérifier bouton "Continuer" désactivé
✓ Uploader Statuts
✓ Vérifier bouton encore désactivé
✓ Uploader RC
✓ Vérifier bouton encore désactivé
✓ Uploader NINEA
✓ Vérifier bouton "Continuer" activé ✅
```

### Test 4 : Vérifier tous les prix semestriels
```
✓ Tester chaque offre avec période semestrielle
✓ Plateau : 255 000 FCFA (50K × 6 × 0.85)
✓ Almadies : 382 500 FCFA (75K × 6 × 0.85)
✓ Mermoz : 306 000 FCFA (60K × 6 × 0.85)
✓ Point E : 178 500 FCFA (35K × 6 × 0.85)
```

---

## 📁 Fichiers modifiés

### Données
- `/data/domiciliationData.ts` ✅

### Composants
- `/components/mobile/Domiciliation.tsx` ✅
- `/components/web/WebDomiciliation.tsx` (À mettre à jour)
- `/components/admin/AdminDomiciliation.tsx` (À mettre à jour si nécessaire)

---

## ⚠️ À faire ensuite

### Version Web
- [ ] Appliquer les mêmes modifications au composant `WebDomiciliation.tsx`
- [ ] Tester le parcours complet sur desktop
- [ ] Vérifier la cohérence des labels et prix

### Version Admin
- [ ] Mettre à jour l'interface de gestion des offres (ajouter champ prix semestriel)
- [ ] Mettre à jour les filtres de période dans le dashboard
- [ ] Mettre à jour les statistiques pour inclure la période semestrielle

### Documentation
- [ ] Mettre à jour `/MODULE_DOMICILIATION.md` avec les nouveaux prix
- [ ] Mettre à jour `/TEST_GUIDE_DOMICILIATION.md` avec les nouveaux tests
- [ ] Créer un guide de migration pour les contrats existants (si applicable)

### Backend (lorsque implémenté)
- [ ] Mettre à jour le schéma DB (supprimer colonne `deposit` si existante)
- [ ] Ajouter migration pour les prix semestriels
- [ ] Mettre à jour les validations API pour RC et NINEA obligatoires
- [ ] Mettre à jour les calculs de facturation automatique

---

## 🎯 Prochaine étape

**Créer le composant de suivi des domiciliations client** :
- Page "Mes domiciliations" 
- Liste des contrats actifs/expirés
- Détails de chaque domiciliation
- Historique des paiements
- Renouvellement et résiliation

---

**Version**: 2.0  
**Dernière mise à jour**: 10 décembre 2024  
**Statut**: ✅ Modifications mobile complètes
