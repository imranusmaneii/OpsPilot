import httpx
from app.domains.integrations.connectors.base import BaseConnector, SyncResult
from app.core.logging_config import logger


class NotionConnector(BaseConnector):
    provider = "notion"
    name = "Notion"
    description = "Sync pages, databases, and wiki content"
    icon = "notion"
    required_fields = [
        {"name": "token", "type": "password", "label": "Integration Token", "required": True},
        {"name": "database_id", "type": "text", "label": "Database ID", "required": False},
    ]

    async def test_connection(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.notion.com/v1/search",
                    headers={
                        "Authorization": f"Bearer {self.credentials}",
                        "Notion-Version": "2022-06-28",
                    },
                    json={"page_size": 1},
                )
                return resp.status_code == 200
        except Exception as e:
            logger.error("notion_connection_test_failed", error=str(e))
            return False

    async def sync(self) -> SyncResult:
        errors = []
        items = 0
        try:
            db_id = self.config.get("database_id")
            if db_id:
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        f"https://api.notion.com/v1/databases/{db_id}/query",
                        headers={
                            "Authorization": f"Bearer {self.credentials}",
                            "Notion-Version": "2022-06-28",
                        },
                        json={"page_size": 100},
                    )
                    if resp.status_code == 200:
                        items = len(resp.json().get("results", []))
                    else:
                        errors.append(f"Failed: {resp.status_code}")
        except Exception as e:
            errors.append(str(e))
        return SyncResult(items_synced=items, errors=errors)

    async def fetch_items(self, query: str | None = None) -> list[dict]:
        db_id = self.config.get("database_id")
        if not db_id:
            return []
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"https://api.notion.com/v1/databases/{db_id}/query",
                    headers={
                        "Authorization": f"Bearer {self.credentials}",
                        "Notion-Version": "2022-06-28",
                    },
                    json={"page_size": 50},
                )
                if resp.status_code == 200:
                    return resp.json().get("results", [])
        except Exception:
            pass
        return []
