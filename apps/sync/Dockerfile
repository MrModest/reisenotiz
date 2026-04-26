# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:24.14.1-alpine3.23 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile=false && pnpm store prune

COPY src ./src
COPY tsconfig.json ./

RUN pnpm build

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM node:24.14.1-alpine3.23 AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV SYNC_PORT=4000
ENV SYNC_HOST=0.0.0.0

RUN corepack enable && corepack prepare pnpm@latest --activate

LABEL org.opencontainers.image.title="Reisenotiz Sync"
LABEL org.opencontainers.image.description="Automerge sync server"
LABEL org.opencontainers.image.source="https://github.com/MrModest/reisenotiz"

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile=false && pnpm store prune

COPY --from=builder /app/dist ./dist

USER node
EXPOSE 4000

CMD ["node", "dist/server.js"]
