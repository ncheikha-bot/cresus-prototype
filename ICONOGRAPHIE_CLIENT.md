# Iconographie — 6 août 2026

> Étendu depuis à l'administration et à l'espace comptable :
> [ICONOGRAPHIE_ADMIN.md](ICONOGRAPHIE_ADMIN.md).

Les écrans client, mobile et web, ne reposent plus sur le jeu d'icônes par défaut ni sur les
emojis. `tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Ce qui donnait cet air de gabarit

Deux signaux, tous deux dans les espaces client :

1. **Les icônes** venaient de `lucide-react`, au trait de 2 px et au dessin très répandu. On
   les retrouve à l'identique dans une quantité d'interfaces produites à la chaîne : à elles
   seules, elles datent un produit.
2. **Les emojis** — une centaine d'occurrences — servaient tantôt de pictogrammes (🟠 pour
   Orange Money, 🏢 pour une SARL, 🪪 pour une pièce d'identité), tantôt de ponctuation
   (« Bonjour Cheikh 👋 », « Modification finalisée ! 🎉 », « 💡 Vous pouvez… »). Rien ne
   signale plus vite un écran généré.

## Le nouveau jeu

Les 926 icônes des écrans client viennent désormais de **Phosphor**, dessinées en graisse
`light` : trait fin, angles adoucis, silhouettes plus calmes que le jeu précédent.

Tout passe par un module unique,
[`src/components/ui/icons.tsx`](src/components/ui/icons.tsx), qui fixe la graisse commune et
réexporte **les mêmes noms** que ceux employés jusqu'ici. Les 50 écrans concernés n'ont eu
qu'à changer la provenance de leur import :

```diff
- import { FileText, Clock, Users } from 'lucide-react';
+ import { FileText, Clock, Users } from '../ui/icons';
```

Aucune ligne de JSX n'a bougé pour cette bascule, et un seul endroit décide désormais de
l'allure des icônes — graisse, alias, substitutions futures.

## Les emojis remplacés

| Emplacement | Avant | Après |
|---|---|---|
| Moyens de paiement | 🟠 💙 💵 🏦 💳 | Symboles de trait (téléphone, portefeuille, banque, carte), sur pastille claire au lieu d'un dégradé |
| Formes juridiques | 🏢 👤 🏛️ 🚀 ⭐ 🏘️ | Immeuble, personne, banque, maison — un symbole par famille |
| Pièces de domiciliation | 🪪 🏢 🏠 📄 | Carte d'identité, immeuble, maison, document |
| Secteurs (comptabilité) | 🧑‍💼 🏪 🏗️ 🚢 | Mallette, commerce, casque de chantier, navire |
| Offres de domiciliation | ⚡ ⭐ 👑 | Trois cercles de hiérarchie croissante, jusqu'au sceau vérifié |
| Rendez-vous | 🏢 🏖️ | Immeuble, horizon |
| Textes courants | 💡 📋 ⚠️ 🎉 ✅ 📄 📝 📞 👋 💬 … | Retirés : la phrase se suffit |

Ne restent que deux emojis, dans le titre d'une notification (« Rendez-vous réservé 📅 »).

## Quelques choix revus au passage

La correspondance automatique produisait des symboles justes mais parfois à côté du sens :

- « Créer une entreprise » s'affichait avec **une signature** ; c'est maintenant un immeuble.
- « Mes sociétés » montrait **une pile de calques** ; immeuble également.
- « Domiciliation » reprenait le même immeuble que la création : c'est devenu un repère de
  carte, qui dit l'adresse.
- Les titres de section (« Services essentiels », « Services complémentaires ») portaient un
  **éclair** et des **étincelles** : retirés, le titre suffit.
- Le tableau de bord web affichait une **fusée** pour la phase de lancement : remplacée.

## Portée

Ce premier passage a couvert les espaces **client mobile et web**, ainsi que
`data/processSteps.ts`. L'administration et l'espace comptable ont suivi :
[ICONOGRAPHIE_ADMIN.md](ICONOGRAPHIE_ADMIN.md).

**Vérifié** : les 31 écrans client, mobile et web, s'affichent sans erreur console, et plus
aucun fichier client n'importe l'ancien jeu d'icônes.
