from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_db_session
from app.infrastructure.redis import redis_manager
from app.infrastructure.vector_store import vector_store
from app.domains.auth.service import AuthService
from app.domains.documents.service import DocumentService
from app.domains.knowledge_base.service import CollectionService

async def get_redis():
    return redis_manager


async def get_vector_store():
    return vector_store


async def get_current_user_id() -> str:
    return "00000000-0000-0000-0000-000000000001"


async def get_auth_service(
    db: AsyncSession = Depends(get_db_session),
) -> AuthService:
    return AuthService(db)


async def get_document_service(
    db: AsyncSession = Depends(get_db_session),
) -> DocumentService:
    return DocumentService(db)


async def get_collection_service(
    db: AsyncSession = Depends(get_db_session),
) -> CollectionService:
    return CollectionService(db)
