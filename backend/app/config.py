from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    APP_NAME: str = "OpsPilot AI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="development")

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://opspilot:opspilot@localhost:5432/opspilot"
    )
    DATABASE_ECHO: bool = Field(default=False)

    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    JWT_SECRET_KEY: str = Field(default="dev-secret-change-in-production")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    OPENAI_API_KEY: str = Field(default="")
    OPENAI_MODEL: str = Field(default="gpt-4o")

    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"]
    )

    MAX_UPLOAD_SIZE_MB: int = Field(default=50)
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)

    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/2")

    EMBEDDING_MODEL: str = Field(default="sentence-transformers/all-MiniLM-L6-v2")
    EMBEDDING_DIMENSION: int = Field(default=384)

    LOG_LEVEL: str = Field(default="INFO")
    LOG_FORMAT: str = Field(default="json")


settings = Settings()
