# Fashion Idea frontend — dev image (Vite dev server). Build context is the repo root.
FROM node:22-slim

WORKDIR /app

# Install deps into the PARENT dir (/node_modules) rather than /app/node_modules.
# The docker-compose source bind-mount at /app would otherwise shadow node_modules
# (a known Docker Desktop nested-mount problem). Node resolves modules by walking
# up the tree, so Vite running in /app finds /node_modules automatically — no
# node_modules volume needed. .npmrc carries legacy-peer-deps + slow-network retries.
COPY frontend/package.json frontend/package-lock.json frontend/.npmrc /
RUN cd / && npm ci --no-audit --no-fund

# App source (bind-mounted at runtime for hot reload; copy keeps the image
# self-contained for CI/prod-preview builds).
COPY frontend/ /app/

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
