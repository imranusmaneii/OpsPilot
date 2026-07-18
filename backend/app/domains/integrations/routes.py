import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_async_session
from app.dependencies import get_current_user_id
from app.domains.integrations.service import IntegrationService
from app.domains.integrations.schemas import (
    IntegrationCreate, IntegrationUpdate, IntegrationResponse,
    IntegrationListResponse, SyncResponse, AvailableProvider,
)

router = APIRouter(prefix="/integrations", tags=["Integrations"])


async def get_service(session: AsyncSession = Depends(get_async_session)) -> IntegrationService:
    return IntegrationService(session)


@router.get("/providers", response_model=list[AvailableProvider])
async def list_providers():
    return IntegrationService.get_available_providers()


@router.post("", response_model=IntegrationResponse, status_code=201)
async def create_integration(
    data: IntegrationCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    service: IntegrationService = Depends(get_service),
):
    return await service.create_integration(user_id, data)


@router.get("", response_model=IntegrationListResponse)
async def list_integrations(
    user_id: uuid.UUID = Depends(get_current_user_id),
    service: IntegrationService = Depends(get_service),
):
    return await service.list_integrations(user_id)


@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    integration_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    service: IntegrationService = Depends(get_service),
):
    result = await service.get_integration(integration_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Integration not found")
    return result


@router.patch("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: uuid.UUID,
    data: IntegrationUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    service: IntegrationService = Depends(get_service),
):
    result = await service.update_integration(integration_id, user_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Integration not found")
    return result


@router.delete("/{integration_id}", status_code=204)
async def delete_integration(
    integration_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    service: IntegrationService = Depends(get_service),
):
    deleted = await service.delete_integration(integration_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Integration not found")


@router.post("/{integration_id}/test")
async def test_connection(
    integration_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    service: IntegrationService = Depends(get_service),
):
    ok = await service.test_connection(integration_id, user_id)
    return {"connected": ok}


@router.post("/{integration_id}/sync", response_model=SyncResponse)
async def sync_integration(
    integration_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    service: IntegrationService = Depends(get_service),
):
    result = await service.sync_integration(integration_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Integration not found")
    return result
