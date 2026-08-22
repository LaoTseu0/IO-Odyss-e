# Guide du rendu 3D

## Objectif

Ce document fournit une carte mentale minimale de la scène. Il doit permettre de modifier une entité sans devoir comprendre tout Three.js.

L'application conserve un seul canvas WebGL. Le texte, la navigation et les contrôles restent dans le DOM React ; seules les formes, particules, lumières et animations spatiales sont rendues par Three.js.

## Responsabilités

```text
ExperienceCanvas.tsx
└── crée le renderer, la caméra, le brouillard et le post-traitement
    └── JourneyWorld.tsx
        ├── place les chapitres le long de l'axe X
        ├── déplace la caméra selon le scroll
        ├── affiche les étoiles et les lumières globales
        ├── StageEntity.tsx choisit l'entité du chapitre
        └── IoCore.tsx anime le fil conducteur du voyage
```

Chaque fichier de `app/rendering/entities/` décrit une seule métaphore visuelle. Une entité ne doit pas déplacer la caméra ni connaître la progression générale du voyage, sauf lorsqu'une interaction lui appartient directement, comme le changement de contexte de l'attention.

## Vocabulaire utile

- `group` : conteneur permettant de déplacer, tourner ou redimensionner plusieurs objets ensemble ;
- `mesh` : association d'une géométrie et d'un matériau ;
- `geometry` : forme de l'objet, par exemple une sphère, un anneau ou un cube ;
- `material` : apparence de la surface, notamment sa couleur, sa transparence et sa réaction à la lumière ;
- `points` : ensemble de particules partageant un même matériau ;
- `useFrame` : fonction exécutée à chaque image pour effectuer une animation impérative ;
- `shader` : programme GPU réservé ici aux effets organiques du cœur IO.

Les axes suivent la convention Three.js : X va de gauche à droite, Y de bas en haut et Z règle la profondeur par rapport à la caméra.

## Modifier une entité

1. Ouvrir uniquement son fichier dans `app/rendering/entities/`.
2. Identifier le `group` racine, puis les couples `geometry` / `material`.
3. Changer un seul paramètre à la fois et observer sa conséquence visuelle.
4. Conserver la prop `accent` pour que la couleur suive le chapitre actif.
5. Lancer le lint, les tests et le build avant de terminer.

Les valeurs qui servent uniquement à une entité doivent rester dans son fichier. Une constante ne doit être déplacée vers une configuration globale que lorsqu'elle est réellement partagée par plusieurs composants.

## Ajouter une entité

1. Ajouter son identifiant à `StageEntityId` dans `app/domain/stage.ts`.
2. Créer un composant autonome dans `app/rendering/entities/`.
3. L'ajouter au registre exhaustif de `StageEntity.tsx`.
4. Associer l'identifiant au chapitre concerné dans `app/content/stages.json`.

Le registre TypeScript signale à la compilation tout identifiant oublié. L'ordre des chapitres n'a donc aucune incidence sur le choix de l'entité.

## Commentaires

Un commentaire doit expliquer une intention visuelle, une contrainte de performance ou une décision Three.js non évidente. Il ne doit pas paraphraser le JSX. Les composants simples utilisent une courte description au-dessus de leur fonction ; les explications plus longues restent dans ce document.
