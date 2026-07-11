"""SQLModel table models.

Importing this package registers every table on ``SQLModel.metadata`` — which is
what Alembic's autogenerate and ``create_all`` rely on. Import models from here
(``from app.models import User, Tenant``) so registration always happens.
"""

from app.models.base import TimestampBase, UUIDBase, utcnow
from app.models.collection import Collection
from app.models.enums import InquiryStatus, UserRole
from app.models.inquiry import Inquiry
from app.models.look import Look
from app.models.moodboard import Moodboard, MoodboardItem
from app.models.tenant import Tenant
from app.models.user import User

__all__ = [
    "TimestampBase",
    "UUIDBase",
    "utcnow",
    "Collection",
    "Inquiry",
    "InquiryStatus",
    "Look",
    "Moodboard",
    "MoodboardItem",
    "Tenant",
    "User",
    "UserRole",
]
