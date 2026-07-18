from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db_session
from app.domains.chat.schemas import SearchRequest, SearchResponse
from app.domains.chat.service import SearchService

router = APIRouter(prefix="/search", tags=["Search"])


def get_search_service(db: AsyncSession = Depends(get_db_session)) -> SearchService:
    return SearchService(db)


@router.post("/", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    user_id: str = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    return await service.search(request)
