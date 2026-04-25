# PRD: Offline-First Sync Backend (Automerge)

## Context

Reisenotiz is currently a fully client-side PWA. All data (trips, trip items, user-saved airports and accommodations) lives only in each device's localStorage via Zustand stores. There is no way for a user's desktop and mobile to stay in sync, and any data created on one device is invisible to the other.

This PRD introduces an offline-first sync backend using Automerge CRDT. The solution should require minimal changes to the existing frontend code, support editing while offline, and propagate changes to all connected clients once connectivity is restored.

---

## Problem Statement

As a solo traveler managing trips across multiple devices, I have no way to keep my trip data in sync. If I add a flight on my desktop, I can't see it on my phone. If I edit an accommodation on mobile while offline, that change is silently lost when I switch to desktop. There is no conflict resolution, no sync protocol, and no backend to act as a source of truth.

## Solution

Introduce a lightweight, **data-agnostic** Node.js sync server based on `@automerge/automerge-repo` that speaks the Automerge sync protocol over WebSocket. The server stores and forwards binary Automerge chunks — it never parses document contents and has no knowledge of trips, items, or any domain type. Auth is implemented as generic document-level access control: a `permissions(userId, docId, role)` model that works for any document, not just travel data. Because the server is fully generic, it is a candidate for extraction into a dedicated repository and reuse across other projects.

The client replaces its Zustand localStorage stores with a **per-trip Automerge document model**: one root document tracks the list of trips (each holding its `AutomergeUrl`), and each trip has its own document containing its items. This structure directly enables future trip collaboration by making a trip shareable via its document URL. Documents sync automatically in real-time when online and merge seamlessly after going back online.

---

## User Stories

1. As a user, I want my newly created trips to appear on all my devices automatically, so I don't have to re-enter data.
2. As a user, I want to add trip items while my device is offline, so that connectivity issues don't interrupt my planning.
3. As a user, I want my offline edits to sync to the backend automatically when I reconnect, so I never lose data.
4. As a user, I want my desktop to receive trip changes made on mobile within seconds of reconnecting, so my devices stay consistent.
5. As a user, I want to edit a trip item on both devices simultaneously, and have a sensible merge result rather than data loss, so concurrent edits don't destroy each other.
6. As a user, I want to delete a trip item on one device and have it deleted everywhere, so stale data doesn't reappear.
7. As a user, I want my custom airport records to sync across devices, so I only have to add them once.
8. As a user, I want my saved accommodation records to sync across devices, so I only have to build my library once.
9. As a user, I want the app to work exactly as before when I have no sync server configured, so I'm not forced to run infrastructure.
10. As a user, I want to self-host the sync server via Docker Compose alongside the existing app container, so I remain in full control of my data.
11. As a user, I want the sync server to persist my documents to disk, so a server restart doesn't wipe my synced state.
12. As a user, I want the app to indicate when it's offline and when a sync is in progress, so I understand the current state of my data.
13. As a developer, I want the sync layer to be addable without rewriting the existing component tree, so the change is low-risk.
14. As a future collaborator, I want to receive a trip document URL from another user and immediately see their trip data in my app, so trip sharing requires no server-side changes.

---

## Implementation Decisions

### Backend Service

- **Runtime**: Node.js 24 + TypeScript (matches frontend build image)
- **Core libraries**: `@automerge/automerge-repo`, `@automerge/automerge-repo-network-websocket`
- **Transport**: WebSocket (`ws` library via `NodeWSServerAdapter`)
- **Persistence**: Custom `StorageAdapter` backed by a relational DB (Postgres or SQLite, configurable via env var). No official Postgres/SQLite adapter exists in automerge-repo — a small custom adapter (~100 lines) implements the interface:
  ```typescript
  type StorageKey = string[];
  abstract class StorageAdapter {
    abstract load(key: StorageKey): Promise<Uint8Array | undefined>;
    abstract save(key: StorageKey, data: Uint8Array): Promise<void>;
    abstract remove(key: StorageKey): Promise<void>;
    abstract loadRange(
      keyPrefix: StorageKey,
    ): Promise<{ key: StorageKey; data: Uint8Array }[]>;
    abstract removeRange(keyPrefix: StorageKey): Promise<void>;
  }
  ```
  Keys are hierarchical path segments (`[docId, chunkType, chunkId?]`), joined as `"docId/chunkType/chunkId"` in the DB. `loadRange` maps to a single `WHERE key LIKE 'prefix/%'` query — efficient bulk fetch of all chunks for a document. Storage table:
  ```sql
  CREATE TABLE automerge_chunks (
    key  TEXT PRIMARY KEY,
    data BYTEA NOT NULL
  );
  ```
