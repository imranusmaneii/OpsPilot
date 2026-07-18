from dataclasses import dataclass


@dataclass
class Chunk:
    content: str
    chunk_index: int
    page_number: int | None = None
    token_count: int | None = None
    metadata: dict | None = None


class DocumentChunker:
    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 64):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, metadata: dict | None = None) -> list[Chunk]:
        if not text.strip():
            return []

        words = text.split()
        chunks = []
        start = 0
        index = 0

        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_text = " ".join(words[start:end])

            chunks.append(
                Chunk(
                    content=chunk_text,
                    chunk_index=index,
                    token_count=len(words[start:end]),
                    metadata=metadata or {},
                )
            )

            index += 1
            start += self.chunk_size - self.chunk_overlap
            if start >= len(words):
                break

        return chunks

    def chunk_by_paragraphs(self, text: str, metadata: dict | None = None) -> list[Chunk]:
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = ""
        index = 0

        for para in paragraphs:
            if len(current_chunk) + len(para) > self.chunk_size * 4:
                if current_chunk:
                    chunks.append(
                        Chunk(
                            content=current_chunk.strip(),
                            chunk_index=index,
                            token_count=len(current_chunk.split()),
                            metadata=metadata or {},
                        )
                    )
                    index += 1
                current_chunk = para
            else:
                current_chunk += "\n\n" + para if current_chunk else para

        if current_chunk.strip():
            chunks.append(
                Chunk(
                    content=current_chunk.strip(),
                    chunk_index=index,
                    token_count=len(current_chunk.split()),
                    metadata=metadata or {},
                )
            )

        return chunks
