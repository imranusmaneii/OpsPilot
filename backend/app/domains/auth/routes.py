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


@router.post("/regenerate-api-key")
async def regenerate_api_key(
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service),
):
    api_key = await auth_service.regenerate_api_key(user_id)
    return {"api_key": api_key}
