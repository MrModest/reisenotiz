# pnpm workspace monorepo

The frontend and the sync server live in one repo as pnpm workspace packages under `apps/*`, rather than in separate repos. They share TypeScript config conventions and are released together, and a split would have meant versioning the sync protocol across repo boundaries for a project with one maintainer.

Each app owns its own `Dockerfile` and is published as its own image; the root `docker-compose.yml` composes them.
