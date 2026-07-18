import numpy as np
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging_config import logger


class VectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    async def create_extension(self, session: AsyncSession):
        await session.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await session.commit()

    async def create_index(self, session: AsyncSession, table: str = "document_chunks", lists: int = 100):
        try:
            await session.execute(
                text(
                    f"CREATE INDEX IF NOT EXISTS idx_{table}_embedding "
                    f"ON {table} USING ivfflat (embedding vector_cosine_ops) "
                    f"WITH (lists = {lists})"
                )
            )
            await session.commit()
        except Exception as e:
            logger.warning("index_creation_failed", table=table, error=str(e))

    async def upsert_embedding(self, session: AsyncSession, chunk_id: str, embedding: list[float]):
        vec = np.array(embedding, dtype=np.float32)
        await session.execute(
            text("UPDATE document_chunks SET embedding = :embedding WHERE id = :id"),
            {"embedding": vec.tolist(), "id": chunk_id},
        )

    async def search_similar(
        self,
        session: AsyncSession,
        query_embedding: list[float],
        collection_id: str | None = None,
        top_k: int = 10,
    ) -> list[dict]:
        vec = np.array(query_embedding, dtype=np.float32)

        if collection_id:
            query = text("""
                SELECT dc.id, dc.content, dc.document_id, dc.page_number, dc.metadata,
                       1 - (dc.embedding <=> :embedding) as similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.collection_id = :collection_id AND dc.embedding IS NOT NULL
                ORDER BY dc.embedding <=> :embedding
                LIMIT :top_k
            """)
            result = await session.execute(
                query,
                {"embedding": vec.tolist(), "collection_id": collection_id, "top_k": top_k},
            )
        else:
            query = text("""
                SELECT id, content, document_id, page_number, metadata,
                       1 - (embedding <=> :embedding) as similarity
                FROM document_chunks
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> :embedding
                LIMIT :top_k
            """)
            result = await session.execute(query, {"embedding": vec.tolist(), "top_k": top_k})

        rows = result.mappings().all()
        return [dict(row) for row in rows]


vector_store = VectorStore()
