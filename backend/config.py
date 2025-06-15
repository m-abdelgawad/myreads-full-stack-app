"""
Centralised configuration loader.

– Chooses the correct .env*/.secrets* pair based on MODE.
– Dynamically assembles DATABASE_URL from discrete parts.
– Keeps one canonical Settings object for the entire backend.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Tuple

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent
_ENV_MODE = os.getenv("MODE", "dev").lower()

def _select_env_files() -> Tuple[str, str]:
    """Return (.env, .secrets) or their production counterparts."""
    if _ENV_MODE == "production":
        return ".env.production", ".secrets.production"
    return ".env", ".secrets"

class Settings(BaseSettings):
    # ───── Core toggles ───────────────────────────────────────────────
    MODE: str = Field(default=_ENV_MODE, pattern="^(dev|production)$")
    SEED_DB: bool = True

    # ───── Plain DB parts (no passwords here) ─────────────────────────
    DB_ENGINE: str = "sqlite"            # sqlite | postgres
    DB_USER: str | None = None
    DB_HOST: str | None = None
    DB_PORT: int | None = None
    DB_NAME: str | None = None

    # ───── Secrets (populated from .secrets*) ─────────────────────────
    DB_PASSWORD: str | None = None
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ───── Derived fields ────────────────────────────────────────────
    @computed_field
    @property
    def DATABASE_URL(self) -> str:                         # noqa: N802
        """Assemble SQLAlchemy-compatible URL on the fly."""
        if self.DB_ENGINE == "sqlite":
            return f"sqlite:///{BASE_DIR / self.DB_NAME}"   # type: ignore[arg-type]
        if self.DB_ENGINE == "postgres":
            port = self.DB_PORT or 5432
            return (
                f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@{self.DB_HOST}:{port}/{self.DB_NAME}"
            )
        raise ValueError(f"Unsupported DB_ENGINE={self.DB_ENGINE!r}")

    # ───── Pydantic settings config ──────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=_select_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
