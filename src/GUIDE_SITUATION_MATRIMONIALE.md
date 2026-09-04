# Guide d'utilisation - Situation Matrimoniale des Associés

## 📍 Où trouver cette fonctionnalité ?

**Parcours** : Création d'entreprise  
**Étape** : 2 - Répartition du capital  
**Section** : Formulaire de chaque associé  
**Position** : Après le champ "Profession"

---

## 🎯 Cas d'usage

### Cas 1 : Associé Célibataire
```
┌─────────────────────────────────────┐
│ Situation matrimoniale              │
│ ┌───────────────────────────────┐   │
│ │ Célibataire             ▼    │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘

✓ C'est tout ! Aucun autre champ ne s'affiche.
```

### Cas 2 : Associé Marié - Séparation de biens
```
┌─────────────────────────────────────┐
│ Situation matrimoniale              │
│ ┌───────────────────────────────┐   │
│ │ Marié(e)                ▼    │   │
│ └───────────────────────────────┘   │
│                                     │
│ Régime matrimonial                  │
│ ┌───────────────────────────────┐   │
│ │ Séparation de biens     ▼    │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘

✓ Deux champs uniquement
✓ Pas besoin des infos du conjoint
```

### Cas 3 : Associé Marié - Communauté de biens ⭐
```
┌─────────────────────────────────────┐
│ Situation matrimoniale              │
│ ┌───────────────────────────────┐   │
│ │ Marié(e)                ▼    │   │
│ └───────────────────────────────┘   │
│                                     │
│ Régime matrimonial                  │
│ ┌───────────────────────────────┐   │
│ │ Communauté de biens     ▼    │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👥 Informations du conjoint     │ │
│ │                                 │ │
│ │ Prénom        │ Nom             │ │
│ │ ┌──────────┐  │ ┌──────────┐   │ │
│ │ │ Fatou    │  │ │ Diop     │   │ │
│ │ └──────────┘  │ └──────────┘   │ │
│ │                                 │ │
│ │ Date de naissance               │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 15/03/1990                  │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ Profession                      │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Comptable                   │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

✓ Section complète pour le conjoint
✓ Fond doré pour identifier la section
✓ Tous les champs sont requis
```

### Cas 4 : Associé Divorcé ou Veuf
```
┌─────────────────────────────────────┐
│ Situation matrimoniale              │
│ ┌───────────────────────────────┐   │
│ │ Divorcé(e)              ▼    │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘

✓ Un seul champ
✓ Traitement identique à célibataire
```

---

## 🔄 Logique de réinitialisation

### Scénario : Changement de situation
```
État 1 : Marié + Communauté + Infos conjoint remplies
   ↓
Changement : Sélection de "Célibataire"
   ↓
Résultat : Tous les champs matrimoniaux sont automatiquement effacés
```

### Scénario : Changement de régime
```
État 1 : Marié + Communauté + Infos conjoint remplies
   ↓
Changement : Sélection de "Séparation de biens"
   ↓
Résultat : Les infos du conjoint sont automatiquement effacées
          (le régime matrimonial est conservé)
```

---

## 💡 Conseils d'utilisation

### Pour les célibataires
- Sélectionnez simplement "Célibataire"
- Passez au champ suivant

### Pour les mariés en séparation de biens
- Sélectionnez "Marié(e)"
- Puis "Séparation de biens"
- C'est terminé pour cette section

### Pour les mariés en communauté de biens
- Sélectionnez "Marié(e)"
- Puis "Communauté de biens"
- Remplissez TOUS les champs du conjoint (ils sont tous requis)
- Préparez ces informations à l'avance :
  * Prénom complet
  * Nom complet
  * Date de naissance exacte
  * Profession actuelle

### Pour les veufs ou divorcés
- Sélectionnez votre situation actuelle
- Aucune information supplémentaire n'est demandée

---

## ❓ Questions fréquentes

