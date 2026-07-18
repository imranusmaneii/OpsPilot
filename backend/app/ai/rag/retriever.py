import numpy as np
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.logging_config import logger
from app.ai.rag.embedder import Embedder


class HybridRetriever:
    def __init__(self):
        self.embedder = Embedder()

    async def search(
        self,
        db: AsyncSession,
        query: str,
        collection_id: str | None = None,
        top_k: int = 10,
        semantic_weight: float = 0.7,
        bm25_weight: float = 0.3,
    ) -> list[dict]:
        semantic_results = await self._semantic_search(db, query, collection_id, top_k * 2)
        bm25_results = await self._bm25_search(db, query, collection_id, top_k * 2)

        merged = self._rrf_merge(semantic_results, bm25_results, semantic_weight, bm25_weight)
        return merged[:top_k]

    async def _semantic_search(
        self,
        db: AsyncSession,
        query: str,
        collection_id: str | None,
        limit: int,
    ) -> list[dict]:
        query_embedding = self.embedder.embed_text(query)
        vec = np.array(query_embedding, dtype=np.float32).tolist()

        if collection_id:
            sql = text("""
                SELECT dc.id, dc.content, dc.document_id, dc.page_number, dc.metadata,
                       dc.chunk_index, d.title as document_title,
                       1 - (dc.embedding <=> :embedding::vector) as similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.collection_id = :collection_id AND dc.embedding IS NOT NULL
                ORDER BY dc.embedding <=> :embedding::vector
                LIMIT :limit
            """)
            result = await db.execute(sql, {"embedding": vec, "collection_id": collection_id, "limit": limit})
        else:
            sql = text("""
                SELECT dc.id, dc.content, dc.document_id, dc.page_number, dc.metadata,
                       dc.chunk_index, d.title as document_title,
                       1 - (dc.embedding <=> :embedding::vector) as similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE dc.embedding IS NOT NULL
                ORDER BY dc.embedding <=> :embedding::vector
                LIMIT :limit
            """)
            result = await db.execute(sql, {"embedding": vec, "limit": limit})

        rows = result.mappings().all()
        return [dict(row) for row in rows]

    async def _bm25_search(
        self,
        db: AsyncSession,
        query: str,
        collection_id: str | None,
        limit: int,
    ) -> list[dict]:
        try:
            ts_query = " & ".join(query.split())

            if collection_id:
                sql = text("""
                    SELECT dc.id, dc.content, dc.document_id, dc.page_number, dc.metadata,
                           dc.chunk_index, d.title as document_title,
                           ts_rank_cd(dc.content_tsv, to_tsquery('english', :query)) as bm25_score
                    FROM document_chunks dc
                    JOIN documents d ON dc.document_id = d.id
                    WHERE dc.content_tsv @@ to_tsquery('english', :query)
                      AND d.collection_id = :collection_id
                    ORDER BY bm25_score DESC
                    LIMIT :limit
                """)
                result = await db.execute(sql, {"query": ts_query, "collection_id": collection_id, "limit": limit})
            else:
                sql = text("""
                    SELECT dc.id, dc.content, dc.document_id, dc.page_number, dc.metadata,
                           dc.chunk_index, d.title as document_title,
                           ts_rank_cd(dc.content_tsv, to_tsquery('english', :query)) as bm25_score
                    FROM document_chunks dc
                    JOIN documents d ON dc.document_id = d.id
                    WHERE dc.content_tsv @@ to_tsquery('english', :query)
                    ORDER BY bm25_score DESC
                    LIMIT :limit
                """)
                result = await db.execute(sql, {"query": ts_query, "limit": limit})

            rows = result.mappings().all()
            return [dict(row) for row in rows]
        except Exception as e:
            logger.warning("bm25_search_failed", error=str(e))
            return []

    def _rrf_merge(
        self,
        semantic_results: list[dict],
        bm25_results: list[dict],
        semantic_weight: float,
        bm25_weight: float,
        k: int = 60,
    ) -> list[dict]:
        scores: dict[str, float] = {}
        results_map: dict[str, dict] = {}

        for rank, result in enumerate(semantic_results):
            doc_id = str(result["id"])
            rrf_score = semantic_weight / (k + rank + 1)
            scores[doc_id] = scores.get(doc_id, 0) + rrf_score
            results_map[doc_id] = result

        for rank, result in enumerate(bm25_results):
            doc_id = str(result["id"])
            rrf_score = bm25_weight / (k + rank + 1)
            scores[doc_id] = scores.get(doc_id, 0) + rrf_score
            if doc_id not in results_map:
                results_map[doc_id] = result

        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)

        merged = []
        for doc_id in sorted_ids:
            result = results_map[doc_id]
            result["rrf_score"] = scores[doc_id]
            merged.append(result)

        return merged
