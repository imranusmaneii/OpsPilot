from app.core.logging_config import logger


class ContextCompressor:
    def __init__(self, max_tokens: int = 3000):
        self.max_tokens = max_tokens

    def compress(
        self,
        query: str,
        results: list[dict],
        max_context_length: int | None = None,
    ) -> list[dict]:
        max_len = max_context_length or self.max_tokens * 4
        compressed = []
        total_length = 0

        for result in results:
            content = result.get("content", "")
            if total_length + len(content) <= max_len:
                compressed.append(result)
                total_length += len(content)
            else:
                remaining = max_len - total_length
                if remaining > 100:
                    truncated = content[:remaining] + "..."
                    result_copy = {**result, "content": truncated, "truncated": True}
                    compressed.append(result_copy)
                break

        logger.info(
            "context_compressed",
            original_count=len(results),
            compressed_count=len(compressed),
            total_chars=total_length,
        )

        return compressed

    def format_context(self, results: list[dict]) -> str:
        if not results:
            return "No relevant context found."

        parts = []
        for i, r in enumerate(results, 1):
            title = r.get("document_title", "Unknown")
            page = r.get("page_number")
            content = r.get("content", "")
            source = f"[Source {i}: {title}"
            if page:
                source += f", page {page}"
            source += "]"
            parts.append(f"{source}\n{content}")

        return "\n\n".join(parts)
