import { useMemo } from "react";

type EntityProps = { accent: string };

/** Represents raw, unstructured data as a stable cloud of contrasting fragments. */
export function CorpusEntity({ accent }: EntityProps) {
  // Fixed coordinates keep the composition deterministic across renders.
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
