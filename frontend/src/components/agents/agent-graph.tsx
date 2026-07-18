"use client";

import { motion } from "framer-motion";
import type { WorkflowGraph as WorkflowGraphType, WorkflowNode } from "@/types/agent";

interface AgentGraphProps {
  workflow: WorkflowGraphType;
  activeAgent?: string | null;
  onNodeClick?: (node: WorkflowNode) => void;
}

const agentColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  planner: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", glow: "shadow-purple-500/20" },
  retriever: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/20" },
  document_qa: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
  api_agent: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-amber-500/20" },
  reasoning: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  citation: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", glow: "shadow-pink-500/20" },
  evaluator: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", glow: "shadow-indigo-500/20" },
};

const statusDot: Record<string, string> = {
  active: "bg-emerald-400",
  idle: "bg-[#94A3B8]",
  error: "bg-red-400",
};

export function AgentGraph({ workflow, activeAgent, onNodeClick }: AgentGraphProps) {
  const nodePositions: Record<string, { x: number; y: number }> = {
    planner: { x: 250, y: 30 },
    retriever: { x: 250, y: 140 },
    document_qa: { x: 250, y: 250 },
    api_agent: { x: 250, y: 360 },
    reasoning: { x: 250, y: 470 },
    citation: { x: 250, y: 580 },
    evaluator: { x: 250, y: 690 },
  };

  const svgHeight = 780;
  const nodeWidth = 200;
  const nodeHeight = 80;

  return (
    <div className="relative overflow-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Agent Workflow Graph</h3>
        <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#94A3B8]" /> Idle
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width="500" height={svgHeight} viewBox={`0 0 500 ${svgHeight}`}>
          <defs>
            {workflow.edges.map((edge, i) => (
              <linearGradient key={i} id={`edge-grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.4" />
              </linearGradient>
            ))}
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#7C3AED" fillOpacity="0.5" />
            </marker>
          </defs>

          {workflow.edges.map((edge, i) => {
            const from = nodePositions[edge.source];
            const to = nodePositions[edge.target];
            if (!from || !to) return null;

            const x1 = 250;
            const y1 = from.y + nodeHeight;
            const x2 = 250;
            const y2 = to.y;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={`url(#edge-grad-${i})`}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x={x1 + 12}
                    y={(y1 + y2) / 2}
                    fill="#94A3B8"
                    fontSize="10"
                    fontFamily="Inter"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {workflow.nodes.map((node, i) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const colors = agentColors[node.id] || agentColors.planner;
            const isActive = activeAgent === node.id;

            return (
              <g
                key={node.id}
                onClick={() => onNodeClick?.(node)}
                className="cursor-pointer"
              >
                <rect
                  x={pos.x - nodeWidth / 2}
                  y={pos.y}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx="16"
                  className={`${colors.bg} ${colors.border} ${
                    isActive ? `shadow-lg ${colors.glow}` : ""
                  }`}
                  stroke="currentColor"
                  strokeWidth={isActive ? "2" : "1"}
                  fill="currentColor"
                  fillOpacity="0.1"
                />
                <circle
                  cx={pos.x - nodeWidth / 2 + 20}
                  cy={pos.y + 20}
                  r="4"
                  className={statusDot[node.status] || statusDot.idle}
                />
                <text
                  x={pos.x - nodeWidth / 2 + 30}
                  y={pos.y + 24}
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Inter"
                >
                  {node.name}
                </text>
                <text
                  x={pos.x - nodeWidth / 2 + 20}
                  y={pos.y + 48}
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="Inter"
                >
                  {node.tools.length > 0
                    ? `${node.tools.length} tools`
                    : "No tools"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
