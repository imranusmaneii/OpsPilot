"use client";

import { motion } from "framer-motion";
import { LineChart } from "@/components/dashboard/charts/line-chart";

interface RegressionPoint {
  evaluation_id: string;
  name: string;
  created_at: string;
  metrics: Record<string, number>;
}

interface RegressionChartProps {
  data: RegressionPoint[];
}

export function RegressionChart({ data }: RegressionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#94A3B8]">
        No regression data yet. Run evaluations to see trends.
      </div>
    );
  }

  const sorted = [...data].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const faithfulnessLine = {
    label: "Faithfulness",
    values: sorted.map((d) => d.metrics.faithfulness || 0),
  };
  const relevancyLine = {
    label: "Relevancy",
    values: sorted.map((d) => d.metrics.answer_relevancy || 0),
  };
  const precisionLine = {
    label: "Precision",
    values: sorted.map((d) => d.metrics.context_precision || 0),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#7C3AED]" /> Faithfulness
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#2563EB]" /> Relevancy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Precision
        </span>
      </div>
      <LineChart
        data={[faithfulnessLine, relevancyLine, precisionLine]}
        height={220}
        showDots={true}
      />
      <div className="flex justify-between text-[10px] text-[#94A3B8]/60">
        <span>{sorted[0]?.name}</span>
        <span>{sorted[sorted.length - 1]?.name}</span>
      </div>
    </div>
  );
}
