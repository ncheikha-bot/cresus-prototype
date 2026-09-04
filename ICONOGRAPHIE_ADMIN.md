# Iconographie — administration, comptabilité et catalogues — 6 août 2026

Extension à toute l'application du traitement appliqué aux espaces client
([ICONOGRAPHIE_CLIENT.md](ICONOGRAPHIE_CLIENT.md)). `tsc --noEmit` : 0 erreur.
`npm run build` : vert.

---

## Ce qui a basculé

| Périmètre | Fichiers | Contenu |
|---|---|---|
| Administration | 30 | Dossiers, banques, paiements, comptabilité, branding, rendez-vous, modales d'étape |
| Comptabilité | 3 | Tableau de bord, dossiers, déclarations, échéancier, rapports |
| Écrans partagés | 7 | Écran d'accueil, onboarding, cartes de livrables, modales, champs de formulaire, boîte de dialogue |
| Données de catalogue | 4 | Services de branding, types de modification, comptabilité, jeu de démonstration |

Comme pour le client, les imports pointent vers le module unique
[`src/components/ui/icons.tsx`](src/components/ui/icons.tsx), enrichi de **37 symboles**
supplémentaires pour les besoins propres à ces écrans (archive, pourcentage, cible,
mégaphone, sablier, balance, imprimante, clap de tournage…).

**`lucide-react` a été désinstallé** : plus aucun fichier ne s'y réfère. L'application entière
partage désormais un seul jeu, dans une seule graisse.

## Les emojis des catalogues

C'est là que se cachait le gros du reste : les données elles-mêmes portaient des emojis,
affichés en grand au centre des cartes.

| Catalogue | Avant | Après |
|---|---|---|
| Types de modification (37 entrées) | ✏️ 🎯 📍 📈 📉 👤 ⚖️ 🔄 🔗 🚫 ⏱️ ⚙️ … | Crayon, cible, repère, courbes, personne, balance, flèches, lien, interdit, minuteur, réglages |
| Services de branding (20 entrées) | 🎨 📱 🖨️ 🎬 💻 🚀 👑 🛒 📣 🎙️ … | Palette, téléphone, imprimante, clap, portable, mégaphone, micro… |
| Écrans d'administration | 🏦 🎉 👋 🎯 📊 🏆 💰 📈 🌍 📋 👥 📄 🕐 | Retirés du texte ; le logo bancaire par défaut devient les initiales |

Le champ « icône » du formulaire de service admin — qui invitait à saisir un emoji
(`Ex: 🎨`) — a été retiré : le catalogue porte maintenant des symboles, pas du texte.

> **Suite** : les signes `✓`, `✗` et `⚠`, d'abord conservés comme ponctuation dans les
> badges d'état, ont été retirés à leur tour — voir
> [NETTOYAGE_PICTOGRAMMES.md](NETTOYAGE_PICTOGRAMMES.md).

## Vérifications

- **16 écrans** d'administration et de comptabilité parcourus : rendu correct, console vide,
  et **aucun emoji détecté** dans le texte affiché.
- Les catalogues (branding, modifications) affichent leurs symboles à la taille qu'occupaient
  les emojis, dans la couleur du texte plutôt qu'en pastille colorée.
- `tsc --noEmit` : 0 erreur ; `npm run build` : vert, sans `lucide-react` dans les
  dépendances.
