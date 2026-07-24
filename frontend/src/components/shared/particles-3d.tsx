"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Scene3D } from "./scene-3d";

const PARTICLE_COUNT = 250;
const SPREAD = 20;
const DEPTH = 15;

function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport, camera } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const { positions, colors, baseScales, velocities } = useMemo(() => {
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
      const color = t < 0.65 ? redColor : blueColor;
      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;

      scl[i] = Math.random() * 0.03 + 0.01;

      vel[i3] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.001;
    }

    return { positions: pos, colors: col, baseScales: scl, velocities: vel };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bgColor = useMemo(() => new THREE.Color("#050810"), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const mx = mouseRef.current.x * 0.3;
    const my = mouseRef.current.y * 0.3;

    const camPos = camera.position;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      let x = positions[i3] + Math.sin(time * 0.1 + i * 0.1) * 0.3 + mx;
      let y = positions[i3 + 1] + Math.cos(time * 0.08 + i * 0.15) * 0.2 + my;
      let z = positions[i3 + 2] + Math.sin(time * 0.05 + i * 0.05) * 0.1;

      x += velocities[i3] * state.clock.getDelta() * 60;
      y += velocities[i3 + 1] * state.clock.getDelta() * 60;
      z += velocities[i3 + 2] * state.clock.getDelta() * 60;

      dummy.position.set(x, y, z);

      const distFromCamera = Math.abs(z - camPos.z);
      const depthNorm = Math.min(1, distFromCamera / 15);
      const sizeMultiplier = THREE.MathUtils.lerp(1.5, 0.4, depthNorm);
      const pulse = 0.85 + Math.sin(time * 2 + i) * 0.15;
      dummy.scale.setScalar(baseScales[i] * sizeMultiplier * pulse);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const opacityAttr = meshRef.current.geometry.getAttribute("opacity");
      if (opacityAttr) {
        opacityAttr.setX(i, THREE.MathUtils.lerp(0.7, 0.08, depthNorm));
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    const opacityAttr = meshRef.current.geometry.getAttribute("opacity");
    if (opacityAttr) opacityAttr.needsUpdate = true;
  });

  const opacityArray = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) arr[i] = 0.5;
    return arr;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]}>
        <instancedBufferAttribute attach="attributes-opacity" args={[opacityArray, 1]} />
      </sphereGeometry>
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.5}
        toneMapped={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
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
        transparent
        disablePostProcessing
      >
        <ParticleField />
      </Scene3D>
    </div>
  );
}
