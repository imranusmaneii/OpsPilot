"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calculator, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", input: 2.50, output: 10.00, color: "#DC2626" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", input: 0.15, output: 0.60, color: "#2563EB" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", input: 10.00, output: 30.00, color: "#EC4899" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", input: 3.00, output: 15.00, color: "#F59E0B" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", input: 0.25, output: 1.25, color: "#10B981" },
  { id: "text-embedding-3-small", name: "Embedding Small", input: 0.02, output: 0, color: "#6366F1" },
  { id: "text-embedding-3-large", name: "Embedding Large", input: 0.13, output: 0, color: "#8B5CF6" },
];

const SCENARIOS = [
  { name: "Simple Chat", inputTokens: 500, outputTokens: 200, description: "Basic Q&A interaction" },
  { name: "RAG Query", inputTokens: 4000, outputTokens: 1000, description: "Context + question + answer" },
  { name: "Document Summarization", inputTokens: 8000, outputTokens: 2000, description: "Summarize long document" },
  { name: "Code Generation", inputTokens: 2000, outputTokens: 3000, description: "Generate code from spec" },
  { name: "Batch Processing (1K docs)", inputTokens: 500000, outputTokens: 100000, description: "Process 1000 documents" },
];

export default function CostEstimatorPage() {
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [monthlyRequests, setMonthlyRequests] = useState(10000);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const costs = MODELS.map((model) => ({
    ...model,
    inputCost: (inputTokens / 1_000_000) * model.input,
    outputCost: (outputTokens / 1_000_000) * model.output,
    totalCost: (inputTokens / 1_000_000) * model.input + (outputTokens / 1_000_000) * model.output,
    monthlyCost: ((inputTokens / 1_000_000) * model.input + (outputTokens / 1_000_000) * model.output) * monthlyRequests,
  })).sort((a, b) => a.totalCost - b.totalCost);

  const maxCost = Math.max(...costs.map((c) => c.totalCost), 0.001);

  const handleScenario = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario.name);
    setInputTokens(scenario.inputTokens);
    setOutputTokens(scenario.outputTokens);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cost Estimator</h1>
        <p className="text-sm text-[#94A3B8]">Estimate and optimize your AI spending</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.name}
            onClick={() => handleScenario(s)}
            className={`rounded-xl border px-4 py-2.5 text-left transition-all ${
              selectedScenario === s.name
                ? "border-[#DC2626]/50 bg-[#DC2626]/10"
                : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
            }`}
          >
            <div className="text-sm font-medium">{s.name}</div>
            <div className="text-[10px] text-[#94A3B8]">{s.description}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Input Tokens</label>
          <input
            type="number"
            value={inputTokens}
            onChange={(e) => setInputTokens(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#DC2626]/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Output Tokens</label>
          <input
            type="number"
            value={outputTokens}
            onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#DC2626]/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Monthly Requests</label>
          <input
            type="number"
            value={monthlyRequests}
            onChange={(e) => setMonthlyRequests(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#DC2626]/50"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Per-Request Cost</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {costs.map((cost, i) => (
            <motion.div
              key={cost.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">{cost.name}</span>
                <span className="text-lg font-bold" style={{ color: cost.color }}>
                  ${cost.totalCost.toFixed(6)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(cost.totalCost / maxCost) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: cost.color }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#94A3B8]">
                <span>Input: ${(cost.inputCost * 1000).toFixed(4)}¢</span>
                <span>Output: ${(cost.outputCost * 1000).toFixed(4)}¢</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Monthly Projection</h2>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-1 text-xs text-[#DC2626]"
          >
            <Calculator className="h-3 w-3" />
            {showBreakdown ? "Hide" : "Show"} Breakdown
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {costs.slice(0, 5).map((cost) => (
            <div key={cost.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm">{cost.name}</span>
              <div className="text-right">
                <div className="font-bold" style={{ color: cost.color }}>
                  ${cost.monthlyCost.toFixed(2)}
                </div>
                {showBreakdown && (
                  <div className="text-[10px] text-[#94A3B8]">
                    {monthlyRequests.toLocaleString()} requests × ${cost.totalCost.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-6">
        <div className="mb-3 flex items-center gap-2 text-[#DC2626]">
          <TrendingUp className="h-5 w-5" />
          <span className="font-medium">Cost Optimization Tips</span>
        </div>
        <ul className="space-y-2 text-sm text-[#94A3B8]">
          <li className="flex items-start gap-2"><Zap className="mt-0.5 h-3 w-3 text-[#DC2626]" />Use GPT-4o Mini or Claude 3 Haiku for simple tasks (90% cost savings)</li>
          <li className="flex items-start gap-2"><Zap className="mt-0.5 h-3 w-3 text-[#DC2626]" />Cache frequently accessed RAG results to reduce redundant API calls</li>
          <li className="flex items-start gap-2"><Zap className="mt-0.5 h-3 w-3 text-[#DC2626]" />Batch process documents during off-peak hours for lower latency</li>
          <li className="flex items-start gap-2"><Zap className="mt-0.5 h-3 w-3 text-[#DC2626]" />Use embeddings for semantic search instead of full LLM calls when possible</li>
        </ul>
      </div>
    </div>
  );
}
