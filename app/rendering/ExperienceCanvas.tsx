import { Component, type ErrorInfo, type ReactNode } from "react";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BloomPipeline } from "./effects/BloomPipeline";
import { JourneyWorld } from "./JourneyWorld";

type ErrorBoundaryProps = { children: ReactNode; fallback: ReactNode };
type ErrorBoundaryState = { failed: boolean };

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The 3D scene could not start", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function QualityController() {
  const setDpr = useThree((state) => state.setDpr);
  return (
    <PerformanceMonitor
      flipflops={2}
      onDecline={() => setDpr(1)}
      onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.5))}
    />
  );
}

function CanvasFallback() {
  return (
    <div className="canvas-fallback" role="status">
      <span>MODE ESSENTIEL</span>
      <p>La visualisation 3D n’est pas disponible. Le voyage et son contenu restent accessibles.</p>
    </div>
  );
}

export function ExperienceCanvas() {
  return (
    <div className="canvas-layer" aria-hidden="true">
      <WebGLErrorBoundary fallback={<CanvasFallback />}>
        <Canvas
          camera={{ fov: 42, near: 0.1, far: 80, position: [0, 0, 9] }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <fog attach="fog" args={["#02030a", 9, 31]} />
          <JourneyWorld />
          <QualityController />
          <AdaptiveDpr />
          <BloomPipeline />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
