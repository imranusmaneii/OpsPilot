"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Activity, Zap, Clock, RefreshCw, Play, CheckCircle, AlertCircle, Loader2, Cpu, GitBranch } from "lucide-react";
import dynamic from "next/dynamic";

const Pipeline3DDynamic = dynamic(
  () => import("@/components/agents/pipeline-3d").then((m) => m.Pipeline3D),
  { ssr: false }
);

interface Agent {
  name: string;
  description: string;
  status: "active" | "idle" | "error";
  tools_used: string[];
  total_runs: number;
  avg_latency_ms: number;
  success_rate: number;
}

interface AgentRun {
  id: string;
  agent_name: string;
  status: "completed" | "running" | "failed";
  input_: string;
  output_: string;
  tools_used: string[];
  latency_ms: number;
  created_at: string;
}

const AGENTS: Agent[] = [
  { name: "Planner", description: "Breaks down complex queries into actionable sub-tasks and orchestrates the multi-agent pipeline", status: "active", tools_used: ["task_decomposition", "route_selection"], total_runs: 1247, avg_latency_ms: 120, success_rate: 98.5 },
  { name: "Retriever", description: "Searches the vector knowledge base and performs hybrid retrieval with semantic + keyword matching", status: "active", tools_used: ["vector_search", "keyword_search", "hybrid_rerank"], total_runs: 3891, avg_latency_ms: 85, success_rate: 99.2 },
  { name: "Document QA", description: "Answers questions grounded in retrieved document context with citation tracking", status: "active", tools_used: ["context_extraction", "answer_generation", "citation_tracking"], total_runs: 2156, avg_latency_ms: 340, success_rate: 96.8 },
  { name: "API Agent", description: "Interfaces with external APIs and services to fetch real-time data for enriched responses", status: "idle", tools_used: ["http_request", "json_parser"], total_runs: 423, avg_latency_ms: 210, success_rate: 94.1 },
  { name: "Reasoning", description: "Performs multi-step logical reasoning, chain-of-thought analysis, and complex inference", status: "active", tools_used: ["chain_of_thought", "reflection", "self_correction"], total_runs: 1834, avg_latency_ms: 560, success_rate: 95.3 },
  { name: "Citation", description: "Extracts and validates source references, ensures proper attribution in responses", status: "active", tools_used: ["source_validation", "citation_formatting"], total_runs: 2891, avg_latency_ms: 45, success_rate: 99.7 },
  { name: "Evaluator", description: "Evaluates response quality using faithfulness, relevance, and accuracy metrics", status: "active", tools_used: ["faithfulness_check", "relevance_scoring", "hallucination_detection"], total_runs: 2156, avg_latency_ms: 180, success_rate: 97.4 },
];

const DEMO_RUNS: AgentRun[] = [
  { id: "run-1", agent_name: "Planner", status: "completed", input_: "Analyze Q4 report risks", output_: "Decomposed into 3 sub-tasks: document retrieval, risk extraction, summary generation", tools_used: ["task_decomposition"], latency_ms: 112, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: "run-2", agent_name: "Retriever", status: "completed", input_: "Find risk-related documents", output_: "Retrieved 5 relevant chunks from 3 documents with avg similarity 0.89", tools_used: ["vector_search", "hybrid_rerank"], latency_ms: 78, created_at: new Date(Date.now() - 280000).toISOString() },
  { id: "run-3", agent_name: "Document QA", status: "completed", input_: "Extract risks from context", output_: "Identified 4 high-priority and 2 medium-priority risks", tools_used: ["context_extraction", "answer_generation"], latency_ms: 325, created_at: new Date(Date.now() - 260000).toISOString() },
  { id: "run-4", agent_name: "Reasoning", status: "completed", input_: "Cross-reference with historical data", output_: "Found 2 recurring risks from Q3, 3 new emerging risks", tools_used: ["chain_of_thought", "reflection"], latency_ms: 490, created_at: new Date(Date.now() - 240000).toISOString() },
  { id: "run-5", agent_name: "Citation", status: "completed", input_: "Validate all source references", output_: "All 6 risks traced to source documents with page numbers", tools_used: ["source_validation"], latency_ms: 42, created_at: new Date(Date.now() - 220000).toISOString() },
  { id: "run-6", agent_name: "Evaluator", status: "completed", input_: "Evaluate response quality", output_: "Faithfulness: 0.96, Relevance: 0.94, No hallucinations detected", tools_used: ["faithfulness_check", "relevance_scoring"], latency_ms: 165, created_at: new Date(Date.now() - 200000).toISOString() },
];

