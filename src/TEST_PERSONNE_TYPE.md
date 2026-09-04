# Test de la fonctionnalité Type d'Associé (Personne Physique / Morale)

## 📍 Où trouver la fonctionnalité

La sélection du type d'associé se trouve à **l'ÉTAPE 3 - Documents** du processus de création d'entreprise.

## 🎯 Comment accéder

### Version Mobile
1. Ouvrez l'application en mode mobile
2. Authentifiez-vous
3. Cliquez sur "Créer mon entreprise" ou reprenez un brouillon
4. Complétez les étapes 1 et 2:
   - **Étape 1**: Remplissez les informations de l'entreprise (nom, forme juridique, activité, capital, adresse)
   - **Étape 2**: Définissez la répartition du capital entre les associés (doit totaliser 100%)
5. Passez à l'**Étape 3 - Documents**
6. Vous verrez alors la section "Type d'associé" en haut de la page

### Version Web
1. Ouvrez l'application en mode web
2. Cliquez sur "Créer mon entreprise" ou reprenez un brouillon
3. Complétez les étapes 1 et 2 (mêmes requis que mobile)
4. Passez à l'**Étape 3 - Documents**
5. La section "Type d'associé" apparaît en premier

## 🎨 Interface de sélection

Vous verrez deux boutons :

### 1️⃣ Personne Physique 👤
- Icône: Utilisateurs
- Description: "Entrepreneur individuel ou associé en nom propre"
- Documents requis:
  - CNI du gérant/président
  - Casier judiciaire (bulletin n°3, moins de 3 mois)
  - Justificatif de domicile (facture eau/électricité ou bail, moins de 3 mois)
  - + Documents spécifiques selon la forme juridique (SA, SARL, etc.)

### 2️⃣ Personne Morale 🏢
- Icône: Building
- Description: "Société ou entreprise existante"
- Documents requis:
  - CNI du dirigeant de la personne morale
  - Statuts de la personne morale (PDF)
  - Registre du Commerce (RC)
  - NINEA (Numéro d'Identification National des Entreprises et Associations)

## 🔒 Validations

- ⚠️ **Vous devez sélectionner un type** avant de pouvoir passer à l'étape suivante
- ⚠️ Si vous essayez de passer à l'étape 4 sans sélectionner, vous recevrez une notification: "Veuillez sélectionner si vous êtes une Personne Physique ou Morale"
- 🔄 Changer de type réinitialisera tous les documents uploadés

## 💾 Sauvegarde

Le type d'associé sélectionné est **automatiquement sauvegardé** dans les brouillons :
- Vous pouvez "Enregistrer et quitter" à tout moment
- Le type sélectionné sera restauré quand vous reprendrez le brouillon

## 🐛 Dépannage

### "Je ne vois pas la sélection du type d'associé"

**Vérifiez que vous êtes bien à l'étape 3** :
- Regardez la barre de progression en haut de l'écran
- Elle doit indiquer "Étape 3/5" ou "Documents"
- Si vous êtes aux étapes 1 ou 2, complétez-les d'abord

**Pour les brouillons anciens** :
- Les brouillons sauvegardés avant l'implémentation de cette fonctionnalité n'ont pas de `associateType` sauvegardé
- Solution: Supprimez l'ancien brouillon et créez une nouvelle entreprise

### "Je vois la sélection mais elle ne fonctionne pas"

1. Essayez de rafraîchir la page
2. Vérifiez la console du navigateur pour les erreurs
3. Créez une nouvelle entreprise (ne reprenez pas un brouillon)

## 📝 Code concerné

### Fichiers modifiés :
- `/components/mobile/CreateCompany.tsx` (lignes 284, 575-585, 1265-1410)
- `/components/web/WebCreateCompany.tsx` (lignes 292, 583-593, 1459-1580)

### État React :
```typescript
const [associateType, setAssociateType] = useState<'physique' | 'morale' | null>(null);
```

### Fonction de documents dynamique :
```typescript
const getRequiredDocuments = (): DocumentToUpload[] => {
  if (!associateType) return [];
  
  if (associateType === 'physique') {
    // Documents pour personne physique
  }
  
  if (associateType === 'morale') {
    // Documents pour personne morale
  }
}
```

## ✅ Test complet

1. **Créer une nouvelle entreprise**
2. **Remplir étape 1** : 
   - Nom: "Test SARL"
   - Forme: SARL
   - Activité: "Commerce"
   - Capital: 1000000 FCFA
   - Adresse: "Dakar, Sénégal"
3. **Remplir étape 2** :
   - Associé 1: 50% = 500000 FCFA
   - Associé 2: 50% = 500000 FCFA
4. **Arriver à l'étape 3**
5. **Vérifier la présence** de la section "Type d'associé"
6. **Cliquer sur "Personne Physique"** → Voir les documents requis changer
7. **Cliquer sur "Personne Morale"** → Voir les documents requis changer à nouveau
8. **Essayer de passer à l'étape 4** sans uploader de documents → Recevoir une erreur
9. **Enregistrer et quitter** → Reprendre le brouillon → Vérifier que le type est restauré

---

Si après avoir suivi ces étapes vous ne voyez toujours pas la fonctionnalité, merci de préciser :
- À quelle étape vous êtes (1, 2, 3, 4 ou 5)
- Si vous utilisez un brouillon ou une nouvelle création
- Si vous êtes en mode mobile ou web
- Une capture d'écran si possible