### Pourquoi demander la situation matrimoniale ?
Au Sénégal, le régime matrimonial a des implications juridiques importantes pour les sociétés. Ces informations sont nécessaires pour :
- La rédaction des statuts
- Les actes notariés
- Le registre du commerce
- L'ouverture du compte bancaire professionnel

### Que se passe-t-il si je me trompe de régime ?
Vous pouvez changer à tout moment avant de valider l'étape. Les champs se mettent à jour automatiquement.

### Dois-je fournir des documents du conjoint ?
Non, à cette étape seules les informations sont demandées. Les documents peuvent être demandés ultérieurement si nécessaire.

### Que faire si je ne connais pas la date de naissance exacte de mon conjoint ?
Il est important de fournir la date exacte car elle sera utilisée dans les documents officiels. Vérifiez les documents d'identité de votre conjoint.

### Et si je suis en concubinage ?
Sélectionnez "Célibataire". Le concubinage n'a pas d'implications juridiques pour la création de société.

### Peut-on avoir plusieurs associés avec des situations différentes ?
Oui, absolument ! Chaque associé renseigne sa propre situation matrimoniale. Il peut y avoir :
- Un associé célibataire
- Un associé marié en communauté
- Un autre marié en séparation
- Un dernier divorcé

Tous dans la même société !

---

## ✅ Validation des données

### Avant de passer à l'étape suivante

**Pour tous** :
- [ ] J'ai sélectionné ma situation matrimoniale

**Si marié** :
- [ ] J'ai sélectionné mon régime matrimonial

**Si marié en communauté de biens** :
- [ ] J'ai renseigné le prénom de mon conjoint
- [ ] J'ai renseigné le nom de mon conjoint
- [ ] J'ai renseigné la date de naissance de mon conjoint
- [ ] J'ai renseigné la profession de mon conjoint

---

## 🎨 Repères visuels

### Comment identifier la section ?
- **Position** : Juste après le champ "Profession"
- **Couleur** : Fond blanc comme les autres champs
- **Section conjoint** : Fond doré clair avec icône 👥

### Les champs sont-ils obligatoires ?
- **Situation matrimoniale** : Recommandé (pour un dossier complet)
- **Régime matrimonial** : Obligatoire si marié
- **Infos conjoint** : Obligatoires si marié en communauté de biens

---

## 📱 Différences Mobile vs Web

### Version Mobile
- Tous les champs en pleine largeur
- Seuls prénom/nom du conjoint en grille 2 colonnes
- Optimisé pour la saisie tactile

### Version Web  
- Layout plus spacieux
- Prénom/nom du conjoint en grille 2 colonnes responsive
- Meilleure visibilité d'ensemble

---

## 🔐 Confidentialité

### Les données du conjoint sont-elles sécurisées ?
Oui, toutes les données sont :
- Stockées de manière sécurisée
- Utilisées uniquement pour les besoins légaux de création d'entreprise
- Non partagées avec des tiers (sauf autorités compétentes)
- Accessibles uniquement par vous et les administrateurs Crésus

---

## 🆘 Besoin d'aide ?

### Je ne comprends pas la différence entre les régimes
**Communauté de biens** :
- Tout ce qui est acquis pendant le mariage appartient aux deux époux
- Inclut potentiellement les parts de société

**Séparation de biens** :
- Chaque époux garde la propriété de ce qu'il acquiert
- Les parts de société n'appartiennent qu'à l'associé

💡 **Conseil** : En cas de doute, consultez votre contrat de mariage ou un avocat.

### Je veux corriger les informations plus tard
Les informations peuvent être modifiées tant que vous n'avez pas validé l'ensemble du parcours de création. Après validation, contactez l'administrateur Crésus.

---

## 📞 Support

En cas de difficulté :
1. Consultez le bouton "?" à côté de "Situation matrimoniale"
2. Contactez le support Crésus via le chat
3. Appelez le numéro d'assistance (affiché dans l'app)

---

**Dernière mise à jour** : 10 Décembre 2025  
**Version** : Crésus V2
