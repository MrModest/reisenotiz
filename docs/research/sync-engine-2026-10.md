# Research: A Server-Authoritative Sync Engine for Reisenotiz

> **Verified:** 2026-10-20 to 2026-10-21, against official docs, GitHub repos and issues, licence files, the npm registry and a hands-on PWA build. Versions are pinned inline. Anything not confirmed in a primary source is marked **unverified**. Open-issue details are in `powersync-issues-2026-10.md`.

---

## 1. Question and constraints

Should Reisenotiz replace Automerge with **PowerSync**, **Zero (Rocicorp)** or **ElectricSQL**, given a switch to a **thick, authoritative server**?

**Today.**
- Sync uses Automerge (`@automerge/automerge-repo` 2.5.x) behind a thin Hono sync server that stores opaque documents (`docs/adr/0002`, `0003`, `0004`).
- The data model (`apps/frontend/src/store/automerge/types.ts`) is document-shaped: `RootDoc { tripIndex, savedAirports, savedAccommodationSites }` and `TripDoc { trip, tripItems }`. Items refer to saved places by key (`docs/adr/0005`), and `Person` lives inside items.
- That shape exists because Automerge stores JSON documents.
- The server runs Better Auth (`better-auth` ^1.7.10) inside Hono, on SQLite by default with Postgres opt-in.

**Target.**
- The server owns the schema and is the source of truth.
- The client only needs to:
  - work offline;
  - keep a durable local write queue;
  - sync on reconnect, across devices;
  - leave cross-tab and WebSocket plumbing to the library.
- Field-level last-write-wins, or the server deciding, is enough; collaborative text CRDTs are not needed.
- Integrations (REST/OpenAPI, MCP for adding and removing trips) call the same server logic.
- Local reads and writes must feel as instant as an offline-only app.
- The setup must hold up for a commercial SaaS with thousands of users.

**Sharing.**
- The trip is the smallest shareable unit, shared **read-only or read-write**.
- Saved places and persons are never shared as live, editable records; sharing one gives the recipient a copy.

**Decisions taken during this research.**
- **PowerSync** is the engine.
- **Postgres** is both the source database and PowerSync's bucket storage.
- The data model becomes relational.
- Validation and integrity rules live in an application service layer in Hono; database constraints are the last line of defence.

---

## 2. Recommendation

**PowerSync on a single Postgres.** It is the only candidate with a built-in, persisted, auto-retried offline write queue and server-authoritative rollback. Its default conflict rule is per-field last-write-wins [P5][P7][P20].

- **Auth:** it verifies JWTs against a JWKS, which Better Auth's JWT plugin serves with configuration only [P10][B1].
- **Writes:** they land in a plain endpoint in our Hono server, so sync uploads, REST and MCP share one service layer.
- **Read rules:** Sync Streams express "my trips, plus trips shared with me, plus what their items link to" as SQL subqueries [P12].
- **Offline PWA:** verified hands-on, including a cold start with no network (section 7).

