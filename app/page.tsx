import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line, Sparkles, Stars } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Stage = {
  id: string; index: string; eyebrow: string; title: string; subtitle: string;
  body: string; insight: string; ioLabel: string; payload: string[];
  entityLabel: string; entityInfo: string; accent: string;
  position: [number, number, number]; mode: string;
};

const stages: Stage[] = [
  { id: "data", index: "00", eyebrow: "MATIÈRE PREMIÈRE", title: "La donnée brute", subtitle: "Avant de comprendre, il faut observer.", body: "Textes, images, sons et code arrivent sans mode d’emploi. Ils sont collectés, nettoyés et organisés pour devenir une matière exploitable.", insight: "Une IA n’apprend pas le monde : elle apprend une représentation du monde contenue dans ses données.", ioLabel: "SIGNAL BRUT", payload: ["texte", "image", "audio", "code"], entityLabel: "Nuage de corpus", entityInfo: "Un vaste ensemble d’exemples dont la diversité, la qualité et les biais dessinent déjà les limites du futur modèle.", accent: "#70fff0", position: [-3.6, .35, 0], mode: "PASSAGE LATÉRAL" },
  { id: "tokens", index: "01", eyebrow: "ENCODAGE", title: "Tokens & vecteurs", subtitle: "Transformer le langage en coordonnées.", body: "Le texte est découpé en tokens. Chaque token devient un vecteur — une longue liste de nombres — placé dans un espace où les sens proches se rapprochent.", insight: "Un embedding n’est pas une définition : c’est une position apprise par comparaison avec des milliards de contextes.", ioLabel: "VECTEUR 4 096D", payload: ["tok_1847", "[0.21, −0.08…]", "position: 128"], entityLabel: "Trou de ver vectoriel", entityInfo: "Ce passage symbolise le saut du langage lisible vers un espace mathématique à très haute dimension.", accent: "#8ee4ff", position: [3.35, -.2, -18], mode: "TRAVERSÉE" },
  { id: "attention", index: "02", eyebrow: "MISE EN RELATION", title: "L’attention", subtitle: "Choisir ce qui compte, maintenant.", body: "Chaque token compare ses clés, requêtes et valeurs à celles des autres. Le modèle pondère les relations utiles pour construire un contexte précis.", insight: "Dans « la banque près du fleuve », l’attention aide le modèle à préférer la rive à l’institution financière.", ioLabel: "CONTEXTE PONDÉRÉ", payload: ["Query", "Key", "Value", "score: 0.87"], entityLabel: "Constellation d’attention", entityInfo: "Chaque rayon est un poids d’attention. Les liens les plus lumineux influencent le plus la représentation courante.", accent: "#b49aff", position: [-3.15, .15, -36], mode: "CONNEXIONS" },
];

const ease = (n: number) => n < .5 ? 4 * n ** 3 : 1 - (-2 * n + 2) ** 3 / 2;

function Asteroids({ active }: { active: boolean }) {
  const rocks = useMemo(() => [[-.6,.75,.2,.62],[.55,.35,-.25,.42],[-.2,-.35,.3,.5],[.85,-.55,.15,.28],[-.85,-.3,-.2,.3],[.1,.1,-.4,.24]], []);
  return <Float speed={active ? 2 : 1} rotationIntensity={.55} floatIntensity={.4}>{rocks.map(([x,y,z,s], i) => <mesh key={i} position={[x,y,z]} scale={s} rotation={[i,i*.7,i*.25]}><icosahedronGeometry args={[1,1]} /><meshStandardMaterial color={i%2 ? "#27324a" : "#647086"} roughness={.83} metalness={.1} /></mesh>)}</Float>;
}

function Wormhole({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (group.current) group.current.rotation.z += d * (active ? .75 : .24); });
  return <group ref={group} rotation={[.08,.12,0]}>{[0,1,2,3].map(r => <mesh key={r} rotation={[r*.2,r*.12,r*.45]} scale={1-r*.12}><torusGeometry args={[1.06,.055+r*.012,16,96]} /><meshBasicMaterial color={r%2 ? "#8ee4ff" : "#6969ff"} transparent opacity={.9-r*.12} /></mesh>)}<mesh><ringGeometry args={[.34,.95,96]} /><meshBasicMaterial color="#5b75ff" transparent opacity={.12} side={THREE.DoubleSide} /></mesh><pointLight color="#79deff" intensity={active ? 12 : 7} distance={8} /></group>;
}

