"use client";

import { motion } from "framer-motion";

interface Citation {
  id: string;
  content: string;
  document_title: string;
  page_number: number | null;
  relevance_score: number;
}

interface CitationOverlayProps {
  citations: Citation[];
}

export function CitationOverlay({ citations }: CitationOverlayProps) {
  if (citations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[#94A3B8]">Sources</h4>
      {citations.map((citation, i) => (
        <motion.div
          key={citation.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[#7C3AED]">
              {citation.document_title}
              {citation.page_number && ` (p. ${citation.page_number})`}
            </span>
            <ConfidenceBadge score={citation.relevance_score} />
          </div>
          <p className="text-sm text-[#94A3B8] line-clamp-3">{citation.content}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  const color =
    percentage >= 80
      ? "text-emerald-400 bg-emerald-400/10"
      : percentage >= 60
        ? "text-yellow-400 bg-yellow-400/10"
        : "text-red-400 bg-red-400/10";

  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
      {percentage}%
    </span>
  );
}
