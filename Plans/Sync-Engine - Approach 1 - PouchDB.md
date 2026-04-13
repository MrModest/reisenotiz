# PRD: Offline-First Sync via CouchDB + PouchDB

## Context

Reisenotiz is currently a client-side-only React PWA. All trip data (trips, trip items, user airports, user accommodations) lives exclusively in browser `localStorage` via Zustand. This means data is siloed per browser — a user planning a trip on desktop cannot see their changes on mobile, and any data entered on one device is invisible on others.

This PRD introduces an offline-first sync capability. The smallest viable change that satisfies multi-device use while preserving the existing TypeScript data model and Zustand store API is: replace `localStorage` persistence with **PouchDB** (IndexedDB-backed) on the client, and add a **CouchDB** service to the Docker Compose stack. PouchDB's native CouchDB replication protocol handles conflict resolution and offline queuing automatically.

Data loss from existing `localStorage` data is acceptable — this feature targets new and future data only.

---

## Problem Statement

A user planning a trip across two devices (e.g., desktop at home and mobile on the go) cannot keep their itinerary in sync. Any trip item added on the mobile device is invisible on the desktop unless manually re-entered. If the mobile device goes offline while traveling, there is no mechanism to defer writes and propagate them later.

## Solution

Add CouchDB as a lightweight backend sync service (Docker Compose container). On the frontend, replace Zustand's `localStorage` persistence with PouchDB (IndexedDB). PouchDB's built-in CouchDB replication handles:
- **Offline writes**: changes made offline are queued in IndexedDB and pushed to CouchDB upon reconnection.
- **Multi-client pull**: all connected clients poll CouchDB for changes on a configurable interval and can trigger a manual pull at any time.
- **Conflict resolution**: last-write-wins (CouchDB's `_rev` mechanism) at the trip-item level.

The Zustand store's public API (methods, selectors, TypeScript types) remains unchanged. The only frontend storage change is swapping `createJSONStorage(() => localStorage)` for a PouchDB-backed adapter.

---

## User Stories

1. As a traveler, I want my trip data to be stored in a persistent backend, so that it is not lost if I clear my browser storage.
2. As a traveler, I want to add a trip item on my mobile device while online, so that it immediately syncs to the backend.
3. As a traveler, I want to add a trip item on my mobile device while offline, so that it is queued and synced automatically once I reconnect.
4. As a traveler, I want my desktop browser to receive updates from other devices, so that I always see an up-to-date itinerary without manual re-entry.
5. As a traveler, I want to trigger a manual sync from the UI, so that I do not have to wait for the next polling interval when I need the latest data immediately.
6. As a traveler, I want the app to remain fully functional while offline, so that I can view and edit my itinerary without internet access.
7. As a traveler, I want to see the current sync status in the UI (synced, syncing, offline, error), so that I know whether my changes have been persisted to the backend.
8. As a traveler, I want the polling interval to be configurable without rebuilding the app, so that I can tune it to my network and battery constraints.
9. As a traveler, I want my custom airport records to sync across devices, so that airports I have saved on one device are available on another.
10. As a traveler, I want my custom accommodation records to sync across devices, so that accommodation sites I have configured are shared.
11. As a traveler, I want trip deletions to propagate to other devices, so that a trip removed on mobile disappears on desktop as well.
12. As a traveler, I want trip item deletions to propagate, so that removing a flight or accommodation on one device removes it everywhere.
13. As a traveler, I want last-write-wins conflict resolution, so that if I edit the same trip item on two devices, the most recent save wins without any error.
14. As a developer, I want the CouchDB service configured via environment variables, so that I can deploy to different environments without code changes.
15. As a developer, I want the CouchDB URL on the client to be set via a Vite environment variable (`VITE_COUCHDB_URL`), so that different deployments point to different backends.
16. As a developer, I want the sync polling interval to be set via a Vite environment variable (`VITE_SYNC_INTERVAL_MS`), so that it can be tuned per environment.
17. As a developer, I want the architecture to be extensible for future multi-user support, so that adding per-user authentication does not require a full rewrite.
18. As a developer, I want each entity type in its own CouchDB database, so that access control and replication can be scoped per collection in the future.

---

## Implementation Decisions

### Modules to build or modify

**1. CouchDB Docker service** (`docker/docker-compose.yml`)
- Add a `couchdb` service using the official `couchdb` Docker image.
- Configure admin credentials via environment variables (`COUCHDB_USER`, `COUCHDB_PASSWORD`).
- Add a startup init script (or use CouchDB's `COUCHDB_SECRET` + `_users` DB auto-init) to create the four required databases on first launch: `reisenotiz-trips`, `reisenotiz-trip-items`, `reisenotiz-user-airports`, `reisenotiz-user-accommodations`.
- Expose CouchDB on a configurable port (default `5984`).
- Persist CouchDB data via a named Docker volume.

**2. PouchDB persistence service** (`src/services/persistence/`)
- Create one PouchDB database instance per collection (`databases.ts`), mirroring the four data domains.
- Map each entity's existing `id` field to CouchDB's `_id` field; preserve all other fields. `_id`/`_rev` are internal to this service — nothing outside it sees them.
- Expose typed async CRUD functions (e.g. `saveTrip`, `deleteTrip`, `getAllTrips`) that write to local IndexedDB via PouchDB and return plain typed entities.
- On app startup, each Zustand store calls the relevant `getAll*` function to hydrate its initial state from IndexedDB.

**3. Modified Zustand stores** (`src/store/`)
- Remove `persist` middleware with `localStorage` from all three stores (`useTripsStore`, `useUserAirportsStore`, `useUserAccommodationsStore`).
- CRUD mutations must write to both in-memory Zustand state and the PouchDB persistence adapter (2) in tandem.
- Subscribe to PouchDB's `changes()` feed per database; apply incoming remote changes to Zustand state (merge/replace at entity level, LWW by CouchDB `_rev`).
- The external store API (method signatures, selector hooks) remains identical.

**4. Sync service** (`src/services/sync/`)
- Manages PouchDB ↔ CouchDB live/one-shot replication per database.
- Reads `VITE_COUCHDB_URL` and `VITE_SYNC_INTERVAL_MS` from environment.
- Exposes a `SyncStatus` type: `idle | syncing | synced | offline | error`.
- Provides `startSync()`, `stopSync()`, and `triggerManualSync()` functions.
- Uses PouchDB's `sync()` API in `live: false` mode on a timer (interval from env var) for polling; `triggerManualSync()` fires an immediate one-shot replication.
- Detects network offline/online events (`window.addEventListener('online'/'offline')`) to pause/resume sync automatically.
- Exposes sync status as a reactive signal (Zustand store or context) for UI consumption.

**5. Sync status UI component** (`src/components/sync-status/`)
- Displays current `SyncStatus` with an appropriate icon/indicator.
- Includes a "Sync now" button that calls `triggerManualSync()`.
- Integrated into the existing `AppLayout` header or toolbar area.

### Key technical decisions

- **One PouchDB DB per collection** (not one shared DB): enables future per-collection access control and replication filtering.
- **PouchDB in `live: false` + interval polling** (not `live: true` with WebSockets): matches the user's chosen push model (periodic polling) and avoids a persistent WebSocket connection to CouchDB.
- **Conflict strategy**: CouchDB's built-in `_rev` provides LWW when the client always pushes with the latest known `_rev`. No custom CRDT logic needed.
- **No auth in scope**: CouchDB runs with admin credentials configured in the Docker Compose env; the client connects without per-user credentials. The PouchDB adapter is structured with an injectable auth header for future extension.
- **No data migration**: existing `localStorage` data is not migrated. Stores initialize from PouchDB (empty on first run).
- **TypeScript types unchanged**: Trip, TripItem, Accommodation, Flight, LongTransfer, Airport, AccommodationSite types stay as-is. PouchDB documents extend these with `_id` and `_rev` at the persistence layer only; the application layer never sees these fields.

---

## Testing Decisions

**What makes a good test here**: test observable behavior (data appears on another "client", sync status transitions correctly, offline edits propagate on reconnect) — not internal implementation details like which PouchDB method was called.

**Modules to test**:

- **PouchDB persistence adapter**: unit tests using PouchDB's in-memory adapter (`pouchdb-adapter-memory`). Verify CRUD operations round-trip correctly and that entity shape is preserved.
- **Zustand stores (with PouchDB adapter)**: integration tests with an in-memory PouchDB. Verify that calling `createTripItem()` persists to PouchDB, and that an incoming PouchDB change event updates the Zustand store.
- **Sync service**: integration test with two in-memory PouchDB instances replicated against each other (no CouchDB needed). Verify that a write on "client A" appears in "client B" after `triggerManualSync()`.

**Prior art**: no existing test files were found in the repo. These would be the first tests; use Vitest (already in the Vite ecosystem) with `pouchdb-adapter-memory` for in-process testing.

---

## Out of Scope

- User authentication and per-user data isolation (planned for a future release).
- Data migration from existing `localStorage` to PouchDB/CouchDB.
- Real-time push (WebSocket / SSE); the chosen model is periodic polling + manual trigger.
- CouchDB admin UI / Fauxton exposure in the Docker Compose setup.
- Attachment syncing (the `Attachment` type's `link` field stores URLs, not binary blobs — no binary sync needed).
- CouchDB backup / disaster recovery procedures.
- Conflict resolution UI (showing conflicts to the user) — LWW is sufficient.

---

## Further Notes

- PouchDB should be added as a frontend dependency: `pouchdb` + `pouchdb-adapter-idb` (for IndexedDB in the browser). Type definitions via `@types/pouchdb`.
- The CouchDB init script should use CouchDB's `/_cluster_setup` or `PUT /<db>` REST calls to create databases idempotently, so repeated container restarts do not error.
- Consider setting CouchDB CORS headers in the Docker config to allow the Vite dev server origin (`localhost:5173`) to connect directly from the browser.
- The `VITE_COUCHDB_URL` should include credentials for now (e.g., `http://admin:password@localhost:5984`) since there is no auth layer. This should be treated as a secret and excluded from version control.
- Future multi-user support would introduce a CouchDB proxy (e.g., a small Node/Bun API) that validates JWT tokens before forwarding to CouchDB — the frontend sync service only needs its base URL changed.
