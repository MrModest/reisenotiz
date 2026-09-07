# CLAUDE.md — Sync Server

This file applies when working inside `apps/sync/`. Run all commands from this directory.

Read `CONTEXT.md` in this directory for the vocabulary. The one rule that governs everything
here: **this server holds no domain knowledge** — see `/docs/adr/0003-sync-server-holds-no-domain-knowledge.md`.

## Development Commands

- `pnpm dev` — Run the server with `tsx watch`
- `pnpm start` — Run the server without watch
- `pnpm build` — Type-check and emit with `tsc`
- `pnpm lint` — ESLint, zero warnings
- `pnpm test` / `pnpm test:watch` — Vitest

## Architecture

- **Runtime**: Node + TypeScript, ESM (`"type": "module"`), run through `tsx`
- **HTTP/WS**: Hono with `@hono/node-server` and `@hono/node-ws`
- **Sync**: `@automerge/automerge-repo` with `NodeWSServerAdapter`
- **Storage**: `src/storage/` — a `StorageAdapter` per backend, `better-sqlite3` by default
  and `pg` opt-in, selected by env var
- **Keys**: chunks are addressed `docId/chunkType[/chunkId]`; range reads rely on that prefix,
  so `src/storage/key.ts` owns the shape

## Configuration

| Variable          | Default          | Meaning                          |
| ----------------- | ---------------- | -------------------------------- |
| `SYNC_PORT`       | `4000`           | Listen port                      |
| `SYNC_HOST`       | `0.0.0.0`        | Listen host                      |
| `SYNC_DB_KIND`    | `sqlite`         | `sqlite` or `postgres`           |
| `SYNC_SQLITE_PATH`| `/data/sync.db`  | SQLite file (sqlite only)        |
| `SYNC_PG_URL`     | —                | Connection string (postgres only)|

## Rules

- **Never import a domain type.** No `Trip`, no `TripItem`, no travel vocabulary — not in code,
  not in table names, not in tests. A chunk is bytes.
- **Never add validation, projection or filtering of document contents.** If a feature seems to
  need the server to understand a document, it belongs in the frontend.
- Auth is not implemented. The WebSocket handler is structured so middleware can slot in before
  the `NodeWSServerAdapter` handshake without touching storage or transport.
- New storage backends implement the existing `StorageAdapter` interface and nothing more.
