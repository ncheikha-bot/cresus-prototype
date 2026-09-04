# 💾 Guide du Système de Sauvegarde et Brouillons

## 🎯 LES BOUTONS SONT MAINTENANT ULTRA-VISIBLES !

### ⚡ VERSION 3.0 - IMPOSSIBLE À MANQUER

**3 EMPLACEMENTS PAR PAGE :**
1. 🚀 **Bouton flottant fixe** DORÉ - Coin supérieur droit (web) / Bas droit (mobile)
   - Toujours visible même en scrollant
   - Animation de pulsation (web) ou rebond (mobile)
   - Couleur OR distinctive (#D6A93A)
   
2. ✅ **Badge Auto-save** qui PULSE - Dans le header en haut à droite
   - Animation de pulsation continue
   - Couleur OR distinctive
   - Texte "✅ Auto-save" ou "✅ Sauvegarde automatique activée"
   
3. 📦 **Grande bannière DORÉE** - En bas de page
   - 100-120px de hauteur, impossible à manquer
   - Bordure animée en pointillés
   - GROS bouton doré avec texte "💾 Enregistrer et quitter"

👉 **Voir le fichier `/BOUTONS_SAUVEGARDE_LOCALISATION.md` pour un guide visuel complet avec schémas**

---

### 🔍 COMMENT LES TROUVER

#### Sur WEB (Desktop)
1. Regardez en **haut à DROITE** → Bouton flottant DORÉ fixe
2. Scrollez en bas de la page → Grande BANNIÈRE DORÉE
3. Vérifiez le header → Badge qui PULSE

#### Sur MOBILE
1. Regardez en **bas à DROITE** → Cercle DORÉ qui rebondit
2. Scrollez en bas → Grande BANNIÈRE DORÉE sous la navigation
3. Vérifiez le header bleu → Badge DORÉ qui pulse

**Si vous ne voyez TOUJOURS PAS ces éléments, rafraîchissez la page (F5)**

---

## Vue d'ensemble

Le système de sauvegarde automatique permet aux utilisateurs de **sauvegarder leur progression** à tout moment pendant le processus de création d'entreprise et de **reprendre plus tard** exactement où ils se sont arrêtés.

---

## 🎯 Fonctionnalités principales

### 1. **Bouton "Enregistrer et quitter"**

#### Web (Client Desktop)
- **Emplacement** : En bas de chaque étape, entre les boutons "Précédent" et "Suivant"
- **Design** : Bouton bleu foncé avec gradient (`#273A7A` → `#1A2753`) avec icône 💾
- **Effet** : Animation au survol avec ombre portée
- **Texte** : "Enregistrer et quitter"

#### Mobile
- **Emplacement** : En bas de l'écran, sous le bouton "Suivant"
- **Design** : Bouton pleine largeur, gradient bleu foncé avec icône 💾
- **Texte** : "💾 Enregistrer et quitter"

### 2. **Indicateur de sauvegarde automatique**

#### Web
- **Emplacement** : En haut à droite du header, à côté du titre
- **Design** : Badge blanc avec bordure dorée
- **Texte** : "Sauvegarde automatique activée" avec icône Save

#### Mobile
- **Emplacement** : En haut à droite du header gradient
- **Design** : Badge translucide avec backdrop-blur
- **Texte** : "Auto-save" avec icône Save

---

## 📋 Données sauvegardées

Le système sauvegarde **toutes les informations** saisies :

```typescript
{
  userId: string,              // ID de l'utilisateur
  formData: {                  // Informations de l'entreprise
    name: string,
    legalForm: string,
    activity: string,
    capital: string,
    address: string,
  },
  associates: Associate[],     // Liste des associés
  uploadedFiles: Record<>,     // Documents téléversés
  currentStep: number,         // Étape en cours (1-5)
  selectedPaymentMethod: string,
  phoneNumber: string,
  signedDocs: string[],
  liberationType: 'total' | 'partial',
  liberationMethod: 'amount' | 'percentage',
  liberationValue: string,
  paymentCompleted: boolean,
}
```

---

## 🔄 Flux utilisateur

### Nouveau processus
1. L'utilisateur démarre un nouveau processus de création
2. **Notification d'astuce** : "💡 Vous pouvez sauvegarder votre progression à tout moment"
3. L'utilisateur remplit les informations
4. À tout moment, il peut cliquer sur "Enregistrer et quitter"
5. **Notification de succès** : "💾 Brouillon enregistré - Votre progression a été sauvegardée"
6. Redirection vers le dashboard après 800ms

### Reprise d'un brouillon
1. L'utilisateur clique sur un brouillon dans la section "Brouillons en cours"
2. Le système charge toutes les données sauvegardées
3. **Notification de reprise** : "📝 Reprise du brouillon - Vous reprenez à l'étape X"
4. L'utilisateur est directement placé à l'étape où il s'était arrêté
5. Il peut continuer ou mettre à jour le brouillon

### Mise à jour d'un brouillon existant
1. L'utilisateur modifie les informations
2. Il clique sur "Enregistrer et quitter"
3. **Notification de mise à jour** : "💾 Brouillon mis à jour"
4. Le brouillon existant est mis à jour (pas de duplication)

---

## 🎨 Design & UX

### Couleurs utilisées
- **Bouton principal** : Gradient `from-[#273A7A] to-[#1A2753]`
- **Icône** : `Save` de lucide-react
- **Badge auto-save** : Fond blanc avec bordure `#D6A93A`

### Animations
- **Hover sur web** : Scale de l'icône (110%) + ombre portée
- **Active sur mobile** : Scale (98%) pour feedback tactile
- **Transition** : 300ms smooth pour tous les états

### Notifications
- **Succès** : Vert avec icône ✅
- **Info** : Bleu avec icône 💡
- **Durée d'affichage** : Toast automatique selon la configuration

---

## 📱 Différences Web vs Mobile

| Aspect | Web | Mobile |
|--------|-----|--------|
| **Position bouton** | Entre Précédent/Suivant | Sous le bouton Suivant |
| **Largeur bouton** | Auto (avec padding) | Pleine largeur (100%) |
| **Badge auto-save** | Header droit, opaque | Header droit, translucide |
| **Émoji dans texte** | Non | Oui (💾) |
| **Shadow** | shadow-lg au hover | shadow-md permanent |

---

## 🧪 Test du système

### Scénario 1 : Nouvelle création
1. ✅ Démarrer une nouvelle création d'entreprise
2. ✅ Remplir l'étape 1 partiellement
3. ✅ Cliquer sur "Enregistrer et quitter"
4. ✅ Vérifier la notification de succès
5. ✅ Vérifier que le brouillon apparaît dans le dashboard

### Scénario 2 : Reprise
1. ✅ Cliquer sur un brouillon existant
2. ✅ Vérifier que toutes les données sont chargées
3. ✅ Vérifier l'étape en cours
4. ✅ Continuer la saisie
5. ✅ Re-sauvegarder

### Scénario 3 : Mise à jour
1. ✅ Reprendre un brouillon
2. ✅ Modifier les informations
3. ✅ Enregistrer et quitter
4. ✅ Vérifier qu'il n'y a pas de doublon
5. ✅ Vérifier que les modifications sont sauvées

---

## 🔧 Implémentation technique

### Fonction principale
```typescript
const handleSaveAndExit = () => {
  if (!currentUser) return;

  const draftData = { /* toutes les données */ };

  if (currentDraftId) {
    updateDraft(currentDraftId, draftData);
    // Notification mise à jour
  } else {
    const newDraftId = saveDraft(draftData);
    setCurrentDraftId(newDraftId);
    // Notification nouveau brouillon
  }

  setTimeout(() => onBack(), 800);
};
```

### Chargement au montage
```typescript
React.useEffect(() => {
  if (draftId && currentUser) {
    const draft = getDraftById(draftId);
    if (draft) {
      // Charger toutes les données
      // Notification de reprise
    }
  } else if (!draftId && currentUser) {
    // Notification d'astuce
  }
}, [draftId, currentUser]);
```

---

## ✅ Checklist de visibilité

- [x] Bouton "Enregistrer et quitter" visible à chaque étape (Web)
- [x] Bouton "Enregistrer et quitter" visible à chaque étape (Mobile)
- [x] Badge "Auto-save" visible dans le header (Web)
- [x] Badge "Auto-save" visible dans le header (Mobile)
- [x] Notification d'astuce au démarrage d'un nouveau processus
- [x] Notification de succès lors de la sauvegarde
- [x] Notification de reprise lors du chargement d'un brouillon
- [x] Icône Save au lieu de Download
- [x] Gradient bleu foncé pour le bouton (au lieu de blanc)
- [x] Tooltip sur le bouton Web

---

## 📝 Notes importantes

1. **Pas de perte de données** : Toutes les saisies sont préservées
2. **Mise à jour intelligente** : Le système détecte si c'est un nouveau brouillon ou une mise à jour
3. **Étape précise** : L'utilisateur reprend exactement à l'étape où il s'était arrêté
4. **Validation préservée** : Les validations déjà passées sont mémorisées
5. **Documents conservés** : Les fichiers uploadés sont sauvegardés dans l'état

---

## 🎯 Améliorations futures possibles

- [ ] Auto-save périodique (toutes les 30s)
- [ ] Indicateur de dernière sauvegarde (timestamp)
- [ ] Confirmation avant de quitter sans sauvegarder
- [ ] Synchronisation cloud (si Supabase activé)
- [ ] Historique des versions du brouillon
- [ ] Export/Import de brouillon

---

## 📞 Support

Si le bouton n'est pas visible :
1. Vérifier que vous êtes bien dans le processus de création
2. Scroller jusqu'en bas de l'écran
3. Le bouton est toujours présent, même à l'étape 1
4. Sur mobile, il est sous le bouton principal
5. Sur web, il est entre "Précédent" et "Suivant"

---

**Dernière mise à jour** : Novembre 2025  
**Version** : 2.0 - Système de brouillons complet
