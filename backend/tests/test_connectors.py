import pytest


class TestBaseConnector:
    def test_cannot_instantiate_directly(self):
        from app.domains.integrations.connectors.base import BaseConnector

        with pytest.raises(TypeError):
            BaseConnector(config={})

    def test_sync_result(self):
        from app.domains.integrations.connectors.base import SyncResult

        result = SyncResult(items_synced=10, errors=["err1"])
        assert result.items_synced == 10
        assert len(result.errors) == 1


class TestGitHubConnector:
    @pytest.mark.asyncio
    async def test_no_repo_fetch_returns_empty(self):
        from app.domains.integrations.connectors.github import GitHubConnector

        conn = GitHubConnector(config={}, credentials="token")
        items = await conn.fetch_items()
        assert items == []

    @pytest.mark.asyncio
    async def test_no_repo_sync_returns_zero(self):
        from app.domains.integrations.connectors.github import GitHubConnector

        conn = GitHubConnector(config={}, credentials="token")
        result = await conn.sync()
        assert result.items_synced == 0


class TestSlackConnector:
    @pytest.mark.asyncio
    async def test_no_channel_fetch_returns_empty(self):
        from app.domains.integrations.connectors.slack import SlackConnector

        conn = SlackConnector(config={}, credentials="token")
        items = await conn.fetch_items()
        assert items == []

    @pytest.mark.asyncio
    async def test_no_channel_sync_returns_zero(self):
        from app.domains.integrations.connectors.slack import SlackConnector

        conn = SlackConnector(config={}, credentials="token")
        result = await conn.sync()
        assert result.items_synced == 0


class TestNotionConnector:
    @pytest.mark.asyncio
    async def test_no_db_fetch_returns_empty(self):
        from app.domains.integrations.connectors.notion import NotionConnector

        conn = NotionConnector(config={}, credentials="token")
        items = await conn.fetch_items()
        assert items == []
