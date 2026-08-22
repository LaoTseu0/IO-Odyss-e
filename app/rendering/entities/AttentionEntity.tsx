import { useMemo } from "react";
import * as THREE from "three";
import { useExperienceStore } from "../../state/experienceStore";

type EntityProps = { accent: string };
type EdgeProps = {
  from: THREE.Vector3Tuple;
  to: THREE.Vector3Tuple;
  opacity: number;
  color: string;
};

const attentionNodes: THREE.Vector3Tuple[] = [
  [-1.15, 0.2, 0], [-0.55, 0.82, 0.05], [0.05, 0.1, 0.35],
  [0.72, 0.68, 0], [1.12, -0.25, 0.1], [-0.3, -0.78, -0.1],
];

/** Builds one explicit 3D connection so its opacity can carry an attention weight. */
function Edge({ from, to, opacity, color }: EdgeProps) {
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]),
    [from, to],
  );

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

/** Turns the selected sentence context into visible connection strengths. */
export function AttentionEntity({ accent }: EntityProps) {
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
