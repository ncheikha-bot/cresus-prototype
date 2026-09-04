# Guide Rapide Admin - Crésus V2

## 🎯 Accès Rapide

### Navigation
```
Menu latéral → "Dossiers & Documents"
```

---

## 📋 Actions Courantes

### 1️⃣ Voir un Dossier

```
1. Aller dans "Dossiers & Documents"
2. Cliquer sur une ligne du tableau
   OU
   Cliquer sur "Gérer" à droite
```

### 2️⃣ Faire Avancer un Dossier

```
1. Ouvrir le dossier
2. Vérifier le stepper (progression en haut)
3. Cliquer "Passer à l'étape suivante : [Nom]"
   → Client notifié automatiquement
```

### 3️⃣ Ajouter un Document

```
1. Ouvrir le dossier
2. Section "Documents du dossier"
3. Cliquer "+ Ajouter un document"
4. Upload PDF + note optionnelle
5. Valider
   → Client notifié automatiquement
```

### 4️⃣ Corriger un Document Rejeté

```
Documents rejetés = fond ROUGE avec badge "À corriger"

1. Lire le commentaire du client (affiché en rouge)
2. Cliquer "Uploader correction"
3. Upload nouvelle version + note sur les corrections
4. Valider
   → Nouvelle version créée (v2, v3...)
   → Client notifié automatiquement
```

### 5️⃣ Voir l'Historique d'un Document

```
1. Cliquer "Historique" sur n'importe quel document
2. Modal affiche :
   - GAUCHE : Toutes les versions uploadées
   - DROITE : Tous les retours du client (validations/rejets)
```

### 6️⃣ Contacter un Client

```
1. Ouvrir le dossier
2. En haut à droite : "Contacter le client"
3. Écrire message
4. Envoyer
   → Client reçoit dans ses notifications
```

---

## 🎨 Comprendre les Couleurs

### Statuts des Dossiers

| Couleur | Signification |
|---------|---------------|
| 🟡 Jaune | Soumis (nouveau) |
| 🟠 Orange | En révision (en cours de traitement) |
| 🟣 Violet | Documents prêts (en validation client) |
| 🔵 Bleu | Signé (documents signés) |
| 🟢 Vert | Terminé (dossier finalisé) ✓ |

### Statuts des Documents

| Couleur | Signification | Action |
|---------|---------------|--------|
| 🟡 Ambré | En attente | Attendre |
| 🟣 Violet | En validation client | Attendre retour |
| 🟢 Vert | Validé ✓ | RAS |
| 🔴 Rouge | **À corriger** | **URGENT : Uploader correction** |
| 🔵 Bleu | Signé | RAS |

---

## 🔍 Filtres et Recherche

### Rechercher un Dossier
```
Barre de recherche en haut
→ Tape le nom de la société ou la forme juridique
```

### Filtrer par Statut
```
Menu déroulant "Tous les statuts"
→ Sélectionne un statut pour filtrer
```

### Voir Uniquement les Urgences
```
Filtre "Tous les statuts" → "En révision"
+
Regarde la colonne "Documents" → Nombres en rouge = à corriger
```

---

## ⚡ Raccourcis

### Dans la Liste

| Action | Raccourci |
|--------|-----------|
| Ouvrir un dossier | Cliquer n'importe où sur la ligne |
| Rechercher | Cliquer dans la barre de recherche |

### Dans les Détails

| Action | Localisation |
|--------|--------------|
| Retour à la liste | Flèche ← en haut à gauche |
| Contacter client | Bouton or en haut à droite |
| Avancer processus | Bouton bleu sous le stepper |

---

## 📊 Comprendre les Stats

### Vue Liste

```
Documents : 3/5
         ↑  ↑
         │  └─ Total documents
         └──── Validés par le client

2 à corriger
└─ Documents rejetés par le client (URGENT)
```

### Vue Détails - En-tête

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total docs  │  Validés    │ En validation│ À corriger  │
│     5       │     3       │      1       │     1       │
│   (gris)    │  (vert)     │  (violet)    │  (rouge)    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🚨 Gestion des Urgences

### Priorité 1 : Documents à Corriger

```
1. Filtre : "Tous les statuts" → "En révision"
2. Regarde colonne "Documents"
3. Lignes avec badge rouge "X à corriger" = URGENT
4. Clique sur le dossier
5. Documents en rouge = traiter en priorité
```

### Priorité 2 : Dossiers Bloqués

