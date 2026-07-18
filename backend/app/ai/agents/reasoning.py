from app.ai.agents.state import AgentState
from app.core.logging_config import logger

REASONING_PROMPT = """You are a Reasoning Agent.
Synthesize information from document QA, API calls, and retrieved context
to produce a comprehensive, accurate answer. Be precise and cite sources."""


async def reasoning_agent(state: AgentState) -> AgentState:
    logger.info("reasoning_agent_running")

    if "reason" not in state.plan:
        return state

    parts = []
    if state.document_answers:
        parts.extend(state.document_answers)
    if state.api_data:
        parts.append(str(state.api_data))

    state.reasoning_output = "\n\n".join(parts) if parts else "No relevant information found."
    state.tools_used.append("reasoning")
    return state
