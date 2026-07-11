"""Request/response DTOs for authentication and registration.

Kept separate from the SQLModel table models so the API contract is explicit and
never leaks columns like ``hashed_password``.
"""

import uuid

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole

# Reserved subdomain labels that may not be claimed as a tenant slug.
RESERVED_SLUGS = {"api", "www", "traefik", "app", "localhost", "admin", "static", "assets"}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DesignerRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    tenant_name: str = Field(min_length=1, max_length=255)
    # DNS-safe subdomain label.
    tenant_slug: str = Field(min_length=1, max_length=63, pattern=r"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")


class ConsumerRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)


class TenantPublic(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    is_active: bool

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None
    role: UserRole
    tenant_id: uuid.UUID | None
    is_active: bool

    model_config = {"from_attributes": True}
