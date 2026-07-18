from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db_session
from app.domains.evaluation.service import EvaluationService
from app.domains.evaluation.schemas import (
    EvaluationCreate,
    EvaluationDetailResponse,
    EvaluationListResponse,
    EvaluationResponse,
    EvaluationResultResponse,
)

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


def get_evaluation_service(db: AsyncSession = Depends(get_db_session)) -> EvaluationService:
    return EvaluationService(db)


@router.post("/", response_model=EvaluationResponse, status_code=201)
async def create_evaluation(
    data: EvaluationCreate,
    user_id: str = Depends(get_current_user_id),
    service: EvaluationService = Depends(get_evaluation_service),
):
    return await service.create(user_id, data)


@router.get("/", response_model=EvaluationListResponse)
async def list_evaluations(
    user_id: str = Depends(get_current_user_id),
    service: EvaluationService = Depends(get_evaluation_service),
):
    evals = await service.list(user_id)
    return EvaluationListResponse(evaluations=evals, total=len(evals))


@router.get("/regression")
async def get_regression(
    limit: int = Query(default=20, le=50),
    user_id: str = Depends(get_current_user_id),
    service: EvaluationService = Depends(get_evaluation_service),
):
    return await service.get_regression_history(user_id, limit)


@router.get("/{evaluation_id}", response_model=EvaluationDetailResponse)
async def get_evaluation(
    evaluation_id: str,
    user_id: str = Depends(get_current_user_id),
    service: EvaluationService = Depends(get_evaluation_service),
):
    ev = await service.get(user_id, evaluation_id)
    results = await service.get_results(evaluation_id)
    return EvaluationDetailResponse(
        id=ev.id,
        name=ev.name,
        status=ev.status,
        metrics=ev.metrics,
        model=ev.model,
        total_samples=ev.total_samples,
        created_at=ev.created_at,
        completed_at=ev.completed_at,
        results=results,
    )


@router.post("/{evaluation_id}/run", response_model=EvaluationResponse)
async def run_evaluation(
    evaluation_id: str,
    user_id: str = Depends(get_current_user_id),
    service: EvaluationService = Depends(get_evaluation_service),
):
    return await service.run_evaluation(user_id, evaluation_id)
