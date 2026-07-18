from app.ai.agents.state import AgentState
from app.core.logging_config import logger

DOCUMENT_QA_PROMPT = """You are a Document QA Agent.
Extract precise answers from the retrieved document chunks.
Always cite which document and page the answer comes from."""


async def document_qa_agent(state: AgentState) -> AgentState:
    logger.info("document_qa_agent_running", chunk_count=len(state.retrieved_chunks))

    if "document_qa" not in state.plan or not state.retrieved_chunks:
        return state

    answers = []
    for chunk in state.retrieved_chunks:
        if isinstance(chunk, dict) and "content" in chunk:
            answers.append(chunk["content"])

    state.document_answers = answers
    state.tools_used.append("document_qa")
    return state
