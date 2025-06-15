"""
Security / dependency helpers.

* HTTPBearer → Swagger shows a single header field for the JWT
* get_db       → one DB session per request
* get_current_user → validates token & returns User
"""

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from core.security import decode_token


# ── HTTP Bearer scheme (adds pad-lock + single input in Swagger) ──────────
bearer_scheme = HTTPBearer(bearerFormat="JWT", description="Paste access token")


# ── DB session dependency ─────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Current-user dependency ───────────────────────────────────────────────
def get_current_user(
    creds: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Requires: `Authorization: Bearer <token>`
    Returns the active User or raises 401.
    """
    token = creds.credentials
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found / inactive")
    return user
