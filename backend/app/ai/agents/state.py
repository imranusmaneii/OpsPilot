from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentState:
    query: str = ""
    plan: list[str] = field(default_factory=list)
    retrieved_chunks: list[dict] = field(default_factory=list)
    document_answers: list[str] = field(default_factory=list)
    api_data: dict[str, Any] = field(default_factory=dict)
    reasoning_output: str = ""
    citations: list[dict] = field(default_factory=list)
    final_answer: str = ""
    confidence_score: float = 0.0
    evaluation_metrics: dict[str, float] = field(default_factory=dict)
    error: str | None = None
    tools_used: list[str] = field(default_factory=list)
