import { useMemo } from "react";
import * as THREE from "three";

type EntityProps = { accent: string };

/** Arranges possible outputs along three deterministic arms instead of randomizing every render. */
export function GalaxyEntity({ accent }: EntityProps) {
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
