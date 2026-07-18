from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db_session
from app.domains.agents.service import AgentService
from app.domains.agents.schemas import AgentInfo, AgentRunResponse, WorkflowGraph

router = APIRouter(prefix="/agents", tags=["Agents"])


def get_agent_service(db: AsyncSession = Depends(get_db_session)) -> AgentService:
    return AgentService(db)


@router.get("/", response_model=list[AgentInfo])
async def list_agents(
    service: AgentService = Depends(get_agent_service),
):
    return service.get_agents()


@router.get("/workflow", response_model=WorkflowGraph)
async def get_workflow(
    service: AgentService = Depends(get_agent_service),
):
    return service.get_workflow_graph()


@router.get("/status")
async def get_agent_status(
    service: AgentService = Depends(get_agent_service),
):
    return await service.get_agent_status()


@router.get("/runs", response_model=list[AgentRunResponse])
async def get_agent_runs(
    agent_name: str | None = None,
    limit: int = Query(default=50, le=200),
    service: AgentService = Depends(get_agent_service),
):
    return await service.get_agent_runs(agent_name, limit)
