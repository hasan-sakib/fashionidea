"""Public storefront: the published portfolio for the tenant in the request host.

No authentication — the tenant is resolved from the subdomain (or X-Tenant-ID),
and only published collections/looks are exposed.
"""

from fastapi import APIRouter

from app.api.deps import SessionDep, TenantDep
from app.crud import collection as collection_crud
from app.crud import look as look_crud
from app.schemas.storefront import Storefront, StorefrontTenant

router = APIRouter(prefix="/storefront", tags=["storefront"])


@router.get("/", response_model=Storefront)
def get_storefront(tenant: TenantDep, session: SessionDep) -> Storefront:
    return Storefront(
        tenant=StorefrontTenant(slug=tenant.slug, name=tenant.name),
        collections=collection_crud.list_published(session, tenant),
        looks=look_crud.list_published(session, tenant),
    )
