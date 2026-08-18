Oui, la bonne direction est une expérience 3D « sur rails » : l’utilisateur ne contrôle pas librement la caméra, mais voyage d’étape en étape en cliquant sur la prochaine entité. Cela garantit qu’IO reste au centre tout en donnant une vraie sensation de profondeur.

Le constat actuel : l’application utilise des transformations CSS et une progression calculée depuis `window.scrollY` dans [page.tsx](C:/Dev/Projets/3d-io/app/page.tsx:186). La perspective présente dans [globals.css](C:/Dev/Projets/3d-io/app/globals.css:27) donne une illusion de relief, mais ce n’est pas une scène 3D.

## Proposition à valider

### 1. Expérience de navigation

À l’arrêt :

- IO reste exactement au centre.
- L’entité de l’étape actuelle se trouve légèrement sur le côté d’IO.
- La prochaine entité est visible au loin dans la profondeur.
- L’entité précédente est derrière le joueur, ou termine sa disparition sur un côté.
- Les étoiles et particules bougent très légèrement pour que la scène reste vivante.

Lorsque l’utilisateur survole la prochaine entité :

- Elle réagit visuellement.
- Une fiche courte explique son rôle.
- Une indication « Cliquer pour voyager » apparaît.

Lorsqu’il clique :

1. IO accumule de l’énergie.
2. La caméra et IO accélèrent ensemble.
3. L’ancienne entité passe sur le côté puis derrière.
4. La prochaine entité grossit naturellement avec la perspective.
5. IO passe à travers ou à proximité de l’entité.
6. Les données contenues dans IO sont transformées.
7. La nouvelle fiche pédagogique apparaît.

La transition durerait environ 2,5 à 3 secondes. Pendant le trajet, les clics seraient temporairement désactivés afin d’éviter les doubles navigations.

### 2. Principe de caméra

Techniquement, IO serait attaché à un « camera rig » et maintenu à une distance constante devant la caméra. Ainsi :

- IO ne quitte jamais le centre de l’écran.
- La caméra et IO avancent ensemble dans un véritable espace 3D.
- Les entités restent placées dans le monde.
- C’est leur perspective relative qui donne l’impression qu’elles approchent, passent sur le côté puis disparaissent derrière.

Je déconseille une caméra libre ou des contrôles orbitaux : cela affaiblirait la narration pédagogique et empêcherait de garantir la position centrale d’IO. Un léger parallaxe suivant la souris peut toutefois être ajouté sans déplacer IO.

### 3. Une trajectoire différente selon le concept

Les huit étapes actuelles peuvent être conservées, mais chaque passage aurait sa propre mise en scène :

| Étape | Interaction 3D proposée |
|---|---|
| Données brutes | IO traverse un nuage d’astéroïdes représentant le corpus |
| Tokens et vecteurs | IO entre dans un trou de ver qui décompose le signal |
| Attention | Des connexions s’allument autour d’IO selon leur importance |
| Transformer | IO traverse une station composée de couches successives |
| Pré-entraînement | Passage près d’une étoile, avec erreurs et gradients en orbite |
| Alignement | IO contourne une planète entourée de trajectoires classées |
| Inférence | IO franchit un portail activé par le prompt |
| Génération | IO entre dans une galaxie représentant les suites possibles |

On introduirait donc trois comportements d’entités : passage à travers, passage à proximité et contournement/orbite. Cela évitera que les huit déplacements donnent l’impression d’être la même animation répétée.

### 4. Technologie recommandée

Je recommande de remplacer la scène CSS par :

- Three.js pour le rendu WebGL ;
- React Three Fiber pour intégrer la scène proprement dans l’application React ;
- Drei pour les éléments utilitaires 3D ;
- une animation pilotée par une machine d’état : `idle → preview → travelling → arrived`.

React Three Fiber est un renderer React pour Three.js et sa version 9 correspond à React 19, déjà utilisé par ce projet. Son `Canvas` fournit la scène, la caméra et la boucle de rendu. [Documentation officielle React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction)

Les interactions de survol et de clic reposeraient sur le raycasting 3D, conçu pour déterminer quel objet se trouve sous le curseur. [Documentation officielle Three.js Raycaster](https://threejs.org/docs/pages/Raycaster.html)

L’interface textuelle resterait en HTML au-dessus du canvas :

- titre de l’étape ;
- explication pédagogique ;
- inspecteur d’IO ;
- carte du voyage ;
- boutons précédent/suivant ;
- aide et son.

Cela donnera du texte plus net, accessible et responsive qu’en le dessinant dans WebGL.

### 5. Interactions à conserver

- Survol d’IO : afficher ses données actuelles.
- Survol d’une entité : expliquer son rôle.
- Clic sur la prochaine entité : voyager.
- Carte latérale : revoir une étape déjà débloquée.
- Boutons précédent/suivant et touches fléchées : alternatives accessibles.
- Sur mobile : premier toucher pour inspecter, bouton explicite pour voyager.

Le scroll ne piloterait plus du tout l’expérience. La page aurait une hauteur fixe de `100dvh`.

### 6. Ce qui peut être réutilisé

Peuvent être conservés :

- les huit étapes et leurs textes ;
- les couleurs associées ;
- la structure de la fiche pédagogique ;
- l’inspecteur des données d’IO ;
- la carte du voyage ;
- l’identité visuelle générale ;
- une partie du système sonore.

À reconstruire :

- toutes les entités visuelles en objets 3D ;
- le fond spatial ;
- IO en véritable objet 3D ;
- la navigation basée sur le scroll ;
- le calcul de progression ;
- les animations de déplacement CSS.

Ce n’est donc pas un simple remplacement du scroll par un bouton : c’est une refonte du moteur visuel, tout en conservant le contenu et une grande partie de l’interface.

## Première phase d’implémentation proposée

Après validation, je commencerais par un prototype limité à trois étapes :

- données brutes ;
- trou de ver vectoriel ;
- constellation d’attention.

Ce prototype servirait à valider :

- la sensation de profondeur ;
- le maintien d’IO au centre ;
- le passage de l’ancienne entité derrière l’utilisateur ;
- le clic et le survol 3D ;
- la durée des déplacements ;
- le rendu desktop et mobile ;
- les performances.

Une fois cette « tranche verticale » validée, les cinq autres étapes seraient ajoutées sans remettre en cause l’architecture.

## Critères de validation

La refonte sera considérée réussie si :

- aucun scroll n’est nécessaire ;
- IO reste visuellement centré pendant tout le voyage ;
- la prochaine destination est perceptible au loin ;
- la dernière entité passe clairement sur le côté puis derrière ;
- le déplacement semble avancer dans la profondeur ;
- chaque entité reste inspectable ;
- IO montre toujours son état pédagogique actuel ;
- les déplacements sont fluides sur desktop et suffisamment légers sur mobile ;
- un mode de mouvement réduit et une navigation clavier existent.

Ma recommandation finale est donc : parcours linéaire 3D sur rails, clic sur l’entité suivante, carte permettant de revenir aux étapes débloquées, transitions de 2,5 à 3 secondes et prototype initial sur trois étapes.

Je n’ai effectué aucune modification du code.
