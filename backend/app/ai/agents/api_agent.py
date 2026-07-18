from app.ai.agents.state import AgentState
from app.core.logging_config import logger

API_AGENT_PROMPT = """You are an API Agent.
Fetch data from external APIs (GitHub, Slack, Notion, Jira, etc.) based on the plan.
Integrate the results with document-based answers."""


async def api_agent(state: AgentState) -> AgentState:
    logger.info("api_agent_running", plan=state.plan)

    if "api_call" not in state.plan:
        return state

    state.api_data = {}
    state.tools_used.append("api_call")
    return state