function Constellation({ active }: { active: boolean }) {
  const points = useMemo<[number,number,number][]>(() => [[-1,.1,0],[-.3,.9,.1],[.95,.42,-.1],[.35,-.85,.15],[-.75,-.65,-.12]], []);
  return <Float speed={1.1} rotationIntensity={.16} floatIntensity={.28}>{points.map((p,i) => <mesh key={i} position={p} scale={i===1 ? 1.4 : 1}><sphereGeometry args={[.09,20,20]} /><meshBasicMaterial color="#f5efff" /></mesh>)}{points.slice(1).map((p,i) => <Line key={i} points={[points[0],p]} color={i<2 ? "#cfb8ff" : "#7769d8"} lineWidth={active ? 1.8 : .8} transparent opacity={active ? .9 : .42} />)}<pointLight color="#b49aff" intensity={active ? 10 : 5} distance={7} /></Float>;
}

function Destination({ stage, index, actionable, active, onHover, onSelect }: { stage: Stage; index: number; actionable: boolean; active: boolean; onHover: (i:number|null)=>void; onSelect:(i:number)=>void }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { document.body.style.cursor = hovered && actionable ? "pointer" : "auto"; return () => { document.body.style.cursor = "auto"; }; }, [actionable, hovered]);
  useFrame((state, delta) => { if (!group.current) return; const s = THREE.MathUtils.damp(group.current.scale.x, hovered ? 1.12 : 1, 7, delta); group.current.scale.setScalar(s); group.current.rotation.y = Math.sin(state.clock.elapsedTime*.35+index)*.08; });
  return <group ref={group} position={stage.position} onPointerEnter={e => { e.stopPropagation(); setHovered(true); onHover(index); }} onPointerLeave={() => { setHovered(false); onHover(null); }} onClick={e => { e.stopPropagation(); if (actionable) onSelect(index); }}>
    {index===0 && <Asteroids active={active||hovered} />}{index===1 && <Wormhole active={active||hovered} />}{index===2 && <Constellation active={active||hovered} />}
    <mesh visible={false}><sphereGeometry args={[1.45,16,16]} /><meshBasicMaterial /></mesh>
    {(actionable||hovered) && <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.55,.012,8,80]} /><meshBasicMaterial color={stage.accent} transparent opacity={hovered ? .9 : .3} /></mesh>}
  </group>;
}

function IO({ accent, travelling }: { accent:string; travelling:boolean }) {
  const group = useRef<THREE.Group>(null); const rings = useRef<THREE.Group>(null); const { camera } = useThree();
  useFrame((state,delta) => { if (!group.current||!rings.current) return; group.current.position.copy(camera.position).add(new THREE.Vector3(0,-.05,-4)); group.current.quaternion.copy(camera.quaternion); rings.current.rotation.z += delta*(travelling?2.9:.48); group.current.scale.setScalar(1+Math.sin(state.clock.elapsedTime*2.2)*.025+(travelling?.12:0)); });
  return <group ref={group} renderOrder={4}><pointLight color={accent} intensity={travelling?18:9} distance={7} /><mesh><sphereGeometry args={[.45,48,48]} /><meshPhysicalMaterial color="#516cff" emissive={accent} emissiveIntensity={.55} roughness={.16} metalness={.28} clearcoat={1} /></mesh><mesh scale={1.18}><sphereGeometry args={[.45,32,32]} /><meshBasicMaterial color={accent} transparent opacity={.08} side={THREE.BackSide} /></mesh><group ref={rings}><mesh rotation={[1.1,.25,0]}><torusGeometry args={[.72,.012,8,80]} /><meshBasicMaterial color={accent} transparent opacity={.75} /></mesh><mesh rotation={[.35,1.15,.4]}><torusGeometry args={[.9,.008,8,80]} /><meshBasicMaterial color="#7584ff" transparent opacity={.38} /></mesh></group><Sparkles count={travelling?34:16} scale={travelling?2.7:1.65} size={2.3} speed={.75} color={accent} /></group>;
}

