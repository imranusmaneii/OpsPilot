"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Zap,
  Activity,
  Brain,
  Database,
  Timer,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LineChart } from "@/components/dashboard/charts/line-chart";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { api } from "@/lib/api-client";

interface Overview {
  documents_indexed: number;
  questions_answered: number;
  evaluations_run: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_latency_ms: number;
  embedding_count: number;
}

interface UsageDay {
  date: string;
  count: number;
  tokens: number;
  cost: number;
}

interface AgentStatus {
  name: string;
  key: string;
  status: string;
  total_runs: number;
  success_rate: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [usage, setUsage] = useState<UsageDay[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    const [overviewRes, usageRes, agentRes] = await Promise.all([
      api.get<Overview>("/analytics/overview"),
      api.get<UsageDay[]>("/analytics/usage?days=30"),
      api.get<AgentStatus[]>("/agents/status"),
    ]);
    if (overviewRes.data) setOverview(overviewRes.data);
    if (usageRes.data) setUsage(usageRes.data);
    if (agentRes.data) setAgentStatus(agentRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpis = [
    { title: "Documents Indexed", value: String(overview?.documents_indexed || 0), change: "+12%", icon: FileText, color: "purple" as const },
    { title: "Questions Answered", value: String(overview?.questions_answered || 0), change: "+23%", icon: MessageSquare, color: "blue" as const },
    { title: "Total Tokens", value: overview?.total_tokens ? `${(overview.total_tokens / 1000).toFixed(1)}K` : "0", change: "+15%", icon: Zap, color: "purple" as const },
    { title: "Agent Health", value: "99.8%", change: "+0.2%", icon: Activity, color: "blue" as const },
    { title: "Embedding Count", value: overview?.embedding_count ? `${(overview.embedding_count / 1000).toFixed(1)}K` : "0", change: "+15%", icon: Database, color: "purple" as const },
    { title: "Evaluations", value: String(overview?.evaluations_run || 0), change: "+0.03", icon: Brain, color: "blue" as const },
    { title: "Avg Latency", value: overview?.avg_latency_ms ? `${(overview.avg_latency_ms / 1000).toFixed(1)}s` : "1.2s", change: "-18%", icon: Timer, color: "purple" as const },
    { title: "Cost (MTD)", value: `$${overview?.total_cost_usd || 0}`, change: "-5%", icon: TrendingUp, color: "blue" as const },
  ];

  const usageChartData = usage.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.count,
  }));

  const costChartData = usage.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.cost,
  }));

  const latencyData = [
    { label: "Mon", values: [1200, 1100, 1050] },
    { label: "Tue", values: [1150, 1080, 1020] },
    { label: "Wed", values: [1100, 1050, 980] },
    { label: "Thu", values: [1050, 1000, 950] },
    { label: "Fri", values: [1000, 980, 920] },
    { label: "Sat", values: [980, 950, 900] },
    { label: "Sun", values: [950, 920, 880] },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[#94A3B8]">Overview of your AI operations platform</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.title} variants={item}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Usage Over Time</h3>
            <span className="text-xs text-[#94A3B8]">Last 30 days</span>
          </div>
          {usageChartData.length > 0 ? (
            <BarChart data={usageChartData} height={180} />
          ) : (
            <div className="flex h-48 items-center justify-center text-[#94A3B8]">
              <p className="text-sm">No usage data yet</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cost Over Time</h3>
            <span className="text-xs text-[#94A3B8]">Last 30 days</span>
          </div>
          {costChartData.length > 0 ? (
            <BarChart data={costChartData} height={180} color="#2563EB" />
          ) : (
            <div className="flex h-48 items-center justify-center text-[#94A3B8]">
              <p className="text-sm">No cost data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Response Latency</h3>
            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]" /> P50
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#2563EB]" /> P90
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> P99
              </span>
            </div>
          </div>
          <LineChart data={latencyData} height={200} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">Agent Status</h3>
          <div className="space-y-3">
            {agentStatus.length > 0 ? agentStatus.map((agent) => (
              <div key={agent.key} className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3">
                <span className="text-sm">{agent.name}</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-emerald-400" : "bg-[#94A3B8]"}`} />
                  <span className="text-xs text-[#94A3B8]">{agent.total_runs} runs</span>
                </div>
              </div>
            )) : (
              <>
                {["Planner Agent", "Retriever", "Document QA", "API Agent", "Reasoning Agent", "Evaluator"].map((name) => (
                  <div key={name} className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3">
                    <span className="text-sm">{name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-[#94A3B8]">active</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
