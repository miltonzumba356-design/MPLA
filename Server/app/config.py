from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "ClacsListening"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    DATABASE_URL: str = "postgresql+asyncpg://clacs:clacs@localhost:5432/clacslistening"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://clacs:clacs@localhost:5432/clacslistening"

    REDIS_URL: str = "redis://localhost:6379/0"

    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-6"

    # ─── WhatsApp Business API ────────────────────────────────────────────────
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_VERIFY_TOKEN: str = "clacslistening-verify"

    # ─── Facebook Graph API ───────────────────────────────────────────────────
    FACEBOOK_PAGE_ACCESS_TOKEN: str = ""
    FACEBOOK_PAGE_ID: str = ""
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    FACEBOOK_WEBHOOK_VERIFY_TOKEN: str = "clacslistening-fb-verify"

    # ─── Instagram Graph API (partilha token com Facebook) ────────────────────
    INSTAGRAM_ACCESS_TOKEN: str = ""          # geralmente igual ao FACEBOOK_PAGE_ACCESS_TOKEN
    INSTAGRAM_BUSINESS_ACCOUNT_ID: str = ""

    # ─── TikTok Research API ─────────────────────────────────────────────────
    TIKTOK_CLIENT_KEY: str = ""
    TIKTOK_CLIENT_SECRET: str = ""
    TIKTOK_USE_APIFY: bool = False            # fallback sem aprovação TikTok

    # ─── Apify (scraping alternativo) ────────────────────────────────────────
    APIFY_API_TOKEN: str = ""

    SOCIALFETCH_API_KEY: str = ""
    GOOGLE_PLACES_API_KEY: str = ""

    COLLECT_INTERVAL_MINUTES: int = 15
    BRAIN_INTERVAL_MINUTES: int = 5
    REPORT_HOUR_UTC: int = 7

    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
