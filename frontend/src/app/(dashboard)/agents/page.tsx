"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Activity, Zap, Clock, RefreshCw } from "lucide-react";
import { AgentGraph } from "@/components/agents/agent-graph";
import { ExecutionViewer } from "@/components/agents/execution-viewer";
import { api } from "@/lib/api-client";
import type { Agent, AgentRun, WorkflowGraph, WorkflowNode } from "@/types/agent";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowGraph | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [agentStatus, setAgentStatus] = useState<Record<string, unknown>[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "runs">("graph");

  const fetchData = async () => {
    const [agentsRes, workflowRes, runsRes, statusRes] = await Promise.all([
      api.get<Agent[]>("/agents"),
      api.get<WorkflowGraph>("/agents/workflow"),
      api.get<AgentRun[]>("/agents/runs?limit=20"),
      api.get<Record<string, unknown>[]>("/agents/status"),
    ]);
    if (agentsRes.data) setAgents(agentsRes.data);
    if (workflowRes.data) setWorkflow(workflowRes.data);
    if (runsRes.data) setRuns(runsRes.data);
    if (statusRes.data) setAgentStatus(statusRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-sm text-[#94A3B8]">Monitor and configure your multi-agent system</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {agentStatus.slice(0, 4).map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-xs text-[#94A3B8]">{String(a.name)}</p>
            </div>
            <p className="text-lg font-bold">{String(a.total_runs || 0)}</p>
            <p className="text-[10px] text-[#94A3B8]/60">total runs</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-[rgba(255,255,255,0.08)] pb-2">
        <button
          onClick={() => setActiveTab("graph")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "graph"
              ? "bg-[#7C3AED]/15 text-[#7C3AED]"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          Workflow Graph
        </button>
        <button
          onClick={() => setActiveTab("runs")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "runs"
              ? "bg-[#7C3AED]/15 text-[#7C3AED]"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          Execution History
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={activeTab === "graph" ? "lg:col-span-2" : "lg:col-span-3"}>
          {activeTab === "graph" ? (
            workflow ? (
              <AgentGraph
                workflow={workflow}
                activeAgent={selectedNode?.id}
                onNodeClick={handleNodeClick}
              />
            ) : (
              <div className="flex h-96 items-center justify-center glass rounded-2xl">
                <p className="text-sm text-[#94A3B8]">Loading workflow graph...</p>
              </div>
            )
          ) : (
            <ExecutionViewer runs={runs} />
          )}
        </div>

        {activeTab === "graph" && selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#7C3AED]/10 p-2.5">
                <Bot className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedNode.name}</h3>
                <p className="text-xs text-[#94A3B8]">Agent Details</p>
              </div>
            </div>

            <p className="mb-4 text-sm text-[#94A3B8]">{selectedNode.description}</p>

            {selectedNode.tools.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-[#94A3B8]">Tools</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-lg bg-[#7C3AED]/10 px-2 py-1 text-xs text-[#7C3AED]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-[rgba(255,255,255,0.08)] pt-4">
              <p className="mb-2 text-xs font-medium text-[#94A3B8]">Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm">Active</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "graph" && !selectedNode && (
          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#7C3AED]/10 p-2.5">
                <Activity className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="font-semibold">Agent Overview</h3>
                <p className="text-xs text-[#94A3B8]">All agents</p>
              </div>
            </div>

            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      agent.status === "active" ? "bg-emerald-400" : "bg-[#94A3B8]"
                    }`} />
                    <span className="text-sm">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <Zap className="h-3 w-3" />
                    {(agent.tools_used?.length || 0)} tools
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
