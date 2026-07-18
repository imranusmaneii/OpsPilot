from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.core.logging_config import logger


@dataclass
class SyncResult:
    items_synced: int
    errors: list[str]


class BaseConnector(ABC):
    provider: str
    name: str
    description: str
    icon: str
    required_fields: list[dict]

    def __init__(self, config: dict, credentials: str | None = None):
        self.config = config
        self.credentials = credentials

    @abstractmethod
    async def test_connection(self) -> bool:
        pass

    @abstractmethod
    async def sync(self) -> SyncResult:
        pass

    @abstractmethod
    async def fetch_items(self, query: str | None = None) -> list[dict]:
        pass

    def get_config_schema(self) -> list[dict]:
        return self.required_fields
