import uuid

from app.infrastructure.celery_app import celery_app
from app.infrastructure.database import async_session_factory
from app.core.logging_config import logger


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def index_document_task(self, document_id: str, user_id: str):
    import asyncio

    async def _index():
        async with async_session_factory() as db:
            from app.ai.rag.indexer import Indexer

            indexer = Indexer()
            try:
                result = await indexer.index_document(db, document_id)
                logger.info("document_indexed", document_id=document_id, result=result)
                return result
            except Exception as e:
                logger.error("document_index_failed", document_id=document_id, error=str(e))
                raise

    try:
        return asyncio.run(_index())
    except Exception as exc:
        self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=2)
def reindex_document_task(self, document_id: str):
    import asyncio

    async def _reindex():
        async with async_session_factory() as db:
            from app.ai.rag.indexer import Indexer

            indexer = Indexer()
            return await indexer.index_document(db, document_id)

    try:
        return asyncio.run(_reindex())
    except Exception as exc:
        self.retry(exc=exc)
