# Refonte de la base de code

## Objectifs

La refonte prépare le projet à deux évolutions :

1. Le contenu narratif doit pouvoir évoluer indépendamment de la logique applicative.
2. Le projet doit pouvoir être ouvert à des contributeurs externes avec un code simple à comprendre et à examiner.

Le mot d'ordre est la simplicité. Une abstraction ne doit être introduite que si elle rend le projet réellement plus facile à comprendre, tester ou faire évoluer.

## Principes

- Préférer des fonctions courtes et explicites aux abstractions génériques.
- Conserver des responsabilités visibles depuis l'arborescence.
- Préserver le comportement visuel, les performances et l'accessibilité.
- Ajouter des tests ciblés avec chaque extraction de logique.
- Ne pas multiplier les fichiers lorsque cela disperse une logique simple.

## Contenu narratif indépendant

Le contenu éditorial se trouve actuellement dans `app/experience/stages.ts`. Il doit être déplacé vers un format indépendant de React, Zustand et Three.js, par exemple un fichier JSON.

Une cible simple pourrait être :

```text
app/
├── content/
│   └── stages.json
├── domain/
│   ├── stage.ts
│   └── journey.ts
├── state/
│   └── experienceStore.ts
├── ui/
└── rendering/
```

Le JSON ne contiendrait que les données éditoriales. Un modèle TypeScript indépendant de l'interface et du rendu resterait responsable du typage et de la validation.

L'association entre un chapitre et son entité 3D doit utiliser un identifiant explicite. Elle ne doit plus dépendre de la position du chapitre dans un tableau.

## Proposition de refonte

La refonte doit rester progressive et produire de petits changements vérifiables.

Ordre recommandé :

1. Définir un modèle `Stage` indépendant de React et Three.js.
2. Déplacer les données narratives vers `app/content/stages.json`.
3. Ajouter une validation simple du contenu au démarrage ou pendant le build.
4. Remplacer l'association des entités par index par un identifiant explicite.
5. Supprimer les valeurs codées en dur qui peuvent être dérivées de `stages.length`.
6. Découper `ExperienceCanvas.tsx` par responsabilité lorsque cela améliore réellement la lecture.
7. Ajouter des tests ciblés à chaque étape.

Un découpage raisonnable du rendu pourrait devenir :

```text
app/rendering/
├── ExperienceCanvas.tsx
├── JourneyWorld.tsx
├── entities/
│   ├── StageEntity.tsx
│   └── IoCore.tsx
├── effects/
│   └── BloomPipeline.tsx
└── shaders/
    └── ioCoreShaders.ts
```

Ce découpage reste volontairement limité. Il faut éviter un fichier par fonction, les couches génériques prématurées et les abstractions qui obligent un lecteur à parcourir de nombreux fichiers pour comprendre un flux simple.

## Politique de commentaires

Le nommage, les types et les fonctions courtes doivent expliquer ce que fait le code. Les commentaires doivent expliquer pourquoi une décision non évidente existe.

Un commentaire est utile pour documenter, par exemple :

- pourquoi une lecture impérative du store est nécessaire dans `useFrame` ;
- pourquoi le post-traitement utilise une priorité de rendu spécifique ;
- pourquoi une limite de performance ou une valeur visuelle a été choisie ;
- pourquoi un fallback ou une adaptation d'accessibilité existe.

Un commentaire qui paraphrase une instruction est à éviter :

```ts
// Incrémente l'index
index += 1;
```

## Critères de réussite

La refonte sera réussie si :

- une personne peut modifier le récit sans toucher à la logique de rendu ;
- ajouter ou réordonner un chapitre ne casse pas silencieusement son entité 3D ;
- les responsabilités importantes sont repérables depuis l'arborescence ;
- les fonctions non triviales expliquent leurs contraintes et leur raison d'être ;
- chaque commit reste petit, testable et facile à examiner ;
- le comportement visuel et l'accessibilité existants sont préservés.
