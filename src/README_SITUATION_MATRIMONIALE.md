# 💍 Gestion de la Situation Matrimoniale - Crésus V2

## 📌 Vue d'ensemble

Cette fonctionnalité permet de collecter la situation matrimoniale des associés lors de la création d'une entreprise, avec une gestion intelligente du régime matrimonial et des informations du conjoint pour les mariés en communauté de biens.

## 🎯 Objectif

Conformité avec les exigences juridiques sénégalaises pour la création d'entreprise, notamment pour :
- La rédaction des statuts
- Les actes notariés  
- Le registre du commerce
- L'ouverture de compte bancaire professionnel

## 📍 Localisation

- **Module** : Création d'entreprise
- **Étape** : 2 - Répartition du capital
- **Position** : Après le champ "Profession" de chaque associé

## ✨ Fonctionnalités

### 1. Situation matrimoniale (tous les associés)
Options disponibles :
- ✅ Célibataire
- ✅ Marié(e)
- ✅ Veuf/Veuve
- ✅ Divorcé(e)

### 2. Régime matrimonial (si marié)
Options disponibles :
- ✅ Communauté de biens
- ✅ Séparation de biens

### 3. Informations du conjoint (si marié en communauté)
Champs collectés :
- Prénom
- Nom
- Date de naissance
- Profession

## 🎨 Interface utilisateur

### Affichage conditionnel intelligent
```
Célibataire/Divorcé/Veuf
  └─> 1 champ seulement

Marié + Séparation de biens
  └─> 2 champs

Marié + Communauté de biens
  └─> 2 champs + section conjoint (4 champs supplémentaires)
```

