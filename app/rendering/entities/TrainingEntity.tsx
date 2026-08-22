type EntityProps = { accent: string };

/** Depicts training as a hot, luminous source encircled by an optimization path. */
export function TrainingEntity({ accent }: EntityProps) {
  return (
    <group>
      <pointLight color={accent} intensity={3} distance={5} />
      <mesh>
        <icosahedronGeometry args={[0.7, 4]} />
        {/* HDR emission deliberately bypasses tone mapping so the bloom remains visible. */}
        <meshStandardMaterial color="#fff2c7" emissive={accent} emissiveIntensity={2.2} roughness={0.28} toneMapped={false} />
      </mesh>
      <mesh rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[1.08, 0.018, 8, 80]} />
        <meshBasicMaterial color={accent} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}
