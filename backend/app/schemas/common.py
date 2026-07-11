"""Shared API schema primitives."""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Standard list envelope: the page of items plus the total match count."""

    data: list[T]
    count: int
