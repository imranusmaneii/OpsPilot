import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime

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


class TestAuthSchemas:
    def test_user_create_valid(self):
        data = UserCreate(email="test@example.com", password="StrongP@ss1", full_name="Test")
        assert data.email == "test@example.com"
        assert data.full_name == "Test"

    def test_user_create_invalid_email(self):
        with pytest.raises(Exception):
            UserCreate(email="not-an-email", password="StrongP@ss1", full_name="Test")


class TestAuthService:
    @pytest.mark.asyncio
    async def test_register(self, auth_service, mock_session):
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        data = UserCreate(email="new@test.com", password="TestPass1!", full_name="New User")
        result = await auth_service.register(data)

        assert result.email == "new@test.com"
        assert result.full_name == "New User"
        mock_session.add.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_duplicate(self, auth_service, mock_session):
        existing = MagicMock()
        existing.email = "dup@test.com"
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing
        mock_session.execute.return_value = mock_result

        data = UserCreate(email="dup@test.com", password="TestPass1!", full_name="Dup")
        with pytest.raises(ValueError):
            await auth_service.register(data)
