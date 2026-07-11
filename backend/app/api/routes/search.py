"""Public global search + shared vocabulary for the discovery UI."""

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import SessionDep
from app.api.routes.marketplace import to_marketplace_look
from app.core.vocab import CATEGORIES, OCCASIONS
from app.crud import designer as designer_crud
from app.crud import marketplace as discover_crud
from app.schemas.discovery import DesignerCard, SearchResults, Vocab

router = APIRouter(tags=["search"])


@router.get("/vocab", response_model=Vocab)
def get_vocab() -> Vocab:
    """Occasion + category vocabularies shared by the dashboard editor and filters."""
    return Vocab(occasions=OCCASIONS, categories=CATEGORIES)


@router.get("/search/", response_model=SearchResults)
def search(
    session: SessionDep,
    q: Annotated[str, Query(min_length=1)],
    limit: Annotated[int, Query(ge=1, le=20)] = 6,
):
    """Rich search for the navbar dropdown: designers, designs, occasions, categories."""
    tenants = designer_crud.search_names(session, q, limit)
    look_rows = discover_crud.list_looks(session, 0, limit, q=q)
    ql = q.lower()
    return SearchResults(
        designers=[
            DesignerCard(slug=t.slug, name=t.name, look_count=0, cover_image=None) for t in tenants
        ],
        looks=[to_marketplace_look(look, tenant) for look, tenant in look_rows],
        occasions=[o for o in OCCASIONS if ql in o.lower()],
        categories=[c for c in CATEGORIES if ql in c.lower()],
    )
