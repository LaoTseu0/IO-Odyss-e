import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Trail } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer as ThreeEffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
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

const ioNoiseGlsl = /* glsl */ `
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float valueNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 local = fract(p);
    local = local * local * (3.0 - 2.0 * local);
    float n000 = hash31(cell + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(cell + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(cell + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(cell + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(cell + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(cell + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(cell + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(cell + vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(n000, n100, local.x), mix(n010, n110, local.x), local.y),
      mix(mix(n001, n101, local.x), mix(n011, n111, local.x), local.y),
      local.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int octave = 0; octave < 4; octave++) {
      value += valueNoise(p) * amplitude;
      p = p * 2.03 + vec3(13.1, 7.7, 3.9);
      amplitude *= 0.48;
    }
    return value;
  }
`;

const ioCoreVertexShader = /* glsl */ `
  uniform float uTime;
  varying float vEnergy;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  ${ioNoiseGlsl}

  void main() {
    float slowNoise = fbm(normal * 3.15 + vec3(uTime * 0.24, -uTime * 0.17, uTime * 0.11));
    float current = sin((position.y + slowNoise * 0.65) * 11.0 - uTime * 2.1) * 0.5 + 0.5;
    float displacement = (slowNoise - 0.48) * 0.17 + current * 0.025;
    vec3 displaced = position + normal * displacement;
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vEnergy = clamp(slowNoise * 0.75 + current * 0.45, 0.0, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const ioCoreFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  varying float vEnergy;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(vWorldNormal, viewDirection), 0.0), 2.35);
    float veins = smoothstep(0.62, 0.9, sin(vEnergy * 16.0 - uTime * 2.4) * 0.5 + 0.5);
    float heartbeat = 0.88 + sin(uTime * 3.15) * 0.12;
    vec3 plasma = mix(uSecondaryColor, uColor, smoothstep(0.1, 0.9, vEnergy));
    vec3 hotCore = mix(plasma, vec3(1.0), 0.58 + veins * 0.35);
    vec3 hdrColor = hotCore * (0.74 + fresnel * 1.7 + veins * 0.62) * heartbeat;
    gl_FragColor = vec4(hdrColor, 1.0);
  }
`;

const ioAuraVertexShader = /* glsl */ `
  uniform float uTime;
  varying float vFlow;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  ${ioNoiseGlsl}

  void main() {
    float flow = fbm(normal * 3.7 + vec3(-uTime * 0.14, uTime * 0.21, uTime * 0.08));
    float wave = sin(normal.y * 13.0 + flow * 8.0 - uTime * 2.0);
    vec3 displaced = position + normal * ((flow - 0.5) * 0.16 + wave * 0.018);
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vFlow = flow + wave * 0.12;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const ioAuraFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  varying float vFlow;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(vWorldNormal, viewDirection)), 2.0);
    float filaments = smoothstep(0.66, 0.83, sin(vFlow * 22.0 - uTime * 2.8) * 0.5 + 0.5);
    float pulse = 0.76 + sin(uTime * 1.7 + vFlow * 5.0) * 0.24;
    vec3 color = mix(uSecondaryColor, uColor, vFlow) * (0.7 + fresnel * 1.55 + filaments * 0.95);
    float alpha = (fresnel * 0.26 + filaments * 0.11) * pulse;
    gl_FragColor = vec4(color, alpha);
  }
`;

const ioParticleVertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aSize;
  uniform float uTime;
  varying float vPulse;

  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    vec3 animated = position;
    float speed = 0.11 + aPhase * 0.18;
    animated.xz = rotate2d(uTime * speed + aPhase * 6.28318) * animated.xz;
    animated.xy = rotate2d(sin(uTime * 0.13 + aPhase * 4.0) * 0.42) * animated.xy;
    float flow = sin(uTime * 1.4 + aPhase * 18.0 + length(animated) * 5.0);
    animated += normalize(animated) * flow * 0.075;
    animated.y += sin(uTime * 0.7 + animated.x * 3.5 + aPhase * 9.0) * 0.07;
    vPulse = 0.48 + 0.52 * sin(uTime * 2.2 + aPhase * 21.0);
    vec4 viewPosition = modelViewMatrix * vec4(animated, 1.0);
    gl_PointSize = aSize * (0.68 + vPulse * 0.52) * (8.0 / -viewPosition.z);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const ioParticleFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  varying float vPulse;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float halo = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    float core = 1.0 - smoothstep(0.0, 0.13, distanceToCenter);
    vec3 color = mix(uSecondaryColor, uColor, vPulse) * 1.1 + core * vec3(1.15);
    gl_FragColor = vec4(color, halo * (0.45 + vPulse * 0.55));
  }
