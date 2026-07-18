from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    collection_id: str | None = None
    top_k: int = 10
    rerank: bool = True


class SearchResult(BaseModel):
    id: str
    content: str
    document_id: str
    document_title: str | None = None
    page_number: int | None = None
    chunk_index: int | None = None
    similarity: float | None = None
    rerank_score: float | None = None
    metadata: dict | None = None


class SearchResponse(BaseModel):
    results: list[SearchResult]
    query: str
    total: int
    latency_ms: float