**Costs and risks:**
- Postgres becomes mandatory, so the SQLite-default deployment ends.
- Compose gains `postgres` and `powersync`.
- The service licence is FSL, which converts to Apache-2.0 after two years (section 6).
- Telemetry is on until opted out [P19].
- iOS reliability is the open risk: two open iOS issues (js#1081, js#1077) and an unexplained read stall (js#1114). See section 8.
- A real-iPhone spike should come before committing.

**Rejected:**
- **Zero** does not support offline writes [Z5][Z6].
- **ElectricSQL** syncs only the read path and leaves offline writes to a separate, partly pre-1.0 TanStack DB stack [E6][E7].

Both are covered in section 10.

**Impact on the repo:**
- Adopting PowerSync reverses ADR-0002 (Automerge), ADR-0003 (no domain knowledge on the server) and ADR-0004 (document per trip), and supersedes the storage side of ADR-0005.
- Existing Automerge data needs a one-off export into Postgres. No dual sync is needed.

---

## 3. How PowerSync works

**Architecture.**
- PowerSync replicates the source database, through Postgres logical replication, into per-user **buckets**.
- It streams those buckets into a SQLite database in the browser.
- Writes never go through PowerSync. They go through our backend: "PowerSync is designed this way so that you can apply your own backend business logic, validations and authorization to any mutations going to your source database." [P5]

**Bucket storage** is PowerSync's own derived data, not ours. "Each bucket stores the *recent history* of operations on each row". It is append-only and compacted, so a reconnecting client receives only what it missed, and "the source database is not queried directly during streaming". [P22] Being derived, it can be rebuilt: "Backups are not strictly required, since the data can be rebuilt by re-replicating from the source database." [P26]

**Storage versions.** Bucket storage has an on-disk format version.
- Version 4 is the default on MongoDB since Service 1.27.0. "Postgres bucket storage does not currently support version 4", so Postgres stays on version 2. [P4]
- Version 4 adds **incremental reprocessing**: deploying a Sync Streams change rebuilds only the streams that changed. It also adds **S3 object storage** for large bucket blocks. [P23]
- On version 2, every sync-rule deploy reprocesses all selected data in the background and then has every client download its data once more. [P23] At Reisenotiz's data sizes (kilobytes to megabytes per user) that is a cost per deploy, not a reason to run MongoDB.
- "Incremental reprocessing for Postgres and other source databases is planned", with no date. [P23]

**Self-hosting.**
- The service "can be self-hosted using Docker" as `journeyapps/powersync-service`, with no dashboard. [P1]
- It needs a source DB connection, a bucket storage database ("MongoDB and Postgres are supported"), client auth and a sync config. [P4]
- On Postgres 14+, source and storage can share one server: "Using the same database (with separate schemas) is supported but may lead to higher CPU usage." [P4]

Compose services: `app`, `sync` (Hono), `postgres`, `powersync`.

**Offline writes.**
- "Any mutations on the SQLite database … are immediately reflected in the SQLite database, and also automatically placed into an upload queue … The upload queue is a blocking FIFO queue." [P5]
- The queue is the `ps_crud` table in the same persisted SQLite file, so it survives reloads.
- "If processing mutations in the upload queue fails (e.g. because the user is offline), it is automatically retried." [P5]
- The server receives `PUT`, `PATCH` (changed columns only) and `DELETE` operations, and "you have full control over how to structure your backend application API". [P6]
- The endpoint "must be blocking/synchronous with underlying writes", and operations must be idempotent; a per-client incrementing op id is provided. [P6][P20]
- The default conflict rule is "per-field Last-Write-Wins", and "Deletes always win" is recommended. [P20]
- Rejections and rollback are covered in section 5.

**Database.**
- Postgres 11+ with `wal_level = logical` and `CREATE PUBLICATION powersync`. [P8]
- MongoDB, MySQL, SQL Server and Convex are also supported as sources; MySQL and SQL Server are beta and Convex is experimental. [P8][P9]
- There is no SQLite source.

**Auth.**
- `fetchCredentials()` on the client fetches a JWT from our backend, and the service verifies it against a JWKS.
- JWT requirements: a `kid` matching a key, an `aud` in `client_auth.audience`, a lifetime of at most 24h (60 min recommended), and "The user ID must be used as the `sub`". EdDSA with Ed25519 is accepted. [P10]
- The Better Auth JWT plugin defaults to EdDSA/Ed25519 with a `kid` header. It serves `/api/auth/jwks`, sets `sub` to the user id, expires tokens after 15 minutes and has a configurable `audience`. [B1]
- Wiring it up: point `client_auth.jwks_uri` at Hono's `/api/auth/jwks`, and fetch `/api/auth/token` in `fetchCredentials()`.

**Read rules (Sync Streams).**
- SQL-like queries in YAML, scoped with `auth.user_id()`. [P11]
- Relations use "`IN (SELECT ...)`", "Nested Subqueries … to traverse multiple levels of relationships", and `JOIN`/`INNER JOIN` with equality conditions that select columns from one table. [P12]
- Sharing is a documented pattern: "`list_id IN (SELECT id FROM lists WHERE owner_id = auth.user_id() OR id IN (SELECT list_id FROM list_shares WHERE shared_with = auth.user_id()))`". [P12]
- Section 4 maps this to trips.

**Server-side writes.** The service replicates the source DB and streams changes in real time [P13], so writes from REST or MCP reach clients with no extra code.

**Client.**
- **Storage:** wa-sqlite. The default `IDBBatchAtomicVFS` uses IndexedDB. `OPFSCoopSyncVFS` is "Recommended for applications requiring multi-tab support, especially on Safari/iOS". [P14]
- **Multi-tab:** "Multiple tab support relies on shared web workers", with one shared sync worker for all tabs. Where shared workers are unavailable (Android, iOS, Safari), it falls back to broadcast channels. [P14]
- **Responsiveness:** all reads and writes hit local SQLite inside a worker, so the network is never on the interaction path. Known exceptions are in section 8.
- **React:** `useQuery`, `useStatus` and `useSuspenseQuery`. [P15] `@powersync/react` 2.1.0 declares peer `react: "*"` (npm). Use a current release, because several `useQuery` bugs were fixed in September and October 2026 (section 8).
- **Queries:** the base API takes SQL strings (`useQuery('SELECT … FROM trips WHERE …')`). Typed alternatives:
  - `@powersync/kysely-driver` 2.0.2 (Apache-2.0).
  - `@powersync/drizzle-driver` 0.8.0, which says it is "currently in an Beta release" and is defined with Drizzle `sqlite-core` tables [P27]. The server would use `pg-core` tables, so client and server get the same query style but two table definitions.
  - `@tanstack/powersync-db-collection` 0.2.12, for TanStack DB on top (npm).
- **PWA:** verified in section 7.

**Maturity.**
- Service v1.27.0 shipped on 2026-10-06, roughly monthly. `@powersync/web` 2.5.0 and `@powersync/react` 2.1.0 shipped on 2026-10-19. [P2]
- Sync Rules are being replaced by Sync Streams, with a migration guide. [P16]
- Maintainers reply fast: a median first reply of about 0.5 h on powersync-js and about 4.5 h on powersync-service (`powersync-issues-2026-10.md`).

**Migrations.**
- "The client-side schema is just a view on top of the schemaless data. Updating this client-side schema is immediate … with no client-side migrations required." Removed columns read as `undefined`, and versioned streams serve old app versions. [P17]
- Deploy order: source schema, then backend, then Sync Streams, then the app. [P18]

**Code in `apps/sync`.**
- Better Auth with the `jwt()` plugin.
- Postgres migrations.
- A trip service layer, used by a batch `POST /api/upload` and by future REST and MCP routes.
- The PowerSync service owns the Sync Streams config and replication. Hono implements no WebSocket or cross-tab code.

---

## 4. Data model and sharing

**Relational model.** The model is normalised:
- `trips`, `trip_items`, `persons`, saved places (airports, accommodation sites), `trip_shares`, and link tables;
- foreign keys between them;
- client-generated UUID primary keys, which offline inserts need;
- IATA-keyed `savedAirports` moving to a UUID key, with IATA as a column.

Each row merges field by field, and relation-based access becomes a subquery.

**Integrity in the application layer.**
- Rules such as "an item must point to an existing trip" or "deleting a place clears its links" live in the trip service in Hono, which every write path calls: sync upload, REST and MCP.
- Postgres constraints back them up as a last line of defence.
- A shared schema module (for example zod) used by both frontend and server keeps client-side and server-side validation identical.

**Sharing.**
- `trip_shares (trip_id, user_id, role)`, with role `viewer` or `editor`.
- **Reads:** a user's trip stream is "trips I own, or trips in `trip_shares` for me" [P12]. Items, and the places and persons they link to, follow through subqueries, for example `id IN (SELECT place_id FROM trip_items WHERE trip_id IN (…))`.
- **Writes:** PowerSync has no write permissions of its own. The upload endpoint checks the role and rejects a viewer's writes, which then roll back on the client (section 5). The UI hides edit controls for viewers, so nothing appears and then vanishes.
- **Places and persons** belong to a user. A guest receives the owner's rows through the shared trip but cannot edit them. "Copy to my places" inserts a new row owned by the recipient.

**Open questions:**
- Can an editor link their own places into someone else's trip? The trip would then reference two users' places, and each user could edit only their own.
- Is "copy to my places" an offline-capable client insert, or a server-side action?
- Do `persons` belong to a user (reusable across trips) or to one trip? This decides who sees a person once a trip is shared.

---

## 5. Rejected writes and data safety

The client never drops a local write on its own. A write leaves the upload queue only when our `uploadData` code marks it complete, and our endpoint decides what that means [P7]:

| Endpoint outcome | Client behaviour |
| --- | --- |
| Network error, 5xx, or `uploadData` throws | "The change is kept in the queue" and retried. A persistent bug "has to be fixed before the changes from the client can be processed", so the queue stalls instead of losing data. [P7] |
| 2xx, write applied | Confirmed when the next checkpoint includes it. |
| 2xx, write rejected (validation or conflict) | "The client rolls back the change": once the queue is empty, local state is replaced by server state. [P7] |
| 2xx, but a bug skipped the write | The same as a rejection: a silent revert. This is the dangerous case, and it is a bug in our code. |

A 4xx response also blocks the queue, so validation failures return 2xx with details [P7]. Rejection is per row change, not per trip: a rejected item reverts only that item. A rejected parent is the exception, because every child that references it fails too.

**Realistic rejection scenarios:**
- **Client and server validation disagree**, for example after a release changes a rule. Mitigation: one shared schema module.
- **Cascading failures.** A rejected trip insert takes its items with it. An item linking a place that another device deleted fails too. Mitigation: the service layer never rejects a parent for fixable reasons, places are soft-deleted, and dangling links are cleared rather than rejected.
- **Permissions changed while offline.** A guest was cut to viewer, or the trip was unshared. Rejecting is correct, but the work should be kept.
- **Concurrent edits are not rejections.** Last-write-wins applies per field, so another device's later edit to the same field wins and other fields are kept.

For a single user editing their own trips, the only realistic rejections are bugs.

**Rules that keep offline work from vanishing:**
1. Never return 2xx for a write that wasn't committed or explicitly recorded as rejected.
2. Record every rejection in a `rejected_writes` table that syncs back to its user. PowerSync recommends writing "the details to a separate table" [P7]. The UI can then show the rejection and offer recovery.
3. Accept and normalise rather than reject wherever the data is still meaningful.
4. Return 5xx (kept in the queue) for anything unexpected, and alert on queue stalls, which show as a growing `ps_crud`.

---

## 6. Database choice, scaling and licence

**Postgres or MongoDB as the source.** PowerSync accepts MongoDB 6.0+ as a source, through change streams with post-images (`changeStreamPreAndPostImages`) [P8]. Integrity lives in the service layer either way, so foreign keys don't decide this. Postgres wins on:
- **Read rules.** Sync Streams are SQL with subqueries and joins, and every sharing example is relational [P12]. How they behave over nested MongoDB documents is not documented (**unverified**). Collections would have to stay flat to be safe.
- **One query model.** The client queries SQLite with SQL, Kysely or Drizzle. A Postgres server can use the same tools; a MongoDB server uses a different query model.
- **Operations.** Postgres needs only `wal_level = logical`. A MongoDB source needs a replica set (one node is enough) and post-images enabled on every synced collection [P8].
- **Licence.** Postgres is OSI open source; MongoDB is SSPL. Self-hosting is fine with both.

**Postgres or MongoDB as bucket storage.** PowerSync's history explains why coverage looks uneven. This reading of the docs is **unverified** against their release history:
- Postgres has been the primary source database, so every sharing example is relational.
- MongoDB has been the primary bucket storage. PowerSync Cloud runs on it, it gets storage version 4 first [P23], and the production deployment guide describes only MongoDB storage [P26].
- Postgres bucket storage serves self-hosters who don't want MongoDB, and maintainers call it less optimised (service#613).

**Decision: one Postgres for both roles.** Two database engines would double the cost and maintenance. MongoDB's advantages are all inside PowerSync's derived storage. Its open Postgres-storage bugs come from very large rows (service#840) and half-open connections (service#700). A replication watchdog covers the second, and trip data doesn't produce the first. Bucket storage is rebuildable, so moving it to MongoDB later is a redeploy and a re-replication, with no data migration.

**Scaling** [P26]:
- **Replication:** "Only one process can replicate at a time." Its load is "primarily driven by write load on the source database", which is small for trip edits.
- **API containers:** each has a hard limit of 200 concurrent connections, with a target of 100 or fewer: "add 1x PowerSync API container per 100 connections".
- **What sizes the deployment:** concurrent online devices, not registered users. Thousands of users likely means hundreds of concurrent connections, so a handful of 1 GB / 1 vCPU API containers.
- **Not stated:** any limit on buckets per user. With one bucket per trip, check this before a SaaS launch (**unverified**).
- **Managed option:** PowerSync Cloud, if running the service becomes a burden.

**Licence.**
- The service is **FSL-1.1-ALv2**. It forbids only a "Competing Use": a commercial product that "substitutes for the Software", substitutes for a PowerSync product, or "offers the same or substantially similar functionality". Everything else is a "Permitted Purpose". [P3]
- A trip-planning SaaS that uses PowerSync internally is permitted.
- Each release becomes Apache-2.0 "on the second anniversary" of its release. [P3]
- The JS SDK is Apache-2.0. [P2]

---

## 7. Verified: PowerSync in an offline PWA

**Environment.** Run on 2026-10-20 with:
- `@powersync/web` 2.5.0 and `@journeyapps/wa-sqlite` 2.0.8;
- Vite 8.3.4 and `vite-plugin-pwa` 1.3.0;
- headless Chromium 154 via `agent-browser` 0.27.

No sync server was connected, so every write stayed in the local upload queue.

**Setup.**
- The build used the official demo's Vite settings [P21]: `optimizeDeps.exclude: ['@powersync/web']`, `worker.format: 'es'`, and `generateSW` with `maximumFileSizeToCacheInBytes: 5 MiB`. The 5 MiB limit is there because "The SQLite WASM builds are over the 2 MiB default; the app needs them precached to work offline."
- No custom `globPatterns`.
- Each page load inserts one row into a synced table, then reports the row count, the `ps_crud` entry count and whether the service worker controls the page.

**Precache.** The plugin's default glob includes `.wasm`. The generated `sw.js` precached all 31 entries (7,977 KiB):
- four wasm builds: `wa-sqlite` (1.1 MB), `wa-sqlite-async` (2.3 MB), and `mc-*` variants of each (1.3 MB and 2.5 MB);
- the worker chunk;
- every VFS chunk. Each JS chunk appears twice, because the worker has its own module graph.

The `mc-*` builds are the SQLite3MultipleCiphers (encryption) variants. With `globIgnores: ['**/mc-*']`, the precache drops to 25 entries (4,047 KiB) and the results below are unchanged. The main app chunk is 118 kB (36 kB gzip).

**Results.** Step 3 was a full browser shutdown, then a relaunch with the network disabled before the first navigation, on the same persistent profile. The results were the same with and without the `mc-*` builds.

| Step | `IDBBatchAtomicVFS` | `OPFSCoopSyncVFS` |
| --- | --- | --- |
| 1. First visit, online | rows 1, queued 1 (no SW control yet) | rows 1, queued 1 |
| 2. Reload, online | rows 2, queued 2, SW controls | rows 2, queued 2, SW controls |
| 3. Browser restarted, **offline** cold start | rows 3, queued 3, SW controls | rows 3, queued 3, SW controls |

The shell, workers and wasm load from the precache. The local database reopens with its data, and new writes join the persisted queue while offline.

**Gotcha.** The `@powersync/web` 2.5.0 README shows `new WASQLiteOpenFactory({ dbFilename, vfs })`, but 2.5.0 expects `{ open: { … } }`. Passing the factory fails with "The provided `database` option is invalid." Plain options, `database: { dbFilename, vfs }`, work.

**Not covered:**
- Safari and iOS;
- the real upload path (`uploadData`);
- service-worker updates while writes are queued.

---

## 8. Known PowerSync issues

This is a summary of `powersync-issues-2026-10.md` (open issues as of 2026-10-20).

**Data loss.**
- No open report of a lost upload queue or lost local rows in the web SDK.
- The one data-destroying bug: `PRAGMA rekey` with the encryption build on OPFS leaves an unopenable file (js#1144). Avoided by not using encryption.
- Fixed in 2026: a checksum mismatch causing a full re-sync (js#954), and a queue that never drained because wa-sqlite and SDK versions were mismatched (js#1058). Web 2.1.0+ checks the schema version at init and ships wa-sqlite as a regular dependency.

**Responsiveness.**
- js#1114 (open): a deterministic ~30 s stall of all local reads after connect, on `IDBBatchAtomicVFS` with 6.4k rows. Maintainers called it unexpected and asked for traces.
- js#1130: writes in the visible tab are 2.3 to 2.7 times slower while another tab holds the shared worker's OPFS connection.
- js#785, js#808: OPFS multi-tab deadlock, and on iOS a lock that only clears when the browser is quit.

**iOS.**
- js#1081: the page process is killed every 30 to 60 s on iOS 26.2 once the wasm loads. One reporter, not yet reproduced.
- js#1077: sync stays wedged after a long iOS background. The workaround is `disconnect()` then `connect()` on foreground. No maintainer reply in two months.

**Postgres bucket storage.**
- Fixed quickly: service#718, #813 (in 1.27.0), #729 and #400.
- Open: service#840 (a large row stalls replication) and service#700 (replication stops silently while the health probe stays green).

**Rules if adopted:**
- Use the default IndexedDB VFS.
- Pin `@powersync/web`, `common`, `shared-internals` and `wa-sqlite` together, and use a current `@powersync/react`.
- Use service 1.27.0 or later.
- Don't use encryption.
- Avoid very large text columns.
- Run a replication watchdog.
- Before committing, run a real-iPhone spike: an installed PWA, about 6,000 rows, backgrounding and resuming. That covers js#1081, js#1077 and js#1114.

---

## 9. Open questions

- **Self-hosters.** Postgres becomes mandatory and Better Auth moves to it. Is that acceptable for self-hosters?
- **Sharing details.** Cross-user place links, how "copy to my places" works, and who owns `persons` (section 4).
- **Rejection UX.** A user-visible `rejected_writes` surface needs design (section 5).
- **iOS.** The real-device spike (section 8). Storage eviction for PWAs that aren't installed also applies.
- **Buckets per user** at SaaS scale (section 6).
- **Migration.** A one-off export from Automerge documents to relational rows.

---

## 10. Alternatives considered

**Zero (Rocicorp): rejected, no offline writes.**
- "Zero does not support offline writes. When the client is in the `disconnected`, `error`, or `needs-auth` states, reads from synced data continue to work, but writes are rejected."
- A tab hidden for `hiddenTabDisconnectDelay` (default 5 minutes) disconnects. [Z5]
- Its own guidance lists "You need to support offline writes or long periods offline" under "Zero Might Not be a Good Fit", and adds "Zero is not local-first." [Z6]
- In its favour: Apache-2.0 [Z1], GA since 2026-03-24 [Z2][Z14], TypeScript read rules resolved on the server [Z10], cookie auth that fits Better Auth [Z8], and REST generated from mutators [Z12].
- It requires Postgres 15+ [Z4].
- None of that offsets the core requirement for a trip planner used on the road.

**ElectricSQL (+ TanStack DB): rejected, too much assembly.**
- "Electric does not do write-path sync." [E6] Offline writes come from TanStack DB `@tanstack/offline-transactions` 1.1.3, an IndexedDB outbox where "Non-leader tabs: Online-only mode for safety". [E7]
- Local persistence of synced rows needs `@tanstack/browser-db-sqlite-persistence` (0.2.36, pre-1.0). [E10]
- "Shapes are currently single table", so trips, items and places each need their own shape, proxied through Hono with an access filter. [E9]
- In its favour: Apache-2.0 / MIT licences [E1][E3], GA since 2025-03-17 [E11], and Postgres 14+ [E5].
- The company's 2026 positioning leads with "multi-agent systems" [E12].
- More of the plumbing the brief wants to avoid would end up in our code.

**Others, briefly** (none beats PowerSync on the requirements):
- **Triplit:** AGPL-3.0, and inactive since mid-2025 (last release 2025-07-31).
- **InstantDB:** primarily hosted. Self-hosting and the offline write queue are **unverified**.
- **LiveStore:** v0.5.0, event-sourced with client-side state as the source of truth, which runs against an authoritative server.
- **TinyBase:** a client store with its own sync and no authoritative relational server.
- **Replicache:** its GitHub repo is archived.

---

## Sources

**PowerSync**
- [P1] Self-Hosting: https://docs.powersync.com/intro/self-hosting
- [P2] GitHub releases: https://github.com/powersync-ja/powersync-service/releases (v1.27.0, 2026-10-06); https://github.com/powersync-ja/powersync-js (Apache-2.0; `@powersync/web` 2.5.0, 2026-10-19)
- [P3] Service licence (FSL-1.1-ALv2): https://github.com/powersync-ja/powersync-service/blob/main/LICENSE
- [P4] Self-Hosted Instance Configuration (storage, storage versions, PG versions): https://docs.powersync.com/configuration/powersync-service/self-hosted-instances
- [P5] Client Architecture (upload queue, `ps_crud`): https://docs.powersync.com/architecture/client-architecture
- [P6] Writing Client Changes: https://docs.powersync.com/handling-writes/writing-client-changes
- [P7] Handling Write / Validation Errors: https://docs.powersync.com/handling-writes/handling-write-validation-errors
- [P8] Source Database Setup (Postgres `wal_level` and publication; MongoDB 6.0+, post-images): https://docs.powersync.com/configuration/source-db/setup
- [P9] Docs index (supported sources): https://docs.powersync.com/llms.txt
- [P10] Custom Authentication (JWT/JWKS requirements): https://docs.powersync.com/configuration/auth/custom
- [P11] Sync Streams overview: https://docs.powersync.com/sync/streams/overview
- [P12] Sync Streams queries (subqueries, joins, sharing): https://docs.powersync.com/sync/streams/queries
- [P13] Replication into buckets: https://docs.powersync.com/sync/streams/overview#replication-from-the-source-database
- [P14] JavaScript Web SDK (VFS, multi-tab): https://docs.powersync.com/client-sdks/reference/javascript-web
- [P15] React hooks: https://docs.powersync.com/client-sdks/frameworks/react
- [P16] Migrate to Sync Streams: https://docs.powersync.com/sync/rules/migrate-to-sync-streams
- [P17] Implementing Schema Changes: https://docs.powersync.com/maintenance-ops/implementing-schema-changes
- [P18] Deploying Schema Changes: https://docs.powersync.com/maintenance-ops/deploying-schema-changes
- [P19] Usage Reporting: https://docs.powersync.com/maintenance-ops/self-hosting/usage-reporting
- [P20] Handling Update Conflicts: https://docs.powersync.com/handling-writes/handling-update-conflicts
- [P21] React demo Vite config (PWA): https://github.com/powersync-ja/powersync-js/blob/main/demos/react-supabase-todolist/vite.config.mts
- [P22] PowerSync Service architecture (buckets, operation history): https://docs.powersync.com/architecture/powersync-service
- [P23] Storage version 4: https://docs.powersync.com/sync/advanced/storage-version-4
- [P26] Self-hosting deployment architecture: https://docs.powersync.com/maintenance-ops/self-hosting/deployment-architecture
- [P27] Drizzle driver README (beta): https://github.com/powersync-ja/powersync-js/tree/main/packages/drizzle-driver

**Zero**
- [Z1] Open Source: https://zero.rocicorp.dev/docs/open-source
- [Z2] npm `@rocicorp/zero` (Apache-2.0; 1.0.0 on 2026-03-24, 1.11.1 on 2026-10-19): https://www.npmjs.com/package/@rocicorp/zero
- [Z4] Provider Support (Postgres 15+): https://zero.rocicorp.dev/docs/connecting-to-postgres
- [Z5] Connection Status / Offline: https://zero.rocicorp.dev/docs/offline
- [Z6] When To Use: https://zero.rocicorp.dev/docs/when-to-use
- [Z8] Authentication: https://zero.rocicorp.dev/docs/auth
- [Z10] Reading Data (queries, context): https://zero.rocicorp.dev/docs/queries
- [Z12] REST APIs: https://zero.rocicorp.dev/docs/rest
- [Z14] Project Status: https://zero.rocicorp.dev/docs/status

**Electric / TanStack DB**
- [E1] Repo (Apache-2.0, releases): https://github.com/electric-sql/electric
- [E3] TanStack DB (MIT): https://github.com/TanStack/db
- [E5] Installation / Postgres requirements: https://electric.ax/docs/sync/guides/installation
- [E6] Writes guide: https://electric.ax/docs/sync/guides/writes
- [E7] `@tanstack/offline-transactions` README: https://github.com/TanStack/db/tree/main/packages/offline-transactions
- [E9] Shapes guide: https://electric.ax/docs/sync/guides/shapes
- [E10] TanStack DB SQLite persistence guide: https://github.com/TanStack/db/blob/main/docs/guides/sqlite-persistence.md
- [E11] Electric 1.0 released (2025-03-17): https://electric.ax/blog/2025/03/17/electricsql-1.0-released
- [E12] Electric docs index / positioning: https://electric.ax/llms.txt

**Better Auth**
- [B1] JWT plugin (EdDSA/Ed25519 default, `/jwks`, issuer/audience/expiry): https://www.better-auth.com/docs/plugins/jwt
