import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete

from app.config import settings
from app.core.logging_config import logger
from app.domains.documents.models import DocumentChunk
from app.domains.documents.service import DocumentService
from app.ai.rag.chunker import DocumentChunker
from app.ai.rag.embedder import Embedder


class Indexer:
    def __init__(self):
        self.chunker = DocumentChunker()
        self.embedder = Embedder()

    async def index_document(self, db: AsyncSession, document_id: str) -> dict:
        doc_service = DocumentService(db)

        doc = await doc_service.get(
            user_id=str(uuid.uuid4()),
            document_id=document_id,
        )

        logger.info("indexing_started", document_id=str(document_id))

        await doc_service.update_status(document_id, "processing")

        try:
            from pathlib import Path

            file_path = Path(doc.file_path)
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {doc.file_path}")

            content = self._extract_content(file_path, doc.file_type)

            chunks = self.chunker.chunk_by_paragraphs(
                content,
                metadata={"document_id": str(document_id), "file_name": doc.file_name},
            )

            if not chunks:
                await doc_service.update_status(document_id, "indexed")
                return {"chunk_count": 0, "message": "No content to index"}

            texts = [c.content for c in chunks]
            embeddings = self.embedder.embed_batch(texts)

            await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document_id))

            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                db_chunk = DocumentChunk(
                    document_id=uuid.UUID(document_id),
                    content=chunk.content,
                    chunk_index=i,
                    page_number=chunk.page_number,
                    token_count=chunk.token_count,
                    metadata_=chunk.metadata,
                    embedding=embedding,
                )
                db.add(db_chunk)

            await db.flush()

            await doc_service.update_index_info(
                document_id,
                chunk_count=len(chunks),
                embedding_model=settings.EMBEDDING_MODEL,
            )

            await db.commit()

            logger.info(
                "indexing_completed",
                document_id=str(document_id),
                chunk_count=len(chunks),
            )

            return {
                "chunk_count": len(chunks),
                "embedding_model": settings.EMBEDDING_MODEL,
                "message": f"Indexed {len(chunks)} chunks",
            }

        except Exception as e:
            logger.error("indexing_failed", document_id=str(document_id), error=str(e))
            await doc_service.update_status(document_id, "failed", str(e))
            await db.rollback()
            raise

    def _extract_content(self, file_path, file_type: str) -> str:
        suffix = file_path.suffix.lower()

        if suffix == ".pdf":
            return self._extract_pdf(file_path)
        elif suffix in (".txt", ".md"):
            return file_path.read_text(encoding="utf-8")
        elif suffix == ".csv":
            return self._extract_csv(file_path)
        elif suffix == ".json":
            return self._extract_json(file_path)
        elif suffix in (".docx",):
            return self._extract_docx(file_path)
        else:
            return file_path.read_text(encoding="utf-8", errors="ignore")

    def _extract_pdf(self, file_path) -> str:
        try:
            import pymupdf

            doc = pymupdf.open(str(file_path))
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text())
            doc.close()
            return "\n\n".join(text_parts)
        except ImportError:
            try:
                from PyPDF2 import PdfReader

                reader = PdfReader(str(file_path))
                text_parts = []
                for page in reader.pages:
                    text_parts.append(page.extract_text() or "")
                return "\n\n".join(text_parts)
            except ImportError:
                return file_path.read_bytes().decode("utf-8", errors="ignore")

    def _extract_docx(self, file_path) -> str:
        try:
            import docx

            doc = docx.Document(str(file_path))
            return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except ImportError:
            return file_path.read_text(encoding="utf-8", errors="ignore")

    def _extract_csv(self, file_path) -> str:
        import csv
        import io

        content = file_path.read_text(encoding="utf-8")
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)
        if not rows:
            return ""
        header = rows[0]
        lines = [" | ".join(header)]
        for row in rows[1:100]:
            lines.append(" | ".join(row))
        return "\n".join(lines)

    def _extract_json(self, file_path) -> str:
        import json

        content = file_path.read_text(encoding="utf-8")
        data = json.loads(content)
        if isinstance(data, list):
            return json.dumps(data[:100], indent=2)
        return json.dumps(data, indent=2)
