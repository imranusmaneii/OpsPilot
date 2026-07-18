from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user_id, get_db_session
from app.domains.documents.schemas import (
    DocumentChunkResponse,
    DocumentListResponse,
    DocumentResponse,
    DocumentUploadResponse,
)
from app.domains.documents.service import DocumentService
from app.core.exceptions import BadRequestException

router = APIRouter(prefix="/documents", tags=["Documents"])


def get_document_service(db: AsyncSession = Depends(get_db_session)) -> DocumentService:
    return DocumentService(db)


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    collection_id: str = Form(...),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    service: DocumentService = Depends(get_document_service),
):
    if not file.filename:
        raise BadRequestException("No file provided")

    allowed_types = {
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/csv",
        "application/json",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
    }

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise BadRequestException(f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    file_type = file.content_type or "application/octet-stream"

    result = await service.upload(
        user_id=user_id,
        collection_id=collection_id,
        file_name=file.filename,
        file_type=file_type,
        file_size=len(content),
        file_content=content,
    )

    try:
        from app.workers.document_tasks import index_document_task
        index_document_task.delay(str(result.id), user_id)
    except Exception:
        pass

    return result


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    collection_id: str | None = None,
    skip: int = 0,
    limit: int = 50,
    user_id: str = Depends(get_current_user_id),
    service: DocumentService = Depends(get_document_service),
):
    documents = await service.list(user_id, collection_id, skip, limit)
    return DocumentListResponse(documents=documents, total=len(documents))


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    service: DocumentService = Depends(get_document_service),
):
    return await service.get(user_id, document_id)


@router.get("/{document_id}/chunks", response_model=list[DocumentChunkResponse])
async def get_document_chunks(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    service: DocumentService = Depends(get_document_service),
):
    await service.get(user_id, document_id)
    return await service.get_chunks(document_id)


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    service: DocumentService = Depends(get_document_service),
):
    await service.delete(user_id, document_id)


@router.post("/{document_id}/reindex")
async def reindex_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    service: DocumentService = Depends(get_document_service),
):
    doc = await service.get(user_id, document_id)
    await service.update_status(document_id, "pending")
    return {"message": "Document reindexing queued", "document_id": str(document_id)}