### Design
- **Couleurs** : Palette Crésus (#1A2753, #D6A93A, #273A7A)
- **Section conjoint** : Fond doré (#D6A93A/5) avec icône Users
- **Transitions** : Fluides (300ms)
- **Responsive** : Optimisé mobile et web

## 🔄 Logique de réinitialisation

### Automatique et intelligente
- Changement de "Marié" → Autre : Efface régime + infos conjoint
- Changement de "Communauté" → "Séparation" : Efface infos conjoint uniquement

## 📁 Fichiers modifiés

```
/types/index.ts                          (Interface Associate)
/components/mobile/CreateCompany.tsx     (Version mobile)
/components/web/WebCreateCompany.tsx     (Version web)
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CHANGELOG_SITUATION_MATRIMONIALE.md](./CHANGELOG_SITUATION_MATRIMONIALE.md) | Historique détaillé des modifications |
| [GUIDE_SITUATION_MATRIMONIALE.md](./GUIDE_SITUATION_MATRIMONIALE.md) | Guide d'utilisation complet |
| [TEST_SITUATION_MATRIMONIALE.md](./TEST_SITUATION_MATRIMONIALE.md) | Exemples de test et validation |
| README_SITUATION_MATRIMONIALE.md | Ce fichier |

## 🚀 Démarrage rapide

### Pour les développeurs

1. **Structure de données**
```typescript
interface Associate {
  // ... champs existants
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced';
  matrimonialRegime?: 'community' | 'separation';
  spouseInfo?: {
    firstName: string;
    lastName: string;
    birthDate: string;
    profession: string;
  };
}
```

2. **Utilisation**
```typescript
// Initialisation
const newAssociate = {
  // ... autres champs
  maritalStatus: undefined,
  matrimonialRegime: undefined,
  spouseInfo: undefined
};

// Mise à jour
updateAssociate(id, 'maritalStatus', 'married');
updateAssociate(id, 'matrimonialRegime', 'community');
updateAssociate(id, 'spouseInfo', {
  firstName: 'Fatou',
  lastName: 'Diop',
  birthDate: '1990-03-15',
  profession: 'Comptable'
});
```

### Pour les testeurs

1. **Test basique** : Créer un associé célibataire
2. **Test intermédiaire** : Créer un associé marié en séparation
3. **Test complet** : Créer un associé marié en communauté avec infos conjoint
4. **Test réinitialisation** : Changer de situation et vérifier l'effacement des champs

Voir [TEST_SITUATION_MATRIMONIALE.md](./TEST_SITUATION_MATRIMONIALE.md) pour plus de détails.

### Pour les utilisateurs

Consultez le [GUIDE_SITUATION_MATRIMONIALE.md](./GUIDE_SITUATION_MATRIMONIALE.md) pour :
- Instructions pas à pas
- Cas d'usage avec illustrations
- FAQ
- Conseils d'utilisation

## ✅ Checklist de validation

### Avant mise en production

**Fonctionnel** :
- [ ] Affichage conditionnel fonctionne pour tous les cas
- [ ] Réinitialisation automatique fonctionne
- [ ] Multi-associés avec situations différentes
- [ ] Sauvegarde dans les brouillons
- [ ] Récupération depuis les brouillons

**Validation** :
- [ ] Messages d'erreur pour champs obligatoires
- [ ] Validation date de naissance (majeur, pas futur)
- [ ] Validation cohérence des données

**Design** :
- [ ] Responsive mobile
- [ ] Responsive tablette
- [ ] Responsive desktop
- [ ] Transitions fluides
- [ ] Section conjoint bien visible

**Performance** :
- [ ] Pas de ralentissement avec 50 associés
- [ ] Mise à jour instantanée des champs
- [ ] Pas de perte de données

## 🐛 Problèmes connus

Aucun problème connu à ce jour.

## 🔮 Améliorations futures

### Court terme
- [ ] Ajout d'une infobulle explicative sur les régimes matrimoniaux
- [ ] Validation en temps réel des champs obligatoires
- [ ] Message de confirmation lors de changements majeurs

### Moyen terme
- [ ] Import des données du conjoint depuis une pièce d'identité (OCR)
- [ ] Vérification automatique de la cohérence des dates
- [ ] Export des données matrimoniales pour les documents officiels

### Long terme
- [ ] Base de données des régimes matrimoniaux par pays (pour l'international)
- [ ] Intégration avec les services d'état civil
- [ ] Signature électronique du conjoint si nécessaire

## 📊 Impact

### Utilisateurs
- ✅ Collecte complète des informations dès le début
- ✅ Pas de retour en arrière pour compléter
- ✅ Processus plus fluide

### Administrateurs
- ✅ Toutes les infos nécessaires disponibles
- ✅ Moins de demandes de complément d'information
- ✅ Génération automatique des documents possible

### Conformité
- ✅ Respect des exigences juridiques sénégalaises
- ✅ Dossiers complets pour les autorités
- ✅ Réduction des risques de rejet

## 🤝 Contribution

### Vous avez trouvé un bug ?
1. Vérifiez qu'il n'est pas déjà signalé
2. Créez une issue avec :
   - Description du problème
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Captures d'écran si possible

### Vous avez une suggestion ?
1. Consultez les améliorations futures ci-dessus
2. Créez une issue avec le tag "enhancement"
3. Expliquez le cas d'usage et les bénéfices attendus

## 📞 Support

### Pour les utilisateurs
- 📱 Chat dans l'application
- 📧 Email : support@cresus.sn
- 📞 Téléphone : +221 XX XXX XX XX

### Pour les développeurs
- 📚 Consultez la documentation complète
- 💬 Slack : #dev-cresus-v2
- 🔧 GitHub : Issues et Pull Requests

## 📝 Licence

© 2025 Crésus - Tous droits réservés

---

## 🎉 Remerciements

Merci à toute l'équipe Crésus pour cette fonctionnalité qui améliore significativement l'expérience utilisateur et la conformité juridique de notre plateforme !

---

**Version** : 1.0.0  
**Date de release** : 10 Décembre 2025  
**Auteur** : Équipe Crésus V2  
**Statut** : ✅ En production

---

## 🔗 Liens rapides

- [Changelog détaillé](./CHANGELOG_SITUATION_MATRIMONIALE.md)
- [Guide d'utilisation](./GUIDE_SITUATION_MATRIMONIALE.md)
- [Exemples de test](./TEST_SITUATION_MATRIMONIALE.md)
- [Documentation principale](./START_HERE.md)
- [État d'implémentation](./IMPLEMENTATION_STATUS.md)

---

**Bonne utilisation ! 🚀**
