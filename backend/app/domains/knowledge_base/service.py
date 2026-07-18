from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ForbiddenException
from app.domains.knowledge_base.models import Collection
from app.domains.knowledge_base.schemas import CollectionCreate, CollectionUpdate


class CollectionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, data: CollectionCreate) -> Collection:
        collection = Collection(
            user_id=user_id,
            name=data.name,
            description=data.description,
        )
        self.db.add(collection)
        await self.db.flush()
        await self.db.refresh(collection)
        return collection

    async def list(self, user_id: str) -> list[Collection]:
        result = await self.db.execute(
            select(Collection).where(Collection.user_id == user_id).order_by(Collection.created_at.desc())
        )
        return list(result.scalars().all())

    async def get(self, user_id: str, collection_id: str) -> Collection:
        result = await self.db.execute(
            select(Collection).where(
                Collection.id == collection_id,
                Collection.user_id == user_id,
            )
        )
        collection = result.scalar_one_or_none()
        if not collection:
            raise NotFoundException("Collection", collection_id)
        return collection

    async def update(self, user_id: str, collection_id: str, data: CollectionUpdate) -> Collection:
        collection = await self.get(user_id, collection_id)
        if data.name is not None:
            collection.name = data.name
        if data.description is not None:
            collection.description = data.description
        await self.db.flush()
        await self.db.refresh(collection)
        return collection

    async def delete(self, user_id: str, collection_id: str):
        collection = await self.get(user_id, collection_id)
        await self.db.delete(collection)
        await self.db.flush()

    async def count(self, user_id: str) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Collection).where(Collection.user_id == user_id)
        )
        return result.scalar() or 0
