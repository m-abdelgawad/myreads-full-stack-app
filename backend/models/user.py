from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """SQLAlchemy ORM model for application users."""
    __tablename__ = "users"

    id         = Column(String, primary_key=True, index=True)
    email      = Column(String, unique=True, index=True, nullable=False)
    hashed_pw  = Column(String, nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ── make sure import * exposes the symbol and breaks no cycles ──
__all__ = ["User"]
