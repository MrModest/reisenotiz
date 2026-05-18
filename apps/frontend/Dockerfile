# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:24.14.1-alpine3.23 AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Copy dependency files first (layer caching)
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (dev deps needed for build) and clean cache
RUN pnpm install --frozen-lockfile && pnpm store prune

# Copy source files explicitly (no COPY . .)
COPY src ./src
COPY public ./public
COPY index.html tsconfig.json tsconfig.node.json vite.config.ts ./

# Build the app
RUN pnpm build

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM nginxinc/nginx-unprivileged:1.29.5-alpine3.23 AS runtime

# OCI labels for traceability
LABEL org.opencontainers.image.title="Reisenotiz"
LABEL org.opencontainers.image.description="Travel planning PWA"
LABEL org.opencontainers.image.source="https://github.com/MrModest/reisenotiz"

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure static files are world-readable (for arbitrary UID support)
USER root
RUN chmod -R a+r /usr/share/nginx/html && \
    find /usr/share/nginx/html -type d -exec chmod a+rx {} \;
USER nginx

EXPOSE 8080

# nginx-unprivileged uses exec form CMD by default
