import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stages } from "./experience/stages";
import { useExperienceStore } from "./experience/store";

const ExperienceCanvas = lazy(() =>
  import("./rendering/ExperienceCanvas").then((module) => ({ default: module.ExperienceCanvas })),
);

gsap.registerPlugin(ScrollTrigger, useGSAP);

function AttentionLab() {
  const mode = useExperienceStore((state) => state.attentionMode);
  const setMode = useExperienceStore((state) => state.setAttentionMode);
  const river = mode === "river";

  return (
    <aside className="attention-lab" aria-labelledby="attention-lab-title">
      <span className="micro-label">LABORATOIRE · CONTEXTE</span>
      <h3 id="attention-lab-title">Que signifie « banque » ?</h3>
      <p className="lab-sentence">La banque est près <strong>{river ? "du fleuve" : "du marché financier"}</strong>.</p>
      <div className="context-switch" role="group" aria-label="Choisir le contexte de la phrase">
        <button type="button" className={river ? "active" : ""} aria-pressed={river} onClick={() => setMode("river")}>Fleuve</button>
        <button type="button" className={!river ? "active" : ""} aria-pressed={!river} onClick={() => setMode("money")}>Finance</button>
      </div>
      <div className="lab-result" aria-live="polite">
        <span>INTERPRÉTATION DOMINANTE</span>
        <strong>{river ? "La rive d'un cours d'eau" : "Une institution financière"}</strong>
        <div className="weight-meter" aria-label={`Confiance ${river ? 87 : 84} pour cent`}><i style={{ width: `${river ? 87 : 84}%` }} /></div>
        <small>{river ? "87 %" : "84 %"} · les liens lumineux montrent les tokens les plus influents</small>
      </div>
    </aside>
  );
}

export default function Home() {
  const experienceRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLElement>(null);
  const coordinatesRef = useRef<HTMLSpanElement>(null);
  const [sound, setSound] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const active = useExperienceStore((state) => state.activeStage);
  const setJourney = useExperienceStore((state) => state.setJourney);
  const setReducedMotion = useExperienceStore((state) => state.setReducedMotion);
  const current = stages[active];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [setReducedMotion]);

  useGSAP(() => {
    if (!experienceRef.current) return;
    const trigger = ScrollTrigger.create({
      trigger: experienceRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: ({ progress }) => {
        const nextActive = Math.min(stages.length - 1, Math.round(progress * (stages.length - 1)));
        experienceRef.current?.style.setProperty("--journey", String(progress));
        if (progressBarRef.current) progressBarRef.current.style.width = `${progress * 100}%`;
        if (coordinatesRef.current) coordinatesRef.current.textContent = `DEPTH ${(progress * 100).toFixed(1)}%`;
        setIntroGone(progress > 0.025);
        setJourney(progress, nextActive);
      },
    });
    return () => trigger.kill();
  }, { scope: experienceRef, dependencies: [setJourney] });

  const ping = useCallback((stage: number) => {
    if (!sound) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(250 + stage * 36, context.currentTime);
      gain.gain.setValueAtTime(0.025, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.45);
    } catch {
      // Audio is an optional enhancement.
    }
  }, [sound]);

  const previousActive = useRef(active);
  useEffect(() => {
    if (previousActive.current !== active) {
      previousActive.current = active;
      ping(active);
    }
  }, [active, ping]);

  const goTo = (index: number) => {
    document.getElementById(stages[index].id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <main ref={experienceRef} className="experience" style={{ "--stage-accent": current.accent } as React.CSSProperties}>
      <a className="skip-link" href={`#${current.id}-content`}>Passer à l’explication</a>
      <Suspense fallback={<div className="canvas-layer canvas-loading" aria-hidden="true"><span>INITIALISATION DE L’ESPACE</span></div>}>
        <ExperienceCanvas />
      </Suspense>
      <div className="atmosphere" aria-hidden="true" />

      <header className="topbar">
        <button className="brand" onClick={() => goTo(0)} aria-label="Revenir au début"><span className="brand-mark" /><span>IO / ODYSSÉE</span></button>
        <div className="chapter-readout" aria-hidden="true"><span>{current.index}</span><p>{current.eyebrow}</p></div>
        <div className="top-actions">
          <span className="render-badge"><i /> TEMPS RÉEL</span>
          <button className="icon-button" type="button" onClick={() => setHelpOpen((open) => !open)} aria-expanded={helpOpen} aria-label="Mode d’emploi">?</button>
          <button className={`icon-button sound ${sound ? "is-on" : ""}`} type="button" onClick={() => setSound((on) => !on)} aria-pressed={sound} aria-label={sound ? "Désactiver le son" : "Activer le son"}><span /><span /><span /></button>
        </div>
      </header>

      {helpOpen && (
        <aside className="help-popover">
          <span className="micro-label">COMMANDES</span><strong>Explorez à votre rythme</strong>
          <p>Faites défiler pour traverser la scène 3D. La carte permet de rejoindre une étape. Dans le chapitre Attention, modifiez le contexte pour observer les liens se recomposer.</p>
          <button onClick={() => setHelpOpen(false)}>COMPRIS</button>
        </aside>
      )}

      <div className={`intro-lockup ${introGone ? "is-gone" : ""}`} aria-hidden={introGone}>
        <p>UNE ODYSSÉE INTERACTIVE AU CŒUR DE L’IA</p>
        <h1>De la donnée<br />à <em>l’imaginaire.</em></h1>
        <span>Une information traverse les mécanismes de l’IA générative. Suivez sa métamorphose.</span>
      </div>

      <div className="scene-hud">
        <div className="io-readout" aria-hidden="true">
          <span>IO · CONTENU ACTUEL</span><strong>{current.ioLabel}</strong>
          <div>{current.payload.map((item) => <i key={item}>{item}</i>)}</div>
        </div>

        <article className={`story-card side-${active % 2 ? "left" : "right"}`} key={current.id} aria-hidden="true">
          <div className="story-number">{current.index}</div><span className="micro-label">{current.eyebrow}</span>
          <h2>{current.title}</h2><h3>{current.subtitle}</h3><p>{current.body}</p>
          <div className="insight"><span>À RETENIR</span><p>{current.insight}</p></div>
        </article>

        {active === 2 && <AttentionLab />}

        <nav className="journey-map" aria-label="Étapes du voyage">
          <span className="map-line" aria-hidden="true"><i ref={progressBarRef} /></span>
          {stages.map((stage, index) => (
            <button key={stage.id} onClick={() => goTo(index)} className={index === active ? "active" : ""} aria-current={index === active ? "step" : undefined} aria-label={`Aller à l'étape ${index + 1} : ${stage.title}`}><i /><span>{stage.title}</span></button>
          ))}
        </nav>

        <div className={`scroll-cue ${introGone ? "compact" : ""}`} aria-hidden="true"><span>{active === stages.length - 1 ? "FIN DU VOYAGE" : "SCROLL POUR AVANCER →"}</span><i /></div>
        <div className="coordinates" aria-hidden="true"><span>WEBGL · AXE X</span><span ref={coordinatesRef}>DEPTH 0.0%</span></div>
      </div>

      <div className="scroll-track">
        {stages.map((stage) => (
          <section key={stage.id} id={stage.id} aria-labelledby={`${stage.id}-title`}>
            <div className="sr-only" id={`${stage.id}-content`}>
              <p>{stage.eyebrow}</p><h2 id={`${stage.id}-title`}>{stage.title}</h2><h3>{stage.subtitle}</h3>
              <p>{stage.body}</p><p>À retenir : {stage.insight}</p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
