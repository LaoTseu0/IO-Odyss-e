import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Stage = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  insight: string;
  ioLabel: string;
  payload: string[];
  entity: string;
  entityLabel: string;
  entityInfo: string;
  accent: string;
  x: number;
};

const stages: Stage[] = [
  {
    id: "data",
    index: "00",
    eyebrow: "MATIÈRE PREMIÈRE",
    title: "La donnée brute",
    subtitle: "Avant de comprendre, il faut observer.",
    body: "Textes, images, sons et code arrivent sans mode d’emploi. Ils sont collectés, nettoyés et organisés pour devenir une matière exploitable.",
    insight: "Une IA n’apprend pas le monde : elle apprend une représentation du monde contenue dans ses données.",
    ioLabel: "SIGNAL BRUT",
    payload: ["texte", "image", "audio", "code"],
    entity: "asteroids",
    entityLabel: "Nuage de corpus",
    entityInfo: "Un corpus est un vaste ensemble d’exemples. Sa diversité, sa qualité et ses biais dessinent déjà les limites du futur modèle.",
    accent: "#70fff0",
    x: -28,
  },
  {
    id: "tokens",
    index: "01",
    eyebrow: "ENCODAGE",
    title: "Tokens & vecteurs",
    subtitle: "Transformer le langage en coordonnées.",
    body: "Le texte est découpé en tokens. Chaque token devient un vecteur — une longue liste de nombres — placé dans un espace où les sens proches se rapprochent.",
    insight: "Un embedding n’est pas une définition : c’est une position apprise par comparaison avec des milliards de contextes.",
    ioLabel: "VECTEUR 4 096D",
    payload: ["tok_1847", "[0.21, −0.08…]", "position: 128"],
    entity: "wormhole",
    entityLabel: "Trou de ver vectoriel",
    entityInfo: "Ce passage symbolise l’embedding : un saut du langage lisible vers un espace mathématique à très haute dimension.",
    accent: "#8ee4ff",
    x: 29,
  },
  {
    id: "attention",
    index: "02",
    eyebrow: "MISE EN RELATION",
    title: "L’attention",
    subtitle: "Choisir ce qui compte, maintenant.",
    body: "Chaque token compare ses clés, requêtes et valeurs à celles des autres. Le modèle pondère les relations utiles pour construire un contexte précis.",
    insight: "Dans « la banque près du fleuve », l’attention aide le modèle à préférer la rive à l’institution financière.",
    ioLabel: "CONTEXTE PONDÉRÉ",
    payload: ["Query", "Key", "Value", "score: 0.87"],
    entity: "constellation",
    entityLabel: "Constellation d’attention",
    entityInfo: "Chaque rayon est un poids d’attention. Les liens les plus lumineux ont le plus d’influence sur la représentation courante.",
    accent: "#b49aff",
    x: -31,
  },
  {
    id: "transformer",
    index: "03",
    eyebrow: "PROFONDEUR",
    title: "Le Transformer",
    subtitle: "Raffiner, couche après couche.",
    body: "Attention, normalisation et réseaux de neurones s’enchaînent dans des dizaines de blocs. À chaque traversée, IO devient une représentation plus abstraite.",
    insight: "Les premières couches repèrent souvent la forme ; les suivantes combinent syntaxe, concepts et intentions.",
    ioLabel: "ÉTAT CACHÉ L.24",
    payload: ["résiduel", "attention", "MLP", "normalisé"],
    entity: "station",
    entityLabel: "Station Transformer",
    entityInfo: "Un Transformer réutilise le même type de bloc en profondeur. Les connexions résiduelles préservent le signal pendant sa transformation.",
    accent: "#8e8cff",
    x: 31,
  },
  {
    id: "pretraining",
    index: "04",
    eyebrow: "APPRENTISSAGE AUTO-SUPERVISÉ",
    title: "Le pré-entraînement",
    subtitle: "Prédire, se tromper, s’ajuster.",
    body: "Le modèle masque ou décale la suite et tente de prédire le prochain token. L’erreur revient à travers le réseau pour ajuster des milliards de paramètres.",
    insight: "Le savoir émerge comme effet secondaire d’un objectif simple répété à une échelle gigantesque.",
    ioLabel: "GRADIENT ACTIF",
    payload: ["loss: 2.31", "∂L/∂w", "batch 8 192", "epoch 0.7"],
    entity: "star",
    entityLabel: "Étoile d’entraînement",
    entityInfo: "L’énergie représente le calcul. Le gradient indique dans quelle direction modifier chaque paramètre pour réduire l’erreur future.",
    accent: "#ffca7a",
    x: -29,
  },
  {
    id: "alignment",
    index: "05",
    eyebrow: "POST-ENTRAÎNEMENT",
    title: "L’alignement",
    subtitle: "Rendre le modèle utile et sûr.",
    body: "Des exemples experts, des préférences humaines et des évaluations de sûreté orientent le modèle vers des réponses plus utiles, honnêtes et maîtrisées.",
    insight: "Le pré-entraînement apprend ce qui est probable. L’alignement affine ce qui est souhaitable.",
    ioLabel: "POLITIQUE ALIGNÉE",
    payload: ["SFT", "préférences", "récompense", "sécurité"],
    entity: "planet",
    entityLabel: "Planète des préférences",
    entityInfo: "Les trajectoires lumineuses sont des réponses candidates classées. Le modèle apprend à privilégier celles qui satisfont les critères humains.",
    accent: "#ff8fd8",
    x: 30,
  },
  {
    id: "inference",
    index: "06",
    eyebrow: "INFÉRENCE",
    title: "Le prompt entre en scène",
    subtitle: "Le modèle est entraîné. Il peut répondre.",
    body: "Votre demande est tokenisée puis traverse le réseau. Le modèle produit des logits : un score pour chaque token possible du vocabulaire.",
    insight: "Le modèle ne récupère pas une phrase stockée : il recalcule une distribution de possibilités à chaque nouveau token.",
    ioLabel: "LOGITS / VOCAB",
    payload: ["lune 31%", "monde 18%", "silence 7%"],
    entity: "portal",
    entityLabel: "Portail d’inférence",
    entityInfo: "L’inférence est le trajet avant. Contrairement à l’entraînement, les poids ne changent plus : seul le contexte courant évolue.",
    accent: "#78b8ff",
    x: -31,
  },
  {
    id: "generation",
    index: "07",
    eyebrow: "ÉCHANTILLONNAGE",
    title: "La génération",
    subtitle: "Un choix, puis un autre — jusqu’à l’idée.",
    body: "Température, top-p et contraintes transforment les scores en choix. Le token retenu rejoint le contexte et le cycle recommence, à grande vitesse.",
    insight: "Générer, c’est avancer dans un arbre de possibles — de manière guidée, mais jamais totalement écrite d’avance.",
    ioLabel: "SÉQUENCE GÉNÉRÉE",
    payload: ["temp: 0.7", "top-p: 0.92", "+ 164 tokens"],
    entity: "galaxy",
    entityLabel: "Galaxie des possibles",
    entityInfo: "Chaque bras représente une suite plausible. L’échantillonnage choisit une trajectoire et transforme une distribution en création concrète.",
    accent: "#75ffe0",
    x: 28,
  },
];

