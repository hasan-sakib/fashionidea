"""Enumerations shared across models and schemas."""

import enum


class UserRole(str, enum.Enum):
    designer = "designer"
    consumer = "consumer"
    admin = "admin"


class InquiryStatus(str, enum.Enum):
    new = "new"
    read = "read"
    archived = "archived"
