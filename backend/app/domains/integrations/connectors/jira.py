import httpx
from app.domains.integrations.connectors.base import BaseConnector, SyncResult
from app.core.logging_config import logger


class JiraConnector(BaseConnector):
    provider = "jira"
    name = "Jira"
    description = "Sync issues, sprints, and project data"
    icon = "jira"
    required_fields = [
        {"name": "email", "type": "text", "label": "Email", "required": True},
        {"name": "token", "type": "password", "label": "API Token", "required": True},
        {"name": "domain", "type": "text", "label": "Jira Domain (yourorg.atlassian.net)", "required": True},
        {"name": "project_key", "type": "text", "label": "Project Key", "required": False},
    ]

    async def test_connection(self) -> bool:
        try:
            import base64
            email = self.config.get("email", "")
            token = self.credentials or ""
            auth = base64.b64encode(f"{email}:{token}".encode()).decode()
            domain = self.config.get("domain", "")

            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://{domain}/rest/api/3/myself",
                    headers={"Authorization": f"Basic {auth}"},
                )
                return resp.status_code == 200
        except Exception as e:
            logger.error("jira_connection_test_failed", error=str(e))
            return False

    async def sync(self) -> SyncResult:
        errors = []
        items = 0
        try:
            import base64
            email = self.config.get("email", "")
            token = self.credentials or ""
            auth = base64.b64encode(f"{email}:{token}".encode()).decode()
            domain = self.config.get("domain", "")
            project = self.config.get("project_key", "")

            jql = f"project={project}" if project else ""

            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://{domain}/rest/api/3/search",
                    headers={"Authorization": f"Basic {auth}"},
                    params={"jql": jql, "maxResults": 100},
                )
                if resp.status_code == 200:
                    items = resp.json().get("total", 0)
                else:
                    errors.append(f"Failed: {resp.status_code}")
        except Exception as e:
            errors.append(str(e))
        return SyncResult(items_synced=items, errors=errors)

    async def fetch_items(self, query: str | None = None) -> list[dict]:
        return []
