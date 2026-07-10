"""Inquiry: a tenant-scoped message from a visitor about a look/designer."""

import uuid

from sqlmodel import Field

from app.models.base import TimestampBase, UUIDBase
from app.models.enums import InquiryStatus


class Inquiry(UUIDBase, TimestampBase, table=True):
    __tablename__ = "inquiries"

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True, nullable=False)
    look_id: uuid.UUID | None = Field(
        default=None, foreign_key="looks.id", index=True, nullable=True
    )
    sender_name: str = Field(max_length=255)
    sender_email: str = Field(max_length=255)
    message: str
    status: InquiryStatus = Field(default=InquiryStatus.new, index=True)
