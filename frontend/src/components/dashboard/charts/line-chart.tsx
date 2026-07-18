"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface LineChartData {
  label: string;
  values: number[];
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  color?: string;
  gradient?: boolean;
  showDots?: boolean;
}

export function LineChart({
  data,
  height = 200,
  color = "#7C3AED",
  gradient = true,
  showDots = true,
}: LineChartProps) {
  const allValues = useMemo(() => data.flatMap((d) => d.values), [data]);
  const maxValue = useMemo(() => Math.max(...allValues, 1), [allValues]);
  const minValue = useMemo(() => Math.min(...allValues, 0), [allValues]);
  const range = maxValue - minValue || 1;

  const points = useMemo(() => {
    return data.map((series, si) => {
      return series.values.map((val, vi) => {
        const x = (vi / Math.max(series.values.length - 1, 1)) * 100;
        const y = 100 - ((val - minValue) / range) * 100;
        return { x, y, value: val };
      });
    });
  }, [data, minValue, range]);

  const pathD = useMemo(() => {
    if (!points[0] || points[0].length === 0) return "";
    const pts = points[0];
    return pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD) return "";
    return `${pathD} L 100 100 L 0 100 Z`;
  }, [pathD]);

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.3"
          />
        ))}

        {gradient && areaD && (
          <motion.path
            d={areaD}
            fill={`url(#grad-${color.replace("#", "")})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}

        {pathD && (
          <motion.path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}

        {showDots &&
          points[0]?.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.2"
              fill={color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 + 0.5 }}
            />
          ))}
      </svg>
    </div>
  );
}
