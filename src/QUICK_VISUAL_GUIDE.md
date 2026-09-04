# 🎨 Guide Visuel Rapide - Système de Livrables

## 🎯 Vue d'ensemble en 1 image

```
┌────────────────────────────────────────────────────────────────────┐
│                     CRÉSUS V2 - BRANDING                           │
│                                                                    │
│  Client paie forfait → Projet démarre → Livrables → Validation   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Interface Mobile

### Vue Discussion avec livrable intégré
```
┌──────────────────────────────────────┐
│  ← Refonte identité Boutique Mode    │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ [Discussion] [Livrables] (1)     ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌─ Sophie - Designer ─ 10:30 ──────┐│
│  │ 📦 Premier livrable prêt !       ││
│  │    Voici vos propositions de     ││
│  │    logo. 🎨                      ││
│  │                                  ││
│  │  ┌───────────────────────────┐  ││
│  │  │ 📦 Propositions de logo   │  ││
│  │  │    3 concepts avec        │  ││
│  │  │    déclinaisons           │  ││
│  │  │                           │  ││
│  │  │ ┌───────────────────────┐ │  ││
│  │  │ │🔵 En attente           │ │  ││
│  │  │ │   de validation        │ │  ││
│  │  │ └───────────────────────┘ │  ││
│  │  │                           │  ││
│  │  │ 📄 Logo_A.pdf   [📥]      │  ││
│  │  │ 📄 Logo_B.pdf   [📥]      │  ││
│  │  │ 📄 Logo_C.pdf   [📥]      │  ││
│  │  │                           │  ││
│  │  │ [Tout télécharger]        │  ││
│  │  │ [✅ Donner mon avis]       │  ││
│  │  └───────────────────────────┘  ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ [Écrivez un message...] [📤]     ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

### Modal de review (Bottom Sheet Mobile)
```
┌──────────────────────────────────────┐
│  ═══  (Handle pour swipe down)       │
│                                      │
│         Propositions de logo         │
│         Version 1 • 3 fichiers       │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ Fichiers livrés                  ││
│  │                                  ││
│  │ 📄 Logo_Concept_A.pdf  [📥]      ││
│  │    PDF • 2.4 MB                  ││
│  │                                  ││
│  │ 📄 Logo_Concept_B.pdf  [📥]      ││
│  │    PDF • 2.1 MB                  ││
│  │                                  ││
│  │ 📄 Logo_Concept_C.pdf  [📥]      ││
│  │    PDF • 2.8 MB                  ││
│  └──────────────────────────────────┘│
│                                      │
│    Que pensez-vous de ce livrable ?  │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ┌───────┐                        ││
│  │ │  ✅   │ J'approuve ce livrable ││
│  │ └───────┘ Le travail correspond  ││
│  │           à mes attentes         ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ┌───────┐                        ││
│  │ │  🔄   │ Demander des           ││
│  │ └───────┘ modifications          ││
│  │           2 révision(s)          ││
│  │           restante(s)            ││
│  └──────────────────────────────────┘│
│                                      │
│  [ Fermer ]                          │
└──────────────────────────────────────┘
```

### Après avoir cliqué "Approuver"
```
┌──────────────────────────────────────┐
│  ═══                                 │
│                                      │
│         Approuver ce livrable        │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ✅  Approuver ce livrable        ││
│  └──────────────────────────────────┘│
│                                      │
│  Commentaire (optionnel)             │
│  ┌──────────────────────────────────┐│
│  │ Partagez vos impressions         ││
│  │ positives...                     ││
│  │                                  ││
│  │                                  ││
│  └──────────────────────────────────┘│
│                                      │
│  [ Retour ]  [ ✅ Approuver ]        │
└──────────────────────────────────────┘
```

