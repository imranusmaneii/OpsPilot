import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.core.logging_config import logger
from app.infrastructure.database import engine
from app.infrastructure.redis import redis_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("starting_app", app_name=settings.APP_NAME, environment=settings.ENVIRONMENT)

    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        logger.info("database_connected")
    except Exception as e:
        logger.error("database_connection_failed", error=str(e))
        raise

    try:
        await redis_manager.connect()
        logger.info("redis_connected")
    except Exception as e:
        logger.warning("redis_connection_failed", error=str(e))

    yield

    logger.info("shutting_down_app")
    await redis_manager.disconnect()
    await engine.dispose()
    logger.info("shutdown_complete")
