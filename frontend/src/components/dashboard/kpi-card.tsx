"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: "purple" | "blue";
}

export function KpiCard({ title, value, change, icon: Icon, color }: KpiCardProps) {
  const isPositive = change.startsWith("+") || change.startsWith("-");

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="glass glass-hover group cursor-pointer rounded-2xl p-5 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-[#94A3B8]">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p
            className={`text-xs font-medium ${
              change.startsWith("+") && !change.includes("-")
                ? "text-emerald-400"
                : change.startsWith("-")
                  ? "text-emerald-400"
                  : "text-[#94A3B8]"
            }`}
          >
            {change} from last month
          </p>
        </div>
        <div
          className={`rounded-xl p-2.5 transition-colors ${
            color === "purple"
              ? "bg-[#DC2626]/10 text-[#DC2626] group-hover:bg-[#DC2626]/20"
              : "bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB]/20"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
