from app.domains.integrations.connectors.base import BaseConnector
from app.domains.integrations.connectors.github import GitHubConnector
from app.domains.integrations.connectors.slack import SlackConnector
from app.domains.integrations.connectors.notion import NotionConnector
from app.domains.integrations.connectors.jira import JiraConnector
from app.domains.integrations.connectors.google_drive import GoogleDriveConnector

CONNECTOR_REGISTRY: dict[str, type[BaseConnector]] = {
    "github": GitHubConnector,
    "slack": SlackConnector,
    "notion": NotionConnector,
    "jira": JiraConnector,
    "google_drive": GoogleDriveConnector,
}


def get_connector(provider: str, config: dict, credentials: str | None = None) -> BaseConnector | None:
    cls = CONNECTOR_REGISTRY.get(provider)
    if not cls:
        return None
    return cls(config=config, credentials=credentials)


def get_available_providers() -> list[dict]:
    return [
        {
            "id": cls.provider,
            "name": cls.name,
            "description": cls.description,
            "icon": cls.icon,
            "fields": cls.required_fields,
        }
        for cls in CONNECTOR_REGISTRY.values()
    ]
