# CLAUDE.md

Guidance for Claude Code (claude.ai/code) at the **repo root**.

## Layout

pnpm workspace (`apps/*`) with two packages:

- `apps/frontend/` — React 19 PWA. See `apps/frontend/CLAUDE.md` for app-specific guidance.
- `apps/sync/` — Node + TypeScript Automerge sync server (WebSocket, SQLite by default, Postgres opt-in). See `apps/sync/CLAUDE.md`.

## When to Work in Which Directory

- Touching React UI, components, hooks, stores, PWA config → `cd apps/frontend` first, then read `apps/frontend/CLAUDE.md`.
- Touching the sync server, its storage adapters or its Dockerfile → `cd apps/sync`, then read `apps/sync/CLAUDE.md`.
- Touching `docker-compose.yml`, GitHub workflows, `docs/`, `plans/`, root README/ROADMAP → stay at the root.

## Documentation Structure

- **`CONTEXT-MAP.md`** → `apps/frontend/CONTEXT.md`, `apps/sync/CONTEXT.md` — the domain glossary. What the words mean. Read before naming anything.
- **`docs/adr/`** — system-wide decisions and why they were made. `apps/frontend/docs/adr/` holds frontend-only ones.
- **`CLAUDE.md`** (here, and one per app) — how to work here: commands, tooling, conventions.
- **`docs/agents/`** — configuration the engineering skills read. Not project documentation.
- **`apps/frontend/docs/design-system.md`** — implemented radius/spacing tokens.
- **`plans/archived/`** — history, not current state. See `plans/README.md`.

For anything touching the Automerge store or sync, read the `automerge` skill first.

## Tooling

- Use `pnpm` (never `npm` or `yarn`).
- Prefer running package commands from inside the app directory: `cd apps/frontend && pnpm dev`.
- The root `package.json` has workspace-wide passthroughs that fan out to every app: `pnpm dev` (parallel), `pnpm build`, `pnpm lint`, `pnpm test`. Use these when you want both apps at once; use the app directory when you want one.

## Docker

- Each app builds from its own directory via its own `Dockerfile`.
- `docker-compose.yml` at the root orchestrates two services: `app` (frontend, port 8080) and `sync` (sync server, port 4000, `sync-data` volume).
- `VITE_SYNC_SERVER_URL` is baked into the frontend **at build time** (Vite), set from a root `.env`. Absent → the app runs local-only on IndexedDB.

## Agent skills

Provided by the `mattpocock-skills` plugin, enabled for this repo in `.claude/settings.json`.
Install it once with `/plugin install mattpocock-skills@claude-plugins-official`.

### Workflow

The main flow, driven by the human as slash commands:

1. `/mattpocock-skills:grill-with-docs` — interrogate the idea, capturing terms into `CONTEXT.md` and decisions into `docs/adr/` as they settle. For work too big for one session, `/mattpocock-skills:wayfinder` instead.
2. `/mattpocock-skills:to-spec` — turn the conversation into a spec on the issue tracker
3. `/mattpocock-skills:to-tickets` — break the spec into tracer-bullet tickets with blocking edges
4. `/mattpocock-skills:implement` — build the tickets, test-first where there are seams
5. `/mattpocock-skills:code-review` — review the diff on both standards and spec axes

Most of these set `disable-model-invocation`, so they run only when invoked — asking for "a spec"
in prose will not start step 2. `/mattpocock-skills:ask-matt` routes to the right one if unsure.

### Issue tracker

Issues live in this repo's GitHub Issues (`MrModest/reisenotiz`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: a root `CONTEXT-MAP.md` pointing at per-app `CONTEXT.md` files, with root and per-app `docs/adr/`. See `docs/agents/domain.md`.
