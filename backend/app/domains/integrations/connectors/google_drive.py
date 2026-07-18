from app.domains.integrations.connectors.base import BaseConnector, SyncResult


class GoogleDriveConnector(BaseConnector):
    provider = "google_drive"
    name = "Google Drive"
    description = "Sync documents, spreadsheets, and files"
    icon = "google_drive"
    required_fields = [
        {"name": "token", "type": "password", "label": "OAuth2 Access Token", "required": True},
        {"name": "folder_id", "type": "text", "label": "Folder ID", "required": False},
    ]

    async def test_connection(self) -> bool:
        return bool(self.credentials)

    async def sync(self) -> SyncResult:
        return SyncResult(items_synced=0, errors=["Google Drive sync requires OAuth2 setup"])

    async def fetch_items(self, query: str | None = None) -> list[dict]:
        return []
