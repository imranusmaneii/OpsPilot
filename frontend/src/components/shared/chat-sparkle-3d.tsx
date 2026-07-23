"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles as DreiSparkles } from "@react-three/drei";
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
      <DreiSparkles
        count={30}
        scale={2}
        size={2}
        speed={0.4}
        color="#DC2626"
        opacity={0.8}
      />
      <DreiSparkles
        count={15}
        scale={1.5}
        size={1.5}
        speed={0.3}
        color="#2563EB"
        opacity={0.6}
      />
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#DC2626"
          emissive="#DC2626"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#DC2626" intensity={2} distance={3} />
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
      >
        <SparkleMesh />
      </Scene3D>
    </div>
  );
}
