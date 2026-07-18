import uuid
from datetime import datetime
from pydantic import BaseModel


class IntegrationCreate(BaseModel):
    provider: str
    name: str
    config: dict = {}
    credentials: str | None = None


class IntegrationUpdate(BaseModel):
    name: str | None = None
    config: dict | None = None
    credentials: str | None = None
    status: str | None = None


class IntegrationResponse(BaseModel):
    id: uuid.UUID
    provider: str
    name: str
    config: dict
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class IntegrationListResponse(BaseModel):
    integrations: list[IntegrationResponse]
    total: int


class AvailableProvider(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    fields: list[dict]


class SyncResponse(BaseModel):
    message: str
    items_synced: int
