import uuid
from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: uuid.UUID
    collection_id: uuid.UUID
    title: str
    file_name: str
    file_type: str
    file_size: int
    status: str
    chunk_count: int
    embedding_model: str | None
    error_message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int


class DocumentChunkResponse(BaseModel):
    id: uuid.UUID
    content: str
    chunk_index: int
    page_number: int | None
    token_count: int | None
    metadata_: dict | None

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    id: uuid.UUID
    title: str
    status: str
    message: str
