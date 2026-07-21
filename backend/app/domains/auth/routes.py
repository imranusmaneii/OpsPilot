from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_auth_service, get_current_user_id, get_db_session
from app.domains.auth.schemas import (
    TokenRefresh,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.domains.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    data: UserRegister,
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.register(data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.login(data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    data: TokenRefresh,
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.refresh_token(data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.get_user(user_id)


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    auth_service: AuthService = Depends(get_auth_service),
):
    """Google OAuth endpoint.

    In production, verify the Google ID token here using Google's tokeninfo endpoint.
    For now, this creates a demo user for Google sign-in flow.
    """
    import secrets
    from app.domains.auth.schemas import UserRegister

    demo_email = f"google-user-{secrets.token_hex(4)}@gmail.com"
    demo_data = UserRegister(
        email=demo_email,
        password=secrets.token_urlsafe(32),
        name="Google User",
    )

    try:
        user = await auth_service.register(demo_data)
        from app.core.security import create_access_token, create_refresh_token

        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
        }
    except Exception:
        from app.core.exceptions import BadRequestException

        raise BadRequestException("Google authentication not yet configured. Please use email/password login.")


@router.post("/regenerate-api-key")
async def regenerate_api_key(
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service),
):
    api_key = await auth_service.regenerate_api_key(user_id)
    return {"api_key": api_key}
