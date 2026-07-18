"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
} from "lucide-react";

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
}

export function PdfViewer({ fileUrl, fileName }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[40px] text-center text-xs text-[#94A3B8]">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="mx-2 h-4 w-px bg-[rgba(255,255,255,0.1)]" />
          <button className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white">
            <RotateCw className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0a0f1a] p-4">
        <div
          className="flex items-center justify-center text-[#94A3B8]"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div className="flex h-[800px] w-[600px] items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-white/5">
            <p className="text-sm">PDF Preview</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-[rgba(255,255,255,0.08)] px-4 py-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-[#94A3B8]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
