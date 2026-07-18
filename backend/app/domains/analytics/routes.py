from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db_session
from app.domains.analytics.service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_analytics_service(db: AsyncSession = Depends(get_db_session)) -> AnalyticsService:
    return AnalyticsService(db)


@router.get("/overview")
async def get_overview(
    user_id: str = Depends(get_current_user_id),
    service: AnalyticsService = Depends(get_analytics_service),
):
    return await service.get_overview(user_id)


@router.get("/usage")
async def get_usage(
    days: int = Query(default=30, le=90),
    user_id: str = Depends(get_current_user_id),
    service: AnalyticsService = Depends(get_analytics_service),
):
    return await service.get_usage_over_time(user_id, days)


@router.get("/cost")
async def get_cost(
    days: int = Query(default=30, le=90),
    user_id: str = Depends(get_current_user_id),
    service: AnalyticsService = Depends(get_analytics_service),
):
    return await service.get_cost_breakdown(user_id, days)


@router.get("/latency")
async def get_latency(
    days: int = Query(default=30, le=90),
    user_id: str = Depends(get_current_user_id),
    service: AnalyticsService = Depends(get_analytics_service),
):
    return await service.get_latency_metrics(user_id, days)


@router.get("/models")
async def get_models(
    user_id: str = Depends(get_current_user_id),
    service: AnalyticsService = Depends(get_analytics_service),
):
    return await service.get_model_comparison(user_id)
