"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "../shared/scene-3d";

const AGENTS = [
  { id: "planner", name: "Planner", color: "#EF4444", y: 3 },
  { id: "retriever", name: "Retriever", color: "#3B82F6", y: 2 },
  { id: "document_qa", name: "Document QA", color: "#06B6D4", y: 1 },
  { id: "api_agent", name: "API Agent", color: "#F59E0B", y: 0 },
  { id: "reasoning", name: "Reasoning", color: "#10B981", y: -1 },
  { id: "citation", name: "Citation", color: "#EC4899", y: -2 },
  { id: "evaluator", name: "Evaluator", color: "#6366F1", y: -3 },
];

interface PipelineNodeProps {
  agent: (typeof AGENTS)[number];
  index: number;
  isActive: boolean;
  isDone: boolean;
  onClick: () => void;
}

function PipelineNode({ agent, index, isActive, isDone, onClick }: PipelineNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    const targetScale = isActive ? 1.2 : isDone ? 1.05 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    const targetEmissive = isActive ? 1.5 : isDone ? 0.5 : 0.1;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity +=
      (targetEmissive - mat.emissiveIntensity) * 0.1;

    if (glowRef.current) {
      glowRef.current.intensity = isActive ? 3 : isDone ? 1 : 0.2;
    }

    if (isActive) {
      meshRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group position={[0, agent.y * 1.3, 0]}>
      <Float
        speed={0.5}
        rotationIntensity={0.1}
        floatIntensity={isActive ? 0.3 : 0.1}
      >
        <RoundedBox
          ref={meshRef}
          args={[2.8, 0.65, 0.35]}
          radius={0.08}
          smoothness={4}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <meshStandardMaterial
            color={agent.color}
            emissive={agent.color}
            emissiveIntensity={0.1}
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={0.9}
          />
          <pointLight
            ref={glowRef}
            color={agent.color}
            intensity={0.2}
            distance={3}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {agent.name}
        </Text>
      </Float>
    </group>
  );
}

interface PipelineEdgeProps {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  isActive: boolean;
}

function PipelineEdge({ from, to, color, isActive }: PipelineEdgeProps) {
  const ref = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  const midPoint = useMemo(() => {
    const m = from.clone().lerp(to, 0.5);
    m.x += 0.5;
    return m;
  }, [from, to]);

  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(from, midPoint, to),
    [from, midPoint, to]
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.LineBasicMaterial;
    mat.opacity = isActive ? 0.8 : 0.2;

    if (isActive && particleRef.current) {
      progress.current = (progress.current + delta * 0.8) % 1;
      const point = curve.getPoint(progress.current);
      particleRef.current.position.copy(point);
      particleRef.current.visible = true;
      const s = 0.06 + Math.sin(state.clock.getElapsedTime() * 5) * 0.02;
      particleRef.current.scale.setScalar(s);
    } else if (particleRef.current) {
      particleRef.current.visible = false;
    }
  });

  const points = useMemo(() => {
    const pts = curve.getPoints(30);
    return pts.map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [curve]);

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={isActive ? 2.5 : 1}
        transparent
        opacity={0.3}
      />
      <mesh ref={particleRef} visible={false}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

interface PipelineSceneProps {
  runningAgentIndex: number;
  completedAgents: number[];
  onNodeClick: (agentId: string) => void;
}

function PipelineScene({
  runningAgentIndex,
  completedAgents,
  onNodeClick,
}: PipelineSceneProps) {
  return (
    <group position={[0, 0.5, 0]}>
      {AGENTS.map((agent, i) => (
        <PipelineNode
          key={agent.id}
          agent={agent}
          index={i}
          isActive={i === runningAgentIndex}
          isDone={completedAgents.includes(i)}
          onClick={() => onNodeClick(agent.id)}
        />
      ))}
      {AGENTS.slice(0, -1).map((agent, i) => {
        const from = new THREE.Vector3(0, agent.y * 1.3 - 0.33, 0);
        const to = new THREE.Vector3(
          0,
          AGENTS[i + 1].y * 1.3 + 0.33,
          0
        );
        const isActive =
          runningAgentIndex === i + 1 || completedAgents.includes(i + 1);
        return (
          <PipelineEdge
            key={`${agent.id}-${AGENTS[i + 1].id}`}
            from={from}
            to={to}
            color={agent.color}
            isActive={isActive}
          />
        );
      })}
    </group>
  );
}

interface Pipeline3DProps {
  onNodeClick: (agentId: string) => void;
  runningAgentIndex?: number;
  completedAgents?: number[];
}

export function Pipeline3D({ onNodeClick, runningAgentIndex = -1, completedAgents = [] }: Pipeline3DProps) {
  return (
    <div className="w-full h-[600px] rounded-2xl border border-white/[0.06] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <Scene3D
        camera={{ position: [0, 0.5, 7], fov: 50 }}
        dpr={[1, 1.5]}
      >
        <PipelineScene
          runningAgentIndex={runningAgentIndex}
          completedAgents={completedAgents}
          onNodeClick={onNodeClick}
        />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <pointLight position={[-3, 3, 2]} color="#DC2626" intensity={1} />
        <pointLight position={[3, -3, 2]} color="#2563EB" intensity={1} />
      </Scene3D>
    </div>
  );
}
