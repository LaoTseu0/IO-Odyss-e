import { type ComponentType, useMemo } from "react";
import * as THREE from "three";
import type { StageEntityId } from "../../domain/stage";
import { useExperienceStore } from "../../state/experienceStore";

type EntityProps = { accent: string };

function CorpusEntity({ accent }: EntityProps) {
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

function VectorEntity({ accent }: EntityProps) {
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

function AttentionEntity({ accent }: EntityProps) {
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

function TransformerEntity({ accent }: EntityProps) {
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

function TrainingEntity({ accent }: EntityProps) {
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

function AlignmentEntity({ accent }: EntityProps) {
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

function PortalEntity({ accent }: EntityProps) {
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

function GalaxyEntity({ accent }: EntityProps) {
  const positions = useMemo(() => {
    const count = 500;
    const data = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const arm = index % 3;
      const radius = (index / count) * 1.5;
      const angle = radius * 7 + arm * ((Math.PI * 2) / 3);
      data[index * 3] = Math.cos(angle) * radius;
      data[index * 3 + 1] = Math.sin(index * 91.17) * 0.12 * (radius + 0.2);
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

const entityById: Record<StageEntityId, ComponentType<EntityProps>> = {
  corpus: CorpusEntity,
  vector: VectorEntity,
  attention: AttentionEntity,
  transformer: TransformerEntity,
  training: TrainingEntity,
  alignment: AlignmentEntity,
  portal: PortalEntity,
  galaxy: GalaxyEntity,
};

export function StageEntity({ entityId, accent }: EntityProps & { entityId: StageEntityId }) {
  const EntityComponent = entityById[entityId];
  return <EntityComponent accent={accent} />;
}
