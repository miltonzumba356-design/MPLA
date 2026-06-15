from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.logging import setup_logging
from app.models.database import get_engine, Base
from app.api.routes import auth, projects, mentions, alerts, reports, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging(debug=settings.DEBUG)
    if settings.APP_ENV != "development" and settings.SECRET_KEY == "change-me":
        raise RuntimeError("SECRET_KEY must be configured outside development")
    # Create tables on startup (use alembic in production)
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await get_engine().dispose()


app = FastAPI(
    title="ClacsListening API",
    description="Motor próprio de social listening para o mercado angolano",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(mentions.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(webhooks.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME, "env": settings.APP_ENV}
