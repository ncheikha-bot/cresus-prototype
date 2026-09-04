# 🚀 Quick Start - Gestion des Dossiers de Création (Admin)

## ⚡ Démarrage Rapide (2 minutes)

### 1️⃣ Accéder aux Dossiers
```
Dashboard Admin → Menu "Dossiers" → Liste des dossiers de création
```

### 2️⃣ Ouvrir un Dossier
```
Cliquez sur n'importe quelle carte de dossier
→ Vue complète : Progression + Documents + Échanges
```

### 3️⃣ Ajouter un Document
```
Vue détails dossier → Bouton "Ajouter un document"
→ Choisir le type → Uploader le fichier → Confirmer
→ Client reçoit une notification
```

### 4️⃣ Faire Avancer le Dossier
```
Vue détails → Stepper progression
→ Bouton "Passer à l'étape suivante"
→ Dossier avance automatiquement
```

---

## 📋 Vue Liste - Actions Rapides

### Interface
```
┌─────────────────────────────────────────────────┐
│ [Recherche...] [Filtrer par statut ▼]         │
├─────────────────────────────────────────────────┤
│ □ Soumis: 3  □ Révision: 5  □ Prêts: 2  etc. │
├─────────────────────────────────────────────────┤
│ [📋] SARL Tech Innovation                       │
│ SARL • Commerce • 1M FCFA                       │
│ ▓▓▓▓▓▓░░░░ 60%                                  │
│ 📄 5 • ✓ 3 • ⏱ 1 • ⚠ 1                        │
│                                    [→]          │
└─────────────────────────────────────────────────┘
```

### Actions Disponibles
- 🔍 **Rechercher** : Tapez le nom ou la forme juridique
- 🎯 **Filtrer** : Sélectionnez un statut (Soumis, En révision, etc.)
- 👆 **Cliquer** : Sur n'importe quel dossier pour voir les détails

### Légende Stats
- `📄 X` = Total documents
- `✓ X` = Documents validés
- `⏱ X` = En attente validation client
- `⚠ X` = Documents à corriger

---

## 📂 Vue Détails - Gestion Complète

### 1. Stepper Progression (Haut de page)

```
◉───●───○───○───○
│   │   │   │   │
1   2   3   4   5
```

**5 Étapes**
1. **Soumis** - Dossier reçu du client
2. **En révision** - Vérification + Upload documents
3. **Documents prêts** - Validation client + Signatures
4. **Signé** - Finalisation
5. **Terminé** - Entreprise créée

**Action**
- Bouton "Passer à l'étape suivante" → Fait avancer le dossier

### 2. Stats Documents (5 Cartes)

```
┌─────┬─────┬─────┬─────┬─────┐
│ 📄5 │ ✓3  │ ⏱1  │ ⚠1  │ 🔐0 │
│Total│Valid│Atten│Corri│Signé│
└─────┴─────┴─────┴─────┴─────┘
```

### 3. Documents Manquants (Si applicable)

```
⚠ DOCUMENTS MANQUANTS (2)
┌─────────────────┬─────────────────┐
│ CNI du gérant   │ Casier judic.  │
│ Pièce identité  │ < 3 mois       │
└─────────────────┴─────────────────┘
```

### 4. Liste Documents (Principal)

#### Document Validé ✓
```
┌─────────────────────────────────────────────┐
│ [✓] Statuts de la société    [✓ Validé]   │
│     245 KB • 12 pages • v1                  │
│     [Historique] [Aperçu] [Télécharger]   │
└─────────────────────────────────────────────┘
```

#### Document À Corriger ⚠
```
┌─────────────────────────────────────────────┐
│ [⚠] CNI du gérant           [⚠ À corriger] │
│     128 KB • 2 pages • v2                   │
│     💬 "Document illisible, meilleure       │
│         qualité SVP" - Client le 03/11      │
│     [Historique] [Aperçu] [Télécharger]    │
│     [📤 Uploader nouvelle version]          │
└─────────────────────────────────────────────┘
```

#### Document En Validation ⏱
```
┌─────────────────────────────────────────────┐
│ [⏱] Justificatif    [⏱ Validation client]  │
│     198 KB • 1 page • v1                    │
│     [Historique] [Aperçu] [Télécharger]    │
└─────────────────────────────────────────────┘
```

---

## ⚙️ Actions Principales

### 📤 Ajouter un Document

**Étapes**
1. Cliquez sur "Ajouter un document" (haut de la section documents)
2. **Modal s'ouvre** avec liste des types de documents
3. **Sélectionnez le type** (CNI, Statuts, Casier, etc.)
   - Types grisés = déjà uploadés
   - Types actifs = encore à uploader
4. **Glissez ou cliquez** pour sélectionner le fichier
5. **Ajoutez un message** (optionnel) pour le client
6. Cliquez "Ajouter le document"

**Résultat**
- ✅ Document ajouté à la liste
- ✅ Status : "En validation client"
- ✅ Client reçoit notification
- ✅ Client peut valider ou refuser

