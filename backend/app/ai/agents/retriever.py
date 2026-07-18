from app.ai.agents.state import AgentState
from app.core.logging_config import logger

RETRIEVER_PROMPT = """You are a Retriever Agent.
Given the query and execution plan, retrieve relevant document chunks using semantic search.
Return the most relevant chunks with their source information."""


async def retriever_agent(state: AgentState) -> AgentState:
    logger.info("retriever_agent_running", query=state.query[:100])

    if "retrieve_documents" not in state.plan:
        return state

    state.retrieved_chunks = [
        {
            "content": "Sample retrieved chunk for demonstration",
            "document_id": "demo",
            "similarity": 0.85,
            "page_number": 1,
        }
    ]

    state.tools_used.append("semantic_search")
    return state
