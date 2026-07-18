from app.ai.agents.planner import planner_agent
from app.ai.agents.retriever import retriever_agent
from app.ai.agents.document_qa import document_qa_agent
from app.ai.agents.api_agent import api_agent
from app.ai.agents.reasoning import reasoning_agent
from app.ai.agents.evaluator import evaluator_agent
from app.ai.agents.state import AgentState


def create_workflow():
    try:
        from langgraph.graph import StateGraph, END

        workflow = StateGraph(AgentState)

        workflow.add_node("planner", planner_agent)
        workflow.add_node("retriever", retriever_agent)
        workflow.add_node("document_qa", document_qa_agent)
        workflow.add_node("api_agent", api_agent)
        workflow.add_node("reasoning", reasoning_agent)
        workflow.add_node("evaluator", evaluator_agent)

        workflow.set_entry_point("planner")
        workflow.add_edge("planner", "retriever")
        workflow.add_edge("retriever", "document_qa")
        workflow.add_edge("document_qa", "api_agent")
        workflow.add_edge("api_agent", "reasoning")
        workflow.add_edge("reasoning", "evaluator")
        workflow.add_edge("evaluator", END)

        return workflow.compile()
    except ImportError:
        return None


agent_workflow = create_workflow()


async def run_agent_workflow(query: str) -> AgentState:
    if agent_workflow is None:
        state = AgentState(query=query)
        state = await planner_agent(state)
        state = await retriever_agent(state)
        state = await document_qa_agent(state)
        state = await api_agent(state)
        state = await reasoning_agent(state)
        state = await evaluator_agent(state)
        return state

    initial_state = AgentState(query=query)
    result = await agent_workflow.ainvoke(initial_state)
    return result
