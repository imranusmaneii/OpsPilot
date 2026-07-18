import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.agents.models import AgentRun
from app.domains.agents.schemas import (
    AgentInfo,
    AgentRunResponse,
    WorkflowGraph,
    WorkflowNode,
    WorkflowEdge,
)

AGENT_DEFINITIONS = [
    {
        "name": "Planner Agent",
        "key": "planner",
        "description": "Decomposes complex queries into structured execution plans with sub-tasks.",
        "tools": [],
    },
    {
        "name": "Retriever Agent",
        "key": "retriever",
        "description": "Performs hybrid semantic + keyword search across the knowledge base.",
        "tools": ["semantic_search", "bm25_search", "hybrid_search"],
    },
    {
        "name": "Document QA Agent",
        "key": "document_qa",
        "description": "Extracts precise answers from retrieved document chunks.",
        "tools": ["document_lookup", "table_qa", "visual_qa"],
    },
    {
        "name": "API Agent",
        "key": "api_agent",
        "description": "Fetches data from external integrations (GitHub, Slack, Jira, etc.).",
        "tools": ["github_api", "slack_api", "notion_api", "jira_api"],
    },
    {
        "name": "Reasoning Agent",
        "key": "reasoning",
        "description": "Synthesizes all information into a coherent, comprehensive answer.",
        "tools": ["chain_of_thought", "reflection"],
    },
    {
        "name": "Citation Agent",
        "key": "citation",
        "description": "Maps answer claims back to source documents with bounding boxes.",
        "tools": ["source_matching", "citation_generation"],
    },
    {
        "name": "Evaluator Agent",
        "key": "evaluator",
        "description": "Checks answer quality, detects hallucinations, and computes confidence.",
        "tools": ["faithfulness_check", "relevance_check", "groundedness_check"],
    },
]


class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def get_agents(self) -> list[AgentInfo]:
        return [
            AgentInfo(
                name=a["name"],
                description=a["description"],
                status="active",
                tools_used=a["tools"],
            )
            for a in AGENT_DEFINITIONS
        ]

    def get_workflow_graph(self) -> WorkflowGraph:
        nodes = [
            WorkflowNode(
                id=a["key"],
                name=a["name"],
                type="agent",
                description=a["description"],
                tools=a["tools"],
            )
            for a in AGENT_DEFINITIONS
        ]

        edges = [
            WorkflowEdge(source="planner", target="retriever", label="plan"),
            WorkflowEdge(source="retriever", target="document_qa", label="context"),
            WorkflowEdge(source="document_qa", target="api_agent", label="doc_answer"),
            WorkflowEdge(source="api_agent", target="reasoning", label="api_data"),
            WorkflowEdge(source="reasoning", target="citation", label="draft_answer"),
            WorkflowEdge(source="citation", target="evaluator", label="cited_answer"),
        ]

        return WorkflowGraph(nodes=nodes, edges=edges)

    async def get_agent_runs(self, agent_name: str | None = None, limit: int = 50) -> list[AgentRunResponse]:
        query = select(AgentRun).order_by(AgentRun.created_at.desc()).limit(limit)
        if agent_name:
            query = query.where(AgentRun.agent_name == agent_name)
        result = await self.db.execute(query)
        runs = result.scalars().all()
        return [
            AgentRunResponse(
                id=r.id,
                agent_name=r.agent_name,
                status=r.status,
                input_=r.input_,
                output_=r.output_,
                tools_used=r.tools_used or [],
                token_count=r.token_count,
                latency_ms=r.latency_ms,
                error_message=r.error_message,
                trace_id=r.trace_id,
                created_at=r.created_at,
            )
            for r in runs
        ]

    async def get_agent_status(self) -> list[dict]:
        agents = []
        for a in AGENT_DEFINITIONS:
            result = await self.db.execute(
                select(func.count()).select_from(AgentRun).where(AgentRun.agent_name == a["key"])
            )
            total = result.scalar() or 0

            result = await self.db.execute(
                select(func.count())
                .select_from(AgentRun)
                .where(AgentRun.agent_name == a["key"], AgentRun.status == "completed")
            )
            completed = result.scalar() or 0

            result = await self.db.execute(select(func.avg(AgentRun.latency_ms)).where(AgentRun.agent_name == a["key"]))
            avg_latency = result.scalar()

            result = await self.db.execute(
                select(AgentRun.created_at)
                .where(AgentRun.agent_name == a["key"])
                .order_by(AgentRun.created_at.desc())
                .limit(1)
            )
            last_run = result.scalar()

            agents.append(
                {
                    "name": a["name"],
                    "key": a["key"],
                    "description": a["description"],
                    "status": "active",
                    "total_runs": total,
                    "success_rate": round(completed / total * 100, 1) if total > 0 else 0,
                    "avg_latency_ms": round(avg_latency, 2) if avg_latency else None,
                    "last_run": last_run.isoformat() if last_run else None,
                }
            )

        return agents
