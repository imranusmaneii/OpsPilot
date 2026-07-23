"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  color?: string;
  showLabels?: boolean;
  showValues?: boolean;
}

export function BarChart({ data, height = 200, color: defaultColor, showLabels = true, showValues = true }: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = (item.value / maxValue) * 100;
          const color = item.color || defaultColor || "#DC2626";

          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              {showValues && (
                <span className="text-[10px] text-[#94A3B8]">{item.value.toLocaleString()}</span>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                className="w-full rounded-t-lg"
                style={{ backgroundColor: color, minHeight: "4px" }}
              />
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="mt-2 flex gap-2">
          {data.map((item, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[10px] text-[#94A3B8] truncate block">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
