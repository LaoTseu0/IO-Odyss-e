import { Component, type ErrorInfo, type ReactNode, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { getJourneyX, HORIZONTAL_SPACING } from "../experience/journey";
import { stages } from "../experience/stages";
import { useExperienceStore } from "../experience/store";

type ErrorBoundaryProps = { children: ReactNode; fallback: ReactNode };
type ErrorBoundaryState = { failed: boolean };

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The 3D scene could not start", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function SeededStars({ count = 900 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    let seed = 13;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let index = 0; index < count; index += 1) {
      data[index * 3] = random() * 70 - 16;
      data[index * 3 + 1] = (random() - 0.5) * 30;
      data[index * 3 + 2] = -4 - random() * 16;
    }
    return data;
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current || useExperienceStore.getState().reducedMotion) return;
    points.current.rotation.y += delta * 0.006;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b9dfff" size={0.025} transparent opacity={0.72} sizeAttenuation />
    </points>
  );
}

function CorpusEntity({ accent }: { accent: string }) {
  const fragments = useMemo(
    () => [
      [-0.7, 0.15, 0], [-0.15, 0.65, -0.2], [0.55, 0.34, 0.1],
      [0.63, -0.42, -0.12], [-0.36, -0.55, 0.18], [0.05, -0.08, 0.4],
    ] as [number, number, number][],
    [],
  );
  return (
    <group>
      {fragments.map((position, index) => (
        <mesh key={position.join(":")} position={position} rotation={[index, index * 0.7, index * 0.3]} scale={0.18 + index * 0.025}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 2 ? "#334158" : accent} emissive={accent} emissiveIntensity={0.12} roughness={0.52} />
        </mesh>
      ))}
    </group>
  );
}

