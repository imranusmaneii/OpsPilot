"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "../shared/scene-3d";

function HeroMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    meshRef.current.rotation.y = t * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#DC2626"
          emissive="#DC2626"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh scale={1.5} position={[0.5, 0.3, -1]}>
        <torusKnotGeometry args={[0.8, 0.25, 128, 32, 2, 3]} />
        <MeshDistortMaterial
          color="#2563EB"
          emissive="#2563EB"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.7}
          distort={0.2}
          speed={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      <pointLight position={[3, 3, 3]} color="#DC2626" intensity={2} />
      <pointLight position={[-3, -2, 2]} color="#2563EB" intensity={1.5} />
    </Float>
  );
}

export function LoginHero3D() {
  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <Scene3D
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
      >
        <HeroMesh />
      </Scene3D>
    </div>
  );
}

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export function TiltCard({ children, className = "" }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const springRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    springRef.current = { x: y * -8, y: x * 8 };
  };

  useFrame(() => {
    if (!cardRef.current) return;
    const target = isHovering
      ? springRef.current
      : { x: 0, y: 0 };

    setTilt((prev) => ({
      x: prev.x + (target.x - prev.x) * 0.08,
      y: prev.y + (target.y - prev.y) * 0.08,
    }));
  });

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovering ? "none" : "transform 0.5s ease-out",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