### Après avoir cliqué "Demander révision"
```
┌──────────────────────────────────────┐
│  ═══                                 │
│                                      │
│    Demander des modifications        │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ 🔄  Demander des modifications   ││
│  │                                  ││
│  │     2 révision(s) restante(s)    ││
│  └──────────────────────────────────┘│
│                                      │
│  Quelles modifications souhaitez-    │
│  vous ? *                            │
│  ┌──────────────────────────────────┐│
│  │ Décrivez précisément les         ││
│  │ changements souhaités...         ││
│  │                                  ││
│  │                                  ││
│  │                                  ││
│  └──────────────────────────────────┘│
│  Plus vous serez précis, plus vite   │
│  nous pourrons apporter les          │
│  corrections.                        │
│                                      │
│  [ Retour ]  [ 🔄 Demander révision] │
└──────────────────────────────────────┘
```

---

## 💻 Interface Desktop

### Modal centré (au lieu de bottom sheet)
```
        ┌────────────────────────────────────────┐
        │ Propositions de logo           [×]    │
        │ Version 1 • 3 fichier(s)               │
        │                                        │
        │ ┌────────────────────────────────────┐ │
        │ │ Fichiers livrés                    │ │
        │ │                                    │ │
        │ │ 📄 Logo_Concept_A.pdf      [📥]    │ │
        │ │    PDF • 2.4 MB                    │ │
        │ │                                    │ │
        │ │ 📄 Logo_Concept_B.pdf      [📥]    │ │
        │ │    PDF • 2.1 MB                    │ │
        │ │                                    │ │
        │ │ 📄 Logo_Concept_C.pdf      [📥]    │ │
        │ │    PDF • 2.8 MB                    │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │   Que pensez-vous de ce livrable ?     │
        │                                        │
        │ ┌────────────────────────────────────┐ │
        │ │   ✅  J'approuve ce livrable       │ │
        │ │       Le travail correspond à mes  │ │
        │ │       attentes                     │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ ┌────────────────────────────────────┐ │
        │ │   🔄  Demander des modifications   │ │
        │ │       2 révision(s) restante(s)    │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │              [ Fermer ]                │
        └────────────────────────────────────────┘
```

---

## 🎨 États visuels

### Statut: En attente de validation
```
┌─────────────────────────────────────┐
│ 🔵 En attente de validation         │  ← Bleu
│    [✅ Donner mon avis]              │
└─────────────────────────────────────┘
```

### Statut: Approuvé
```
┌─────────────────────────────────────┐
│ 🟢 Approuvé                         │  ← Vert
│                                     │
│ ✅ "J'adore le concept B ! Merci !" │
└─────────────────────────────────────┘
```

### Statut: Révision demandée
```
┌─────────────────────────────────────┐
│ 🟠 Révision demandée                │  ← Orange
│                                     │
│ 🔄 "Pourriez-vous agrandir le       │
│     logo ?"                         │
└─────────────────────────────────────┘
```

---

## 📊 Messages dans la discussion

### Message normal
```
┌─ Vous ─ 14:25 ────────────────────┐
│  Merci pour votre retour !        │
└───────────────────────────────────┘
```

### Message de livraison
```
┌─ Sophie - Designer ─ 10:30 ────────┐
│ 📦 Premier livrable prêt !          │
│    Voici vos propositions de logo.  │
│                                     │
│  [Carte du livrable s'affiche ici] │
└─────────────────────────────────────┘
```

### Message d'approbation
```
┌───────────────────────────────────────┐
│ ✅ Vous avez approuvé un livrable     │
│                                       │
│    J'approuve le livrable             │
│    "Propositions de logo".            │
│    Merci pour ce travail ! 👍         │
│                                       │
│    3 nov. 2025, 15:45                 │
└───────────────────────────────────────┘
```

### Message de révision
```
┌───────────────────────────────────────┐
│ 🔄 Vous avez demandé des modifications│
│                                       │
│    Modifications demandées pour       │
│    "Propositions de logo":            │
│                                       │
│    Pourriez-vous agrandir le logo et  │
│    changer la police pour quelque     │
│    chose de plus moderne ?            │
│                                       │
│    Révision n°1 • 3 nov. 2025, 16:20  │
└───────────────────────────────────────┘
```

