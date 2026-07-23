"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Target,
  AlertTriangle,
  Play,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { MetricCard } from "@/components/evaluation/metric-card";
import { RegressionChart } from "@/components/evaluation/regression-chart";
import { ComparisonTable } from "@/components/evaluation/comparison-table";
import { api } from "@/lib/api-client";

interface Evaluation {
  id: string;
  name: string;
  status: string;
  metrics: Record<string, number> | null;
  model: string | null;
  total_samples: number;
  created_at: string;
  completed_at: string | null;
}

interface RegressionPoint {
  evaluation_id: string;
  name: string;
  created_at: string;
  metrics: Record<string, number>;
}

export default function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [regression, setRegression] = useState<RegressionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvalName, setNewEvalName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [evalsRes, regRes] = await Promise.all([
      api.get<{ evaluations: Evaluation[]; total: number }>("/evaluation"),
      api.get<RegressionPoint[]>("/evaluation/regression"),
    ]);
    if (evalsRes.data) setEvaluations(evalsRes.data.evaluations);
    if (regRes.data) setRegression(regRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latestMetrics = evaluations.find((e) => e.status === "completed" && e.metrics)?.metrics;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const dataset = [
      { question: "What is the revenue forecast for Q4?", ground_truth: "Revenue forecast is $2.4M", context: "Q4 revenue is projected at $2.4M" },
      { question: "What are the main risk factors?", ground_truth: "Supply chain and regulatory", context: "Key risks include supply chain disruptions" },
      { question: "Summarize the API performance metrics", ground_truth: "99.9% uptime, 150ms p95", context: "API maintains 99.9% uptime with 150ms p95 latency" },
    ];

    const res = await api.post<Evaluation>("/evaluation", {
      name: newEvalName || `Eval ${new Date().toLocaleDateString()}`,
      dataset,
    });

    if (res.data) {
      setEvaluations((prev) => [res.data!, ...prev]);
      setShowCreateModal(false);
      setNewEvalName("");
      handleRun(res.data.id);
    }
    setIsCreating(false);
  };

  const handleRun = async (evalId: string) => {
    setRunningId(evalId);
    const res = await api.post<Evaluation>(`/evaluation/${evalId}/run`);
    if (res.data) {
      setEvaluations((prev) => prev.map((e) => (e.id === evalId ? res.data! : e)));
      fetchData();
    }
    setRunningId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evaluation</h1>
          <p className="text-sm text-[#94A3B8]">Measure and improve your RAG pipeline quality</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#DC2626]/90"
          >
            <Plus className="h-4 w-4" />
            New Evaluation
          </button>
        </div>
      </div>

      {latestMetrics ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <MetricCard
            label="Faithfulness"
            value={latestMetrics.faithfulness || 0}
            icon={Brain}
            color="purple"
            description="Grounded in retrieved documents"
          />
          <MetricCard
            label="Answer Relevancy"
            value={latestMetrics.answer_relevancy || 0}
            icon={Target}
            color="blue"
            description="Answers the user's question"
          />
          <MetricCard
            label="Context Precision"
            value={latestMetrics.context_precision || 0}
            icon={BarChart3}
            color="green"
            description="Relevant context retrieved"
          />
          <MetricCard
            label="Hallucination Rate"
            value={1 - (latestMetrics.hallucination_rate || 0)}
            icon={AlertTriangle}
            color={latestMetrics.hallucination_rate > 0.15 ? "red" : "amber"}
            description={`${((latestMetrics.hallucination_rate || 0) * 100).toFixed(1)}% detected`}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Faithfulness", icon: Brain, color: "purple" },
            { label: "Answer Relevancy", icon: Target, color: "blue" },
            { label: "Context Precision", icon: BarChart3, color: "green" },
            { label: "Hallucination Rate", icon: AlertTriangle, color: "amber" },
          ].map((m) => (
            <div key={m.label} className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-xl p-2 bg-[rgba(255,255,255,0.05)]`}>
                  <m.icon className="h-4 w-4 text-[#94A3B8]" />
                </div>
                <span className="text-2xl font-bold text-[#94A3B8]">--</span>
              </div>
              <p className="text-sm text-[#94A3B8]">{m.label}</p>
              <p className="text-xs text-[#94A3B8]/60">Run an evaluation to see metrics</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">Regression History</h3>
          <RegressionChart data={regression} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">Model Comparison</h3>
          <ComparisonTable
            results={[
              { model: "gpt-4o", faithfulness: 0.94, answer_relevancy: 0.91, context_precision: 0.88, hallucination_rate: 0.04, avg_latency_ms: 1200 },
              { model: "gpt-4o-mini", faithfulness: 0.87, answer_relevancy: 0.85, context_precision: 0.82, hallucination_rate: 0.09, avg_latency_ms: 600 },
              { model: "claude-3.5-sonnet", faithfulness: 0.92, answer_relevancy: 0.93, context_precision: 0.9, hallucination_rate: 0.05, avg_latency_ms: 1100 },
            ]}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold">Evaluation History</h3>
        {evaluations.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <BarChart3 className="mb-3 h-8 w-8 text-[#94A3B8]" />
            <p className="text-sm text-[#94A3B8]">No evaluations yet</p>
            <p className="text-xs text-[#94A3B8]/60">Create your first evaluation to measure quality</p>
          </div>
        ) : (
          <div className="space-y-2">
            {evaluations.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4"
              >
                <div className={`rounded-lg p-1.5 ${
                  ev.status === "completed" ? "bg-emerald-400/10" :
                  ev.status === "running" ? "bg-[#2563EB]/10" :
                  ev.status === "failed" ? "bg-red-400/10" : "bg-[#94A3B8]/10"
                }`}>
                  {ev.status === "completed" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> :
                   ev.status === "running" ? <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" /> :
                   <Clock className="h-4 w-4 text-[#94A3B8]" />}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{ev.name}</p>
                  <p className="text-xs text-[#94A3B8]">
                    {ev.total_samples} samples &middot; {ev.model}
                    {ev.completed_at && ` \u00b7 ${new Date(ev.completed_at).toLocaleDateString()}`}
                  </p>
                </div>

                {ev.metrics && (
                  <div className="hidden items-center gap-4 sm:flex">
                    <span className="text-xs text-[#94A3B8]">
                      Faithfulness: <span className="text-emerald-400 font-mono">{((ev.metrics.faithfulness || 0) * 100).toFixed(1)}%</span>
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      Relevancy: <span className="text-[#2563EB] font-mono">{((ev.metrics.answer_relevancy || 0) * 100).toFixed(1)}%</span>
                    </span>
                  </div>
                )}

                {ev.status === "pending" && (
                  <button
                    onClick={() => handleRun(ev.id)}
                    disabled={runningId === ev.id}
                    className="flex items-center gap-1.5 rounded-lg bg-[#DC2626]/15 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#DC2626]/25 disabled:opacity-50"
                  >
                    <Play className="h-3 w-3" />
                    Run
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {showCreateModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass rounded-2xl p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-semibold">Create Evaluation</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-[#94A3B8]">Name</label>
                  <input
                    value={newEvalName}
                    onChange={(e) => setNewEvalName(e.target.value)}
                    placeholder="My Evaluation"
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-[#94A3B8]/50 outline-none focus:border-[#DC2626]/50"
                  />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  A demo dataset with 3 sample questions will be used.
                </p>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-xl px-4 py-2.5 text-sm text-[#94A3B8] hover:text-white">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#DC2626]/90 disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Create & Run
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
