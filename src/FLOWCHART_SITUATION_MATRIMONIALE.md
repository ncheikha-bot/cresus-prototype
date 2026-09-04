# Flowchart - Situation Matrimoniale des Associés

## 🔄 Diagramme de flux principal

```
┌─────────────────────────────────────────────────────────────────┐
│                     DÉBUT ÉTAPE 2                               │
│                 (Répartition du capital)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Pour chaque ASSOCIÉ :                                          │
│  • Nom, Prénom                                                  │
│  • Pourcentage / Montant                                        │
│  • Adresse                                                      │
│  • Profession                                                   │
│  • Email, Téléphone                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              📋 SITUATION MATRIMONIALE ?                        │
│  [ Sélectionner... ▼ ]                                         │
└─────┬────────┬─────────┬─────────┬────────────────────────────┘
      │        │         │         │
      │        │         │         │
    Single   Married  Divorced  Widowed
      │        │         │         │
      ▼        │         ▼         ▼
   ┌──────┐   │      ┌──────────────┐
   │ FIN  │   │      │     FIN      │
   └──────┘   │      └──────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│              💑 RÉGIME MATRIMONIAL ?                            │
│  [ Sélectionner... ▼ ]                                         │
└────────────────┬───────────────┬────────────────────────────────┘
                 │               │
           Community      Separation
                 │               │
                 ▼               ▼
        ┌─────────────┐    ┌─────────┐
        │ CONTINUE    │    │   FIN   │
        └──────┬──────┘    └─────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│       👥 INFORMATIONS DU CONJOINT                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Fond doré #D6A93A/5                                      │  │
│  │                                                           │  │
│  │  Prénom: [____________]  Nom: [____________]             │  │
│  │                                                           │  │
│  │  Date de naissance: [____-__-__]                         │  │
│  │                                                           │  │
│  │  Profession: [_____________________________]             │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION                                   │
│  • Tous les champs obligatoires remplis ?                      │
│  • Conjoint majeur ?                                           │
│  • Date de naissance valide ?                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ASSOCIÉ SUIVANT                                │
│              ou FIN ÉTAPE 2                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Diagramme de décision

```
                    SITUATION MATRIMONIALE
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    SINGLE             MARRIED            DIVORCED/WIDOWED
        │                   │                   │
        ▼                   │                   ▼
     [FIN]                  │                [FIN]
                            │
                            ▼
                   RÉGIME MATRIMONIAL
                            │
                ┌───────────┴───────────┐
                │                       │
           SEPARATION              COMMUNITY
                │                       │
                ▼                       ▼
             [FIN]              INFOS CONJOINT
                                        │
                                        ▼
                                 ┌─────────────┐
                                 │  Prénom     │
                                 │  Nom        │
                                 │  Naissance  │
                                 │  Profession │
                                 └─────────────┘
                                        │
                                        ▼
                                   VALIDATION
                                        │
                                        ▼
                                     [FIN]
```

---

## 🔄 Flux de réinitialisation

### Cas 1 : Changement de situation matrimoniale

```
ÉTAT INITIAL
┌────────────────────────────────────────────┐
│ Marié + Communauté + Infos Conjoint       │
│ ┌────────────────────────────────────────┐ │
│ │ maritalStatus: "married"               │ │
│ │ matrimonialRegime: "community"         │ │
│ │ spouseInfo: {                          │ │
│ │   firstName: "Fatou",                  │ │
│ │   lastName: "Diop",                    │ │
│ │   birthDate: "1990-03-15",             │ │
│ │   profession: "Comptable"              │ │
│ │ }                                      │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
                    │
                    │ Changement → "Célibataire"
                    ▼
         RÉINITIALISATION AUTOMATIQUE
                    │
                    ▼
ÉTAT FINAL
┌────────────────────────────────────────────┐
│ Célibataire (tous les champs effacés)     │
│ ┌────────────────────────────────────────┐ │
│ │ maritalStatus: "single"                │ │
│ │ matrimonialRegime: undefined           │ │
│ │ spouseInfo: undefined                  │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

### Cas 2 : Changement de régime matrimonial

