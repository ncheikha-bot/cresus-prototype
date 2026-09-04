# Sociétés persistées, compte de démonstration unifié — 6 août 2026

Les deux points laissés ouverts par la [seconde recette](RECETTE_FINALE_2.md).
`tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## 1. Une société créée survit au rechargement

**Le problème.** Le brouillon survivait, l'avancement du dossier aussi, la session depuis
peu — mais la société elle-même disparaissait au premier rafraîchissement. Un client menait
sa création jusqu'à « Création finalisée 🎉 », rechargeait la page, et son dossier n'existait
plus nulle part : ni dans sa liste, ni dans les dossiers de l'administration.

**Ce qui change.** Les sociétés créées depuis l'application sont enregistrées sous
`cresus_companies` et relues au montage :

```ts
const [companies, setCompanies] = useState<Company[]>(() => {
  const idsReference = new Set(mockCompanies.map(c => c.id));
  const creees = readJSON<Company[]>(STORAGE_KEYS.companies, [])
    .filter(c => !idsReference.has(c.id));
  return [...creees, ...mockCompanies];
});
```

**Seules les sociétés créées sont stockées** — les données de démonstration restent relues à
chaque démarrage. Sans cette précaution, une copie figée du jeu de référence aurait masqué
toute évolution ultérieure des données : on aurait corrigé une société de démonstration sans
jamais voir la correction. En contrepartie, les modifications apportées aux sociétés de
référence ne survivent toujours pas au rechargement ; leur avancement, lui, est persisté à
part dans `cresus_company_processes` depuis les correctifs précédents.

**Vérifié**, parcours complet puis rechargement : PERSISTANCE SARL, créée de l'étape 1 à la
soumission, se retrouve après rafraîchissement dans la liste du client — « Toutes (11) ·
Actives (3) · En cours (8) », tableau de bord à 3 créées / 8 en cours — et dans les dossiers
de l'administration, à « Dossier soumis ».

## 2. Un seul compte de démonstration

**Le problème.** Trois identités cohabitaient pour un seul rôle : `cheikh@example.com`
(id `1`), qui porte toutes les données de démonstration ; `client@cresus.sn` (id
`client-demo`), sans aucune société ; et, sur l'écran Splash mobile, un troisième profil
composé à la main — l'identifiant du premier, le nom et l'email du second. Selon la porte
d'entrée empruntée, on tombait donc sur un espace peuplé ou sur un espace vide.

**Ce qui change.** Le compte `client-demo` est supprimé des données de référence. Ses trois
notifications parlaient de sociétés appartenant à l'utilisateur `1` — « Sunu Agritech SARL a
été créée », « Ndogalma Fashion est en cours de révision » — elles lui sont donc rattachées
plutôt que jetées. Les quatre points d'entrée pointent désormais sur `mockUsers[0]` :

| Porte d'entrée | Avant | Après |
|---|---|---|
| Écran d'accueil → App Mobile / Interface Web | objet écrit en dur | `mockUsers[0]` |
| Splash mobile → Mode démo | identité composée à la main | `mockUsers[0]` |
| Connexion mobile → Continuer en mode démo | `mockUsers[0]` | *(inchangé)* |
| Profil web → Accès rapide démo | `client@cresus.sn`, vide | `cheikh@example.com` |

**Vérifié** : les quatre chemins ouvrent la même session, Cheikh Diop, sur un espace peuplé ;
le centre de notifications en compte maintenant 5 au lieu de 2, les trois reprises comprises.

---

## Note d'environnement

Le port 3000 est occupé par le serveur de développement d'un autre projet. La configuration
Vite n'impose plus ce port : elle lit `process.env.PORT` et retombe sur 3010, et
`.claude/launch.json` autorise l'attribution automatique (`autoPort`). Rien ici ne dépendait
d'un port fixe — ni rappel OAuth, ni webhook. L'ouverture automatique du navigateur au
démarrage (`open: true`) a été désactivée au passage : elle ouvrait un onglet à chaque
lancement du serveur.
