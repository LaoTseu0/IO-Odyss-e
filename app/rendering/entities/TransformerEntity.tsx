type EntityProps = { accent: string };

/** Stacks successive processing layers while preserving their depth at a glance. */
export function TransformerEntity({ accent }: EntityProps) {
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