function EntityVisual({ type }: { type: string }) {
  if (type === "asteroids") return <div className="asteroid-cluster"><i /><i /><i /><i /><i /></div>;
  if (type === "constellation") return <div className="constellation"><i /><i /><i /><i /><i /><b /><b /><b /></div>;
  if (type === "station") return <div className="station"><i /><i /><i /><i /><span /></div>;
  return <div className={`entity-shape ${type}`}><i /><i /><span /></div>;
}

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const lastActive = useRef(0);
  const raf = useRef<number | null>(null);
  const current = stages[active];

  const ping = useCallback(() => {
    if (!sound) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(260 + active * 38, ctx.currentTime);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + 0.5);
    } catch { /* Le son reste un enrichissement facultatif. */ }
  }, [active, sound]);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const nextActive = Math.min(stages.length - 1, Math.round(nextProgress * (stages.length - 1)));
      setProgress(nextProgress);
      setActive(nextActive);
      setIntroGone(window.scrollY > 80);
      raf.current = null;
    };
    const onScroll = () => { if (raf.current === null) raf.current = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  useEffect(() => {
    if (lastActive.current !== active) { lastActive.current = active; ping(); }
  }, [active, ping]);

  const stageProgress = progress * (stages.length - 1);
  const worldStyle = useMemo(() => ({ "--journey": progress } as React.CSSProperties), [progress]);

  const goTo = (index: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * (index / (stages.length - 1)), behavior: "smooth" });
  };

  return (
    <main className="experience" style={{ ...worldStyle, "--stage-accent": current.accent } as React.CSSProperties}>
      <div className="space" aria-hidden="true"><div className="stars stars-a" /><div className="stars stars-b" /><div className="nebula" /><div className="flight-lines" /></div>

      <header className="topbar">
        <button className="brand" onClick={() => goTo(0)} aria-label="Revenir au début"><span className="brand-mark" /><span>IO / ODYSSÉE</span></button>
        <div className="chapter-readout"><span>{current.index}</span><p>{current.eyebrow}</p></div>
        <div className="top-actions">
          <button className="icon-button help-button" type="button" onClick={() => setHelpOpen(!helpOpen)} aria-expanded={helpOpen} aria-label="Mode d’emploi">?</button>
          <button className={`icon-button sound ${sound ? "is-on" : ""}`} type="button" onClick={() => setSound(!sound)} aria-pressed={sound} aria-label={sound ? "Désactiver le son" : "Activer le son"}><span /><span /><span /></button>
        </div>
      </header>

      {helpOpen && <aside className="help-popover"><span className="micro-label">COMMANDES</span><strong>Explorez à votre rythme</strong><p>Faites défiler pour voyager. Survolez IO et chaque astre pour révéler leur rôle. Utilisez la carte à droite pour sauter entre les étapes.</p><button onClick={() => setHelpOpen(false)}>COMPRIS</button></aside>}

      <div className="fixed-scene">
        <div className={`intro-lockup ${introGone ? "is-gone" : ""}`}>
          <p>UNE ODYSSÉE INTERACTIVE AU CŒUR DE L’IA</p>
          <h1>De la donnée<br />à <em>l’imaginaire.</em></h1>
          <span>Après le machine learning, découvrez la mécanique des IA génératives.</span>
        </div>

        <div className="world" aria-label="Entités du voyage">
          {stages.map((stage, index) => {
            const distance = index - stageProgress;
            const y = distance * 78;
            const scale = Math.max(.35, 1 - Math.abs(distance) * .14);
            const opacity = Math.max(0, 1 - Math.abs(distance) * .48);
            return (
              <button
                key={stage.id}
                className={`cosmic-entity entity-${stage.entity} ${active === index ? "is-active" : ""}`}
                style={{ "--entity-x": `${stage.x}vw`, "--entity-y": `${y}vh`, "--entity-scale": scale, "--entity-opacity": opacity, "--entity-accent": stage.accent } as React.CSSProperties}
                onClick={() => goTo(index)}
                aria-label={`${stage.entityLabel} — ${stage.entityInfo}`}
              >
                <EntityVisual type={stage.entity} />
                <span className="entity-index">{stage.index}</span>
                <span className="entity-tooltip"><small>ENTITÉ · {stage.eyebrow}</small><strong>{stage.entityLabel}</strong><span>{stage.entityInfo}</span><i>CLIQUER POUR REJOINDRE</i></span>
              </button>
            );
          })}
        </div>

        <button className="io-stage" aria-label={`Inspecter IO : ${current.ioLabel}`}>
          <span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="io-aura" />
          <span className="data-particles"><i /><i /><i /><i /><i /><i /></span>
          <span className="io-core"><i className="core-light" /><i className="core-light light-two" /><i className="core-light light-three" /></span>
          <span className="io-caption">IO · {current.ioLabel}</span>
          <span className="io-inspector"><small>CONTENU ACTUEL DE IO</small><strong>{current.ioLabel}</strong><span className="payload-grid">{current.payload.map(item => <i key={item}>{item}</i>)}</span><b>Survolez les astres pour comprendre leur action.</b></span>
        </button>

        <article className={`story-card side-${active % 2 ? "left" : "right"}`} key={current.id}>
          <div className="story-number">{current.index}</div>
          <span className="micro-label">{current.eyebrow}</span>
          <h2>{current.title}</h2>
          <h3>{current.subtitle}</h3>
          <p>{current.body}</p>
          <div className="insight"><span>À RETENIR</span><p>{current.insight}</p></div>
        </article>

        <nav className="journey-map" aria-label="Étapes du voyage">
          <span className="map-line"><i style={{ height: `${progress * 100}%` }} /></span>
          {stages.map((stage, index) => <button key={stage.id} onClick={() => goTo(index)} className={index === active ? "active" : ""} aria-label={`Aller à l’étape ${index + 1} : ${stage.title}`}><i /><span>{stage.title}</span></button>)}
        </nav>

        <div className={`scroll-cue ${introGone ? "compact" : ""}`} aria-hidden="true"><span>{active === stages.length - 1 ? "FIN DU VOYAGE" : "SCROLL POUR VOYAGER"}</span><i /></div>
        <div className="coordinates" aria-hidden="true"><span>LAT {(43.2965 + progress * 12.7).toFixed(4)}</span><span>DEPTH {(progress * 100).toFixed(1)}%</span></div>
      </div>

      <div className="scroll-track" aria-hidden="true">{stages.map(stage => <section key={stage.id} id={stage.id} />)}</div>
    </main>
  );
}