function RailCamera({ target, travelling, reducedMotion, onArrive }: { target:number; travelling:boolean; reducedMotion:boolean; onArrive:()=>void }) {
  const { camera } = useThree(); const travel = useRef({from:8,to:8,started:0,target:0,running:false});
  useEffect(() => { if (travelling) travel.current = { from:camera.position.z, to:stages[target].position[2]+8, started:performance.now(), target, running:true }; }, [camera,target,travelling]);
  useFrame(() => { const t=travel.current; if(!t.running)return; const duration=reducedMotion?320:2700; const raw=Math.min(1,(performance.now()-t.started)/duration); const p=reducedMotion?raw:ease(raw); camera.position.z=THREE.MathUtils.lerp(t.from,t.to,p); camera.position.x=reducedMotion?0:Math.sin(p*Math.PI)*(t.target%2?.42:-.42); camera.lookAt(camera.position.x*.18,0,camera.position.z-10); if(raw===1){t.running=false;camera.position.x=0;camera.lookAt(0,0,camera.position.z-10);onArrive();} }); return null;
}

function Scene({ active,target,travelling,reducedMotion,hovered,setHovered,onSelect,onArrive }:{active:number;target:number;travelling:boolean;reducedMotion:boolean;hovered:number|null;setHovered:(i:number|null)=>void;onSelect:(i:number)=>void;onArrive:()=>void}) {
  return <Canvas dpr={[1,1.7]} camera={{fov:48,near:.1,far:120,position:[0,0,8]}} gl={{antialias:true,alpha:false}}><color attach="background" args={["#02030a"]}/><fog attach="fog" args={["#02030a",14,68]}/><ambientLight intensity={.38}/><directionalLight position={[3,4,5]} intensity={1.6} color="#b9d9ff"/><Stars radius={72} depth={60} count={1800} factor={2.8} saturation={.18} fade speed={travelling?2.5:.25}/><Sparkles count={80} scale={[24,14,58]} size={1.25} speed={travelling?1.5:.18} opacity={.32} color="#688cff"/><Suspense fallback={null}>{stages.map((s,i)=><Destination key={s.id} stage={s} index={i} active={i===active||i===hovered} actionable={!travelling&&i===active+1} onHover={setHovered} onSelect={onSelect}/>)}<IO accent={stages[target].accent} travelling={travelling}/></Suspense><RailCamera target={target} travelling={travelling} reducedMotion={reducedMotion} onArrive={onArrive}/></Canvas>;
}

