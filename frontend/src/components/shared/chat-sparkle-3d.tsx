"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Scene3D } from "./scene-3d";

function SparkleMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.3;
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial
          color="#DC2626"
          emissive="#DC2626"
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#DC2626" intensity={1.5} distance={4} />
    </group>
  );
}

interface ChatSparkle3DProps {
  size?: number;
  className?: string;
}

export function ChatSparkle3D({ size = 96, className = "" }: ChatSparkle3DProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Scene3D
        camera={{ position: [0, 0, 2], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        transparent
        disablePostProcessing
      >
        <SparkleMesh />
      </Scene3D>
    </div>
  );
}
