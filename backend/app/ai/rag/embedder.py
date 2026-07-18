import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import settings
from app.core.logging_config import logger

_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info("loading_embedding_model", model=settings.EMBEDDING_MODEL)
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("embedding_model_loaded")
    return _model


class Embedder:
    def __init__(self):
        self.model = get_embedding_model()
        self.dimension = settings.EMBEDDING_DIMENSION

    def embed_text(self, text: str) -> list[float]:
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def embed_batch(self, texts: list[str], batch_size: int = 64) -> list[list[float]]:
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return embeddings.tolist()

    def similarity(self, a: list[float], b: list[float]) -> float:
        return float(np.dot(a, b))
