"use client";

import { motion } from "framer-motion";

interface ModelResult {
  model: string;
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  hallucination_rate: number;
  avg_latency_ms: number;
}

interface ComparisonTableProps {
  results: ModelResult[];
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  if (results.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[#94A3B8]">
        No model comparison data yet.
      </div>
    );
  }

  const getColor = (val: number, invert = false) => {
    const score = invert ? 1 - val : val;
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.08)]">
            <th className="pb-3 text-left text-xs font-medium text-[#94A3B8]">Model</th>
            <th className="pb-3 text-center text-xs font-medium text-[#94A3B8]">Faithfulness</th>
            <th className="pb-3 text-center text-xs font-medium text-[#94A3B8]">Relevancy</th>
            <th className="pb-3 text-center text-xs font-medium text-[#94A3B8]">Precision</th>
            <th className="pb-3 text-center text-xs font-medium text-[#94A3B8]">Hallucination</th>
            <th className="pb-3 text-right text-xs font-medium text-[#94A3B8]">Latency</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <motion.tr
              key={r.model}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-[rgba(255,255,255,0.05)]"
            >
              <td className="py-3 font-medium">{r.model}</td>
              <td className={`py-3 text-center font-mono ${getColor(r.faithfulness)}`}>
                {(r.faithfulness * 100).toFixed(1)}%
              </td>
              <td className={`py-3 text-center font-mono ${getColor(r.answer_relevancy)}`}>
                {(r.answer_relevancy * 100).toFixed(1)}%
              </td>
              <td className={`py-3 text-center font-mono ${getColor(r.context_precision)}`}>
                {(r.context_precision * 100).toFixed(1)}%
              </td>
              <td className={`py-3 text-center font-mono ${getColor(r.hallucination_rate, true)}`}>
                {(r.hallucination_rate * 100).toFixed(1)}%
              </td>
              <td className="py-3 text-right text-[#94A3B8] font-mono">
                {r.avg_latency_ms.toFixed(0)}ms
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
