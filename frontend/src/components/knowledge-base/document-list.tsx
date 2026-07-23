"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock, AlertCircle, Loader2, MoreVertical } from "lucide-react";
import type { Document } from "@/types/document";

interface DocumentListProps {
  documents: Document[];
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  pending: { icon: Clock, color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", label: "Pending" },
  processing: { icon: Loader2, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", label: "Processing", animate: true },
  indexed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Indexed" },
  failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Failed" },
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function DocumentList({ documents, onSelect, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)]">
          <FileText className="h-8 w-8 text-[#94A3B8]" />
        </div>
        <p className="text-sm text-[#94A3B8]">No documents uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc, i) => {
        const status = statusConfig[doc.status] || statusConfig.pending;
        const StatusIcon = status.icon;

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect?.(doc.id)}
            className="glass glass-hover group flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-all"
          >
            <div className="rounded-xl bg-[#DC2626]/10 p-2.5">
              <FileText className="h-5 w-5 text-[#DC2626]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-[#94A3B8]">
                {doc.file_name} &middot; {formatFileSize(doc.file_size)} &middot; {doc.chunk_count} chunks
              </p>
            </div>

            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${status.bg}`}>
              <StatusIcon
                className={`h-3.5 w-3.5 ${status.color} ${"animate" in status && status.animate ? "animate-spin" : ""}`}
              />
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
