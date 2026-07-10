#!/bin/sh
# Backend container entrypoint: apply DB migrations, then start the API.
# Lives at / (outside the /app bind-mount) so it is never shadowed at runtime.
set -e

cd /app
echo "[backend-start] applying migrations (alembic upgrade head)"
alembic upgrade head

echo "[backend-start] starting uvicorn"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
