import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stages } from "../content/stages";
import { getJourneyX, HORIZONTAL_SPACING } from "../domain/journey";
import { useExperienceStore } from "../state/experienceStore";
import { IoCore } from "./entities/IoCore";
import { StageEntity } from "./entities/StageEntity";

function SeededStars({ count = 900 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    let seed = 13;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let index = 0; index < count; index += 1) {
      data[index * 3] = random() * 70 - 16;
      data[index * 3 + 1] = (random() - 0.5) * 30;
      data[index * 3 + 2] = -4 - random() * 16;
    }
    return data;
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current || useExperienceStore.getState().reducedMotion) return;
    points.current.rotation.y += delta * 0.006;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b9dfff" size={0.025} transparent opacity={0.72} sizeAttenuation />
    </points>
  );
}

export function JourneyWorld() {
  const stageGroups = useRef<(THREE.Group | null)[]>([]);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useFrame((_, delta) => {
    // The frame loop reads the store directly so scrolling does not trigger React renders.
    const { progress, reducedMotion } = useExperienceStore.getState();
    const stageProgress = progress * (stages.length - 1);
    const journeyX = getJourneyX(progress, stages.length);
    const mobile = size.width < 760;
    stageGroups.current.forEach((group, index) => {
      if (!group) return;
      const distance = index - stageProgress;
      const side = index % 2 === 0 ? 1 : -1;
      group.position.x = index * HORIZONTAL_SPACING;
      group.position.y = mobile ? 0.65 : side * 1.55;
      group.position.z = -Math.abs(distance) * 1.7;
      const entityScale = mobile ? 0.62 : 0.7;
      const targetScale = entityScale * Math.max(0.16, 1 - Math.abs(distance) * 0.52);
      group.scale.setScalar(targetScale);
      group.visible = Math.abs(distance) < 1.75;
      group.rotation.y += reducedMotion ? 0 : delta * (0.1 + index * 0.012);
    });

    camera.position.set(journeyX, 0, mobile ? 10.8 : 9);
    camera.lookAt(journeyX, 0, 0);
  });

  return (
    <>
      <SeededStars count={size.width < 760 ? 500 : 900} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 5, 5]} intensity={1.25} color="#b8c8ff" />
      {stages.map((stage, index) => (
        <group
          key={stage.id}
          ref={(group) => { stageGroups.current[index] = group; }}
          position={[index * HORIZONTAL_SPACING, index % 2 === 0 ? 1.55 : -1.55, 0]}
        >
          <StageEntity entityId={stage.entityId} accent={stage.accent} />
        </group>
      ))}
      <IoCore />
    </>
  );
}