---

## 📈 Statistiques (optionnel)

```
┌───────────────────────────────────────┐
│  📦 Résumé livrables                  │
│                                       │
│  ┌─────┐  ┌─────┐  ┌─────┐          │
│  │  1  │  │  0  │  │  0  │          │
│  │ À   │  │Appro│  │ En  │          │
│  │vali-│  │uvés │  │révi-│          │
│  │der  │  │     │  │sion │          │
│  └─────┘  └─────┘  └─────┘          │
│                                       │
│  2 révisions restantes                │
└───────────────────────────────────────┘
```

---

## 🎯 Palette de couleurs

```css
/* Statuts */
.pending-review {
  background: #EFF6FF;     /* bg-blue-50 */
  border: #BFDBFE;         /* border-blue-200 */
  color: #1E3A8A;          /* text-blue-900 */
}

.approved {
  background: #F0FDF4;     /* bg-green-50 */
  border: #BBF7D0;         /* border-green-200 */
  color: #14532D;          /* text-green-900 */
}

.revision-requested {
  background: #FFF7ED;     /* bg-orange-50 */
  border: #FED7AA;         /* border-orange-200 */
  color: #7C2D12;          /* text-orange-900 */
}

/* Boutons primaires */
.btn-approve {
  background: #16A34A;     /* bg-green-600 */
  color: #FFFFFF;
}

.btn-revision {
  background: #EA580C;     /* bg-orange-600 */
  color: #FFFFFF;
}

.btn-download {
  background: rgba(39, 58, 122, 0.1);  /* bg-[#273A7A]/10 */
  color: #273A7A;
}

.btn-primary {
  background: #D6A93A;     /* bg-[#D6A93A] */
  color: #FFFFFF;
}
```

---

## 🔄 Flow interactif

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  1. Client ouvre projet                           │
│     ↓                                              │
│  2. Voit livrable avec statut "pending-review"    │
│     ↓                                              │
│  3. Clique sur [✅ Donner mon avis]                │
│     ↓                                              │
│  4. Modal s'ouvre (bottom sheet mobile)           │
│     ↓                                              │
│  5. Client a 2 choix:                             │
│     ├─ ✅ Approuver                                │
│     │   ├─ Champ commentaire (optionnel)          │
│     │   ├─ Clique [Approuver]                     │
│     │   ├─ Message ajouté à discussion            │
│     │   └─ Statut → "approved"                    │
│     │                                              │
│     └─ 🔄 Demander révision                        │
│         ├─ Champ notes (obligatoire)              │
│         ├─ Clique [Demander révision]             │
│         ├─ Message ajouté à discussion            │
│         ├─ Statut → "revision-requested"          │
│         └─ Révisions utilisées: +1                │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 💡 Points clés

### ✅ Ce qui fonctionne
- Affichage des livrables dans le fil de discussion
- Modal de review avec 2 options (approuver/révision)
- Gestion automatique des révisions restantes
- Messages enrichis avec types différents
- Téléchargement simulé des fichiers
- Design Crésus respecté

### 🔄 À faire (Backend)
- Upload réel de fichiers
- Téléchargement réel (URLs signées)
- Génération de ZIP pour "Tout télécharger"
- Notifications email/push
- Persistance en BDD

---

## 🚀 Pour tester

1. **Ouvrir l'app** → Module Branding
2. **Sélectionner** projet "Refonte identité Boutique Mode"
3. **Onglet Discussion** → Voir le livrable intégré
4. **Cliquer** sur [✅ Donner mon avis]
5. **Tester** les 2 flows (approuver/révision)
6. **Vérifier** les messages ajoutés

---

**Version:** 1.0.0  
**Date:** 4 novembre 2025  
**Temps de lecture:** 5 minutes
