import json
from typing import Any

import redis.asyncio as aioredis

from app.config import settings
from app.core.logging_config import logger


class RedisManager:
    def __init__(self):
        self._client: aioredis.Redis | None = None

    async def connect(self):
        self._client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
        await self._client.ping()

    async def disconnect(self):
        if self._client:
            await self._client.close()
            self._client = None

    @property
    def client(self) -> aioredis.Redis:
        if not self._client:
            raise RuntimeError("Redis not connected")
        return self._client

    async def get(self, key: str) -> str | None:
        return await self.client.get(key)

    async def set(self, key: str, value: str, expire: int | None = None):
        await self.client.set(key, value, ex=expire)

    async def delete(self, key: str):
        await self.client.delete(key)

    async def get_json(self, key: str) -> Any | None:
        data = await self.get(key)
        if data:
            return json.loads(data)
        return None

    async def set_json(self, key: str, value: Any, expire: int | None = None):
        await self.set(key, json.dumps(value), expire=expire)

    async def increment(self, key: str, amount: int = 1) -> int:
        return await self.client.incr(key, amount)

    async def health_check(self) -> bool:
        try:
            return await self.client.ping()
        except Exception:
            return False


redis_manager = RedisManager()
