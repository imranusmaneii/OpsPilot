export interface Agent {
  name: string;
  description: string;
  status: "active" | "idle" | "error";
  tools_used?: string[];
  last_run?: string;
  avg_latency_ms?: number;
  total_runs?: number;
  success_rate?: number;
}

export interface AgentRun {
  id: string;
  agent_name: string;
  status: "pending" | "running" | "completed" | "failed";
  input_: Record<string, unknown> | null;
  output_: Record<string, unknown> | null;
  tools_used: string[];
  token_count: number | null;
  latency_ms: number | null;
  error_message: string | null;
  trace_id: string | null;
  created_at: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  description: string;
  tools: string[];
  status: string;
}

export interface WorkflowEdge {
  source: string;
  target: string;
  label: string | null;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
