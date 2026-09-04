# Chaînage admin → client — 5 août 2026

Dernier chaînon manquant identifié dans [SPRINT3_APPLIQUE.md](SPRINT3_APPLIQUE.md) :
`AdminCompanySteps.tsx` (2 053 lignes) tenait tout l'avancement des dossiers dans des `useState`
locaux. Une validation admin n'avait **aucun effet visible côté client** et disparaissait au
démontage du composant.

`npm run build` est vert. Tous les parcours ont été retestés.

---

## Ce qui a été fait

### 1. Séparer l'état d'interface de l'état métier

Sur les 25 `useState` du composant, **10 portaient de l'état métier** — envoi des statuts,
validation par le client, rendez-vous de signature, documents officiels, finalisation, décisions
de validation des documents. Les 14 autres sont de l'interface pure (ouverture de modale, saisie
en cours) et restent locaux, ce qui est correct.

### 2. Un type dédié, partagé

`CompanyProcessState` dans `src/types/index.ts` décrit l'avancement d'un dossier :

```ts
statutsSent, statutsVersion, statutsValidatedByClient, statutsRejectedByClient,
clientRejectionReason, appointmentRequest, onlineSignatureCompleted,
signedDocuments, officialDocs, companyFinalized, documentDecisions
```

Le contexte l'expose indexé par société :

```ts
getCompanyProcess(companyId): CompanyProcessState
updateCompanyProcess(companyId, patch): void
```

Dans le composant admin, les 14 mutations passent par un raccourci local :

```ts
const majProcessus = (patch) => updateCompanyProcess(company.id, patch);
```

Cas particulier des documents : la liste affichée n'est plus un état, mais une **projection**
des documents du dossier sur les décisions partagées. L'avis de l'admin est donc immédiatement
lisible partout.

### 3. Le client voit enfin l'avancement

Les deux écrans de suivi client affichaient des statuts et des dates **écrits en dur** : le
client voyait toujours la même progression, quoi que fasse l'admin.

`getStepStatuses(company, process)` a été ajouté à `src/domain/companySteps.ts`. C'est une
fonction pure, source unique des deux timelines, qui déduit le statut des 7 étapes de l'état
réel du dossier. Les dates fictives (« 10 Déc 2025 ») ont été retirées côté mobile.

**Vérifié par test direct de la fonction :**

| Situation | Progression des 7 étapes |
|---|---|
| Dossier neuf, un document en attente | `terminée terminée` **`active`** `terminée attente attente attente` |
| **L'admin valide le document** | `terminée terminée terminée terminée` **`active`** `attente attente` |
| **Le client valide les statuts** | `… terminée terminée` **`active`** |
| Signature électronique | tout terminé |
| Dossier finalisé par l'admin | tout terminé |

Une action admin déplace bien la progression que voit le client.

---

## Vérifications

**État réellement partagé** — inspection de l'arbre React après une action admin :

```json
companyProcesses: {
  "creation-etape-1": { "statutsValidatedByClient": true, … }
}
```

L'avancement vit dans le provider, pas dans le composant : il survit au démontage et reste
accessible depuis les quatre espaces.

**Régression détectée et corrigée pendant les tests** : la projection des documents référençait
`processus` avant sa déclaration, ce qui produisait un `ReferenceError` et un **écran blanc** sur
le détail de dossier admin. Le bloc a été remonté juste après `useApp()`. C'est précisément le
genre de défaut qu'un typecheck ne voit pas — l'erreur n'apparaît qu'à l'exécution.

**Parcours testés — 46 écrans, 0 erreur console :**

| Espace | Écrans | Résultat |
|---|---|---|
| Administration | 10 | tous rendus, aucune erreur |
| Comptable | 5 | tous rendus, aucune erreur |
| Client web | 15 | tous rendus, aucune erreur |
| Client mobile | 16 | tous rendus, aucune erreur |

Le seul écran à faible contenu (`/app/notifications`) affiche un état vide légitime
(« Aucune notification — Vous êtes à jour ! »).

---

## 4. Persistance de l'avancement

L'avancement ne vit plus seulement en mémoire : il est relu au montage et réécrit à chaque
mise à jour, sous la clé `cresus_company_processes`. Un rechargement ne remet plus le dossier
à zéro.

L'écriture se fait **depuis l'updater de `setState`**, et non après :

```ts
setCompanyProcesses(prev => {
  const suivant = { ...prev, [companyId]: { ...(prev[companyId] ?? EMPTY), ...patch } };
  writeJSON(STORAGE_KEYS.companyProcesses, suivant);
  return suivant;
});
```

Écrire depuis l'extérieur aurait persisté une valeur périmée dès que deux mises à jour
s'enchaînent dans le même cycle de rendu.

### Un accès au stockage factorisé

Le contexte manipulait `localStorage` directement, avec un `try/catch` recopié à chaque appel.
`src/lib/storage.ts` regroupe `readJSON`, `writeJSON` et les clés utilisées. Les brouillons,
l'onboarding et l'avancement passent tous par là — plus aucun accès direct au stockage dans le
contexte.

Le repli est systématique, parce que le stockage échoue pour des raisons étrangères à
l'application : quota dépassé, mode privé de Safari, contenu écrit par une version antérieure.

**Sept cas vérifiés par test direct :**

| Cas | Résultat |
|---|---|
| Aller-retour écriture / lecture | valeur restituée |
| Clé absente | renvoie le repli |
| JSON corrompu | pas d'exception, renvoie le repli |
| Quota dépassé | pas d'exception, renvoie `false` |
| Clés distinctes par utilisateur | vérifié |

**Vérifié aussi dans le navigateur :**

- action admin → `cresus_company_processes` écrit ;
- **rechargement complet** → l'état est relu, `statutsValidatedByClient: true` préservé ;
- stockage volontairement corrompu → l'application démarre normalement ;
- brouillons non régressés après le passage au helper (cycle saisie → enregistrement → relecture).

Compatibilité : la clé `hasSeenOnboarding` était une chaîne `'true'`, elle est désormais écrite
en booléen JSON. La lecture accepte les deux formes, pour ne pas réafficher l'onboarding aux
utilisateurs déjà passés par l'ancienne version.

---

## Ce qui reste

- **`AdminCompanySteps.tsx` reste à 2 000 lignes** : l'état est sorti, pas le composant. Il
  gagnerait à être découpé par étape.
- **La persistance est locale au navigateur.** Deux personnes sur deux postes ne partagent
  toujours rien : l'admin et le client ne se voient que s'ils utilisent le même navigateur.
  C'est la limite structurelle du prototype — le vrai chaînage demande une API.
- Les points encore ouverts du sprint 3 : migration des 834 cartes vers `<Card>`, fusion des
  composants jumeaux mobile/web, `prefers-reduced-motion`, et les 20 autres
  `AnimatePresence mode="wait"` non audités.