```
ÉTAT INITIAL
┌────────────────────────────────────────────┐
│ Marié + Communauté + Infos Conjoint       │
│ ┌────────────────────────────────────────┐ │
│ │ maritalStatus: "married"               │ │
│ │ matrimonialRegime: "community"         │ │
│ │ spouseInfo: {...}                      │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
                    │
                    │ Changement → "Séparation"
                    ▼
         RÉINITIALISATION PARTIELLE
                    │
                    ▼
ÉTAT FINAL
┌────────────────────────────────────────────┐
│ Marié + Séparation (infos conjoint effacées)│
│ ┌────────────────────────────────────────┐ │
│ │ maritalStatus: "married"               │ │
│ │ matrimonialRegime: "separation"        │ │
│ │ spouseInfo: undefined                  │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

## 🎨 Affichage conditionnel visuel

```
┌───────────────────────────────────────────────────────────────┐
│                       ASSOCIÉ #1                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Nom: [___________]      Prénom: [___________]                │
│                                                               │
│ Pourcentage: [___] %    Montant: [___________] FCFA         │
│                                                               │
│ Adresse: [_____________________________________________]      │
│                                                               │
│ Profession: [_______________________] (optionnel)            │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ 💍 SECTION MATRIMONIALE                                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Situation matrimoniale:                                      │
│ [ Sélectionner... ▼ ]  ◄─── TOUJOURS VISIBLE                │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ SI maritalStatus === "married" :                        │  │
│ │                                                         │  │
│ │ Régime matrimonial:                                     │  │
│ │ [ Sélectionner... ▼ ]  ◄─── VISIBLE SI MARIÉ           │  │
│ │                                                         │  │
│ │ ┌───────────────────────────────────────────────────┐  │  │
│ │ │ SI matrimonialRegime === "community" :            │  │  │
│ │ │                                                   │  │  │
│ │ │ ╔════════════════════════════════════════════╗    │  │  │
│ │ │ ║  👥 Informations du conjoint              ║    │  │  │
│ │ │ ║  (fond doré #D6A93A/5)                    ║    │  │  │
│ │ │ ╟────────────────────────────────────────────╢    │  │  │
│ │ │ ║                                           ║    │  │  │
│ │ │ ║  Prénom: [________]  Nom: [________]     ║    │  │  │
│ │ │ ║                                           ║    │  │  │
│ │ │ ║  Date de naissance: [____-__-__]         ║    │  │  │
│ │ │ ║                                           ║    │  │  │
│ │ │ ║  Profession: [____________________]      ║    │  │  │
│ │ │ ║                                           ║    │  │  │
│ │ │ ╚════════════════════════════════════════════╝    │  │  │
│ │ │                                                   │  │  │
│ │ │ ◄─── VISIBLE SI MARIÉ EN COMMUNAUTÉ              │  │  │
│ │ └───────────────────────────────────────────────────┘  │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Email: [_________________] (optionnel)                       │
│ Téléphone: [_________________] (optionnel)                   │
│                                                               │
│ ☐ Désigner comme gérant/président                            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 📊 Matrice de visibilité des champs

```
┌──────────────┬─────────────┬──────────────┬───────────────────┐
│  Situation   │   Régime    │   Champs     │  Champs conjoint  │
│ matrimoniale │ matrimonial │   visibles   │     visibles      │
├──────────────┼─────────────┼──────────────┼───────────────────┤
│              │             │              │                   │
│ Single       │   N/A       │      1       │         0         │
│              │             │              │                   │
├──────────────┼─────────────┼──────────────┼───────────────────┤
│              │             │              │                   │
│ Married      │ Separation  │      2       │         0         │
│              │             │              │                   │
├──────────────┼─────────────┼──────────────┼───────────────────┤
│              │             │              │                   │
│ Married      │ Community   │      2       │         4         │
│              │             │              │                   │
├──────────────┼─────────────┼──────────────┼───────────────────┤
│              │             │              │                   │
│ Divorced     │   N/A       │      1       │         0         │
│              │             │              │                   │
├──────────────┼─────────────┼──────────────┼───────────────────┤
│              │             │              │                   │
│ Widowed      │   N/A       │      1       │         0         │
│              │             │              │                   │
└──────────────┴─────────────┴──────────────┴───────────────────┘

Légende :
• Champs visibles = Dropdowns situation + régime
• Champs conjoint = Prénom + Nom + Naissance + Profession
```

---

## 🔍 Arbre de validation

```
VALIDATION ÉTAPE 2
        │
        ├── Informations de base complètes ?
        │   ├── Nom ✓
        │   ├── Prénom ✓
        │   ├── Pourcentage ✓
        │   ├── Montant ✓
        │   └── Adresse ✓
        │
        ├── Situation matrimoniale renseignée ?
        │   │
        │   ├── Non → WARNING (optionnel mais recommandé)
        │   │
        │   └── Oui
        │       │
        │       ├── Single/Divorced/Widowed → OK ✓
        │       │
        │       └── Married
        │           │
        │           ├── Régime matrimonial renseigné ?
        │           │   │
        │           │   ├── Non → ERROR (obligatoire)
        │           │   │
        │           │   └── Oui
        │           │       │
        │           │       ├── Separation → OK ✓
        │           │       │
        │           │       └── Community
        │           │           │
        │           │           └── Infos conjoint complètes ?
        │           │               │
        │           │               ├── Non → ERROR
        │           │               │   └── "Renseignez infos conjoint"
        │           │               │
        │           │               └── Oui
        │           │                   │
        │           │                   ├── Date naissance future ? → ERROR
        │           │                   │
        │           │                   ├── Conjoint mineur ? → WARNING
        │           │                   │
        │           │                   └── Tout OK → OK ✓
        │
        └── Total pourcentages = 100% ? → OK ✓
```

---

## 🎭 États des données

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉTAT "UNDEFINED"                         │
│  (Nouveau associé ou champs non renseignés)                │
├─────────────────────────────────────────────────────────────┤
│  maritalStatus: undefined                                   │
│  matrimonialRegime: undefined                               │
│  spouseInfo: undefined                                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Utilisateur sélectionne
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ÉTAT "PARTIEL"                            │
│  (Situation sélectionnée, suite en attente)                │
├─────────────────────────────────────────────────────────────┤
│  maritalStatus: "married"                                   │
│  matrimonialRegime: undefined                               │
│  spouseInfo: undefined                                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Utilisateur continue
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  ÉTAT "INTERMÉDIAIRE"                       │
│  (Régime sélectionné, infos conjoint en attente)           │
├─────────────────────────────────────────────────────────────┤
│  maritalStatus: "married"                                   │
│  matrimonialRegime: "community"                             │
│  spouseInfo: undefined                                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Utilisateur remplit
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    ÉTAT "COMPLET"                           │
│  (Toutes les informations renseignées)                     │
├─────────────────────────────────────────────────────────────┤
│  maritalStatus: "married"                                   │
│  matrimonialRegime: "community"                             │
│  spouseInfo: {                                              │
│    firstName: "Fatou",                                      │
│    lastName: "Diop",                                        │
│    birthDate: "1990-03-15",                                 │
│    profession: "Comptable"                                  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚦 Flux de navigation

```
ÉTAPE 1                ÉTAPE 2                  ÉTAPE 3
Infos entreprise   →   Capital + Associés   →   Documents
     │                      │                        │
     │                      ├─ Associé 1            │
     │                      │  └─ Situation ✓       │
     │                      │                        │
     │                      ├─ Associé 2            │
     │                      │  └─ Situation ✓       │
     │                      │                        │
     │                      └─ Associé N            │
     │                         └─ Situation ✓       │
     │                              │                │
     │                              │                │
     └──────────────────────────────┴────────────────┘
                                    │
                          VALIDATION GLOBALE
                                    │
                                    ▼
                         [CONTINUER] ou [CORRIGER]
```

---

## 📱 Responsive - Mobile vs Web

```
MOBILE (< 768px)                    WEB (≥ 768px)
┌──────────────────┐            ┌─────────────────────────┐
│                  │            │                         │
│ Situation        │            │ Situation     Régime    │
│ [Dropdown]       │            │ [Dropdown]    [Dropdown]│
│                  │            │                         │
│ Régime           │            │ ┌─────────────────────┐ │
│ [Dropdown]       │            │ │ Infos conjoint      │ │
│                  │            │ │                     │ │
│ ┌──────────────┐ │            │ │ Prénom   │   Nom   │ │
│ │Infos conjoint│ │            │ │ [_____]  │  [_____]│ │
│ │              │ │            │ │                     │ │
│ │Prénom [____] │ │            │ │ Date naissance      │ │
│ │Nom    [____] │ │            │ │ [__________]        │ │
│ │              │ │            │ │                     │ │
│ │Date [______] │ │            │ │ Profession          │ │
│ │              │ │            │ │ [_______________]   │ │
│ │Prof [______] │ │            │ └─────────────────────┘ │
│ └──────────────┘ │            │                         │
│                  │            └─────────────────────────┘
└──────────────────┘

Stack vertical             Grid 2 colonnes + spacieux
```

---

## 🎯 Points clés

### ✅ Simplicité
```
1 champ   →  Célibataire/Divorcé/Veuf
2 champs  →  Marié en séparation
6 champs  →  Marié en communauté (max)
```

### 🔄 Réactivité
```
Changement → Mise à jour instantanée → Réinitialisation auto
```

### 🎨 Design
```
Standard → Blanc
Conjoint → Doré (#D6A93A/5)
```

### ✨ UX
```
Progressif → Conditionnel → Intelligent
```

---

**Dernière mise à jour** : 10 Décembre 2025  
**Version** : Crésus V2 - Flowchart v1.0
