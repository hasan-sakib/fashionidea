# Fashion Hub frontend — dev image (Vite dev server). Build context is the repo root.
FROM node:22-slim

WORKDIR /app

# Install deps first (cached until package files change). package-lock.json is
# copied when present (package*.json glob) so installs are reproducible; npm
# install still works if only package.json exists.
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund

# Source is bind-mounted in docker-compose for hot reload; copy keeps the image
# self-contained for CI/prod-preview builds.
COPY frontend/ ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