const WORKFLOW_NODES = [
  { id: "planner", name: "Planner", x: 250, y: 40, color: "#DC2626", tools: 2 },
  { id: "retriever", name: "Retriever", x: 250, y: 150, color: "#2563EB", tools: 3 },
  { id: "document_qa", name: "Document QA", x: 250, y: 260, color: "#06B6D4", tools: 3 },
  { id: "api_agent", name: "API Agent", x: 420, y: 260, color: "#F59E0B", tools: 2 },
  { id: "reasoning", name: "Reasoning", x: 250, y: 370, color: "#10B981", tools: 3 },
  { id: "citation", name: "Citation", x: 250, y: 480, color: "#EC4899", tools: 2 },
  { id: "evaluator", name: "Evaluator", x: 250, y: 590, color: "#6366F1", tools: 3 },
];

const WORKFLOW_EDGES = [
  { from: "planner", to: "retriever", label: "decompose" },
  { from: "retriever", to: "document_qa", label: "context" },
  { from: "retriever", to: "api_agent", label: "external" },
  { from: "document_qa", to: "reasoning", label: "answers" },
  { from: "api_agent", to: "reasoning", label: "data" },
  { from: "reasoning", to: "citation", label: "reasoned" },
  { from: "citation", to: "evaluator", label: "cited" },
];

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<"graph" | "runs" | "list">("graph");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [runLogs, setRunLogs] = useState<{ agent: string; status: string; time: string }[]>([]);
  const [pipelineRunning, setPipelineRunning] = useState(-1);
  const [pipelineCompleted, setPipelineCompleted] = useState<number[]>([]);

  const totalRuns = AGENTS.reduce((sum, a) => sum + a.total_runs, 0);
  const avgSuccess = AGENTS.reduce((sum, a) => sum + a.success_rate, 0) / AGENTS.length;

  const handleRunPipeline = async () => {
    if (running) return;
    setRunning(true);
    setRunLogs([]);
    setActiveTab("graph");
    setPipelineRunning(0);
    setPipelineCompleted([]);

    const agentOrder = ["planner", "retriever", "document_qa", "reasoning", "citation", "evaluator"];
    const agentNames = ["Planner", "Retriever", "Document QA", "Reasoning", "Citation", "Evaluator"];

    for (let i = 0; i < agentOrder.length; i++) {
      setActiveNode(agentOrder[i]);
      setPipelineRunning(i);
      setRunLogs((prev) => [...prev, { agent: agentNames[i], status: "running", time: "" }]);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

      setPipelineCompleted((prev) => [...prev, i]);
      setRunLogs((prev) =>
        prev.map((log, idx) =>
          idx === i
            ? { ...log, status: "completed", time: `${Math.floor(Math.random() * 400 + 100)}ms` }
            : log
        )
      );
    }

    setPipelineRunning(-1);
    setActiveNode(null);
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-sm text-[#94A3B8]">Monitor and configure your multi-agent AI pipeline</p>
        </div>
        <button
          onClick={handleRunPipeline}
          disabled={running}
          className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#DC2626]/90 disabled:opacity-60"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Running..." : "Run Pipeline"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Agents", value: AGENTS.length, icon: Bot, color: "text-[#FCA5A5]" },
          { label: "Total Runs", value: totalRuns.toLocaleString(), icon: Activity, color: "text-[#60A5FA]" },
          { label: "Avg Success", value: `${avgSuccess.toFixed(1)}%`, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Avg Latency", value: `${Math.round(AGENTS.reduce((s, a) => s + a.avg_latency_ms, 0) / AGENTS.length)}ms`, icon: Clock, color: "text-[#F59E0B]" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/[0.06] bg-[#0A0F1E]/60 p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <p className="text-xs text-[#64748B]">{stat.label}</p>
              </div>
              <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-2">
        {[
          { id: "graph" as const, label: "Workflow Graph", icon: GitBranch },
          { id: "list" as const, label: "Agent List", icon: Bot },
          { id: "runs" as const, label: "Execution History", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#DC2626]/15 text-[#FCA5A5]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "graph" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Agent Workflow Pipeline</h3>
                <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Active</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#94A3B8]" /> Idle</span>
                </div>
              </div>

              <div className="flex justify-center overflow-hidden">
                <Pipeline3DDynamic
                  onNodeClick={(agentId) => setSelectedAgent(agentId)}
                  runningAgentIndex={pipelineRunning}
                  completedAgents={pipelineCompleted}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Run Logs - shown during/after pipeline run */}
            {runLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-5 backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-xl bg-[#DC2626]/10 p-2.5">
                    {running ? (
                      <Loader2 className="h-5 w-5 text-[#DC2626] animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {running ? "Pipeline Running..." : "Pipeline Complete"}
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      {runLogs.filter((l) => l.status === "completed").length}/{runLogs.length} agents executed
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {runLogs.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {log.status === "running" ? (
                          <Loader2 className="h-3 w-3 animate-spin text-[#F59E0B]" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                        )}
                        <span className="text-sm text-white">{log.agent}</span>
                      </div>
                      <span className="text-[10px] text-[#475569]">
                        {log.status === "running" ? "running..." : log.time}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedAgent ? (
              (() => {
                const agent = AGENTS.find((a) => a.name.toLowerCase().replace(" ", "_") === selectedAgent);
                if (!agent) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-5 backdrop-blur-xl"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-xl bg-[#DC2626]/10 p-2.5">
                        <Bot className="h-5 w-5 text-[#DC2626]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{agent.name}</h3>
                        <p className="text-xs text-[#94A3B8]">Agent Details</p>
                      </div>
                    </div>
                    <p className="mb-4 text-sm text-[#94A3B8]">{agent.description}</p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#475569]">Status</span>
                        <span className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-emerald-400" : "bg-[#94A3B8]"}`} />
                          {agent.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#475569]">Total Runs</span>
                        <span className="text-white">{agent.total_runs.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#475569]">Avg Latency</span>
                        <span className="text-white">{agent.avg_latency_ms}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#475569]">Success Rate</span>
                        <span className="text-emerald-400">{agent.success_rate}%</span>
                      </div>
                    </div>

                    {agent.tools_used.length > 0 && (
                      <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <p className="mb-2 text-xs font-medium text-[#94A3B8]">Tools</p>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.tools_used.map((tool) => (
                            <span key={tool} className="rounded-lg bg-[#DC2626]/10 px-2 py-1 text-[10px] text-[#FCA5A5]">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-[#DC2626]/10 p-2.5">
                    <Activity className="h-5 w-5 text-[#DC2626]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Pipeline Overview</h3>
                    <p className="text-xs text-[#94A3B8]">Click a node to view details</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {AGENTS.map((agent) => (
                    <button
                      key={agent.name}
                      onClick={() => setSelectedAgent(agent.name.toLowerCase().replace(" ", "_"))}
                      className="flex w-full items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-emerald-400" : "bg-[#94A3B8]"}`} />
                        <span className="text-sm text-white">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#475569]">
                        <span>{agent.tools_used.length} tools</span>
                        <span>{agent.success_rate}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-5 backdrop-blur-xl transition-all hover:border-white/[0.1]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#DC2626]/10 p-2.5">
                    <Bot className="h-5 w-5 text-[#DC2626]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-[#94A3B8]">{agent.description.slice(0, 60)}...</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                  <p className="text-lg font-bold text-white">{agent.total_runs.toLocaleString()}</p>
                  <p className="text-[10px] text-[#475569]">Runs</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                  <p className="text-lg font-bold text-white">{agent.avg_latency_ms}ms</p>
                  <p className="text-[10px] text-[#475569]">Latency</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                  <p className="text-lg font-bold text-emerald-400">{agent.success_rate}%</p>
                  <p className="text-[10px] text-[#475569]">Success</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {agent.tools_used.map((tool) => (
                  <span key={tool} className="rounded-md bg-[#DC2626]/10 px-2 py-0.5 text-[10px] text-[#FCA5A5]">
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "runs" && (
        <div className="space-y-2">
          {DEMO_RUNS.map((run) => {
            const isExpanded = expandedRun === run.id;
            const statusConfig = {
              completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
              running: { icon: Loader2, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", animate: true },
              failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
            };
            const status = statusConfig[run.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={run.id}
                layout
                className="rounded-xl border border-white/[0.06] bg-[#0A0F1E]/60 backdrop-blur-xl"
              >
                <button
                  onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className={`rounded-lg p-1.5 ${status.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${status.color} ${"animate" in status && status.animate ? "animate-spin" : ""}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{run.agent_name}</p>
                    <p className="text-xs text-[#475569]">
                      {new Date(run.created_at).toLocaleTimeString()} · {run.latency_ms}ms
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-[#DC2626]" />
                    <span className="text-xs text-[#94A3B8]">{run.tools_used.length} tools</span>
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden border-t border-white/[0.04] px-4 pb-4 pt-3"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#94A3B8]">Input</p>
                        <pre className="max-h-24 overflow-auto rounded-lg bg-white/[0.03] p-2 text-xs text-[#94A3B8]">{run.input_}</pre>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#94A3B8]">Output</p>
                        <pre className="max-h-24 overflow-auto rounded-lg bg-white/[0.03] p-2 text-xs text-[#94A3B8]">{run.output_}</pre>
                      </div>
                    </div>
                    {run.tools_used.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {run.tools_used.map((tool) => (
                          <span key={tool} className="rounded-md bg-[#DC2626]/10 px-2 py-0.5 text-[10px] text-[#FCA5A5]">{tool}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
