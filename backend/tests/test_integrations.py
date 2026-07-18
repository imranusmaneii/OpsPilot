import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock


class TestIntegrationSchemas:
    def test_integration_create(self):
        from app.domains.integrations.schemas import IntegrationCreate
        data = IntegrationCreate(provider="github", name="My GitHub", config={"repo": "user/repo"})
        assert data.provider == "github"
        assert data.name == "My GitHub"

    def test_integration_create_with_credentials(self):
        from app.domains.integrations.schemas import IntegrationCreate
        data = IntegrationCreate(provider="slack", name="Slack", credentials="xoxb-token")
        assert data.credentials == "xoxb-token"


class TestConnectorRegistry:
    def test_registry_has_all_providers(self):
        from app.domains.integrations.connectors import CONNECTOR_REGISTRY
        assert "github" in CONNECTOR_REGISTRY
        assert "slack" in CONNECTOR_REGISTRY
        assert "notion" in CONNECTOR_REGISTRY
        assert "jira" in CONNECTOR_REGISTRY
        assert "google_drive" in CONNECTOR_REGISTRY

    def test_get_connector(self):
        from app.domains.integrations.connectors import get_connector
        connector = get_connector("github", {"repo": "test/repo"}, "token123")
        assert connector is not None
        assert connector.provider == "github"

    def test_get_unknown_connector(self):
        from app.domains.integrations.connectors import get_connector
        connector = get_connector("unknown", {})
        assert connector is None

    def test_get_available_providers(self):
        from app.domains.integrations.connectors import get_available_providers
        providers = get_available_providers()
        assert len(providers) == 5
        assert all("id" in p and "name" in p and "fields" in p for p in providers)


class TestGitHubConnector:
    @pytest.mark.asyncio
    async def test_config_schema(self):
        from app.domains.integrations.connectors.github import GitHubConnector
        conn = GitHubConnector(config={}, credentials="token")
        schema = conn.get_config_schema()
        assert len(schema) == 3
        assert schema[0]["name"] == "token"
