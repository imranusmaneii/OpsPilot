"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense, type ReactNode } from "react";

interface Scene3DProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  camera?: Record<string, unknown>;
  frameloop?: "always" | "demand" | "never";
  dpr?: number | [number, number];
  gl?: Record<string, unknown>;
  disablePostProcessing?: boolean;
}

export function Scene3D({
  children,
  className,
  style,
  camera,
  frameloop = "always",
  dpr = [1, 2],
  gl,
  disablePostProcessing = false,
}: Scene3DProps) {
  const cameraProps = {
    position: [0, 0, 5] as [number, number, number],
    fov: 50,
    near: 0.1,
    far: 100,
    ...camera,
  };

  const glProps = {
    antialias: true,
    powerPreference: "high-performance" as const,
    alpha: true,
    ...gl,
  };

  return (
    <Canvas
      className={className}
      style={{ pointerEvents: "none", ...style }}
      camera={cameraProps}
      frameloop={frameloop}
      dpr={dpr}
      gl={glProps}
    >
      <color attach="background" args={["#050810"]} />
      <fog attach="fog" args={["#050810", 8, 25]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />
      <Suspense fallback={null}>
        {children}
      </Suspense>
      {!disablePostProcessing && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={0.8}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