- **Shared DB**: Auth tables (`users`, `sessions`, `permissions`) and `automerge_chunks` live in the same DB instance. Single connection pool, single backup, single Docker service.
- **Authentication**: None in v1 — the WebSocket handler is structured so an auth middleware can be inserted before the `NodeWSServerAdapter` handshake without touching anything else
- **Domain knowledge**: Zero — the server stores and forwards opaque binary blobs. No Trip or TripItem types are imported or referenced server-side, ever.
- **Port**: Configurable via env var (default `4000`), exposed in docker-compose
- **File structure**:
  ```
  sync/
    src/
      server.ts     # all logic in v1; auth.ts, permissions.ts slot in here later
    package.json
    tsconfig.json
    Dockerfile      # co-located with the code it builds
  docker/
    docker-compose.yml   # references ../sync as build context for the sync service
    Dockerfile           # existing frontend, untouched
    nginx.conf           # untouched
  ```
- **Separate repo path**: Because the server is fully data-agnostic, it is a strong candidate for extraction into its own repository once auth and multi-user support are added. At that point it becomes a reusable hosted service, not a reisenotiz component. The `sync/` directory structure above makes that extraction a clean cut with no shared code to untangle.

### Frontend Changes

**Automerge document model — per-trip structure**:

```
// Root doc (one per user, URL stored in localStorage)
RootDoc {
  tripIndex: Record<string, AutomergeUrl>  // tripId → trip doc URL
  userAirports: Record<string, Airport>
  userAccommodations: Record<string, AccommodationSiteRecord>
}

// Trip doc (one per trip, URL stored in RootDoc.tripIndex)
TripDoc {
  trip: Trip
  tripItems: Record<string, TripItem>
}
```

Each trip is a fully independent Automerge document. The root doc acts only as an index — it maps trip IDs to their doc URLs. This means a trip can later be shared with another user by sharing its `AutomergeUrl` directly, without exposing any other data.

**New dependencies**: `@automerge/automerge-repo`, `@automerge/automerge-repo-network-websocket`, `@automerge/automerge-repo-react-hooks`, `@automerge/automerge-repo-storage-indexeddb`

**RepoProvider**: A new context provider wraps the app root. It initialises a `Repo` with a `BrowserWebSocketClientAdapter` (pointing at the sync server URL from env/config) and an `IndexedDbStorageAdapter` for local persistence. Falls back gracefully if no sync URL is configured.

**Document bootstrap**: On first load, the app creates a new root doc and empty trip docs. If existing Zustand localStorage data is found, it is migrated: one trip doc is created per trip, and the root doc index is populated. Old localStorage keys are cleared after migration.

**Zustand removed entirely**: All three Zustand stores (`useTripsStore`, `useUserAirportsStore`, `useUserAccommodationsStore`) and the `persist` middleware are deleted. Automerge documents are the sole source of truth and reactive state container. No Zustand dependency remains for synced data.

**Store replacement** — custom hooks wrapping `useDocument()`:
- `src/store/trips-store.ts` — replaced with hooks over root doc + per-trip doc handles. `createTrip` creates a new `TripDoc` and registers its URL in the root doc index. `deleteTrip` removes the index entry (the doc itself becomes unreferenced). All CRUD methods keep the same public signature.
- `src/store/user-records/airports.ts` and `accommodations.ts` — replaced with hooks that mutate the root doc directly (airports/accommodations live in the root doc).
- `src/store/selectors.ts` — updated to read from the new hook shape; trip list from root doc index, individual trip data from each trip doc handle. Derived/filtered state (e.g. `useTimelineElements`) is implemented as `useMemo` over `useDocument()` output — same pattern as current memos over Zustand selectors.

**Sync URL configuration**: Read from `VITE_SYNC_SERVER_URL` environment variable. If absent, the app runs local-only with IndexedDB persistence.

**Document ID persistence**: The root doc's `AutomergeUrl` is stored in `localStorage` under a stable key. All trip doc URLs are discovered from the root doc index — no additional localStorage keys needed per trip.

**Conflict resolution**: Automerge CRDT handles concurrent edits automatically. Concurrent edits to different trip items are independent map key operations — no conflict. Concurrent edits to the same scalar field within a trip item use last-write-wins per field. No custom merge logic is needed.

