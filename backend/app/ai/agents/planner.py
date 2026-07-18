from app.ai.agents.state import AgentState
from app.core.logging_config import logger

PLANNER_PROMPT = """You are a Planner Agent in an enterprise AI operations system.
Your job is to analyze the user's query and create a structured execution plan.

Break down complex queries into sub-tasks for:
1. Document retrieval (semantic search)
2. Document QA (extracting answers from documents)
3. API calls (external data fetching if needed)
4. Reasoning (synthesizing the final answer)

Return a JSON plan with sub-tasks.
Query: {query}"""


async def planner_agent(state: AgentState) -> AgentState:
    logger.info("planner_agent_running", query=state.query[:100])

    plan = []

    if any(kw in state.query.lower() for kw in ["search", "find", "document", "pdf", "what", "how", "why"]):
        plan.append("retrieve_documents")

    if any(kw in state.query.lower() for kw in ["extract", "summarize", "explain", "analyze"]):
        plan.append("document_qa")

    if any(kw in state.query.lower() for kw in ["api", "fetch", "external", "github", "slack", "jira"]):
        plan.append("api_call")

    plan.append("reason")
    plan.append("cite_sources")
    plan.append("evaluate")

    state.plan = plan
    return state
