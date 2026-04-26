# Plan: Offline-First Sync Backend (Automerge)

> Source PRD: `plans/PRDs/Sync-Engine - Automerge.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Backend location**: `apps/sync/` (Node 24 + TypeScript). Co-located `Dockerfile`. Repo root `docker-compose.yml` references it as build context.
- **Transport**: WebSocket via `@automerge/automerge-repo-network-websocket` (`NodeWSServerAdapter`).
- **Port**: configurable env var, default `4000`.
- **Persistence schema**: single table
  ```sql
  CREATE TABLE automerge_chunks (
    key  TEXT PRIMARY KEY,
    data BYTEA NOT NULL
  );
  ```
  Key format: `docId/chunkType[/chunkId]`. `loadRange` uses `WHERE key LIKE 'prefix/%'`.
- **DB**: SQLite default, Postgres opt-in via env var. Single instance shared with future `users/sessions/permissions` tables.
- **Server domain knowledge**: zero. No `Trip` / `TripItem` types imported server-side, ever.
- **Auth**: none in v1. WebSocket handler structured so an auth middleware slots in before `NodeWSServerAdapter` handshake without touching anything else.
- **Document model**:
  ```ts
  // Root doc — one per user, URL stored in localStorage
  RootDoc {
    tripIndex: Record<string, AutomergeUrl>
    userAirports: Record<string, Airport>
    userAccommodations: Record<string, AccommodationSiteRecord>
  }

  // Trip doc — one per trip, URL stored in RootDoc.tripIndex
  TripDoc {
    trip: Trip
    tripItems: Record<string, TripItem>
  }
  ```
- **Frontend deps**: `@automerge/automerge-repo`, `@automerge/automerge-repo-network-websocket`, `@automerge/automerge-repo-react-hooks`, `@automerge/automerge-repo-storage-indexeddb`.
- **Sync URL**: `VITE_SYNC_SERVER_URL`. Absent → app runs local-only on IndexedDB.
- **Root doc URL persistence**: `localStorage` under a stable key. Trip URLs discovered via root index — no per-trip localStorage entry.
- **Conflict resolution**: native Automerge CRDT. No custom merge logic.
- **Existing TS types**: `Trip`, `TripItem`, subtypes unchanged. `ZonedInstant` stays plain `{ instant, zone }`. UUID v7 unchanged.

---

## Phase 1: Tracer — hello sync

**User stories**: 10, 13

### What to build

Minimal sync server in `apps/sync/` using `@automerge/automerge-repo` + `NodeWSServerAdapter` with **in-memory** storage. Co-located `Dockerfile`. Add `sync` service to root `docker-compose.yml`. Frontend gains a thin `RepoProvider` that connects via `BrowserWebSocketClientAdapter` when `VITE_SYNC_SERVER_URL` is set, otherwise no-op. End-to-end demo: two browser tabs (or two in-process `Repo` instances) exchange changes on a generic test doc through the running server.

### Acceptance criteria

- [ ] `apps/sync/` Node 24 + TS project boots with `pnpm dev` and listens on default port `4000`.
- [ ] `apps/sync/Dockerfile` builds; `sync` service in `docker-compose.yml` runs alongside `app`.
- [ ] Integration test: two `Repo` instances connect to the in-process server, a change on one is observed on the other.
- [ ] Server source contains no `Trip` / `TripItem` / domain references.
- [ ] Frontend `RepoProvider` wraps app root; absent env var = no WS connection, no error.

---

## Phase 2: Persistent server storage

**User stories**: 11

### What to build

Custom `StorageAdapter` (~100 LoC) implementing `load` / `save` / `remove` / `loadRange` / `removeRange` against the `automerge_chunks` table. SQLite default, Postgres switchable via env var. Replace the in-memory adapter in `server.ts`. Documents survive a server restart.

### Acceptance criteria

- [x] Adapter unit tests cover `save` → `load` round-trip, `loadRange` prefix fetch, `remove`, `removeRange`.
- [x] Server boots against SQLite by default; switching env var boots against Postgres without code changes.
- [x] Restart test: change made via Repo A is still readable by a fresh Repo B after the server process restarts.
- [x] Schema is created/migrated on server startup if absent.
- [x] Server still imports zero domain types.

---

## Phase 3: Trips on Automerge (local-only)

**User stories**: 9, 13, 14

### What to build

Swap `useTripsStore` (Zustand + `persist`) for the per-trip Automerge doc model backed by `IndexedDbStorageAdapter`. `RepoProvider` mounts the repo. First load creates a fresh root doc and stores its URL in `localStorage`. Public hook signatures (`useTrips`, `useTrip`, `useTripItem`, `useTripItems`, `useTimelineElements`, `createTrip`, `updateTrip`, `deleteTrip`, `createTripItem`, `updateTripItem`, `deleteTripItem`) preserved so no caller changes. `selectors.ts` reads from doc handles via `useDocument()`. No `VITE_SYNC_SERVER_URL` configured yet — purely local. Existing localStorage data is **not** migrated; the app is pre-launch.

### Acceptance criteria

- [ ] All Zustand trip store code removed. `zustand` dependency stays only if user-records still use it (will be removed in Phase 5).
- [ ] App boots with no sync URL configured, creates a root doc, stores URL in `localStorage`.
- [ ] CRUD against trips and trip items survives page reload (IndexedDB persistence).
- [ ] Existing UI screens for trip list, trip detail, timeline render correctly without component changes.
- [ ] Hook signatures match the previous Zustand-based selectors — caller code untouched.
- [ ] Each trip lives in its own `TripDoc`; root doc holds only the index + (still-empty) user records.
- [ ] Tests with `automerge-repo` in-memory storage adapter cover create/update/delete trip and trip item, asserting doc state.

---

## Phase 4: Trips sync across devices

**User stories**: 1, 2, 3, 4, 5, 6

### What to build

Wire `BrowserWebSocketClientAdapter` to `VITE_SYNC_SERVER_URL`. Trip and trip-item changes propagate between two devices in near real-time. Edits made offline replay automatically on reconnect. Concurrent edits to different items merge cleanly; concurrent scalar edits to the same field resolve last-write-wins per Automerge default.

### Acceptance criteria

- [ ] With server reachable, a trip created on device A appears on device B within a few seconds of B coming online.
- [ ] Edits made on device B while disconnected are visible on A after B reconnects.
- [ ] Deleting a trip on one device removes it everywhere; the deleted trip does not reappear.
- [ ] Concurrent edits to different trip items on two devices merge without data loss.
- [ ] If `VITE_SYNC_SERVER_URL` is unset, app behaves identically to Phase 3 (local-only).
- [ ] If sync URL is set but unreachable, app keeps working from IndexedDB; sync resumes when server returns.

---

## Phase 5: User records sync

**User stories**: 7, 8

### What to build

Move `useUserAirportsStore` and `useUserAccommodationsStore` data into `RootDoc.userAirports` / `RootDoc.userAccommodations`. Hooks rewritten over `useDocument(rootDocHandle)`. Public hook signatures preserved. All remaining Zustand store code and the `zustand` dependency removed.

### Acceptance criteria

- [ ] User airport added on device A appears on device B after sync.
- [ ] User accommodation record edited on one device updates on the other.
- [ ] `zustand` and `zustand/middleware` removed from `package.json`.
- [ ] All `src/store/user-records/*` files use the Automerge hook pattern.
- [ ] Existing screens that consume user records render unchanged.

---

## Phase 6: Connection status UI

**User stories**: 12

### What to build

Surface connection and sync state in the app shell: an indicator that distinguishes online-and-synced, online-syncing, and offline. Drives off `Repo` / network adapter events.

### Acceptance criteria

- [ ] Indicator visible in the app shell on every screen.
- [ ] Goes to "offline" within a few seconds of losing the WebSocket.
- [ ] Goes to "syncing" briefly when changes are propagating, then back to "synced".
- [ ] When `VITE_SYNC_SERVER_URL` is unset, indicator is hidden (no sync configured).
