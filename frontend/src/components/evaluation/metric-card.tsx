"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  description?: string;
}

export function MetricCard({ label, value, icon: Icon, color, description }: MetricCardProps) {
  const percentage = Math.round(value * 100);
  const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
    purple: { bg: "bg-[#DC2626]/10", text: "text-[#DC2626]", bar: "bg-[#DC2626]" },
    blue: { bg: "bg-[#2563EB]/10", text: "text-[#2563EB]", bar: "bg-[#2563EB]" },
    green: { bg: "bg-emerald-500/10", text: "text-emerald-400", bar: "bg-emerald-400" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", bar: "bg-amber-400" },
    red: { bg: "bg-red-500/10", text: "text-red-400", bar: "bg-red-400" },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`rounded-xl p-2 ${c.bg}`}>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>
        <span className={`text-2xl font-bold ${c.text}`}>{percentage}%</span>
      </div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      {description && <p className="mb-3 text-xs text-[#94A3B8]">{description}</p>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${c.bar}`}
        />
      </div>
    </motion.div>
  );
}
