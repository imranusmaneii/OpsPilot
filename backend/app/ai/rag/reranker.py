import numpy as np
from sentence_transformers import CrossEncoder

from app.config import settings
from app.core.logging_config import logger

_reranker_model: CrossEncoder | None = None


def get_reranker() -> CrossEncoder:
    global _reranker_model
    if _reranker_model is None:
        try:
            _reranker_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            logger.info("reranker_loaded")
        except Exception as e:
            logger.warning("reranker_load_failed", error=str(e))
            _reranker_model = None
    return _reranker_model


class Reranker:
    def __init__(self):
        self.model = get_reranker()

    def rerank(
        self,
        query: str,
        results: list[dict],
        top_k: int = 5,
    ) -> list[dict]:
        if not self.model or not results:
            for i, r in enumerate(results[:top_k]):
                r["rerank_score"] = r.get("similarity", r.get("rrf_score", 0.5))
            return results[:top_k]

        pairs = [(query, r["content"]) for r in results]
        scores = self.model.predict(pairs)

        for result, score in zip(results, scores):
            result["rerank_score"] = float(score)

        results.sort(key=lambda x: x["rerank_score"], reverse=True)
        return results[:top_k]
