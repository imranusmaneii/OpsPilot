import uuid
import os
import shutil
from pathlib import Path

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import NotFoundException, BadRequestException
from app.domains.documents.models import Document, DocumentChunk
from app.domains.documents.schemas import DocumentUploadResponse

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload(
        self,
        user_id: str,
        collection_id: str,
        file_name: str,
        file_type: str,
        file_size: int,
        file_content: bytes,
    ) -> DocumentUploadResponse:
        doc_id = uuid.uuid4()
        user_dir = UPLOAD_DIR / user_id
        user_dir.mkdir(exist_ok=True)

        ext = Path(file_name).suffix
        stored_name = f"{doc_id}{ext}"
        file_path = user_dir / stored_name

        file_path.write_bytes(file_content)

        doc = Document(
            id=doc_id,
            collection_id=uuid.UUID(collection_id),
            user_id=uuid.UUID(user_id),
            title=Path(file_name).stem,
            file_name=file_name,
            file_type=file_type,
            file_size=file_size,
            file_path=str(file_path),
            status="pending",
        )
        self.db.add(doc)
        await self.db.flush()
        await self.db.refresh(doc)

        return DocumentUploadResponse(
            id=doc.id,
            title=doc.title,
            status="pending",
            message="Document uploaded successfully. Indexing will begin shortly.",
        )

    async def list(
        self, user_id: str, collection_id: str | None = None, skip: int = 0, limit: int = 50
    ) -> list[Document]:
        query = select(Document).where(Document.user_id == user_id)
        if collection_id:
            query = query.where(Document.collection_id == collection_id)
        query = query.order_by(Document.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get(self, user_id: str, document_id: str) -> Document:
        result = await self.db.execute(
            select(Document).where(
                Document.id == document_id,
                Document.user_id == user_id,
            )
        )
        doc = result.scalar_one_or_none()
        if not doc:
            raise NotFoundException("Document", document_id)
        return doc

    async def get_chunks(self, document_id: str) -> list[DocumentChunk]:
        result = await self.db.execute(
            select(DocumentChunk).where(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index)
        )
        return list(result.scalars().all())

    async def update_status(self, document_id: str, status: str, error_message: str | None = None):
        await self.db.execute(
            update(Document).where(Document.id == document_id).values(status=status, error_message=error_message)
        )
        await self.db.flush()

    async def update_index_info(self, document_id: str, chunk_count: int, embedding_model: str):
        await self.db.execute(
            update(Document)
            .where(Document.id == document_id)
            .values(
                status="indexed",
                chunk_count=chunk_count,
                embedding_model=embedding_model,
            )
        )
        await self.db.flush()

    async def delete(self, user_id: str, document_id: str):
        doc = await self.get(user_id, document_id)
        file_path = Path(doc.file_path)
        if file_path.exists():
            os.remove(file_path)
        await self.db.delete(doc)
        await self.db.flush()

    async def count(self, user_id: str) -> int:
        result = await self.db.execute(select(func.count()).select_from(Document).where(Document.user_id == user_id))
        return result.scalar() or 0
