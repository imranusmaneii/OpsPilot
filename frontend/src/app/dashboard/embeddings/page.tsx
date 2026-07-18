"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Network, Search, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface Point {
  x: number;
  y: number;
  label: string;
  cluster: number;
}

const CLUSTER_COLORS = ["#7C3AED", "#2563EB", "#EC4899", "#F59E0B", "#10B981"];
const CLUSTER_NAMES = ["Technical", "Business", "Legal", "Research", "Operations"];

function generatePoints(n: number): Point[] {
  const centers = [
    { x: 0.3, y: 0.3 },
    { x: 0.7, y: 0.3 },
    { x: 0.3, y: 0.7 },
    { x: 0.7, y: 0.7 },
    { x: 0.5, y: 0.5 },
  ];
  return Array.from({ length: n }, (_, i) => {
    const cluster = i % 5;
    const cx = centers[cluster].x;
    const cy = centers[cluster].y;
    return {
      x: cx + (Math.random() - 0.5) * 0.25,
      y: cy + (Math.random() - 0.5) * 0.25,
      label: `doc_${i}`,
      cluster,
    };
  });
}

export default function EmbeddingsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.moveTo((w / 10) * i, 0);
      ctx.lineTo((w / 10) * i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (h / 10) * i);
      ctx.lineTo(w, (h / 10) * i);
      ctx.stroke();
    }

    points.forEach((p) => {
      const px = p.x * w * zoom;
      const py = p.y * h * zoom;
      if (px < -20 || px > w + 20 || py < -20 || py > h + 20) return;

      const color = CLUSTER_COLORS[p.cluster];
      const isHighlighted = selectedCluster === null || selectedCluster === p.cluster;
      const alpha = isHighlighted ? 0.8 : 0.15;
      const radius = isHighlighted ? 4 * zoom : 2 * zoom;

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.fill();

      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = color + "30";
        ctx.stroke();
      }
    });
  }, [points, zoom, selectedCluster]);

  useEffect(() => {
    setPoints(generatePoints(200));
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / canvas.width;
    const my = (e.clientY - rect.top) / canvas.height;
    const closest = points.find((p) => Math.hypot(p.x - mx, p.y - my) < 0.02);
    setHoveredPoint(closest || null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Embeddings Visualization</h1>
        <p className="text-sm text-[#94A3B8]">Explore document embeddings in 2D space</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search embeddings..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#7C3AED]/50"
          />
        </div>
        <button onClick={() => setZoom((z) => Math.min(z + 0.2, 3))} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[#94A3B8] hover:text-white">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[#94A3B8] hover:text-white">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={() => { setPoints(generatePoints(200)); setZoom(1); }} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[#94A3B8] hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full cursor-crosshair"
              onMouseMove={handleCanvasMouseMove}
            />
            {hoveredPoint && (
              <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-[#0F172A]/90 px-3 py-2 text-xs backdrop-blur-sm">
                <div className="font-medium">{hoveredPoint.label}</div>
                <div className="text-[#94A3B8]">Cluster: {CLUSTER_NAMES[hoveredPoint.cluster]}</div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 text-[10px] text-[#94A3B8]">
              {points.length} documents · Zoom: {(zoom * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-3 text-sm font-medium text-[#94A3B8]">Clusters</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCluster(null)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  selectedCluster === null ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"
                }`}
              >
                <div className="h-3 w-3 rounded-full bg-white/30" />
                All Clusters
              </button>
              {CLUSTER_NAMES.map((name, i) => (
                <button
                  key={name}
                  onClick={() => setSelectedCluster(selectedCluster === i ? null : i)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCluster === i ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <div className="h-3 w-3 rounded-full" style={{ background: CLUSTER_COLORS[i] }} />
                  {name}
                  <span className="ml-auto text-[10px]">{points.filter((p) => p.cluster === i).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-medium">Stats</h3>
            <div className="space-y-1.5 text-xs text-[#94A3B8]">
              <div className="flex justify-between"><span>Total Points</span><span className="text-white">{points.length}</span></div>
              <div className="flex justify-between"><span>Dimensions</span><span className="text-white">1536</span></div>
              <div className="flex justify-between"><span>Model</span><span className="text-white">ada-002</span></div>
              <div className="flex justify-between"><span>Method</span><span className="text-white">t-SNE</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
