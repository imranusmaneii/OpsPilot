import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.integrations.models import Integration
from app.domains.integrations.schemas import (
    IntegrationCreate, IntegrationUpdate, IntegrationResponse,
    IntegrationListResponse, SyncResponse,
)
from app.domains.integrations.connectors import get_connector, get_available_providers
from app.core.logging_config import logger


class IntegrationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_integration(self, user_id: uuid.UUID, data: IntegrationCreate) -> IntegrationResponse:
        integration = Integration(
            user_id=user_id,
            provider=data.provider,
            name=data.name,
            config=data.config,
            credentials_encrypted=data.credentials,
        )
        self.session.add(integration)
        await self.session.commit()
        await self.session.refresh(integration)
        logger.info("integration_created", provider=data.provider, user_id=str(user_id))
        return IntegrationResponse.model_validate(integration)

    async def list_integrations(self, user_id: uuid.UUID) -> IntegrationListResponse:
        stmt = select(Integration).where(Integration.user_id == user_id).order_by(Integration.created_at.desc())
        result = await self.session.execute(stmt)
        integrations = result.scalars().all()
        return IntegrationListResponse(
            integrations=[IntegrationResponse.model_validate(i) for i in integrations],
            total=len(integrations),
        )

    async def get_integration(self, integration_id: uuid.UUID, user_id: uuid.UUID) -> IntegrationResponse | None:
        stmt = select(Integration).where(Integration.id == integration_id, Integration.user_id == user_id)
        result = await self.session.execute(stmt)
        integration = result.scalar_one_or_none()
        return IntegrationResponse.model_validate(integration) if integration else None

    async def update_integration(self, integration_id: uuid.UUID, user_id: uuid.UUID, data: IntegrationUpdate) -> IntegrationResponse | None:
        stmt = select(Integration).where(Integration.id == integration_id, Integration.user_id == user_id)
        result = await self.session.execute(stmt)
        integration = result.scalar_one_or_none()
        if not integration:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            if field == "credentials":
                integration.credentials_encrypted = value
            else:
                setattr(integration, field, value)
        await self.session.commit()
        await self.session.refresh(integration)
        return IntegrationResponse.model_validate(integration)

    async def delete_integration(self, integration_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        stmt = select(Integration).where(Integration.id == integration_id, Integration.user_id == user_id)
        result = await self.session.execute(stmt)
        integration = result.scalar_one_or_none()
        if not integration:
            return False
        await self.session.delete(integration)
        await self.session.commit()
        return True

    async def test_connection(self, integration_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        stmt = select(Integration).where(Integration.id == integration_id, Integration.user_id == user_id)
        result = await self.session.execute(stmt)
        integration = result.scalar_one_or_none()
        if not integration:
            return False
        connector = get_connector(integration.provider, integration.config, integration.credentials_encrypted)
        if not connector:
            return False
        return await connector.test_connection()

    async def sync_integration(self, integration_id: uuid.UUID, user_id: uuid.UUID) -> SyncResponse | None:
        stmt = select(Integration).where(Integration.id == integration_id, Integration.user_id == user_id)
        result = await self.session.execute(stmt)
        integration = result.scalar_one_or_none()
        if not integration:
            return None
        connector = get_connector(integration.provider, integration.config, integration.credentials_encrypted)
        if not connector:
            return SyncResponse(message="Unknown provider", items_synced=0)
        sync_result = await connector.sync()
        return SyncResponse(message="Sync completed", items_synced=sync_result.items_synced)

    @staticmethod
    def get_available_providers():
        return get_available_providers()
