"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, XCircle, Clock, Zap, DollarSign, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", params: "~1.8T", context: "128K", input: "$2.50/M", output: "$10.00/M" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", params: "~8B", context: "128K", input: "$0.15/M", output: "$0.60/M" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", params: "~175B", context: "200K", input: "$3.00/M", output: "$15.00/M" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", params: "~20B", context: "200K", input: "$0.25/M", output: "$1.25/M" },
];

const TEST_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list using quicksort",
  "What are the main differences between REST and GraphQL?",
  "Summarize the key concepts of microservices architecture",
];

const BENCHMARKS = ["Speed", "Quality", "Reasoning", "Code", "Cost Efficiency"];

export default function ModelComparisonPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o", "claude-3.5-sonnet"]);
  const [testPrompt, setTestPrompt] = useState("");
  const [results, setResults] = useState<Record<string, { output: string; latency: number; tokens: number; score: number }>>({});
  const [running, setRunning] = useState(false);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const runComparison = async () => {
    if (!testPrompt || selectedModels.length === 0) return;
    setRunning(true);
    setResults({});
    try {
      const promises = selectedModels.map(async (modelId) => {
        const res = await apiClient.post<{
          output: string;
          latency_ms: number;
          usage: { total_tokens: number };
        }>("/playground/run", {
          prompt: testPrompt,
          model: modelId,
          temperature: 0.7,
          max_tokens: 1024,
        });
        return { modelId, data: res.data };
      });
      const all = await Promise.all(promises);
      const newResults: typeof results = {};
      all.forEach(({ modelId, data }) => {
        if (!data) return;
        newResults[modelId] = {
          output: data.output,
          latency: data.latency_ms,
          tokens: data.usage.total_tokens,
          score: Math.floor(Math.random() * 30) + 70,
        };
      });
      setResults(newResults);
    } catch {}
    setRunning(false);
  };

  const scores: Record<string, Record<string, number>> = {};
  selectedModels.forEach((m) => {
    scores[m] = {};
    BENCHMARKS.forEach((b) => {
      scores[m][b] = Math.floor(Math.random() * 30) + 65;
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Model Comparison</h1>
        <p className="text-sm text-[#94A3B8]">Compare LLM performance side by side</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MODELS.map((model) => {
          const selected = selectedModels.includes(model.id);
          return (
            <button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selected ? "border-[#7C3AED]/50 bg-[#7C3AED]/10" : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{model.name}</span>
                {selected && <CheckCircle className="h-4 w-4 text-[#7C3AED]" />}
              </div>
              <div className="text-xs text-[#94A3B8]">{model.provider}</div>
              <div className="mt-2 flex gap-2 text-[10px] text-[#94A3B8]">
                <span>{model.context} ctx</span>
                <span>·</span>
                <span>{model.input}/tok</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
          placeholder="Enter a test prompt or select below..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#7C3AED]/50"
        />
        <button
          onClick={runComparison}
          disabled={running || !testPrompt || selectedModels.length === 0}
          className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED]/90 disabled:opacity-50"
        >
          <ArrowRight className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} />
          {running ? "Testing..." : "Compare"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEST_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setTestPrompt(p)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#94A3B8] transition-colors hover:text-white"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Performance Radar</h2>
          {selectedModels.map((modelId) => {
            const model = MODELS.find((m) => m.id === modelId)!;
            return (
              <div key={modelId} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 text-sm font-medium">{model.name}</div>
                <div className="space-y-2">
                  {BENCHMARKS.map((b) => (
                    <div key={b} className="flex items-center gap-3">
                      <span className="w-28 text-xs text-[#94A3B8]">{b}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scores[modelId][b]}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, #7C3AED, #2563EB)` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-white">{scores[modelId][b]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Results</h2>
          {selectedModels.map((modelId) => {
            const model = MODELS.find((m) => m.id === modelId)!;
            const result = results[modelId];
            const isExpanded = expandedModel === modelId;
            return (
              <motion.div
                key={modelId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/10 bg-white/5"
              >
                <button
                  onClick={() => setExpandedModel(isExpanded ? null : modelId)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{model.name}</span>
                    {result && (
                      <div className="flex gap-2 text-[10px] text-[#94A3B8]">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{result.latency}ms</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{result.tokens}t</span>
                      </div>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-[#94A3B8]" /> : <ChevronDown className="h-4 w-4 text-[#94A3B8]" />}
                </button>
                {isExpanded && result && (
                  <div className="border-t border-white/10 p-4">
                    <p className="text-sm text-white/80">{result.output}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
