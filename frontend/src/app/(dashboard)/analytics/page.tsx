"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, DollarSign, Clock, Cpu, RefreshCw } from "lucide-react";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { LineChart } from "@/components/dashboard/charts/line-chart";
import { DonutChart } from "@/components/dashboard/charts/donut-chart";
import { api } from "@/lib/api-client";

interface UsageDay {
  date: string;
  count: number;
  tokens: number;
  cost: number;
}

interface CostBreakdown {
  model: string;
  cost: number;
  count: number;
}

interface LatencyMetric {
  date: string;
  avg: number;
  min: number;
  max: number;
}

interface ModelComparison {
  model: string;
  count: number;
  avg_latency_ms: number;
  avg_tokens: number;
  total_cost: number;
}

export default function AnalyticsPage() {
  const [usage, setUsage] = useState<UsageDay[]>([]);
  const [cost, setCost] = useState<CostBreakdown[]>([]);
  const [latency, setLatency] = useState<LatencyMetric[]>([]);
  const [models, setModels] = useState<ModelComparison[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [usageRes, costRes, latencyRes, modelsRes] = await Promise.all([
      api.get<UsageDay[]>("/analytics/usage?days=30"),
      api.get<CostBreakdown[]>("/analytics/cost?days=30"),
      api.get<LatencyMetric[]>("/analytics/latency?days=30"),
      api.get<ModelComparison[]>("/analytics/models"),
    ]);
    if (usageRes.data) setUsage(usageRes.data);
    if (costRes.data) setCost(costRes.data);
    if (latencyRes.data) setLatency(latencyRes.data);
    if (modelsRes.data) setModels(modelsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const usageBarData = usage.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.count,
  }));

  const tokenBarData = usage.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.tokens,
  }));

  const latencyLineData = [
    { label: "avg", values: latency.map((l) => l.avg) },
    { label: "min", values: latency.map((l) => l.min) },
    { label: "max", values: latency.map((l) => l.max) },
  ];

  const donutData = cost.length > 0
    ? cost.map((c, i) => ({
        label: c.model || "unknown",
        value: c.cost,
        color: ["#7C3AED", "#2563EB", "#10B981", "#F59E0B", "#EF4444"][i % 5],
      }))
    : [{ label: "No data", value: 1, color: "#94A3B8" }];

  const totalCost = cost.reduce((sum, c) => sum + c.cost, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-[#94A3B8]">Usage statistics and performance metrics</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#7C3AED]" />
            <h3 className="text-lg font-semibold">Daily Usage</h3>
          </div>
          {usageBarData.length > 0 ? (
            <BarChart data={usageBarData} height={200} />
          ) : (
            <div className="flex h-48 items-center justify-center text-[#94A3B8] text-sm">No data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-lg font-semibold">Token Usage</h3>
          </div>
          {tokenBarData.length > 0 ? (
            <BarChart data={tokenBarData} height={200} color="#2563EB" />
          ) : (
            <div className="flex h-48 items-center justify-center text-[#94A3B8] text-sm">No data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <h3 className="text-lg font-semibold">Latency Distribution</h3>
          </div>
          {latency.length > 0 ? (
            <LineChart data={latencyLineData} height={200} color="#10B981" />
          ) : (
            <div className="flex h-48 items-center justify-center text-[#94A3B8] text-sm">No data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-lg font-semibold">Cost Breakdown</h3>
          </div>
          <div className="flex items-center justify-center">
            <DonutChart
              data={donutData}
              size={160}
              thickness={20}
              centerLabel="total"
              centerValue={`$${totalCost.toFixed(2)}`}
            />
          </div>
        </motion.div>
      </div>

      {models.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">Model Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="pb-3 text-left text-xs font-medium text-[#94A3B8]">Model</th>
                  <th className="pb-3 text-right text-xs font-medium text-[#94A3B8]">Requests</th>
                  <th className="pb-3 text-right text-xs font-medium text-[#94A3B8]">Avg Latency</th>
                  <th className="pb-3 text-right text-xs font-medium text-[#94A3B8]">Avg Tokens</th>
                  <th className="pb-3 text-right text-xs font-medium text-[#94A3B8]">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.model} className="border-b border-[rgba(255,255,255,0.05)]">
                    <td className="py-3 font-medium">{m.model}</td>
                    <td className="py-3 text-right text-[#94A3B8]">{m.count.toLocaleString()}</td>
                    <td className="py-3 text-right text-[#94A3B8]">{m.avg_latency_ms.toFixed(0)}ms</td>
                    <td className="py-3 text-right text-[#94A3B8]">{m.avg_tokens.toFixed(0)}</td>
                    <td className="py-3 text-right text-[#94A3B8]">${m.total_cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
