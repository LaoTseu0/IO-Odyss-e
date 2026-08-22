type EntityProps = { accent: string };

/** Uses nested rings to evoke passage into a high-dimensional vector space. */
export function VectorEntity({ accent }: EntityProps) {
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
