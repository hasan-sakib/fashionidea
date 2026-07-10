"""Password hashing (bcrypt) and JWT access-token creation/decoding."""

import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings
from app.models.enums import UserRole

ALGORITHM = "HS256"

# bcrypt only hashes the first 72 bytes; encode + truncate consistently.
_BCRYPT_MAX_BYTES = 72


def _pw_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_pw_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_pw_bytes(password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(
    *,
    subject: uuid.UUID,
    role: UserRole,
    tenant_id: uuid.UUID | None,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": str(subject),
        "role": role.value,
        "tenant_id": str(tenant_id) if tenant_id else None,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode + verify a token. Raises ``jwt.PyJWTError`` on any failure."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
