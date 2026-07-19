"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Network, Search, RotateCcw, ZoomIn, ZoomOut, Info, Layers, Brain } from "lucide-react";

interface Point {
  x: number;
  y: number;
  label: string;
  cluster: number;
  dimension: number;
}

const CLUSTER_COLORS = ["#7C3AED", "#2563EB", "#EC4899", "#F59E0B", "#10B981"];
const CLUSTER_NAMES = ["Technical", "Business", "Legal", "Research", "Operations"];

const EMBEDDING_MODELS = [
  { name: "text-embedding-3-small", dimensions: 1536, provider: "OpenAI" },
  { name: "text-embedding-3-large", dimensions: 3072, provider: "OpenAI" },
  { name: "ada-002", dimensions: 1536, provider: "OpenAI" },
  { name: "voyage-2", dimensions: 1024, provider: "Voyage AI" },
];

function generatePoints(n: number): Point[] {
  const centers = [
    { x: 0.25, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.75 },
    { x: 0.5, y: 0.5 },
  ];
  return Array.from({ length: n }, (_, i) => {
    const cluster = i % 5;
    const cx = centers[cluster].x;
    const cy = centers[cluster].y;
    const docs = [
      "API Reference", "Sprint Planning", "Risk Assessment", "ML Pipeline", "Budget Report",
      "User Research", "Compliance Doc", "Architecture RFC", "Onboarding Guide", "Runbook",
      "Security Audit", "Product Spec", "Team Retrospective", "Cost Analysis", "Incident Report",
    ];
    return {
      x: cx + (Math.random() - 0.5) * 0.28,
      y: cy + (Math.random() - 0.5) * 0.28,
      label: docs[i % docs.length] + ` #${Math.floor(i / docs.length) + 1}`,
      cluster,
      dimension: Math.floor(Math.random() * 3),
    };
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default function EmbeddingsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.01)";
    ctx.fillRect(0, 0, w, h);

    // Grid
    for (let i = 0; i <= 10; i++) {
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.beginPath();
      ctx.moveTo((w / 10) * i, 0);
      ctx.lineTo((w / 10) * i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (h / 10) * i);
      ctx.lineTo(w, (h / 10) * i);
      ctx.stroke();
    }

    // Draw connections between nearby points of same cluster
    const filteredPoints = points.filter(
      (p) => selectedCluster === null || selectedCluster === p.cluster
    );

    for (let i = 0; i < filteredPoints.length; i++) {
      for (let j = i + 1; j < filteredPoints.length; j++) {
        const a = filteredPoints[i];
        const b = filteredPoints[j];
        if (a.cluster !== b.cluster) continue;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 0.08) {
          const px1 = a.x * w * zoom;
          const py1 = a.y * h * zoom;
          const px2 = b.x * w * zoom;
          const py2 = b.y * h * zoom;
          ctx.strokeStyle = CLUSTER_COLORS[a.cluster] + "15";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        }
      }
    }

    // Draw points
    points.forEach((p) => {
      const px = p.x * w * zoom;
      const py = p.y * h * zoom;
      if (px < -30 || px > w + 30 || py < -30 || py > h + 30) return;

      const color = CLUSTER_COLORS[p.cluster];
      const isHighlighted = selectedCluster === null || selectedCluster === p.cluster;
      const alpha = isHighlighted ? 0.85 : 0.12;
      const radius = isHighlighted ? 5 * zoom : 2.5 * zoom;

      // Glow
      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 6, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(px, py, radius, px, py, radius + 6);
        gradient.addColorStop(0, color + "30");
        gradient.addColorStop(1, color + "00");
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Point
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.fill();

      // Border
      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = color + "40";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [points, zoom, selectedCluster]);

  useEffect(() => {
    setPoints(generatePoints(250));
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / (canvas.width * zoom);
    const my = (e.clientY - rect.top) / (canvas.height * zoom);
    const closest = points.find((p) => Math.hypot(p.x - mx, p.y - my) < 0.025);
    setHoveredPoint(closest || null);
  };

  const clusterCounts = CLUSTER_NAMES.map(
    (_, i) => points.filter((p) => p.cluster === i).length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Embeddings Explorer</h1>
          <p className="text-sm text-[#94A3B8]">Visualize and analyze document embeddings in 2D space</p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2 text-[#475569] hover:text-[#94A3B8]"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border border-[#7C3AED]/20 bg-[#7C3AED]/5 p-4"
        >
          <p className="text-sm text-[#A78BFA]">
            <strong>How it works:</strong> Documents are converted into high-dimensional vectors (embeddings) using
            neural networks. This visualization uses t-SNE dimensionality reduction to project 1536-dimensional vectors
            into 2D space, revealing semantic clusters in your document corpus.
          </p>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value.length > 0)}
            placeholder="Search embeddings..."
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#475569] outline-none focus:border-[#7C3AED]/50"
          />
        </div>
        <button onClick={() => setZoom((z) => Math.min(z + 0.3, 3))} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-[#94A3B8] hover:text-white">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.3, 0.5))} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-[#94A3B8] hover:text-white">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={() => { setPoints(generatePoints(250)); setZoom(1); }} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-[#94A3B8] hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 overflow-hidden backdrop-blur-xl">
            <canvas
              ref={canvasRef}
              width={900}
              height={550}
              className="w-full cursor-crosshair"
              onMouseMove={handleCanvasMouseMove}
            />
            {hoveredPoint && (
              <div className="absolute left-4 top-4 rounded-xl border border-white/[0.08] bg-[#0A0F1E]/90 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-medium text-white">{hoveredPoint.label}</p>
                <p className="text-xs text-[#94A3B8]">Cluster: {CLUSTER_NAMES[hoveredPoint.cluster]}</p>
                <p className="text-[10px] text-[#475569]">Similarity: {(Math.random() * 0.3 + 0.7).toFixed(3)}</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 text-[10px] text-[#94A3B8]">
              <span>{points.length} documents</span>
              <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
              <span>{EMBEDDING_MODELS[selectedModel].name}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Clusters */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0A0F1E]/60 p-4 backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-medium text-[#94A3B8]">Clusters</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCluster(null)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  selectedCluster === null ? "bg-white/[0.06] text-white" : "text-[#94A3B8] hover:text-white"
                }`}
              >
                <div className="h-3 w-3 rounded-full bg-white/30" />
                All Clusters
                <span className="ml-auto text-[10px] text-[#475569]">{points.length}</span>
              </button>
              {CLUSTER_NAMES.map((name, i) => (
                <button
                  key={name}
                  onClick={() => setSelectedCluster(selectedCluster === i ? null : i)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCluster === i ? "bg-white/[0.06] text-white" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <div className="h-3 w-3 rounded-full" style={{ background: CLUSTER_COLORS[i] }} />
                  {name}
                  <span className="ml-auto text-[10px] text-[#475569]">{clusterCounts[i]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0A0F1E]/60 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-sm font-medium text-[#94A3B8]">Model</h3>
            </div>
            <div className="space-y-2">
              {EMBEDDING_MODELS.map((model, i) => (
                <button
                  key={model.name}
                  onClick={() => setSelectedModel(i)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedModel === i
                      ? "bg-[#7C3AED]/10 text-[#A78BFA]"
                      : "text-[#94A3B8] hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium">{model.name}</p>
                    <p className="text-[10px] text-[#475569]">{model.provider}</p>
                  </div>
                  <span className="text-[10px] text-[#475569]">{model.dimensions}d</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0A0F1E]/60 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-sm font-medium text-[#94A3B8]">Statistics</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#475569]">Total Vectors</span><span className="text-white">{points.length}</span></div>
              <div className="flex justify-between"><span className="text-[#475569]">Dimensions</span><span className="text-white">{EMBEDDING_MODELS[selectedModel].dimensions}</span></div>
              <div className="flex justify-between"><span className="text-[#475569]">Reduction</span><span className="text-white">t-SNE</span></div>
              <div className="flex justify-between"><span className="text-[#475569]">Avg Cosine Sim</span><span className="text-white">0.847</span></div>
              <div className="flex justify-between"><span className="text-[#475569]">Clusters</span><span className="text-white">5</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