### Schema / Type Compatibility

Existing TypeScript types (`Trip`, `TripItem`, subtypes) require no changes. Automerge documents are typed using the same interfaces. `ZonedInstant` is stored as a plain object `{ instant: string, zone: string }` — Automerge handles plain objects natively. UUID generation via `uuid v7` is unchanged.

---

## Testing Decisions

**What makes a good test**: Tests should verify observable behavior through the public API — document state after mutations, sync propagation between two in-memory repos, migration correctness — not internal Automerge implementation details or Zustand internals.

**Modules to test**:

1. **Migration utility** (`src/store/migrate-to-automerge.ts`) — unit tests verifying that existing localStorage Zustand state is correctly imported into an Automerge doc and old keys are cleaned up. Test input: mock localStorage with trips and items. Test output: verify doc state matches.

2. **Sync server** (`sync/src/server.ts`) — integration test spinning up the server in-process, connecting two `Repo` instances via WebSocket, making a change on one, and asserting the other receives the change. Uses `@automerge/automerge-repo`'s in-memory adapters for speed. Tests use generic documents (no Trip types) to verify the server remains data-agnostic.

3. **useTripsDoc / useTripDoc hooks** — tests using React Testing Library verifying that `createTrip` (creates a new doc and registers it in the root index), `updateTrip`, `deleteTrip` (removes from index), `createTripItem`, `updateTripItem`, `deleteTripItem` all produce correct document state. Use automerge-repo's in-memory storage adapter (no real WebSocket needed).

**Prior art**: Existing patterns in `src/stubs/` provide good sample data for seeding test documents.

---

## Out of Scope

- User authentication and multi-user access control
- Root doc URL recovery mechanism (if localStorage cleared, root doc URL is lost; server-side userId → rootDocUrl mapping will resolve this naturally at the auth phase — deferred intentionally)
- Shared trips between different users
- Conflict UI (e.g., showing a "conflict detected" dialog) — Automerge resolves automatically
- Server-side validation of document contents
- Sync history or version log visible to the user
- Migration of attachments (file data) — `Attachment.link` strings are synced, but actual file blobs are not
- Admin UI for the sync server
- Cloud-hosted / managed sync option

---

## Further Notes

- **Automerge version**: Use `@automerge/automerge-repo` v2.x (the `automerge-repo` umbrella, not the legacy `automerge` v1 API).
- **WASM bundle size**: `@automerge/automerge` includes a WASM binary (~800KB+ gzipped). For a PWA this is acceptable — Workbox caches the bundle after first load, subsequent app launches serve it from CacheStorage with no network round-trip. Comparable to mobile app installation overhead, paid once.
- **Custom StorageAdapter write batching**: The `save` interface is per-chunk. For high-frequency burst writes (e.g. large offline session syncing on reconnect), the adapter can debounce and flush pending writes in a single batched `INSERT ... ON CONFLICT` transaction. Not required on day 1 — implement if profiling shows DB write pressure.
- **IndexedDB on client**: Use `@automerge/automerge-repo-storage-indexeddb` instead of the `nodefs` adapter for browser-side persistence. This replaces localStorage and survives page reloads without depending on the sync server being online.
- **Graceful degradation**: If the WebSocket connection fails or the env var is unset, the app continues working with the local IndexedDB-backed document. Sync resumes automatically when the server becomes reachable.
- **Auth is a middleware insertion, not a redesign**: Adding authentication means inserting a token-validation middleware before the `NodeWSServerAdapter` handshake and a `permissions(userId, docId, role)` table behind a `/invite` endpoint. The document model, client code, and sync protocol are untouched.
- **Document sharing path**: Sharing a trip is native to the per-trip doc structure — share the trip's `AutomergeUrl`, the recipient adds it to their root doc index, the trip syncs. No server-side domain knowledge required, ever.
- **Dedicated repo trigger**: Extract `sync/` into its own repository when auth is implemented and the server is ready to serve as a hosted service for other projects. The clean boundary is already there — no shared types, no shared code.

---

## GitHub Issue Submission

This PRD should be submitted as a GitHub issue on `MrModest/reisenotiz` with:
- **Title**: `feat: offline-first sync via Automerge backend`
- **Labels**: `enhancement`, `backend`, `sync`
- **Body**: the content of this PRD from Problem Statement onward
