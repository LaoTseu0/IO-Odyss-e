# Architecture du projet 3d-io

## Objet du document

Ce document décrit l'organisation actuelle de l'application, ses flux principaux et les points à améliorer avant une éventuelle ouverture du projet en open source.

Deux principes doivent guider les prochaines évolutions :

1. Le contenu narratif doit pouvoir évoluer indépendamment de la logique applicative.
2. Le code doit rester simple à lire et à vérifier humainement. Les commentaires doivent expliquer la raison d'être des décisions non évidentes, pas paraphraser le code.

Le mot d'ordre de la future refonte est la simplicité. Une abstraction ne doit être introduite que si elle rend le projet réellement plus facile à comprendre, tester ou faire évoluer.

## Vue d'ensemble

Le projet est une application monopage React et Vite exécutée entièrement dans le navigateur. Il ne possède actuellement ni backend, ni routeur, ni base de données.

Le principe central de l'expérience est le suivant : le défilement vertical de la page pilote un voyage horizontal dans une scène 3D persistante.

```text
index.html
└── app/main.tsx                  Point d'entrée React
    └── app/page.tsx              Orchestrateur de l'expérience
        ├── experience/stages.ts  Contenu des huit chapitres
        ├── experience/store.ts   État partagé Zustand
        ├── experience/journey.ts Conversion scroll → position 3D
        ├── rendering/
        │   └── ExperienceCanvas.tsx
        │       ├── scène Three.js
        │       ├── entités des chapitres
        │       ├── shaders
        │       └── post-traitement
        └── globals.css           Layout, HUD, responsive et accessibilité
```

## Point d'entrée

`index.html` fournit le conteneur `#root` et charge `app/main.tsx`.

`app/main.tsx` :

- charge les styles globaux ;
- initialise React ;
- active `StrictMode` ;
- affiche le composant `Home`.

L'application ne possède qu'une page et n'utilise donc pas de système de routing.

## Orchestration de l'expérience

`app/page.tsx` est le chef d'orchestre de l'application. Il coordonne trois couches :

1. La scène 3D chargée à la demande avec `React.lazy`.
2. Le HUD HTML fixe : introduction, textes, navigation, aide et son.
3. Une piste verticale invisible qui fournit la hauteur nécessaire au scroll.

La scène 3D reste fixe à l'écran. Huit sections de `115vh` dans `.scroll-track` créent le parcours vertical.

### Transformation du scroll

GSAP `ScrollTrigger` transforme la position du scroll en une progression normalisée entre `0` et `1`.

```text
scroll vertical
      ↓
progression entre 0 et 1
      ↓
chapitre actif
      ↓
store Zustand
      ↓
interface HTML + scène Three.js
```

À chaque mise à jour, la page synchronise :

- la progression globale ;
- le chapitre actif ;
- la barre de progression ;
- l'indicateur de profondeur ;
- l'apparition ou la disparition de l'introduction.

Les boutons de navigation utilisent `scrollIntoView` pour rejoindre la section correspondant à un chapitre.

## Contenu narratif

`app/experience/stages.ts` contient aujourd'hui les huit chapitres :

1. Donnée brute
2. Tokens et vecteurs
3. Attention
4. Transformer
5. Pré-entraînement
6. Alignement
7. Inférence
8. Génération

Chaque chapitre contient notamment :

- les textes pédagogiques ;
- une idée à retenir ;
- une couleur d'accent ;
- les informations affichées dans le HUD ;
- une description de l'entité 3D associée.

La séparation actuelle est déjà utile, mais le contenu reste défini dans un fichier TypeScript. À terme, le contenu éditorial devrait être déplacé vers un format indépendant de la logique métier, par exemple un fichier JSON validé au chargement.

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

Le schéma TypeScript resterait responsable du typage et de la validation, tandis que le JSON ne contiendrait que des données éditoriales.

## État partagé

`app/experience/store.ts` utilise Zustand pour partager quatre informations :

