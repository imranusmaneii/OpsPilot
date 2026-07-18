"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Copy, RotateCcw, Zap, Clock, DollarSign, BookOpen } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const TEMPLATES = [
  { id: "rag", name: "RAG Q&A", system: "Answer the question using the provided context. Be concise and cite sources.", prompt: "Context: {context}\n\nQuestion: {question}" },
  { id: "summarize", name: "Summarize", system: "Summarize the following text in bullet points.", prompt: "Text: {text}" },
  { id: "extract", name: "Extract Entities", system: "Extract key entities (people, orgs, dates) as JSON.", prompt: "Text: {text}" },
  { id: "classify", name: "Classify", system: "Classify the text into: technical, business, legal, or other.", prompt: "Text: {text}" },
];

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", speed: "fast" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", speed: "very fast" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", speed: "fast" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", speed: "very fast" },
];

export default function PlaygroundPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ latency: number; tokens: number; cost: string } | null>(null);
  const [history, setHistory] = useState<{ prompt: string; output: string; model: string; time: string }[]>([]);

  const handleRun = async () => {
    setLoading(true);
    setOutput("");
    try {
      const res = await apiClient.post<{
        output: string;
        latency_ms: number;
        usage: { total_tokens: number };
      }>("/playground/run", {
        prompt: userPrompt,
        system_prompt: systemPrompt,
        model,
        temperature,
        max_tokens: maxTokens,
      });
      const data = res.data!;
      setOutput(data.output);
      setStats({ latency: data.latency_ms, tokens: data.usage.total_tokens, cost: ((data.usage.total_tokens / 1000) * 0.00015).toFixed(4) });
      setHistory((prev) => [{ prompt: userPrompt.slice(0, 80), output: data.output.slice(0, 100), model, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
    } catch {
      setOutput("Error: Failed to generate response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prompt Playground</h1>
        <p className="text-sm text-[#94A3B8]">Test and iterate on prompts with real-time feedback</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSystemPrompt(t.system); setUserPrompt(t.prompt); }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-[#7C3AED]/30 hover:bg-white/[0.08]"
          >
            <BookOpen className="mb-2 h-4 w-4 text-[#7C3AED]" />
            <div className="text-sm font-medium">{t.name}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#7C3AED]/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">User Prompt</label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#7C3AED]/50"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
            >
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#94A3B8]">Temp: {temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-24 accent-[#7C3AED]"
              />
            </div>
            <button
              onClick={handleRun}
              disabled={loading || !userPrompt}
              className="ml-auto flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED]/90 disabled:opacity-50"
            >
              <Play className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Running..." : "Run"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#94A3B8]">Output</label>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(output)} className="rounded-lg p-1.5 text-[#94A3B8] hover:text-white">
                <Copy className="h-4 w-4" />
              </button>
              <button onClick={() => { setOutput(""); setStats(null); }} className="rounded-lg p-1.5 text-[#94A3B8] hover:text-white">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="min-h-[300px] rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
              </div>
            ) : output ? (
              <p className="whitespace-pre-wrap">{output}</p>
            ) : (
              <p className="text-[#94A3B8]">Output will appear here...</p>
            )}
          </div>
          {stats && (
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#94A3B8]">
                <Clock className="h-3 w-3" />{stats.latency}ms
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#94A3B8]">
                <Zap className="h-3 w-3" />{stats.tokens} tokens
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#94A3B8]">
                <DollarSign className="h-3 w-3" />${stats.cost}
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Recent Runs</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs"
              >
                <span className="text-[#94A3B8]">{h.time}</span>
                <span className="rounded-lg bg-[#7C3AED]/15 px-2 py-0.5 text-[#7C3AED]">{h.model}</span>
                <span className="truncate text-white/60">{h.prompt}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
