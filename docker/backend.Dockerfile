# Fashion Idea backend — dev image (hot-reload). Build context is the repo root.
FROM python:3.13-slim

# uv for fast, reproducible dependency installs.
COPY --from=ghcr.io/astral-sh/uv:0.10 /uv /uvx /bin/

# Keep the virtualenv OUTSIDE /app so the source bind-mount in docker-compose can
# never shadow or seed it with a host (wrong-platform) .venv.
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install dependencies first (cached until the lock/manifest changes) into /opt/venv.
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# App source is bind-mounted in docker-compose for hot reload; copy provides a
# working image even without the mount (e.g. CI).
COPY backend/ ./

# Entrypoint at / (outside the /app bind-mount) so it survives the source mount.
COPY docker/backend-start.sh /backend-start.sh
RUN chmod +x /backend-start.sh

ENV PATH="/opt/venv/bin:$PATH"

EXPOSE 8000
# Runs `alembic upgrade head` then uvicorn.
CMD ["/backend-start.sh"]
