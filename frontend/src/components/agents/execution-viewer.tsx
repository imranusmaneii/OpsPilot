"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Cpu,
  Zap,
  Loader2,
} from "lucide-react";
import type { AgentRun } from "@/types/agent";

interface ExecutionViewerProps {
  runs: AgentRun[];
}

const statusConfig = {
  pending: { icon: Clock, color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" },
  running: { icon: Loader2, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", animate: true },
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

export function ExecutionViewer({ runs }: ExecutionViewerProps) {
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Cpu className="mb-3 h-8 w-8 text-[#94A3B8]" />
        <p className="text-sm text-[#94A3B8]">No agent runs yet</p>
        <p className="text-xs text-[#94A3B8]/60">Runs will appear here when you chat with OpsPilot</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {runs.map((run) => {
        const status = statusConfig[run.status] || statusConfig.pending;
        const StatusIcon = status.icon;
        const isExpanded = expandedRun === run.id;

        return (
          <motion.div
            key={run.id}
            layout
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
          >
            <button
              onClick={() => setExpandedRun(isExpanded ? null : run.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className={`rounded-lg p-1.5 ${status.bg}`}>
                <StatusIcon
                  className={`h-4 w-4 ${status.color} ${"animate" in status && status.animate ? "animate-spin" : ""}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{run.agent_name}</p>
                <p className="text-xs text-[#94A3B8]">
                  {new Date(run.created_at).toLocaleString()}
                  {run.latency_ms && ` \u00b7 ${run.latency_ms.toFixed(0)}ms`}
                </p>
              </div>

              {run.tools_used.length > 0 && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#7C3AED]" />
                  <span className="text-xs text-[#94A3B8]">{run.tools_used.length} tools</span>
                </div>
              )}

              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[rgba(255,255,255,0.05)] px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#94A3B8]">Input</p>
                        <pre className="max-h-32 overflow-auto rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-xs text-[#94A3B8] scrollbar-thin">
                          {run.input_ ? JSON.stringify(run.input_, null, 2) : "N/A"}
                        </pre>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#94A3B8]">Output</p>
                        <pre className="max-h-32 overflow-auto rounded-lg bg-[rgba(255,255,255,0.03)] p-2 text-xs text-[#94A3B8] scrollbar-thin">
                          {run.output_ ? JSON.stringify(run.output_, null, 2) : "N/A"}
                        </pre>
                      </div>
                    </div>

                    {run.tools_used.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-medium text-[#94A3B8]">Tools Used</p>
                        <div className="flex flex-wrap gap-1.5">
                          {run.tools_used.map((tool) => (
                            <span
                              key={tool}
                              className="rounded-md bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] text-[#7C3AED]"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {run.error_message && (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-medium text-red-400">Error</p>
                        <p className="rounded-lg bg-red-500/5 p-2 text-xs text-red-400">
                          {run.error_message}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-[10px] text-[#94A3B8]/60">
                      {run.token_count && <span>{run.token_count} tokens</span>}
                      {run.trace_id && <span>Trace: {run.trace_id}</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
