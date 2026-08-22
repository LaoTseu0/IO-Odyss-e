import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer as ThreeEffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export function BloomPipeline() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const lastPixelRatio = useRef(0);
  const composer = useMemo(() => {
    const nextComposer = new ThreeEffectComposer(gl);
    nextComposer.addPass(new RenderPass(scene, camera));
    nextComposer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.5, 1.1));
    nextComposer.addPass(new OutputPass());
    return nextComposer;
  }, [camera, gl, scene]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.height, size.width]);

  useEffect(() => () => composer.dispose(), [composer]);

  // Priority 1 disables Fiber's automatic render and lets the composer render the final frame.
  useFrame(() => {
    const pixelRatio = gl.getPixelRatio();
    if (lastPixelRatio.current !== pixelRatio) {
      lastPixelRatio.current = pixelRatio;
      composer.setPixelRatio(pixelRatio);
      composer.setSize(size.width, size.height);
    }
    composer.render();
  }, 1);

  return null;
}
