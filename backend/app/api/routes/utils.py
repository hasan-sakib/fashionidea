"""Utility routes: liveness/health checks used by Docker and load balancers."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/utils", tags=["utils"])


class HealthCheck(BaseModel):
    status: str


@router.get("/health-check/", response_model=HealthCheck)
def health_check() -> HealthCheck:
    """Return a static OK payload. Target of the Compose healthcheck and Traefik probes."""
    return HealthCheck(status="ok")
