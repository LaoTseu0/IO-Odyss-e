type EntityProps = { accent: string };

/** Represents the aligned policy as a stable planet guided by a preference ring. */
export function AlignmentEntity({ accent }: EntityProps) {
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
