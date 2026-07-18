import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timedelta

from app.domains.auth.service import AuthService
from app.domains.auth.schemas import UserCreate


@pytest.fixture
def mock_session():
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def auth_service(mock_session):
    return AuthService(mock_session)


class TestAuthService:
    @pytest.mark.asyncio
    async def test_register_user(self, auth_service, mock_session):
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        data = UserCreate(email="test@example.com", password="SecurePass123!", full_name="Test User")
        result = await auth_service.register(data)

        assert result.email == "test@example.com"
        assert result.full_name == "Test User"
        mock_session.add.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, auth_service, mock_session):
        existing_user = MagicMock()
        existing_user.email = "test@example.com"
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_user
        mock_session.execute.return_value = mock_result

        data = UserCreate(email="test@example.com", password="SecurePass123!", full_name="Test User")
        with pytest.raises(ValueError, match="already exists"):
            await auth_service.register(data)
