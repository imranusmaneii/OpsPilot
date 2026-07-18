import uuid
from datetime import datetime
from pydantic import BaseModel


class AgentInfo(BaseModel):
    name: str
    description: str
    status: str
    last_run: datetime | None = None
    avg_latency_ms: float | None = None
    total_runs: int = 0
    success_rate: float = 0.0


class AgentRunResponse(BaseModel):
    id: uuid.UUID
    agent_name: str
    status: str
    input_: dict | None = None
    output_: dict | None = None
    tools_used: list[str] = []
    token_count: int | None = None
    latency_ms: float | None = None
    error_message: str | None = None
    trace_id: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkflowNode(BaseModel):
    id: str
    name: str
    type: str
    description: str
    tools: list[str] = []
    status: str = "idle"


class WorkflowEdge(BaseModel):
    source: str
    target: str
    label: str | None = None


class WorkflowGraph(BaseModel):
    nodes: list[WorkflowNode]
    edges: list[WorkflowEdge]