### 🔄 Uploader une Nouvelle Version

**Quand ?**
- Document refusé par le client (badge rouge ⚠)
- Vous voulez corriger quelque chose

**Étapes**
1. Sur un document refusé, cliquez "Nouvelle version"
2. **Modal s'ouvre** avec info version actuelle
3. **Glissez le nouveau fichier**
4. **Ajoutez un commentaire** expliquant les corrections
5. Cliquez "Uploader"

**Résultat**
- ✅ Version incrémentée (v1 → v2)
- ✅ Ancien commentaire client conservé dans historique
- ✅ Status : "En validation client"
- ✅ Client reçoit notification "Document mis à jour"

### 📜 Consulter l'Historique

**Étapes**
1. Sur n'importe quel document, cliquez "Historique"
2. **Modal s'ouvre** avec 2 sections :
   - **Versions** : Toutes les versions uploadées
   - **Retours client** : Validations et refus

**Infos Affichées**
- Version X avec date/heure
- Commentaire admin (si ajouté)
- Bouton télécharger chaque version
- Statut validation client par version
- Commentaires client (si refus)

### 💬 Contacter le Client

**Étapes**
1. En haut à droite, cliquez "Contacter le client"
2. **Modal s'ouvre** avec textarea
3. Écrivez votre message (texte libre)
4. Cliquez "Envoyer"

**Résultat**
- ✅ Client reçoit notification "Message de Crésus"
- ✅ Message visible dans ses notifications
- ⚠️ Pas de chat en temps réel (notification seulement)

### ⏭️ Avancer le Processus

**Quand ?**
- Étape 1→2 : Infos vérifiées
- Étape 2→3 : Tous documents uploadés et validés
- Étape 3→4 : Tous documents signés
- Étape 4→5 : Dossier finalisé

**Étapes**
1. Vérifiez que l'étape actuelle est complète
2. Dans le stepper, cliquez "Passer à l'étape suivante"
3. Confirmez si demandé

**Résultat**
- ✅ Statut dossier mis à jour
- ✅ Stepper avance visuellement
- ✅ Client reçoit notification "Mise à jour dossier"

---

## 🎯 Workflows Complets

### Workflow 1 : Nouveau Dossier SARL

```
1. CLIENT SOUMET
   → Dossier apparaît en "Soumis"

2. ADMIN RÉVISE (Vous)
   ✓ Vérifiez nom, capital, activité, associés
   ✓ Cliquez "Passer à l'étape suivante"
   → Status: "En révision"

3. ADMIN UPLOAD DOCUMENTS (Vous)
   ✓ Ajoutez "CNI du gérant"
   ✓ Ajoutez "Statuts de la société"
   ✓ Ajoutez "Casier judiciaire"
   ✓ Ajoutez "Justificatif de domicile"
   ✓ Ajoutez "Attestation de dépôt"
   → Client reçoit 5 notifications

4. CLIENT VALIDE
   → CNI validé ✓
   → Statuts refusé ✗ "Erreur page 3"
   → Casier validé ✓
   → Justificatif validé ✓
   → Attestation validée ✓

5. ADMIN CORRIGE (Vous)
   ✓ Sur Statuts, cliquez "Nouvelle version"
   ✓ Uploadez version corrigée
   ✓ Commentaire: "Correction page 3"
   → Client reçoit notification

6. CLIENT REVALIDE
   → Statuts v2 validé ✓

7. ADMIN AVANCE (Vous)
   ✓ Tous documents validés (5/5)
   ✓ Cliquez "Passer à l'étape suivante"
   → Status: "Documents prêts"

8. CLIENT SIGNE
   → Signe électroniquement tous les documents
   → Notifications admin

9. ADMIN FINALISE (Vous)
   ✓ Vérifiez signatures
   ✓ Cliquez "Passer à l'étape suivante"
   → Status: "Signé"
   ✓ Préparez livrables
   ✓ Cliquez "Passer à l'étape suivante"
   → Status: "Terminé"

10. FIN
    ✅ Entreprise créée
    ✅ Dossier archivé
```

### Workflow 2 : Correction Rapide

```
SITUATION
Document refusé par client avec commentaire

ÉTAPES
1. Vue liste → Document badge rouge ⚠
2. Lisez commentaire client (encadré rouge)
3. Cliquez "Nouvelle version"
4. Uploadez fichier corrigé
5. Ajoutez commentaire: "Correction effectuée"
6. Cliquez "Uploader"

RÉSULTAT
✅ v2 envoyée au client
✅ Client reçoit notification
⏱ En attente validation
```

### Workflow 3 : Message d'Urgence

```
SITUATION
Besoin d'info urgente du client

ÉTAPES
1. Ouvrez le dossier
2. Cliquez "Contacter le client"
3. Écrivez: "Urgent: merci de rappeler..."
4. Cliquez "Envoyer"

RÉSULTAT
✅ Client reçoit notification immédiate
✅ Message visible dans ses notifs
```

---

## 🎨 Codes Couleur

