from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_db_session
from app.infrastructure.redis import redis_manager
from app.infrastructure.vector_store import vector_store
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.domains.auth.service import AuthService
from app.domains.documents.service import DocumentService
from app.domains.knowledge_base.service import CollectionService

security_scheme = HTTPBearer()


async def get_redis():
    return redis_manager


async def get_vector_store():
    return vector_store


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException()
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException()
    return user_id


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
