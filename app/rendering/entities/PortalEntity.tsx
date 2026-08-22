type EntityProps = { accent: string };

/** Suggests inference as a narrowing passage through nested probability rings. */
export function PortalEntity({ accent }: EntityProps) {
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
