import pytest
from unittest.mock import AsyncMock, MagicMock

from app.domains.auth.service import AuthService
from app.domains.auth.schemas import UserRegister


@pytest.fixture
def mock_session():
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.flush = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def auth_service(mock_session):
    return AuthService(mock_session)


class TestAuthSchemas:
    def test_user_register_valid(self):
        data = UserRegister(email="test@example.com", password="StrongP@ss1", name="Test")
        assert data.email == "test@example.com"
        assert data.name == "Test"

    def test_user_register_invalid_email(self):
        with pytest.raises(Exception):
            UserRegister(email="not-an-email", password="StrongP@ss1", name="Test")


class TestAuthService:
    @pytest.mark.asyncio
    async def test_register(self, auth_service, mock_session):
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        data = UserRegister(email="new@test.com", password="TestPass1!", name="New User")
        result = await auth_service.register(data)

        assert result.email == "new@test.com"
        assert result.name == "New User"
        mock_session.add.assert_called_once()
