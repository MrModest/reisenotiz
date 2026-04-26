# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:24.14.1-alpine3.23 AS builder

WORKDIR /app

# Native build tools for better-sqlite3 fallback when no prebuilt binary
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile=false && pnpm store prune

COPY src ./src
COPY tsconfig.json ./

RUN pnpm build && pnpm prune --prod

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM node:24.14.1-alpine3.23 AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV SYNC_PORT=4000
ENV SYNC_HOST=0.0.0.0
ENV SYNC_DB_KIND=sqlite
ENV SYNC_SQLITE_PATH=/data/sync.db

LABEL org.opencontainers.image.title="Reisenotiz Sync"
LABEL org.opencontainers.image.description="Automerge sync server"
LABEL org.opencontainers.image.source="https://github.com/MrModest/reisenotiz"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN mkdir -p /data && chown -R node:node /data

USER node
VOLUME ["/data"]
EXPOSE 4000

CMD ["node", "dist/server.js"]