export default function Home() {
  const [active,setActive]=useState(0), [target,setTarget]=useState(0), [maxUnlocked,setMaxUnlocked]=useState(0);
  const [phase,setPhase]=useState<"idle"|"preview"|"travelling"|"arrived">("idle");
  const [hovered,setHovered]=useState<number|null>(null), [inspectIo,setInspectIo]=useState(false), [helpOpen,setHelpOpen]=useState(false), [sound,setSound]=useState(false), [reducedMotion,setReducedMotion]=useState(false);
  const current=stages[active], inspected=hovered===null?null:stages[hovered], travelling=phase==="travelling";
  useEffect(()=>{const m=window.matchMedia("(prefers-reduced-motion: reduce)");const sync=()=>setReducedMotion(m.matches);sync();m.addEventListener("change",sync);return()=>m.removeEventListener("change",sync);},[]);
  const ping=useCallback((frequency:number)=>{if(!sound)return;try{const AudioContextClass=window.AudioContext||(window as typeof window&{webkitAudioContext:typeof AudioContext}).webkitAudioContext;const context=new AudioContextClass(),oscillator=context.createOscillator(),gain=context.createGain();oscillator.type="sine";oscillator.frequency.setValueAtTime(frequency,context.currentTime);gain.gain.setValueAtTime(.035,context.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.65);oscillator.connect(gain).connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.65);}catch{/* facultatif */}},[sound]);
  const goTo=useCallback((index:number)=>{if(travelling||index<0||index>maxUnlocked+1||index>=stages.length||index===active)return;setHovered(null);setInspectIo(false);setTarget(index);setPhase("travelling");ping(320+index*70);},[active,maxUnlocked,ping,travelling]);
  const arrive=useCallback(()=>{setActive(target);setMaxUnlocked(v=>Math.max(v,target));setPhase("arrived");ping(520+target*65);window.setTimeout(()=>setPhase("idle"),reducedMotion?80:500);},[ping,reducedMotion,target]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==="ArrowRight")goTo(active+1);if(e.key==="ArrowLeft"&&!travelling&&active>0)goTo(active-1);if(e.key==="Escape"){setHelpOpen(false);setInspectIo(false);}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[active,goTo,travelling]);
  const updateHover=(index:number|null)=>{setHovered(index);if(!travelling)setPhase(index===active+1?"preview":"idle");};
  return <main className={`experience phase-${phase}`} style={{"--stage-accent":stages[target].accent} as React.CSSProperties}>
    <div className="scene" aria-label="Voyage 3D interactif au cœur de l’intelligence artificielle"><Scene active={active} target={target} travelling={travelling} reducedMotion={reducedMotion} hovered={hovered} setHovered={updateHover} onSelect={goTo} onArrive={arrive}/></div><div className="vignette" aria-hidden="true"/>
    <header className="topbar"><button className="brand" onClick={()=>!travelling&&goTo(0)} aria-label="Revenir au début"><span className="brand-mark"/><span>IO / ODYSSÉE</span><small>PROTOTYPE 3D</small></button><div className="chapter-readout" aria-live="polite"><span>{current.index}</span><p>{current.eyebrow}</p></div><div className="top-actions"><button className="icon-button" onClick={()=>setHelpOpen(v=>!v)} aria-expanded={helpOpen} aria-label="Mode d’emploi">?</button><button className={`icon-button sound ${sound?"is-on":""}`} onClick={()=>setSound(v=>!v)} aria-pressed={sound} aria-label={sound?"Désactiver le son":"Activer le son"}><i/><i/><i/></button></div></header>
    {helpOpen&&<aside className="popover help-popover"><span className="micro-label">COMMANDES</span><strong>Voyagez sur les rails</strong><p>Survolez la destination lointaine, puis cliquez pour voyager. Les flèches du clavier et les boutons de navigation offrent la même expérience.</p><p>Sur mobile, touchez une entité pour l’inspecter puis utilisez « Voyager ».</p><button onClick={()=>setHelpOpen(false)}>COMPRIS</button></aside>}
    <article className="story-card" key={current.id}><div className="story-index">ÉTAPE {current.index}</div><span className="micro-label">{current.eyebrow}</span><h1>{current.title}</h1><h2>{current.subtitle}</h2><p>{current.body}</p><div className="insight"><span>À RETENIR</span><p>{current.insight}</p></div></article>
    <button className={`io-inspector-trigger ${inspectIo?"is-open":""}`} onClick={()=>setInspectIo(v=>!v)} aria-expanded={inspectIo}><span>IO</span><i/>{current.ioLabel}</button>
    {inspectIo&&<aside className="popover io-panel"><span className="micro-label">CONTENU ACTUEL DE IO</span><strong>{current.ioLabel}</strong><div className="payload-grid">{current.payload.map(item=><i key={item}>{item}</i>)}</div><p>Ces données évoluent à chaque destination.</p></aside>}
    {inspected&&<aside className="entity-card" aria-live="polite"><div><span className="micro-label">ENTITÉ · {inspected.mode}</span><strong>{inspected.entityLabel}</strong><p>{inspected.entityInfo}</p></div>{hovered===active+1&&!travelling&&<button onClick={()=>goTo(hovered)}>VOYAGER VERS {inspected.index}<span>→</span></button>}</aside>}
    {travelling&&<div className="travel-status" role="status"><span>IO ACCUMULE L’ÉNERGIE</span><i><b/></i><strong>DESTINATION {stages[target].index}</strong></div>}
    <nav className="journey-map" aria-label="Carte du voyage"><span className="map-track"><i style={{width:`${maxUnlocked/(stages.length-1)*100}%`}}/></span>{stages.map((s,i)=><button key={s.id} className={`${i===active?"active":""} ${i<=maxUnlocked?"unlocked":""}`} disabled={travelling||i>maxUnlocked||i===active} onClick={()=>goTo(i)} aria-label={`${i<=maxUnlocked?"Aller":"Étape verrouillée"} : ${s.title}`}><i/><span>{s.index}</span><small>{s.title}</small></button>)}</nav>
    <div className="bottom-controls"><button onClick={()=>goTo(active-1)} disabled={travelling||active===0} aria-label="Étape précédente">← <span>PRÉCÉDENT</span></button><p>{active===stages.length-1?"TRANCHE VERTICALE TERMINÉE":travelling?"VOYAGE EN COURS":"PROCHAINE ENTITÉ VISIBLE AU LOIN"}</p><button onClick={()=>goTo(active+1)} disabled={travelling||active===stages.length-1}><span>SUIVANT</span> →</button></div>
  </main>;
}
