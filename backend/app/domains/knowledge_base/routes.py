from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db_session
from app.domains.knowledge_base.schemas import (
    CollectionCreate,
    CollectionListResponse,
    CollectionResponse,
    CollectionUpdate,
)
from app.domains.knowledge_base.service import CollectionService

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


def get_collection_service(db: AsyncSession = Depends(get_db_session)) -> CollectionService:
    return CollectionService(db)


@router.post("/", response_model=CollectionResponse, status_code=201)
async def create_collection(
    data: CollectionCreate,
    user_id: str = Depends(get_current_user_id),
    service: CollectionService = Depends(get_collection_service),
):
    return await service.create(user_id, data)


@router.get("/", response_model=CollectionListResponse)
async def list_collections(
    user_id: str = Depends(get_current_user_id),
    service: CollectionService = Depends(get_collection_service),
):
    collections = await service.list(user_id)
    return CollectionListResponse(collections=collections, total=len(collections))


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: str,
    user_id: str = Depends(get_current_user_id),
    service: CollectionService = Depends(get_collection_service),
):
    return await service.get(user_id, collection_id)


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    data: CollectionUpdate,
    user_id: str = Depends(get_current_user_id),
    service: CollectionService = Depends(get_collection_service),
):
    return await service.update(user_id, collection_id, data)


@router.delete("/{collection_id}", status_code=204)
async def delete_collection(
    collection_id: str,
    user_id: str = Depends(get_current_user_id),
    service: CollectionService = Depends(get_collection_service),
):
    await service.delete(user_id, collection_id)