`;

function IoEnergyParticles() {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, phases, sizes } = useMemo(() => {
    const count = 260;
    const particlePositions = new Float32Array(count * 3);
    const particlePhases = new Float32Array(count);
    const particleSizes = new Float32Array(count);
    let seed = 73;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let index = 0; index < count; index += 1) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const radius = 0.7 + Math.pow(random(), 1.55) * 1.25;
      particlePositions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      particlePositions[index * 3 + 1] = Math.cos(phi) * radius;
      particlePositions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
      particlePhases[index] = random();
      particleSizes[index] = 2.8 + Math.pow(random(), 3) * 7.2;
    }
    return { positions: particlePositions, phases: particlePhases, sizes: particleSizes };
  }, []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#70fff0") },
    uSecondaryColor: { value: new THREE.Color("#7772ff") },
  }), []);

  useFrame((state, delta) => {
    if (!points.current || !material.current) return;
    const { activeStage, reducedMotion } = useExperienceStore.getState();
    material.current.uniforms.uTime.value = reducedMotion ? 0.8 : state.clock.elapsedTime;
    material.current.uniforms.uColor.value.lerp(new THREE.Color(stages[activeStage].accent), Math.min(1, delta * 3));
    if (!reducedMotion) points.current.rotation.y += delta * 0.035;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={ioParticleVertexShader}
        fragmentShader={ioParticleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function IoOrbitingWisps() {
  const wisps = useRef<(THREE.Mesh | null)[]>([]);
  const colors = ["#d9fffb", "#817cff", "#70fff0"];

  useFrame((state) => {
    const reducedMotion = useExperienceStore.getState().reducedMotion;
    const time = reducedMotion ? 1.4 : state.clock.elapsedTime;
    wisps.current.forEach((wisp, index) => {
      if (!wisp) return;
      const angle = time * (0.46 + index * 0.08) + index * 2.18;
      const radius = 0.98 + index * 0.16;
      wisp.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.35 + index) * (0.48 + index * 0.08),
        Math.sin(angle) * radius * 0.66,
      );
    });
  });

  return (
    <group>
      {colors.map((color, index) => (
        <Trail
          key={color}
          width={0.72 - index * 0.11}
          length={7 + index * 1.5}
          decay={1.35}
          color={color}
          attenuation={(width) => width * width}
        >
          <mesh ref={(mesh) => { wisps.current[index] = mesh; }}>
            <sphereGeometry args={[0.045 + index * 0.008, 14, 14]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        </Trail>
      ))}
    </group>
  );
}

function IoCore() {
  const root = useRef<THREE.Group>(null);
  const livingCore = useRef<THREE.Group>(null);
  const coreMaterial = useRef<THREE.ShaderMaterial>(null);
  const auraMaterial = useRef<THREE.ShaderMaterial>(null);
  const coreUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#70fff0") },
    uSecondaryColor: { value: new THREE.Color("#6964ff") },
  }), []);
  const auraUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#70fff0") },
    uSecondaryColor: { value: new THREE.Color("#706aff") },
  }), []);

  useFrame((state, delta) => {
    const { activeStage, progress, reducedMotion } = useExperienceStore.getState();
    if (!root.current || !livingCore.current || !coreMaterial.current || !auraMaterial.current) return;
    const time = reducedMotion ? 1.4 : state.clock.elapsedTime;
    const accent = new THREE.Color(stages[activeStage].accent);
    const colorLerp = Math.min(1, delta * 3.2);
    coreMaterial.current.uniforms.uTime.value = time;
    auraMaterial.current.uniforms.uTime.value = time;
    coreMaterial.current.uniforms.uColor.value.lerp(accent, colorLerp);
    auraMaterial.current.uniforms.uColor.value.lerp(accent, colorLerp);
    root.current.position.x = getJourneyX(progress, stages.length);
    root.current.position.y = reducedMotion ? 0 : Math.sin(time * 0.64) * 0.09;
    if (!reducedMotion) {
      root.current.rotation.y += delta * 0.075;
      livingCore.current.rotation.y -= delta * 0.13;
      livingCore.current.rotation.z = Math.sin(time * 0.27) * 0.11;
      livingCore.current.scale.setScalar(1 + Math.sin(time * 3.15) * 0.025);
    }
  });

  return (
    <group ref={root} position={[0, 0, 1.1]} scale={0.54}>
      <group ref={livingCore}>
        <mesh>
          <icosahedronGeometry args={[0.52, 5]} />
          <shaderMaterial
            ref={coreMaterial}
            uniforms={coreUniforms}
            vertexShader={ioCoreVertexShader}
            fragmentShader={ioCoreFragmentShader}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.42}>
          <icosahedronGeometry args={[0.57, 5]} />
          <shaderMaterial
            ref={auraMaterial}
            uniforms={auraUniforms}
            vertexShader={ioAuraVertexShader}
            fragmentShader={ioAuraFragmentShader}
            side={THREE.DoubleSide}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={0.54}>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>
      <IoOrbitingWisps />
      <IoEnergyParticles />
      <pointLight color="#70fff0" intensity={3.8} distance={5.2} decay={2} />
      <pointLight color="#7772ff" intensity={1.8} distance={3.8} decay={2} position={[0.35, -0.18, 0.45]} />
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
      const entityScale = mobile ? 0.62 : 0.7;
      const targetScale = entityScale * Math.max(0.16, 1 - Math.abs(distance) * 0.52);
      group.scale.setScalar(targetScale);
      group.visible = Math.abs(distance) < 1.75;
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

function BloomPipeline() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const lastPixelRatio = useRef(0);
  const composer = useMemo(() => {
    const nextComposer = new ThreeEffectComposer(gl);
    nextComposer.addPass(new RenderPass(scene, camera));
    nextComposer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.5, 1.1));
    nextComposer.addPass(new OutputPass());
    return nextComposer;
  }, [camera, gl, scene]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.height, size.width]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame(() => {
    const pixelRatio = gl.getPixelRatio();
    if (lastPixelRatio.current !== pixelRatio) {
      lastPixelRatio.current = pixelRatio;
      composer.setPixelRatio(pixelRatio);
      composer.setSize(size.width, size.height);
    }
    composer.render();
  }, 1);

  return null;
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
          <BloomPipeline />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
