"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./scene-3d";

function FloatingLogoMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    meshRef.current.rotation.y = t * 0.3;
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.05;
  });

  return (
    <RoundedBox ref={meshRef} args={[1.2, 1.2, 0.3]} radius={0.1} smoothness={4} scale={0.6}>
      <meshStandardMaterial
        color="#DC2626"
        emissive="#DC2626"
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
      <pointLight color="#DC2626" intensity={1} distance={2} />
    </RoundedBox>
  );
}

interface Logo3DProps {
  size?: number;
  className?: string;
}

export function Logo3D({ size = 36, className = "" }: Logo3DProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Scene3D
        camera={{ position: [0, 0, 2.5], fov: 30 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        disablePostProcessing
      >
        <FloatingLogoMesh />
      </Scene3D>
    </div>
  );
}