function VectorEntity({ accent }: { accent: string }) {
  return (
    <group rotation={[1.05, 0, 0.4]}>
      {[0, 1, 2].map((ring) => (
        <mesh key={ring} scale={1 - ring * 0.2} position-z={ring * 0.12}>
          <torusGeometry args={[0.78, 0.055, 12, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.9 - ring * 0.22} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshBasicMaterial color="#02030a" />
      </mesh>
    </group>
  );
}

const attentionNodes: [number, number, number][] = [
  [-1.15, 0.2, 0], [-0.55, 0.82, 0.05], [0.05, 0.1, 0.35], [0.72, 0.68, 0], [1.12, -0.25, 0.1], [-0.3, -0.78, -0.1],
];

function Edge({ from, to, opacity, color }: { from: THREE.Vector3Tuple; to: THREE.Vector3Tuple; opacity: number; color: string }) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]), [from, to]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

function AttentionEntity({ accent }: { accent: string }) {
  const mode = useExperienceStore((state) => state.attentionMode);
  const riverWeights = [0.18, 0.76, 0.9, 0.26, 0.64];
  const moneyWeights = [0.82, 0.34, 0.42, 0.88, 0.22];
  const weights = mode === "river" ? riverWeights : moneyWeights;

  return (
    <group>
      {attentionNodes.slice(1).map((position, index) => (
        <Edge key={`edge-${index}`} from={attentionNodes[0]} to={position} opacity={weights[index]} color={accent} />
      ))}
      {attentionNodes.map((position, index) => (
        <mesh key={position.join(":")} position={position} scale={index === 0 ? 0.18 : 0.1 + weights[Math.max(0, index - 1)] * 0.08}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshBasicMaterial color={index === 0 ? "#ffffff" : accent} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function TransformerEntity({ accent }: { accent: string }) {
  return (
    <group rotation={[0.45, 0.55, 0.15]}>
      {[0, 1, 2, 3].map((layer) => (
        <mesh key={layer} position={[0, 0, (layer - 1.5) * 0.34]} scale={1 - layer * 0.08}>
          <boxGeometry args={[1.3, 1.3, 0.07]} />
          <meshStandardMaterial color="#10142d" emissive={accent} emissiveIntensity={0.22 + layer * 0.08} wireframe={layer !== 3} />
        </mesh>
      ))}
    </group>
  );
}

function TrainingEntity({ accent }: { accent: string }) {
  return (
    <group>
      <pointLight color={accent} intensity={3} distance={5} />
      <mesh>
        <icosahedronGeometry args={[0.7, 4]} />
        <meshStandardMaterial color="#fff2c7" emissive={accent} emissiveIntensity={2.2} roughness={0.28} toneMapped={false} />
      </mesh>
      <mesh rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[1.08, 0.018, 8, 80]} />
        <meshBasicMaterial color={accent} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function AlignmentEntity({ accent }: { accent: string }) {
  return (
    <group rotation={[0.25, 0, -0.2]}>
      <mesh>
        <sphereGeometry args={[0.78, 48, 48]} />
        <meshStandardMaterial color="#3a1649" emissive={accent} emissiveIntensity={0.25} roughness={0.48} metalness={0.2} />
      </mesh>
      <mesh rotation={[1.25, 0.2, 0]}>
        <torusGeometry args={[1.12, 0.055, 12, 90]} />
        <meshBasicMaterial color={accent} transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

function PortalEntity({ accent }: { accent: string }) {
  return (
    <group rotation={[0.1, 0.35, 0]}>
      {[0, 1, 2, 3].map((ring) => (
        <mesh key={ring} rotation={[0, 0, ring * 0.3]} scale={1 - ring * 0.13}>
          <torusGeometry args={[0.92, 0.035, 10, 72]} />
          <meshBasicMaterial color={accent} transparent opacity={0.85 - ring * 0.14} />
        </mesh>
      ))}
    </group>
  );
}

function GalaxyEntity({ accent }: { accent: string }) {
  const positions = useMemo(() => {
    const count = 500;
    const data = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const arm = index % 3;
      const radius = (index / count) * 1.5;
      const angle = radius * 7 + arm * ((Math.PI * 2) / 3);
      data[index * 3] = Math.cos(angle) * radius;
      data[index * 3 + 1] = (Math.sin(index * 91.17) * 0.12) * (radius + 0.2);
      data[index * 3 + 2] = Math.sin(angle) * radius;
    }
    return data;
  }, []);
  return (
    <points rotation={[1.12, 0, 0.2]}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color={accent} size={0.035} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function Entity({ index, accent }: { index: number; accent: string }) {
  if (index === 0) return <CorpusEntity accent={accent} />;
  if (index === 1) return <VectorEntity accent={accent} />;
  if (index === 2) return <AttentionEntity accent={accent} />;
  if (index === 3) return <TransformerEntity accent={accent} />;
  if (index === 4) return <TrainingEntity accent={accent} />;
  if (index === 5) return <AlignmentEntity accent={accent} />;
  if (index === 6) return <PortalEntity accent={accent} />;
  return <GalaxyEntity accent={accent} />;
}

function IoCore() {
  const core = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state, delta) => {
    const { activeStage, progress, reducedMotion } = useExperienceStore.getState();
    if (!core.current || !material.current) return;
    const accent = new THREE.Color(stages[activeStage].accent);
    material.current.emissive.lerp(accent, Math.min(1, delta * 4));
    material.current.color.lerp(accent, Math.min(1, delta * 2));
    core.current.position.x = getJourneyX(progress, stages.length);
    if (!reducedMotion) {
      core.current.rotation.y += delta * 0.24;
      core.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
    }
  });
  return (
    <group ref={core} position={[0, 0, 1.1]}>
      <mesh>
        <icosahedronGeometry args={[0.42, 5]} />
        <meshStandardMaterial ref={material} color="#70fff0" emissive="#70fff0" emissiveIntensity={1.5} roughness={0.18} metalness={0.35} toneMapped={false} />
      </mesh>
      <mesh rotation={[1.1, 0.15, 0.4]}>
        <torusGeometry args={[0.72, 0.012, 8, 80]} />
        <meshBasicMaterial color="#b8fff8" transparent opacity={0.56} />
      </mesh>
      <mesh rotation={[0.3, 1.2, -0.2]}>
        <torusGeometry args={[0.9, 0.009, 8, 80]} />
        <meshBasicMaterial color="#8e8cff" transparent opacity={0.32} />
      </mesh>
      <pointLight color="#70fff0" intensity={2.4} distance={4.5} />
    </group>
  );
}

function JourneyWorld() {
  const stageGroups = useRef<(THREE.Group | null)[]>([]);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useFrame((_, delta) => {
    const { progress, reducedMotion } = useExperienceStore.getState();
    const stageProgress = progress * (stages.length - 1);
    const journeyX = getJourneyX(progress, stages.length);
    const mobile = size.width < 760;
    stageGroups.current.forEach((group, index) => {
      if (!group) return;
      const distance = index - stageProgress;
      const side = index % 2 === 0 ? 1 : -1;
      group.position.x = index * HORIZONTAL_SPACING;
      group.position.y = mobile ? 0.65 : side * 1.55;
      group.position.z = -Math.abs(distance) * 1.7;
      const targetScale = Math.max(0.22, 1 - Math.abs(distance) * 0.28);
      group.scale.setScalar(targetScale);
      group.visible = Math.abs(distance) < 2.25;
      group.rotation.y += reducedMotion ? 0 : delta * (0.1 + index * 0.012);
    });

    camera.position.set(journeyX, 0, mobile ? 10.8 : 9);
    camera.lookAt(journeyX, 0, 0);
  });

  return (
    <>
      <SeededStars count={size.width < 760 ? 500 : 900} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 5, 5]} intensity={1.25} color="#b8c8ff" />
      {stages.map((stage, index) => (
        <group
          key={stage.id}
          ref={(group) => { stageGroups.current[index] = group; }}
          position={[index * HORIZONTAL_SPACING, index % 2 === 0 ? 1.55 : -1.55, 0]}
        >
          <Entity index={index} accent={stage.accent} />
        </group>
      ))}
      <IoCore />
    </>
  );
}

function QualityController() {
  const setDpr = useThree((state) => state.setDpr);
  return (
    <PerformanceMonitor
      flipflops={2}
      onDecline={() => setDpr(1)}
      onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.5))}
    />
  );
}

function CanvasFallback() {
  return (
    <div className="canvas-fallback" role="status">
      <span>MODE ESSENTIEL</span>
      <p>La visualisation 3D n’est pas disponible. Le voyage et son contenu restent accessibles.</p>
    </div>
  );
}

export function ExperienceCanvas() {
  return (
    <div className="canvas-layer" aria-hidden="true">
      <WebGLErrorBoundary fallback={<CanvasFallback />}>
        <Canvas
          camera={{ fov: 42, near: 0.1, far: 80, position: [0, 0, 9] }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <fog attach="fog" args={["#02030a", 9, 31]} />
          <JourneyWorld />
          <QualityController />
          <AdaptiveDpr />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
