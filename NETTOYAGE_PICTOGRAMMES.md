# Derniers pictogrammes — 7 août 2026

Suite de [ICONOGRAPHIE_CLIENT.md](ICONOGRAPHIE_CLIENT.md) et
[ICONOGRAPHIE_ADMIN.md](ICONOGRAPHIE_ADMIN.md). `tsc --noEmit` : 0 erreur.
`npm run build` : vert.

---

## Ce que la recherche précédente ne voyait pas

Les passages précédents cherchaient les emojis dans une seule plage Unicode
(`U+1F300`–`U+1FAFF`). Cinq occurrences y répondaient encore, dans les messages
d'une conversation de démonstration. En cherchant cette fois **tout caractère
non-ASCII qui ne soit ni une lettre accentuée, ni de la ponctuation française**,
il en restait bien davantage :

| | Trouvé | Où |
|---|---|---|
| 🎨 👍 📸 | 5 | Messages de la conversation branding |
| ℹ️ | 5 | Encarts d'information (modification, domiciliation, capital) |
| 1️⃣ 2️⃣ 3️⃣ 4️⃣ | 4 | Étapes du processus branding |
| ✉️ | 1 | Devant l'adresse du gérant |
| ⭐ | 2 | Badge « Populaire », pack de services |
| ❌ | 3 | Traces de console |
| ✅ 🔄 📥 📦 | 4 | Traces de console |
| variation selectors orphelins | 10 | Reliquats des emojis ci-dessus |
| ✓ ✗ ⚠ | 31 | Badges d'état |
| ← → × | 6 | Boutons de retour, de navigation, de fermeture |

Soit **71 occurrences**, dont `src/hooks/`, jamais balayé jusqu'ici.

## Les décisions

**Retirés purement et simplement** quand la phrase se suffit : `ℹ️` devant un
encart déjà encadré et coloré, `✉️` devant une adresse électronique qui se
reconnaît à son format, la coche finale de « Devis envoyé ✓ » dans un badge déjà
vert. Les chiffres encerclés deviennent une liste numérotée ordinaire.

**Remplacés par une icône** quand le caractère faisait le travail d'un pictogramme :

| Avant | Après | Où |
|---|---|---|
| `⭐ Populaire` | `Star` | Badge de service, administration |
| `✓ Validé` / `✗ Rejeté` | `CheckCircle` / `XCircle` | Badges de pièce justificative |
| `⚠ Bloqué` | `AlertTriangle` | Étape bloquée du workflow |
| `←` `→` | `ArrowLeft` `ArrowRight` | Retour de saisie, indication de balayage |
| `×` | `X` | Fermeture de modale, retrait d'un service |

Les traces de console perdent aussi leurs pictogrammes : elles se lisent dans un
terminal, pas dans une interface.

## Ce qui reste, et pourquoi

| Caractère | Nombre | Raison |
|---|---|---|
| `═` `─` | 44 | Séparateurs de sections **dans les commentaires** du code |
| `→` | 9 | Intervalles de dates (« 01/01/2026 → 31/12/2026 ») et commentaires |
| `©` | 3 | Mention légale du pied de page |
| espaces insécables | 4 | Typographie française des nombres, dans `format.ts` |

Aucun n'est un pictogramme et aucun ne remplace une icône.

## Vérification

**39 écrans** parcourus — client web, client mobile, administration, comptabilité —
avec un filtre qui signale tout caractère non-ASCII inattendu dans le texte affiché.
Seuls les espaces insécables des montants et la flèche des intervalles de dates
ressortent. Console vide sur l'ensemble.
