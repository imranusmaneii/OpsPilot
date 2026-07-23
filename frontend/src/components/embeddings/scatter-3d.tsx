"use client";

import { useRef, useMemo, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "../shared/scene-3d";

const CLUSTER_COLORS = ["#DC2626", "#2563EB", "#EC4899", "#F59E0B", "#10B981"];
const CLUSTER_NAMES = ["Technical", "Business", "Legal", "Research", "Operations"];
const POINTS_PER_CLUSTER = 50;
const TOTAL = POINTS_PER_CLUSTER * CLUSTER_COLORS.length;

interface Point {
  position: [number, number, number];
  cluster: number;
  label: string;
}

function generatePoints(): Point[] {
  const points: Point[] = [];
  const clusterCenters: [number, number, number][] = [
    [-2, 1, 0],
    [2, 1.5, -1],
    [0, -1.5, 1],
    [-2.5, -1, -1],
    [2.5, -0.5, 0.5],
  ];

  for (let c = 0; c < CLUSTER_COLORS.length; c++) {
    const center = clusterCenters[c];
    for (let i = 0; i < POINTS_PER_CLUSTER; i++) {
      points.push({
        position: [
          center[0] + (Math.random() - 0.5) * 2.5,
          center[1] + (Math.random() - 0.5) * 2.5,
          center[2] + (Math.random() - 0.5) * 2,
        ],
        cluster: c,
        label: `${CLUSTER_NAMES[c]}-${i + 1}`,
      });
    }
  }
  return points;
}

function ScatterPoints({
  points,
  onHover,
  hoveredIndex,
}: {
  points: Point[];
  onHover: (index: number | null) => void;
  hoveredIndex: number | null;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(TOTAL * 3);
    points.forEach((p, i) => {
      const c = new THREE.Color(CLUSTER_COLORS[p.cluster]);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    });
    return arr;
  }, [points]);

  useFrame(() => {
    if (!meshRef.current) return;
    points.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      const isHovered = i === hoveredIndex;
      const s = isHovered ? 0.12 : 0.06;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, TOTAL]}
      onPointerMove={(e) => {
        e.stopPropagation();
        onHover(e.instanceId ?? null);
      }}
      onPointerOut={() => onHover(null)}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.85}
        emissive="#DC2626"
        emissiveIntensity={0.15}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function ClusterLabels() {
  const centers: [number, number, number][] = [
    [-2, 2.5, 0],
    [2, 3, -1],
    [0, -0.2, 1.5],
    [-2.5, 0.5, -1],
    [2.5, 1, 0.5],
  ];

  return (
    <>
      {CLUSTER_NAMES.map((name, i) => (
        <Billboard key={name} position={centers[i]}>
          <Text
            fontSize={0.18}
            color={CLUSTER_COLORS[i]}
            anchorX="center"
            anchorY="middle"
          >
            {name}
          </Text>
        </Billboard>
      ))}
    </>
  );
}

function ScatterScene({
  onHoverPoint,
  hoveredIndex,
}: {
  onHoverPoint: (index: number | null) => void;
  hoveredIndex: number | null;
}) {
  const points = useMemo(() => generatePoints(), []);

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={[-3, 2, 3]} color="#DC2626" intensity={1} distance={10} />
      <pointLight position={[3, -2, 3]} color="#2563EB" intensity={1} distance={10} />
      <ScatterPoints
        points={points}
        onHover={onHoverPoint}
        hoveredIndex={hoveredIndex}
      />
      <ClusterLabels />
      <gridHelper
        args={[10, 20, "#1a1a2e", "#1a1a2e"]}
        position={[0, -2, 0]}
      />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={3}
        maxDistance={15}
      />
    </group>
  );
}

interface Scatter3DProps {
  onHoverPoint?: (info: { label: string; cluster: string; score: number } | null) => void;
}

export function Scatter3D({ onHoverPoint }: Scatter3DProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const points = useMemo(() => generatePoints(), []);

  const handleHover = useCallback(
    (index: number | null) => {
      setHoveredIndex(index);
      if (index !== null && onHoverPoint) {
        const p = points[index];
        onHoverPoint({
          label: p.label,
          cluster: CLUSTER_NAMES[p.cluster],
          score: 0.6 + Math.random() * 0.4,
        });
      } else if (onHoverPoint) {
        onHoverPoint(null);
      }
    },
    [points, onHoverPoint]
  );

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl border border-white/[0.06] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <Scene3D
        camera={{ position: [5, 3, 8], fov: 50 }}
        dpr={[1, 1.5]}
      >
        <ScatterScene onHoverPoint={handleHover} hoveredIndex={hoveredIndex} />
      </Scene3D>
    </div>
  );
}