```ts
progress
activeStage
attentionMode
reducedMotion
```

Ce store constitue le pont entre le DOM et le moteur 3D :

- la page écrit la progression du scroll ;
- le monde 3D lit cette progression à chaque frame ;
- le laboratoire d'attention change le contexte ;
- l'entité 3D d'attention adapte ses connexions ;
- la préférence `prefers-reduced-motion` limite les animations.

Dans les boucles Three.js, `useExperienceStore.getState()` permet de lire l'état sans déclencher un rendu React à chaque image.

## Déplacement horizontal

`app/experience/journey.ts` contient la conversion mathématique centrale :

```text
position X = progression × (nombre de chapitres - 1) × espacement
```

Chaque chapitre est actuellement espacé de `5.2` unités sur l'axe X. La fonction borne la progression entre `0` et `1` pour garantir une position valide.

## Scène 3D

`app/rendering/ExperienceCanvas.tsx` concentre le moteur graphique. Il utilise :

- React Three Fiber pour décrire la scène avec React ;
- Three.js pour les objets, matériaux et shaders ;
- Drei pour les traînées, le contrôle de performance et le DPR adaptatif.

### Entités des chapitres

Chaque chapitre possède une représentation procédurale :

- corpus : fragments d'octaèdres ;
- vecteurs : anneaux concentriques ;
- attention : graphe de nœuds et connexions ;
- transformer : empilement de couches ;
- entraînement : étoile lumineuse ;
- alignement : planète et anneau ;
- inférence : portail ;
- génération : galaxie de particules.

Aucun modèle 3D externe n'est chargé. Les formes sont générées avec des primitives Three.js et des tableaux de positions.

### Monde et caméra

`JourneyWorld` :

- place chaque entité le long de l'axe X ;
- alterne leur hauteur ;
- réduit et éloigne les chapitres non actifs ;
- masque les entités trop éloignées ;
- déplace la caméra horizontalement avec la progression.

La caméra et le cœur IO suivent la même coordonnée X. Le cœur sert ainsi de fil conducteur entre les chapitres.

### Cœur IO

`IoCore` combine :

- un icosaèdre déformé par shader ;
- une aura transparente ;
- un noyau blanc ;
- des particules énergétiques ;
- trois lucioles avec traînées ;
- deux lumières ponctuelles.

Sa couleur évolue progressivement vers la couleur d'accent du chapitre actif.

Les shaders GLSL produisent le bruit procédural, les déformations, l'effet Fresnel, les filaments lumineux, les pulsations et le mouvement des particules.

## Rendu et performances

Le pipeline graphique applique :

- le tone mapping ACES ;
- l'espace colorimétrique sRGB ;
- du brouillard ;
- un bloom HDR ;
- un DPR limité entre `1` et `1.5`.

`QualityController` réduit automatiquement le DPR lorsque les performances baissent. Le nombre d'étoiles et la taille des entités sont également réduits sur mobile.

Une `ErrorBoundary` affiche un mode essentiel lorsque WebGL ne peut pas démarrer. Le contenu pédagogique reste alors disponible en HTML.

## Interface et styles

`app/globals.css` construit l'expérience avec plusieurs calques fixes :

```text
z-index 0  Canvas WebGL
z-index 1  Atmosphère et gradients
z-index 5  HUD narratif
z-index 30 Barre supérieure
z-index 40 Fenêtre d'aide
```

La variable CSS `--stage-accent` propage la couleur du chapitre vers les textes, lumières, bordures, indicateurs et états actifs.

Le responsive utilise principalement deux seuils :

- moins de `1100px` : panneaux resserrés ;
- moins de `760px` : interface mobile simplifiée.

## Interactions

Le laboratoire d'attention apparaît au troisième chapitre. Le choix « Fleuve » ou « Finance » modifie simultanément :

- la phrase affichée ;
- l'interprétation dominante ;
- le niveau de confiance ;
- les poids des connexions dans la scène 3D.

