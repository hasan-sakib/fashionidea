"""Request/response DTOs for Inquiries."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import InquiryStatus


class InquiryCreate(BaseModel):
    """Public submission payload (the storefront contact form in Phase 4)."""

    sender_name: str = Field(min_length=1, max_length=255)
    sender_email: EmailStr
    message: str = Field(min_length=1, max_length=5000)
    look_id: uuid.UUID | None = None


class InquiryUpdate(BaseModel):
    status: InquiryStatus


class InquiryPublic(BaseModel):
    id: uuid.UUID
    sender_name: str
    sender_email: EmailStr
    message: str
    status: InquiryStatus
    look_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}
