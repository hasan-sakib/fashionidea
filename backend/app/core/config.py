"""Application settings, loaded from environment variables.

Uses pydantic-settings so every deployment (local Docker, CI, prod) is configured the same way.
In Phase 1 the database URI is *assembled* but not yet used to open a connection — the DB engine
and session dependency arrive in Phase 2.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import PostgresDsn, computed_field, field_validator
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    # --- General -----------------------------------------------------------------
    PROJECT_NAME: str = "Fashion Idea"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "local"

    # Secret used to sign JWTs (Phase 2). Present now so the contract is stable.
    SECRET_KEY: str = "changethis"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Apex domain for tenant subdomains, e.g. "localhost" → designer1.localhost
    DOMAIN: str = "localhost"

    # --- CORS --------------------------------------------------------------------
    # Comma-separated list in env, or a JSON array. NoDecode stops pydantic-settings
    # from JSON-decoding the raw env string so the validator below can split it.
    BACKEND_CORS_ORIGINS: Annotated[list[str], NoDecode] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _split_cors(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str) and not value.startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    # --- Database ----------------------------------------------------------------
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "fashionidea"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )


@lru_cache
def get_settings() -> Settings:
    """Cached accessor so settings are parsed once per process."""
    return Settings()


settings = get_settings()
