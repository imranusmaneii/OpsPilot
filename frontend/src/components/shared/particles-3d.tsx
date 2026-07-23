"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Scene3D } from "./scene-3d";

const PARTICLE_COUNT = 400;
const SPREAD = 20;
const DEPTH = 15;

function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const { positions, colors, scales, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const scl = new Float32Array(PARTICLE_COUNT);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    const redColor = new THREE.Color("#DC2626");
    const blueColor = new THREE.Color("#2563EB");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * SPREAD;
      pos[i3 + 1] = (Math.random() - 0.5) * SPREAD;
      pos[i3 + 2] = (Math.random() - 0.5) * DEPTH - 3;

      const t = Math.random();
      const color = t < 0.5 ? redColor : blueColor;
      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;

      scl[i] = Math.random() * 0.03 + 0.01;

      vel[i3] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.001;
    }

    return { positions: pos, colors: col, scales: scl, velocities: vel };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const mx = mouseRef.current.x * 0.3;
    const my = mouseRef.current.y * 0.3;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      let x = positions[i3] + Math.sin(time * 0.1 + i * 0.1) * 0.3 + mx;
      let y = positions[i3 + 1] + Math.cos(time * 0.08 + i * 0.15) * 0.2 + my;
      let z = positions[i3 + 2] + Math.sin(time * 0.05 + i * 0.05) * 0.1;

      x += velocities[i3] * state.clock.getDelta() * 60;
      y += velocities[i3 + 1] * state.clock.getDelta() * 60;
      z += velocities[i3 + 2] * state.clock.getDelta() * 60;

      dummy.position.set(x, y, z);

      const distFromCenter = Math.sqrt(x * x + y * y + z * z);
      const fogFactor = Math.max(0, 1 - distFromCenter / 15);
      const pulse = 0.8 + Math.sin(time * 2 + i) * 0.2;
      dummy.scale.setScalar(scales[i] * fogFactor * pulse);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#DC2626"
        transparent
        opacity={0.6}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

export function Particles3DBackground() {
  return (
    <div
      className="fixed inset-0 z-0"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Scene3D
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        disablePostProcessing
      >
        <ParticleField />
      </Scene3D>
    </div>
  );
}