```
Si un dossier est en "Documents prêts" depuis longtemps :
→ Client n'a pas validé
→ "Contacter le client" pour relancer
```

---

## ✅ Checklist Quotidienne

```
☐ 1. Ouvrir "Dossiers & Documents"
☐ 2. Vérifier badge rouge "X à corriger" sur les dossiers
☐ 3. Traiter tous les documents rejetés
☐ 4. Vérifier les dossiers en "En validation" > 48h
☐ 5. Relancer les clients si besoin
☐ 6. Faire avancer les dossiers dont tous les docs sont validés
```

---

## 🎓 Cas Pratiques

### Cas 1 : Nouveau Dossier

```
Status : "Soumis" (jaune)

Actions :
1. Ouvrir le dossier
2. Vérifier les informations
3. Cliquer "Passer à l'étape suivante : En révision"
4. Préparer les documents requis
5. Uploader chaque document avec "+ Ajouter un document"
6. Cliquer "Passer à l'étape suivante : Documents prêts"
   → Client reçoit notification pour valider
```

### Cas 2 : Document Rejeté

```
Status document : "À corriger" (rouge)
Commentaire client : "La date est incorrecte page 2"

Actions :
1. Cliquer "Uploader correction"
2. Corriger le document (externe)
3. Upload nouvelle version
4. Ajouter note : "Correction date page 2"
5. Valider
   → Version 2 créée
   → Client notifié pour revalider
```

### Cas 3 : Tous Documents Validés

```
Stats : 5/5 validés (tout vert)

Actions :
1. Vérifier que tous les docs sont bien validés
2. Cliquer "Passer à l'étape suivante : Signé"
3. Client peut maintenant signer électroniquement
4. Une fois signé, passer à "Terminé"
   → Dossier finalisé ✓
```

---

## 💡 Astuces Pro

### Astuce 1 : Versions
```
Toujours ajouter une note lors de l'upload d'une nouvelle version
→ Facilite le suivi et la compréhension
```

### Astuce 2 : Communication
```
Avant de relancer un client :
1. Consulter l'historique du document
2. Vérifier s'il a déjà été notifié récemment
3. Personnaliser le message si besoin
```

### Astuce 3 : Organisation
```
Traiter les dossiers dans cet ordre :
1. Documents à corriger (rouge) = URGENT
2. Dossiers en révision
3. Dossiers en validation > 48h
4. Nouveaux dossiers
```

### Astuce 4 : Suivi
```
Utiliser la date de "Dernière mise à jour" pour identifier :
- Dossiers bloqués (date ancienne)
- Dossiers actifs (date récente)
```

---

## ❓ FAQ

**Q : Comment savoir si le client a vu ma notification ?**
R : Actuellement, les notifications sont marquées "non lues" par défaut. Le client les verra dans son centre de notifications.

**Q : Puis-je annuler une action ?**
R : Non, chaque action (upload, avancement statut) est définitive. Mais tu peux toujours uploader une nouvelle version d'un document.

**Q : Combien de versions peut avoir un document ?**
R : Illimité. Chaque upload crée une nouvelle version (v1, v2, v3...).

**Q : Le client peut-il uploader des documents ?**
R : Non, seul l'admin peut uploader. Le client peut seulement valider ou rejeter avec commentaire.

**Q : Que se passe-t-il si je supprime un document ?**
R : Fonctionnalité non implémentée. Pour l'instant, les documents ne peuvent pas être supprimés.

---

## 🆘 Problèmes Courants

### Problème : Document bloqué en "En validation" depuis longtemps

**Solution :**
```
1. "Contacter le client"
2. Message : "Votre dossier [Nom] attend votre validation. 
   Merci de consulter vos documents."
3. Si toujours pas de retour → Appel téléphonique
```

### Problème : Client rejette plusieurs fois le même document

**Solution :**
```
1. Consulter l'historique complet
2. Voir tous les commentaires de rejet
3. "Contacter le client" pour clarifier le problème
4. Uploader version définitive après échange
```

### Problème : Je ne trouve pas un dossier

**Solution :**
```
1. Vérifier le filtre de statut (mettre sur "Tous")
2. Utiliser la barre de recherche
3. Chercher par nom de société OU forme juridique
```

---

## 📞 Support

En cas de problème technique :
1. Vérifier ce guide
2. Consulter `/ADMIN_PROCESS_UNIFIED_GUIDE.md` (version détaillée)
3. Contacter le support technique

---

**Dernière mise à jour** : Novembre 2024
**Version** : 1.0
