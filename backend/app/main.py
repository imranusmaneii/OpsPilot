from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.events import lifespan
from app.core.logging_config import setup_logging
from app.core.middleware import LoggingMiddleware, RequestIDMiddleware
from app.domains.auth.routes import router as auth_router
from app.domains.documents.routes import router as documents_router
from app.domains.knowledge_base.routes import router as knowledge_base_router
from app.domains.chat.routes import router as chat_router
from app.domains.chat.search_routes import router as search_router
from app.domains.agents.routes import router as agents_router
from app.domains.evaluation.routes import router as evaluation_router
from app.domains.analytics.routes import router as analytics_router
from app.domains.integrations.routes import router as integrations_router
from app.domains.playground import router as playground_router
from app.domains.cost import router as cost_router

setup_logging(log_level=settings.LOG_LEVEL, log_format=settings.LOG_FORMAT)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

API_V1 = "/api/v1"
app.include_router(auth_router, prefix=API_V1)
app.include_router(documents_router, prefix=API_V1)
app.include_router(knowledge_base_router, prefix=API_V1)
app.include_router(chat_router, prefix=API_V1)
app.include_router(search_router, prefix=API_V1)
app.include_router(agents_router, prefix=API_V1)
app.include_router(evaluation_router, prefix=API_V1)
app.include_router(analytics_router, prefix=API_V1)
app.include_router(integrations_router, prefix=API_V1)
app.include_router(playground_router, prefix=API_V1)
app.include_router(cost_router, prefix=API_V1)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/")
async def root():
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION}
