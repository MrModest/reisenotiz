# CLAUDE.md

Guidance for Claude Code (claude.ai/code) at the **repo root**.

## Layout

pnpm workspace (`apps/*`) with two packages:

- `apps/frontend/` — React 19 PWA. See `apps/frontend/CLAUDE.md` for app-specific guidance.
- `apps/sync/` — Node + TypeScript Automerge sync server (WebSocket, SQLite by default, Postgres opt-in). No `CLAUDE.md` of its own yet. It holds **zero domain knowledge** — no `Trip` / `TripItem` types server-side, ever.

## When to Work in Which Directory

- Touching React UI, components, hooks, stores, PWA config → `cd apps/frontend` first, then read `apps/frontend/CLAUDE.md`.
- Touching the sync server, its storage adapters or its Dockerfile → `cd apps/sync`.
- Touching `docker-compose.yml`, GitHub workflows, `docs/`, `plans/`, root README/ROADMAP → stay at the root.

## Cross-Cutting Reference Documents

- For brand, colour, typography and composition, refer to the `reisenotiz-design` skill.
- `docs/agents/DESIGN_SYSTEM.md` — the radius/spacing tokens as actually implemented in `src/index.css`. Use it for token names and pixel values; it records a known naming discrepancy with the skill.
- `docs/agents/CRUD_FLOW_BEST_PRACTISE.md` — Create/View/Edit flow patterns.
- For anything touching the Automerge store or sync, read the `automerge` skill first.
- `plans/archived/` is **history, not current state** — see `plans/README.md`.

## Tooling

- Use `pnpm` (never `npm` or `yarn`).
- Prefer running package commands from inside the app directory: `cd apps/frontend && pnpm dev`.
- The root `package.json` has workspace-wide passthroughs that fan out to every app: `pnpm dev` (parallel), `pnpm build`, `pnpm lint`, `pnpm test`. Use these when you want both apps at once; use the app directory when you want one.

## Docker

- Each app builds from its own directory via its own `Dockerfile`.
- `docker-compose.yml` at the root orchestrates two services: `app` (frontend, port 8080) and `sync` (sync server, port 4000, `sync-data` volume).
- `VITE_SYNC_SERVER_URL` is baked into the frontend **at build time** (Vite), set from a root `.env`. Absent → the app runs local-only on IndexedDB.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`MrModest/reisenotiz`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: a root `CONTEXT-MAP.md` pointing at per-app `CONTEXT.md` files, with root and per-app `docs/adr/`. See `docs/agents/domain.md`.
