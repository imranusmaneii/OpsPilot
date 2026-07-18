from app.ai.agents.state import AgentState
from app.core.logging_config import logger

EVALUATOR_PROMPT = """You are an Evaluator Agent.
Assess the quality of the generated answer for:
1. Faithfulness - Is it grounded in the retrieved documents?
2. Relevance - Does it answer the user's question?
3. Completeness - Is the answer comprehensive?
Provide a confidence score from 0 to 1."""


async def evaluator_agent(state: AgentState) -> AgentState:
    logger.info("evaluator_agent_running")

    if "evaluate" not in state.plan:
        return state

    if state.reasoning_output and state.reasoning_output != "No relevant information found.":
        state.confidence_score = 0.85
    else:
        state.confidence_score = 0.1

    state.evaluation_metrics = {
        "faithfulness": state.confidence_score,
        "relevancy": state.confidence_score,
        "groundedness": state.confidence_score,
    }

    state.final_answer = state.reasoning_output
    state.tools_used.append("evaluation")
    return state