Le son est produit avec l'API Web Audio. Aucun fichier audio n'est chargé : un oscillateur génère une courte fréquence à chaque changement de chapitre.

## Accessibilité

Le projet prévoit :

- un lien d'évitement ;
- la navigation au clavier ;
- des attributs ARIA ;
- le respect de `prefers-reduced-motion` ;
- une version textuelle des chapitres pour les technologies d'assistance ;
- un fallback complet si WebGL échoue.

Le Canvas est masqué aux technologies d'assistance car son contenu visuel est retranscrit en HTML.

## Tests

`app/experience/experience.test.ts` couvre actuellement :

- le nombre, l'ordre et l'unicité des chapitres ;
- la présence du contenu pédagogique ;
- la position du laboratoire d'attention ;
- le bornage du store ;
- le changement de contexte ;
- la conversion déterministe et croissante du scroll en position X.

Il n'existe pas encore de tests de composants React, d'accessibilité DOM ou de rendu WebGL.

## Diagnostic architectural

L'organisation actuelle est saine pour une expérience de cette taille :

- le contenu narratif est déjà regroupé ;
- l'état partagé reste léger ;
- la logique mathématique est isolée et testable ;
- le DOM et WebGL communiquent par une interface claire ;
- aucun asset lourd ni appel réseau n'est nécessaire ;
- WebGL et les animations possèdent des modes dégradés.

Les principaux points de vigilance sont :

- `ExperienceCanvas.tsx` concentre les entités, shaders, effets et orchestration 3D ;
- les entités sont associées aux chapitres par leur index ;
- la borne maximale du chapitre est codée en dur dans le store ;
- `entityLabel` et `entityInfo` sont déclarés mais non affichés ;
- la variable CSS `--journey` est mise à jour mais non utilisée.

## Direction proposée pour la refonte

La refonte doit rester progressive et produire de petits changements faciles à relire.

Ordre recommandé :

1. Définir un modèle `Stage` indépendant de React et Three.js.
2. Déplacer les données narratives vers `app/content/stages.json`.
3. Ajouter une validation simple du contenu au démarrage ou pendant le build.
4. Remplacer l'association des entités par index par un identifiant explicite.
5. Supprimer les valeurs codées en dur dérivables de `stages.length`.
6. Découper `ExperienceCanvas.tsx` par responsabilité seulement lorsque cela améliore réellement la lecture.
7. Ajouter des tests ciblés à chaque extraction.

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

Ce découpage reste volontairement limité. Il faut éviter un fichier par fonction, les couches génériques prématurées et les abstractions qui obligeraient un lecteur à naviguer dans de nombreux fichiers pour comprendre un flux simple.

## Politique de commentaires

Les commentaires doivent être utilisés lorsqu'ils répondent à une question que le code seul ne peut pas résoudre clairement :

- pourquoi une lecture impérative du store est nécessaire dans `useFrame` ;
- pourquoi le rendu du post-traitement utilise une priorité spécifique ;
- pourquoi une valeur de performance ou une limite visuelle a été choisie ;
- pourquoi un fallback ou une adaptation d'accessibilité existe.

Les commentaires suivants sont à éviter :

```ts
// Incrémente l'index
index += 1;
```

Le nommage, les types et les fonctions courtes doivent expliquer le « quoi ». Les commentaires doivent conserver le contexte et expliquer le « pourquoi ».

## Critères de réussite

La refonte sera réussie si :

- une personne peut modifier le récit sans toucher à la logique de rendu ;
- ajouter ou réordonner un chapitre ne casse pas silencieusement son entité 3D ;
- les responsabilités importantes sont repérables depuis l'arborescence ;
- les fonctions non triviales expliquent leurs contraintes et leur raison d'être ;
- chaque commit reste petit, testable et facile à examiner ;
- le comportement visuel et l'accessibilité existants sont préservés.
