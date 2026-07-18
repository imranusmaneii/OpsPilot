import httpx
from app.domains.integrations.connectors.base import BaseConnector, SyncResult
from app.core.logging_config import logger


class GitHubConnector(BaseConnector):
    provider = "github"
    name = "GitHub"
    description = "Sync repositories, issues, PRs, and documentation"
    icon = "github"
    required_fields = [
        {"name": "token", "type": "password", "label": "Personal Access Token", "required": True},
        {"name": "org", "type": "text", "label": "Organization", "required": False},
        {"name": "repo", "type": "text", "label": "Repository (owner/repo)", "required": False},
    ]

    async def test_connection(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {self.credentials}"},
                )
                return resp.status_code == 200
        except Exception as e:
            logger.error("github_connection_test_failed", error=str(e))
            return False

    async def sync(self) -> SyncResult:
        errors = []
        items = 0
        try:
            repo = self.config.get("repo")
            if repo:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        f"https://api.github.com/repos/{repo}/issues",
                        headers={"Authorization": f"Bearer {self.credentials}"},
                        params={"state": "all", "per_page": 100},
                    )
                    if resp.status_code == 200:
                        items = len(resp.json())
                    else:
                        errors.append(f"Failed to fetch issues: {resp.status_code}")
        except Exception as e:
            errors.append(str(e))
        return SyncResult(items_synced=items, errors=errors)

    async def fetch_items(self, query: str | None = None) -> list[dict]:
        repo = self.config.get("repo")
        if not repo:
            return []
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{repo}/issues",
                    headers={"Authorization": f"Bearer {self.credentials}"},
                    params={"state": "all", "per_page": 50},
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return []
