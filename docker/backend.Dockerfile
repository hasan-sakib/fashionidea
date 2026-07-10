# Fashion Hub backend — dev image (hot-reload). Build context is the repo root.
FROM python:3.13-slim

# uv for fast, reproducible dependency installs.
COPY --from=ghcr.io/astral-sh/uv:0.10 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install dependencies first (cached until the lock/manifest changes).
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# App source is bind-mounted in docker-compose for hot reload; copy provides a
# working image even without the mount (e.g. CI).
COPY backend/ ./

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
