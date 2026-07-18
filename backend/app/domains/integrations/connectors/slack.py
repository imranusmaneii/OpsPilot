import httpx
from app.domains.integrations.connectors.base import BaseConnector, SyncResult
from app.core.logging_config import logger


class SlackConnector(BaseConnector):
    provider = "slack"
    name = "Slack"
    description = "Sync messages, channels, and workspace data"
    icon = "slack"
    required_fields = [
        {"name": "token", "type": "password", "label": "Bot Token (xoxb-...)", "required": True},
        {"name": "channel", "type": "text", "label": "Channel ID", "required": False},
    ]

    async def test_connection(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://slack.com/api/auth.test",
                    headers={"Authorization": f"Bearer {self.credentials}"},
                )
                data = resp.json()
                return data.get("ok", False)
        except Exception as e:
            logger.error("slack_connection_test_failed", error=str(e))
            return False

    async def sync(self) -> SyncResult:
        errors = []
        items = 0
        try:
            channel = self.config.get("channel")
            if channel:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        "https://slack.com/api/conversations.history",
                        headers={"Authorization": f"Bearer {self.credentials}"},
                        params={"channel": channel, "limit": 100},
                    )
                    data = resp.json()
                    if data.get("ok"):
                        items = len(data.get("messages", []))
                    else:
                        errors.append(data.get("error", "unknown"))
        except Exception as e:
            errors.append(str(e))
        return SyncResult(items_synced=items, errors=errors)

    async def fetch_items(self, query: str | None = None) -> list[dict]:
        channel = self.config.get("channel")
        if not channel:
            return []
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://slack.com/api/conversations.history",
                    headers={"Authorization": f"Bearer {self.credentials}"},
                    params={"channel": channel, "limit": 50},
                )
                data = resp.json()
                return data.get("messages", []) if data.get("ok") else []
        except Exception:
            pass
        return []
