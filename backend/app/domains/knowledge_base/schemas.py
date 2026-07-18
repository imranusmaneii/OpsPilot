import uuid
from datetime import datetime

from pydantic import BaseModel


class CollectionCreate(BaseModel):
    name: str
    description: str | None = None


class CollectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CollectionResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    document_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CollectionListResponse(BaseModel):
    collections: list[CollectionResponse]
    total: int