### Badges Statuts Dossier
- 🟡 **Jaune** = Soumis (nouveau)
- 🟠 **Orange** = En révision
- 🟣 **Violet** = Documents prêts
- 🔵 **Bleu** = Signé
- 🟢 **Vert** = Terminé

### Badges Statuts Document
- ⚪ **Gris** = En attente upload
- 🟣 **Violet** = Validation client
- 🟢 **Vert** = Validé
- 🔴 **Rouge** = À corriger
- 🔵 **Bleu** = Signé

### Icônes
- `📄` Total documents
- `✓` Validé
- `⏱` En attente
- `⚠` À corriger
- `🔐` Signé
- `💬` Commentaire client

---

## ❓ FAQ Admin

### Q: Comment savoir quels documents uploader ?
**R:** 
- Documents manquants = Alerte orange en haut
- Types disponibles = Modal "Ajouter document"
- Dépend de la forme juridique (SARL, SA, etc.)

### Q: Le client n'a pas validé, que faire ?
**R:**
- Attendez 24-48h
- Cliquez "Contacter le client" pour relancer
- Vérifiez que la notification est bien envoyée

### Q: Comment annuler un upload ?
**R:**
- ⚠️ Impossible d'annuler
- Solution : Uploadez nouvelle version corrigée
- L'historique garde toutes les versions

### Q: Peut-on supprimer un document ?
**R:**
- ❌ Non, pas de suppression
- Toutes les versions sont conservées (traçabilité)
- Si erreur : Uploadez version corrigée

### Q: Le client a refusé 3 fois, que faire ?
**R:**
- Lisez attentivement ses commentaires
- Contactez-le pour clarification
- Si besoin, appelez le client directement

### Q: Combien de versions maximum ?
**R:**
- ∞ Illimité
- Toutes conservées dans l'historique
- Seule la dernière est "active"

### Q: Document validé mais erreur détectée ?
**R:**
- Uploadez nouvelle version
- Status repasse en "Validation client"
- Client doit revalider

### Q: Comment voir les anciennes versions ?
**R:**
- Cliquez "Historique" sur le document
- Modal avec toutes les versions
- Bouton télécharger sur chacune

---

## ⚡ Raccourcis Clavier (À venir)

```
Ctrl + K      → Recherche rapide
Ctrl + F      → Filtre statuts
Ctrl + N      → Nouveau message client
Ctrl + U      → Upload document
Esc           → Fermer modal
Enter         → Confirmer action
```

---

## 📞 Support

### Problème Technique
1. Vérifiez la console navigateur (F12)
2. Rafraîchissez la page (Ctrl+R)
3. Vérifiez votre connexion
4. Contactez le support technique

### Question Processus
1. Consultez `ADMIN_UNIFIED_PROCESS_GUIDE.md`
2. Vérifiez `DOCUMENTS_PAR_SOCIETE.md`
3. Contactez le responsable métier

### Bug ou Amélioration
1. Notez les étapes pour reproduire
2. Screenshot si possible
3. Remontez au développeur

---

## 🎓 Best Practices

### ✅ À FAIRE
- Vérifier qualité des scans avant upload
- Ajouter commentaires explicites sur nouvelles versions
- Répondre rapidement aux retours clients
- Uploader tous les docs requis avant d'avancer
- Vérifier cohérence des informations

### ❌ À ÉVITER
- Uploader sans vérifier le contenu
- Avancer sans tous les documents validés
- Ignorer les commentaires clients
- Forcer passage étape suivante
- Uploader mauvaise qualité

---

## 📊 Checklist par Étape

### Étape 1 : Soumis
- [ ] Vérifier nom entreprise
- [ ] Vérifier forme juridique
- [ ] Vérifier capital déclaré
- [ ] Vérifier activité
- [ ] Vérifier informations associés
- [ ] Passer à "En révision"

### Étape 2 : En Révision
- [ ] Upload CNI (selon forme)
- [ ] Upload Casier judiciaire
- [ ] Upload Justificatif domicile
- [ ] Upload Statuts
- [ ] Upload Attestation dépôt (si capital)
- [ ] Upload PV AG (si SA)
- [ ] Attendre validation client (tous docs)
- [ ] Gérer retours/corrections
- [ ] Passer à "Documents prêts"

### Étape 3 : Documents Prêts
- [ ] Tous documents validés par client
- [ ] Attendre signatures électroniques
- [ ] Vérifier signatures reçues
- [ ] Passer à "Signé"

### Étape 4 : Signé
- [ ] Vérifier toutes signatures valides
- [ ] Préparer livrables finaux
- [ ] Uploader certificats officiels
- [ ] Passer à "Terminé"

### Étape 5 : Terminé
- [x] Dossier archivé
- [x] Client a tous les livrables
- [x] Entreprise créée

---

**Version** : 2.0  
**Dernière mise à jour** : Novembre 2025  
**Pour** : Administrateurs Crésus  
**Durée lecture** : 5 minutes  
**Difficulté** : ⭐ Facile
