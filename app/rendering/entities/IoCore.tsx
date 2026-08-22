import { useMemo, useRef } from "react";
import { Trail } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stages } from "../../content/stages";
import { getJourneyX } from "../../domain/journey";
import { useExperienceStore } from "../../state/experienceStore";
import {
  ioAuraFragmentShader,
  ioAuraVertexShader,
  ioCoreFragmentShader,
  ioCoreVertexShader,
  ioParticleFragmentShader,
  ioParticleVertexShader,
} from "../shaders/ioCoreShaders";

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
    // Reading imperatively avoids re-rendering the Three.js scene on every animation frame.
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

export function IoCore() {
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
