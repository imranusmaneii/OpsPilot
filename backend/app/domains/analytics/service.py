from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.analytics.models import UsageMetric


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self, user_id: str) -> dict:
        doc_count = await self._count_docs(user_id)
        msg_count = await self._count_messages(user_id)
        eval_count = await self._count_evaluations(user_id)
        total_tokens = await self._sum_tokens(user_id)
        total_cost = await self._sum_cost(user_id)
        avg_latency = await self._avg_latency(user_id)
        embedding_count = await self._count_embeddings(user_id)

        return {
            "documents_indexed": doc_count,
            "questions_answered": msg_count,
            "evaluations_run": eval_count,
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 2),
            "avg_latency_ms": round(avg_latency or 0, 2),
            "embedding_count": embedding_count,
        }

    async def get_usage_over_time(self, user_id: str, days: int = 30) -> list[dict]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(
                func.date(UsageMetric.created_at).label("date"),
                func.count().label("count"),
                func.sum(UsageMetric.tokens_used).label("tokens"),
                func.sum(UsageMetric.cost_usd).label("cost"),
            )
            .where(UsageMetric.user_id == user_id, UsageMetric.created_at >= cutoff)
            .group_by(func.date(UsageMetric.created_at))
            .order_by(func.date(UsageMetric.created_at))
        )
        rows = result.all()
        return [
            {
                "date": str(row.date),
                "count": row.count,
                "tokens": row.tokens or 0,
                "cost": round(float(row.cost or 0), 4),
            }
            for row in rows
        ]

    async def get_cost_breakdown(self, user_id: str, days: int = 30) -> list[dict]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(
                UsageMetric.model,
                func.sum(UsageMetric.cost_usd).label("cost"),
                func.count().label("count"),
            )
            .where(UsageMetric.user_id == user_id, UsageMetric.created_at >= cutoff)
            .group_by(UsageMetric.model)
            .order_by(func.sum(UsageMetric.cost_usd).desc())
        )
        rows = result.all()
        return [
            {"model": row.model or "unknown", "cost": round(float(row.cost or 0), 4), "count": row.count}
            for row in rows
        ]

    async def get_latency_metrics(self, user_id: str, days: int = 30) -> list[dict]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(
                func.date(UsageMetric.created_at).label("date"),
                func.avg(UsageMetric.latency_ms).label("avg_latency"),
                func.min(UsageMetric.latency_ms).label("min_latency"),
                func.max(UsageMetric.latency_ms).label("max_latency"),
            )
            .where(
                UsageMetric.user_id == user_id,
                UsageMetric.created_at >= cutoff,
                UsageMetric.latency_ms.isnot(None),
            )
            .group_by(func.date(UsageMetric.created_at))
            .order_by(func.date(UsageMetric.created_at))
        )
        rows = result.all()
        return [
            {
                "date": str(row.date),
                "avg": round(float(row.avg_latency or 0), 2),
                "min": round(float(row.min_latency or 0), 2),
                "max": round(float(row.max_latency or 0), 2),
            }
            for row in rows
        ]

    async def get_model_comparison(self, user_id: str) -> list[dict]:
        result = await self.db.execute(
            select(
                UsageMetric.model,
                func.count().label("count"),
                func.avg(UsageMetric.latency_ms).label("avg_latency"),
                func.avg(UsageMetric.tokens_used).label("avg_tokens"),
                func.sum(UsageMetric.cost_usd).label("total_cost"),
            )
            .where(UsageMetric.user_id == user_id)
            .group_by(UsageMetric.model)
            .order_by(func.count().desc())
        )
        rows = result.all()
        return [
            {
                "model": row.model or "unknown",
                "count": row.count,
                "avg_latency_ms": round(float(row.avg_latency or 0), 2),
                "avg_tokens": round(float(row.avg_tokens or 0), 0),
                "total_cost": round(float(row.total_cost or 0), 4),
            }
            for row in rows
        ]

    async def _count_docs(self, user_id: str) -> int:
        from app.domains.documents.models import Document

        result = await self.db.execute(select(func.count()).select_from(Document).where(Document.user_id == user_id))
        return result.scalar() or 0

    async def _count_messages(self, user_id: str) -> int:
        from app.domains.chat.models import Conversation, Message

        result = await self.db.execute(
            select(func.count())
            .select_from(Message)
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.user_id == user_id)
        )
        return result.scalar() or 0

    async def _count_evaluations(self, user_id: str) -> int:
        from app.domains.evaluation.models import Evaluation

        result = await self.db.execute(
            select(func.count()).select_from(Evaluation).where(Evaluation.user_id == user_id)
        )
        return result.scalar() or 0

    async def _sum_tokens(self, user_id: str) -> int:
        result = await self.db.execute(select(func.sum(UsageMetric.tokens_used)).where(UsageMetric.user_id == user_id))
        return result.scalar() or 0

    async def _sum_cost(self, user_id: str) -> float:
        result = await self.db.execute(select(func.sum(UsageMetric.cost_usd)).where(UsageMetric.user_id == user_id))
        return float(result.scalar() or 0)

    async def _avg_latency(self, user_id: str) -> float | None:
        result = await self.db.execute(
            select(func.avg(UsageMetric.latency_ms)).where(
                UsageMetric.user_id == user_id, UsageMetric.latency_ms.isnot(None)
            )
        )
        val = result.scalar()
        return float(val) if val else None

    async def _count_embeddings(self, user_id: str) -> int:
        from app.domains.documents.models import DocumentChunk, Document

        result = await self.db.execute(
            select(func.count())
            .select_from(DocumentChunk)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(Document.user_id == user_id, DocumentChunk.embedding.isnot(None))
        )
        return result.scalar() or 0
