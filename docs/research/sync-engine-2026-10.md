# Research: PowerSync vs Zero vs ElectricSQL as a Server-Authoritative Sync Engine

> **Verified:** 2026-10-20, against official docs, GitHub repos, licence files and the npm registry. Versions are pinned inline. Anything not confirmed in a primary source is marked **unverified**.

---

## 1. Question and constraints

Should Reisenotiz replace Automerge with **PowerSync**, **Zero (Rocicorp)** or **ElectricSQL**, given a switch to a **thick, authoritative server**?

Today the app uses Automerge (`@automerge/automerge-repo` 2.5.x), and a thin Hono sync server stores opaque documents (`docs/adr/0002`, `0003`, `0004`). The data model lives in `apps/frontend/src/store/automerge/types.ts`: `RootDoc { tripIndex, savedAirports, savedAccommodationSites }` and `TripDoc { trip, tripItems }`. Trip items refer to saved places by key (`docs/adr/0005`), and `Person` lives inside trip items. The server runs Better Auth (`better-auth` ^1.7.10) inside Hono, on SQLite by default with Postgres opt-in (`apps/sync/package.json`, `docker-compose.yml`).

The target is a server that owns the schema and is the source of truth. The client must work offline, keep a durable local write queue, and sync on reconnect. It must handle multiple devices, and the library must own cross-tab and WebSocket plumbing. Field-level last-write-wins, or the server deciding, is enough; collaborative text CRDTs are not needed.

Trip sharing is a planned feature. The trip is the smallest shareable unit, shared with another user as **read-only or read-write**. Saved places and persons are never shared as live, editable records; sharing one hands the recipient a copy.

---

## 2. Summary table

| # | Requirement | PowerSync | Zero | ElectricSQL (+ TanStack DB) |
|---|---|---|---|---|
| 1 | Fully self-hostable; licences | Yes. Service is **FSL-1.1-ALv2**: each version becomes Apache-2.0 two years after release, and "Competing Use" is barred until then. Client SDKs are Apache-2.0. Self-hosting needs no cloud. [P1][P2][P3] | Yes. Client and `zero-cache` are **Apache-2.0**. [Z1][Z2] | Yes. Sync service is **Apache-2.0** and TanStack DB is **MIT**. Docs push Electric Cloud, but it is optional. [E1][E2][E3] |
| 1 | Containers on top of `app` + `sync` | `powersync` (journeyapps/powersync-service), **Postgres** as source, and bucket storage (**MongoDB or Postgres**; with PG 14+ it can share the source server) [P1][P4] | `zero-cache` (rocicorp/zero, single-node) and **Postgres 15+** [Z3][Z4] | `electric` (electricsql/electric, Elixir) and **Postgres 14+** [E4][E5] |
| 2 | Durable offline write queue | **Yes, built in.** Every local write lands in the `ps_crud` upload queue, a FIFO table in the client SQLite DB that is retried automatically. [P5] | **No.** "Zero does not support offline writes." Writes queue only while `connecting`, and once `disconnected` they are rejected. [Z5][Z6] | **Not in Electric.** "Electric does not do write-path sync." Use TanStack DB `@tanstack/offline-transactions`, an IndexedDB outbox where only the leader tab persists. [E6][E7] |
| 2 | How the server applies writes; rejection | Your endpoint receives PUT/PATCH/DELETE ops from `uploadData()`. A rejected change is rolled back on the client at the next checkpoint. Return 2xx on validation failure, because 4xx blocks the queue. [P6][P7] | Your `/mutate` endpoint runs `handleMutateRequest` with server-side mutators in one transaction. A mutator that throws is skipped and the client reverts it. [Z7] | Your own API endpoint. Retry, rollback and `NonRetriableError` handling are up to you in TanStack DB. [E6][E7] |
| 3 | Server DB | **Postgres** (11+), or MongoDB, MySQL, SQL Server or Convex. Postgres needs `wal_level=logical` and a publication named `powersync`. **No SQLite.** [P8][P9] | **Postgres 15+ only**, with `wal_level=logical` and a direct connection (no pgbouncer). **No SQLite** upstream; zero-cache keeps its own SQLite replica. [Z4][Z3] | **Postgres 14+ only**, with logical replication, the `REPLICATION` role and a direct connection. **No SQLite.** [E5] |
| 4 | Auth expected | JWT signed with a key from a **JWKS** (URI or inline). `kid` and `sub` are required, `aud` must match the config, and lifetime is at most 24h. EdDSA/Ed25519 is accepted. [P10] | Your query and mutate endpoints authenticate the request: zero-cache forwards cookies, or an opaque `Authorization: Bearer` token. zero-cache's own JWK/JWKS flags are listed as **deprecated**. [Z8][Z9] | Electric itself has no user auth. Shape requests go through your **proxy**, which sets `where` server-side, or a gatekeeper issues shape-scoped tokens. [E8] |
| 4 | Fit with Better Auth in Hono | **Direct.** The Better Auth JWT plugin's defaults (EdDSA/Ed25519, `kid`, `sub` = user id, 15 min expiry, `/api/auth/jwks`) meet PowerSync's JWT requirements. [B1][P10] | **Direct.** Better Auth's session cookie reaches your `/query` and `/mutate` routes in Hono, and `auth.api.getSession` validates it. [Z8] | **Direct.** The Hono proxy route checks the Better Auth session, then forwards to Electric. [E8] |
| 5 | Read rules / relation-based access | **Sync Streams** (YAML, SQL-like). Supports `auth.user_id()`, nested `IN (SELECT …)` subqueries, and INNER JOINs with equality conditions that select columns from one table. Sharing is a documented pattern. [P11][P12] | **Server-resolved named queries** in TypeScript (ZQL with `related` / `whereExists`). The server injects `context.userID`, and the old RLS permissions are under "Old Stuff". [Z10][Z11] | **Shapes are single-table.** `where` supports `IN (SELECT …)` subqueries with incremental move-in and move-out. Related data needs several shapes. [E9] |
| 6 | Server-side writes (REST/MCP) reach clients | Yes, through logical replication of the source DB. [P13] | Yes, through logical replication. Zero documents exposing mutators as REST/OpenAPI. [Z3][Z12] | Yes, through logical replication. [E4] |
| 7 | Client: React / storage / multi-tab | `@powersync/react` 2.1.0 (peer `react: *`). wa-sqlite on IndexedDB (default) or OPFS. Multi-tab through a SharedWorker; Safari/iOS needs `OPFSCoopSyncVFS`. [P14][P15] | React `ZeroProvider`/`useQuery`. IndexedDB store. Tabs of one user share a "client group". [Z5][Z8][Z13] | `@tanstack/react-db` 0.5.11 (peer `react >=18`). Optional persistence via `@tanstack/browser-db-sqlite-persistence` 0.2.36 (OPFS wa-sqlite). Multi-tab is leader-elected, and non-leaders are online-only. [E7][E10] |
| 8 | Maturity (Oct 2026) | Service v1.27.0 (2026-10-06), `@powersync/web` 2.5.0 (2026-10-19). Releases monthly or faster. Sync Rules are being replaced by Sync Streams. [P2][P16] | 1.0 GA on 2026-03-24, now 1.11.1 (2026-10-19). Releases weekly to monthly. Status: "generally available and fully-supported". [Z14][Z15] | Sync service 1.0 GA on 2025-03-17, now `@core/sync-service` 1.8.1 (2026-09-07). The company now leads with "multi-agent systems". TanStack DB is still **0.x**. [E11][E12][E3] |
| 9 | Schema migrations | The client schema is a view over schemaless JSON, so the client needs no migrations. Server changes follow documented additive and rename procedures, and versioned streams serve old clients. [P17][P18] | Expand/contract ordering. Old clients get `SchemaVersionNotSupported`, and `onUpdateNeeded` reloads by default. [Z16] | Shapes are immutable, and a schema change on a shape's table forces a resync (**unverified detail**). The TanStack persistence layer uses `schemaVersion`. [E9][E10] |
| 10 | What lives in `apps/sync` (Hono) | Better Auth with the JWT plugin and JWKS, the upload/write endpoint, REST/MCP, and DB migrations. Sync Streams YAML belongs to the PowerSync service. | Better Auth, `/query` and `/mutate` (`handleQueryRequest` / `handleMutateRequest`), shared TS schema, queries and mutators, and REST/MCP. | Better Auth, a shape proxy that injects `where`, write endpoints, REST/MCP, and DB migrations. |

---

## 3. PowerSync

**What it is.** PowerSync replicates a server database into per-user buckets and streams them into client-side SQLite. Writes go through the developer's own backend: "PowerSync is designed this way so that you can apply your own backend business logic, validations and authorization to any mutations going to your source database." [P5]

**1. Self-hosting and licence.** The service "can be self-hosted using Docker. It is published to Docker Hub as journeyapps/powersync-service." Self-hosting has no dashboard. [P1] A self-hosted instance needs a source DB connection, "A bucket storage database … MongoDB and Postgres are supported", client auth and a sync config. [P4] For Postgres bucket storage, source and storage can share one server on PG 14+: "Using the same database (with separate schemas) is supported but may lead to higher CPU usage." [P4]

Bucket storage is PowerSync's own derived data: "Each bucket stores the *recent history* of operations on each row", append-only and compacted, so reconnecting clients receive only what they missed; "the source database is not queried directly during streaming". [P22] Its on-disk format has a storage version. Version 4 is the default on MongoDB since Service 1.27.0, while Postgres bucket storage stays on version 2: "Postgres bucket storage does not currently support version 4." [P4] Version 4 adds two things. **Incremental reprocessing**: deploying a Sync Streams change rebuilds only the streams that changed, instead of everything. **S3 object storage**: large blocks of bucket data move to S3. [P23] On Postgres (version 2), every sync-rule deploy reprocesses all selected data in the background and then has every client download its data once more. [P23] At Reisenotiz's scale (a few users, kilobytes to megabytes each) that costs seconds, not a reason to run MongoDB. "Incremental reprocessing for Postgres and other source databases is planned", with no date. [P23]

The service licence is **FSL-1.1-ALv2**. Use is permitted for any purpose "other than a Competing Use", and the licence grants Apache-2.0 "effective on the second anniversary of the date we make the Software available." [P3] Hosting it for your own app is a permitted use. The JS SDK (`powersync-ja/powersync-js`) is Apache-2.0. [P2] An Enterprise Self-Hosted Edition exists, but nothing requires it. [P1] Self-hosted instances report anonymous usage metrics through OpenTelemetry "unless you opt-out". [P19]

Resulting compose services: `app`, `sync` (Hono), `postgres`, `powersync`, and `mongo` only if MongoDB storage is chosen.

**2. Offline writes.** "Any mutations on the SQLite database … are immediately reflected in the SQLite database, and also automatically placed into an upload queue … The upload queue is a blocking FIFO queue." The queue is the `ps_crud` table, so it lives in the same persisted SQLite file and survives reloads. "If processing mutations in the upload queue fails (e.g. because the user is offline), it is automatically retried." [P5]

The server receives `PUT`, `PATCH` (changed columns only) and `DELETE` operations, and "you have full control over how to structure your backend application API". The endpoint "must be blocking/synchronous with underlying writes", and operations must be idempotent; a per-client incrementing op id is provided. [P6][P20]

Rejection works like this: "Change acknowledged but rejected (e.g. validation error). The client rolls back the change." There is no explicit rollback call. The client reverts to server state once the queue drains, and a 4xx response would block the queue, so validation errors should return 2xx. [P7] The default conflict behaviour is "per-field Last-Write-Wins", with "Deletes always win" recommended. [P20] This matches the stated requirement exactly.

**3. Database.** Postgres 11+ needs `wal_level = logical` and `CREATE PUBLICATION powersync`. Other supported sources are MongoDB, MySQL, SQL Server and Convex. [P8][P9] **No SQLite source**, so the SQLite default in `docker-compose.yml` would have to go.

**4. Auth.** `fetchCredentials()` on the client fetches a JWT from your backend, and the service verifies it against a JWKS. The JWT needs a `kid` matching a key, an `aud` in `client_auth.audience`, a lifetime of at most 24h (60 min recommended), and "The user ID must be used as the `sub`". EdDSA with Ed25519 is accepted. [P10] The Better Auth JWT plugin defaults to "EdDSA with the Ed25519 curve" and puts a `kid` in the header. Its JWKS is served at `/api/auth/jwks`, `sub` is the user id, expiry is 15 minutes, and `audience` is configurable. [B1] The pieces fit with configuration only: point `client_auth.jwks_uri` at Hono's `/api/auth/jwks` and fetch `/api/auth/token` in `fetchCredentials()`.

**5. Permissions.** Sync Streams are SQL-like queries in YAML. For example, "`SELECT * FROM lists WHERE owner_id = auth.user_id()` creates one bucket per user". [P11] Relations are covered by "`IN (SELECT ...)`", "Nested Subqueries … to traverse multiple levels of relationships", and `JOIN`/`INNER JOIN` with equality conditions that select columns from a single table. [P12] The sharing pattern is documented: "`list_id IN (SELECT id FROM lists WHERE owner_id = auth.user_id() OR id IN (SELECT list_id FROM list_shares WHERE shared_with = auth.user_id()))`". [P12] That maps directly to trips, `trip_shares` and `trip_items`. Saved places used by a shared trip could be synced with `id IN (SELECT place_id FROM trip_items WHERE trip_id IN (…))`. Write authorisation is enforced in our endpoint.

**6. Server-side writes.** The service replicates the source DB into buckets and streams changes in real time [P13], so writes from REST or MCP in Hono reach clients without extra code.

**7. Client.**
- **Storage:** wa-sqlite with several VFS options. The default `IDBBatchAtomicVFS` uses IndexedDB. `OPFSCoopSyncVFS` is "Recommended for applications requiring multi-tab support, especially on Safari/iOS". [P14]
- **Multi-tab:** "Multiple tab support relies on shared web workers", and a single shared sync worker serves all tabs. On Android, iOS and Safari, where shared workers are disabled by default, the SDK falls back to broadcast channels. [P14]
- **React:** hooks `useQuery`, `useStatus` and `useSuspenseQuery`. [P15] `@powersync/react` 2.1.0 declares peer `react: "*"`, so React 19 is accepted (npm registry).
- **PWA:** docs mention "offline-first PWAs". [P14] The official React demo uses `vite-plugin-pwa` with `optimizeDeps.exclude: ['@powersync/web']`, `worker.format: 'es'` and `maximumFileSizeToCacheInBytes: 5 MiB`, because "The SQLite WASM builds are over the 2 MiB default; the app needs them precached to work offline." [P21] Verified in a throwaway build (see section 9): the default `generateSW` precache picks up every wasm and worker chunk, and the app cold-starts offline with data and queued writes intact.
- **Bundle size:** no official figure. Measured in section 9: a 118 kB main chunk (36 kB gzip), and about 4 MB of precache without the encryption builds.
- **TanStack DB:** `@tanstack/powersync-db-collection` exists if TanStack DB is wanted on top (npm).

**8. Maturity.** Service v1.27.0 shipped on 2026-10-06, with tags from v1.23.1 on 2026-06-25 to v1.27.0 roughly monthly. `@powersync/web` 2.5.0 and `@powersync/react` 2.1.0 shipped on 2026-10-19. [P2] Legacy Sync Rules have a migration guide to Sync Streams. [P16] No pivot was found.

**9. Migrations.** "The client-side schema is just a view on top of the schemaless data. Updating this client-side schema is immediate … with no client-side migrations required." Removed columns read as `undefined`, and versioned streams serve old app versions. [P17] Deploy order is source schema, then backend, then Sync Streams, then the app. [P18]

**10. Code in `apps/sync`.** It would hold Better Auth (with the `jwt()` plugin), Postgres migrations, a batch `POST /api/upload` that validates and applies ops with field-level LWW, and future REST/MCP routes. The service owns the Sync Streams YAML and replication. Hono implements no WebSocket or cross-tab code.

---

## 4. Zero (Rocicorp)

**What it is.** "Zero is a query-driven sync engine for TypeScript apps. It replicates Postgres into a SQLite replica inside `zero-cache`, then syncs subsets of rows to clients based on the queries your app runs." [Z13]

**1. Self-hosting and licence.** "The Zero client and server are Apache-2 licensed. You can use, modify, host, and distribute them freely", with "no plans to ever change the licensing of the core product." [Z1] The npm package `@rocicorp/zero` is Apache-2.0 [Z2]. The image is `rocicorp/zero:1.11.0`. Single-node runs one container (view-syncer plus replication-manager), and its replica is `ZERO_REPLICA_FILE`, which "can be lost" and re-replicated. [Z3][Z9] Cloud Zero is optional. [Z15]

Resulting compose services: `app`, `sync` (Hono with `/query` and `/mutate`), `postgres`, `zero-cache`.

**2. Offline writes: the blocking gap.** "Zero does not support offline writes. When the client is in the `disconnected`, `error`, or `needs-auth` states, reads from synced data continue to work, but writes are rejected." Writes are only queued in `initializing` and `connecting`, and Zero "transitions to `disconnected` when the tab is hidden for `hiddenTabDisconnectDelay` (default 5 minutes)". Raising `disconnectTimeoutMs` "is not recommended". [Z5] The "When To Use" page lists "You need to support offline writes or long periods offline" under "Zero Might Not be a Good Fit", and adds "Zero is not local-first. It's a client-server system with an authoritative server." [Z6] Whether queued `connecting` writes survive a reload is **unverified**.

Server writes go through mutators that "run first on the client against the local datastore" and then through your `/mutate` endpoint via `handleMutateRequest`. "`handleMutateRequest` … skips any mutations that throw", and the client reverts. [Z7]

**3. Database.** "Zero requires Postgres v15.0 or higher" with `wal_level = logical`; "Today only Postgres is supported." `ZERO_UPSTREAM_DB` "*must* be a direct connection (not via pgbouncer)". [Z4][Z3]

**4. Auth.** Cookie forwarding (`ZERO_QUERY_FORWARD_COOKIES`, `ZERO_MUTATE_FORWARD_COOKIES`) is "the most common way", or a token passed to `ZeroProvider` is forwarded as `Authorization: Bearer`. Your endpoint validates it and returns 401/403 for `needs-auth`. [Z8] `ZERO_AUTH_JWK`, `ZERO_AUTH_JWKS_URL` and `ZERO_AUTH_SECRET` appear under "Deprecated Flags". [Z9] This fits Better Auth cookie sessions in Hono well.

**5. Permissions.** Read rules are named queries resolved on the server with an auth-derived `context`: "User cannot control context.userID, so this safely restricts the query to the user's own posts", and "the server can add extra filters to enforce permissions that the client query does not." [Z10] Relationships are declared in the schema (`one`/`many`, junction tables up to two levels) and queried with `related`. [Z11] RLS-style permissions sit in the docs' "Old Stuff" section. [Z15] Zero has the most expressive read rules of the three (full TypeScript), but that does not help with offline.

**6. Server-side writes.** Changes reach clients through logical replication. [Z3] REST/OpenAPI can be generated from the mutator registry. [Z12]

**7. Client.** React integration uses `ZeroProvider` and `useQuery`. [Z13b] Storage is "IndexedDB in the browser". [Z5] `userID` separates local storage, and auth lets "one user's tabs share a client group". [Z8] React 19 compatibility is not stated in the docs (**unverified**; `@rocicorp/zero` declares no React peer range on npm). No bundle size is published (**unverified**).

**8. Maturity.** 1.0.0 shipped to npm on 2026-03-24, and the latest is 1.11.0/1.11.1 (2026-10-16 and 10-19) (npm). The status page says "As of March 2026, Zero is generally available and fully-supported"; the 2026 roadmap covers Cloud Zero GA and column permissions. [Z14] **Replicache:** the `rocicorp/replicache` GitHub repo is archived (last push 2022). `replicache` on npm is at 15.3.0 under `https://roci.dev/terms.html` (npm). No first-party maintenance-status statement was found (**unverified**).

**9. Migrations.** Expand runs "DB → API → Client" and contract runs "Client → API → DB". Incompatible clients get `SchemaVersionNotSupported`, and `onUpdateNeeded` "calls `location.reload()`" by default. [Z16]

**10. Code in `apps/sync`.** It would hold Better Auth, `/query` and `/mutate` routes, a TS schema plus queries and mutators shared with the frontend (a workspace package), and REST/MCP built from mutators.

---

## 5. ElectricSQL (Electric Sync + TanStack DB)

**What it is.** "Electric Sync is a read-path sync engine for Postgres. It syncs data out of Postgres into local clients over HTTP using a primitive called a Shape." [E2] The site has moved to `electric.ax` (301 from electric-sql.com), and the top-level pitch is now "the data primitives and infra to build collaborative, multi-agent systems. Including Postgres Sync, Durable Streams, TanStack DB and PGlite." [E12]

**1. Self-hosting and licence.** The `electric-sql/electric` repo is Apache-2.0 [E1] and TanStack DB is MIT [E3]. The service is "an Elixir web service, packaged using Docker" (`electricsql/electric`), and needs a persistent `ELECTRIC_STORAGE_DIR` that "must survive sync service's restarts". [E4] The docs call Electric Cloud "the simplest way", but it is optional. [E4]

Resulting compose services: `app`, `sync` (Hono proxy and writes), `postgres`, `electric`. A caching proxy or CDN in front is recommended. [E4]

**2. Offline writes.** "Electric does not do write-path sync. It doesn't provide (or prescribe) a built-in solution for getting data back into Postgres". The guide lists four do-it-yourself patterns, and the "through-the-db" pattern ships with a "very naive" rollback. [E6]

The packaged answer is TanStack DB `@tanstack/offline-transactions` 1.1.3, a durable outbox ("IndexedDB with localStorage fallback") with FIFO processing and retries. Only the leader tab persists: "Non-leader tabs: Online-only mode for safety". [E7] Persisting the synced rows locally needs `@tanstack/browser-db-sqlite-persistence` (0.2.36, first published 2026-03-25), which runs OPFS wa-sqlite in a secure context and needs a separate multi-tab setup. [E10] That makes three or more client packages to compose, two of them pre-1.0.

**3. Database.** "any standard Postgres, version 14 and above" with logical replication and the `REPLICATION` role, connected directly rather than through a pooler. [E5] No SQLite.

**4. Auth.** Electric itself does not authenticate users. Recommended patterns are "proxy auth", where you "validate the user credentials and set the shape parameters server-side", and "gatekeeper auth", where shape-scoped tokens are issued. [E8] A Hono route with Better Auth can act as the proxy.

**5. Permissions.** "Shapes are currently single table, though you can use subqueries to filter based on related data." When subquery data changes, "rows will automatically move in or out of the shape", and include trees are not implemented. [E9] Trip, items and places therefore need one shape per table, each with an ACL subquery built in the proxy.

**6. Server-side writes.** Any Postgres write replicates out. [E4]

**7. Client.** `@electric-sql/react` 1.0.57 (peer `react >=18.3.1 <20`) and `@tanstack/react-db` 0.5.11 (peer `react >=18`) are on npm. Multi-tab behaviour is described in requirement 2 above. PWA notes and bundle size are not documented (**unverified**).

**8. Maturity.** "With version 1.0.0, Electric is now in GA … no backwards-incompatible changes in patch or minor releases" (2025-03-17), after Electric was "re-built … from scratch" in 2024. [E11] `@core/sync-service` 1.8.1 shipped on 2026-09-07. [E1] The new positioning around agents and Durable Streams in 2026 [E12] is a shift in focus, not a deprecation of Sync. TanStack DB `react-db` is at 0.5.x [E3].

**9. Migrations.** Shape definitions are immutable [E9]. How Electric handles DDL on a synced table (whether it forces a client resync) is **unverified** here. TanStack persistence tracks `schemaVersion` [E10].

**10. Code in `apps/sync`.** It would hold Better Auth, a shape proxy per table that builds `where` with an ACL, write endpoints with idempotency keys, and REST/MCP. This is the most server-side code of the three, because Electric only covers the read path.

---

## 6. Other candidates (brief)

None of these clearly beats PowerSync on the requirements. Each is noted for completeness.

- **Triplit:** an AGPL-3.0 "full-stack, syncing database". The last GitHub release and npm publish (`@triplit/client` 1.0.50) are from 2025-07-31, and the repo was last pushed in 2026-01 (GitHub API, npm). It looks inactive and AGPL, so it was not pursued.
- **InstantDB:** an Apache-2.0 repo, now pitched as "the best backend for AI-coded apps". It is primarily a hosted service. The self-host path and the offline write queue were **not verified**.
- **LiveStore:** Apache-2.0 at v0.5.0 (2026-10-15). It is event-sourced, and its client-side SQLite is the source of state, which runs against the goal of a server that owns the schema. It is pre-1.0.
- **TinyBase:** MIT at v10.0.1. It is a reactive client store with its own sync. It has no authoritative relational server, so it does not fit the thick-server goal.

---

## 7. Recommendation for Reisenotiz

1. **PowerSync: recommended.** It is the only one of the three with a built-in, persisted, auto-retried offline write queue, server-authoritative rollback and per-field LWW by default [P5][P7][P20], which is exactly the brief. Its auth model (JWKS-verified JWT) matches Better Auth's JWT plugin defaults with configuration only [P10][B1]. Writes land in a plain endpoint inside our Hono server, so REST, MCP and the sync upload path share one validation layer. The library handles multi-tab sync through a shared worker [P14].

   Costs:
   - The server moves to Postgres and SQLite is dropped.
   - Compose gains two services (`postgres`, `powersync`).
   - The service is FSL, not OSI; this is fine for self-use and becomes Apache-2.0 after two years.
   - Telemetry has to be opted out.
2. **Electric + TanStack DB: viable but more assembly.** The licences are the most permissive (Apache/MIT), but offline writes come from a separate 0.x/1.x TanStack stack where only the leader tab persists writes. Single-table shapes mean one proxied shape per table with ACL subqueries. More of the plumbing the user wants to avoid ends up in our code.
3. **Zero: not suitable.** It is excellent at TypeScript-first permissions and DX, but it explicitly does not support offline writes [Z5][Z6]. That fails the core requirement for a trip planner used on the road.

Adopting any of them reverses ADR-0002 (Automerge), ADR-0003 (no domain knowledge on the server) and ADR-0004 (document-per-trip). Those ADRs would need superseding decisions, and existing Automerge data would need a one-off export into Postgres.

---

## 8. Open questions and risks

- **PostgreSQL becomes mandatory.** The SQLite-default deployment ends, and Better Auth would move to Postgres too. Decide whether that is acceptable for self-hosters.
- **FSL licence.** Confirm that the "Competing Use" clause [P3] is acceptable if a hosted Reisenotiz SaaS is ever offered. Offering Reisenotiz is not offering a sync service, but check with care.
- **Trip sharing roles.** A `trip_shares (trip_id, user_id, role)` table with `viewer` and `editor` roles. Read access is the Sync Streams sharing pattern [P12]. The role only matters for writes: PowerSync streams rows down and has no write permissions of its own, so the upload endpoint in Hono rejects a viewer's writes, and the client rolls them back [P7]. The UI should still hide edit controls for viewers, so they don't see edits appear and then vanish.
- **Saved places and persons under sharing.** They belong to a user and are shared only as copies. A shared trip's items still link to the owner's places and persons, so a guest syncs those rows through the trip (`id IN (SELECT place_id FROM trip_items WHERE trip_id IN (…))` [P12]) but can't edit them; only their owner can. Open: whether an editor can link their own places into someone else's trip (the trip would then reference two users' places), and whether "copy to my places" is a plain server-side insert.
- **Relational model.** The document shapes (RootDoc, TripDoc with nested items, `Person` inside items) exist because Automerge stores JSON documents. With Postgres the model is normalised: `trips`, `trip_items`, `persons`, saved places and join tables, linked by foreign keys. That gives field-level LWW per row, and relation-based read rules become joins. Open: which tables a trip's read rule reaches (items, persons, the places items link to), and whether `persons` belong to a user or to a trip.
- **Key strategy.** All three expect client-generated ids (UUIDs) for offline inserts. IATA-keyed `savedAirports` need a composite or uuid key.
- **PWA on iOS.** Offline cold start is verified in headless Chromium (section 9). Safari and installed iOS PWAs are not tested, and iOS storage eviction for PWAs that aren't installed still applies.
- **Safari/iOS multi-tab.** Use `OPFSCoopSyncVFS` [P14], and test on iOS PWA installs.
- **Rejection UX.** PowerSync advises returning 2xx with error details or an errors table [P6]. A user-visible "change rejected" surface would need design.
- **Bundle size.** None of the three publishes a figure. PowerSync is measured in section 9; Zero and Electric are not.
- **Migration path.** This is a one-off export from Automerge docs to relational rows, with no long-running dual sync.

---

## 9. Verified: PowerSync in an offline PWA

This was run on 2026-10-20 with `@powersync/web` 2.5.0, `@journeyapps/wa-sqlite` 2.0.8, Vite 8.3.4, `vite-plugin-pwa` 1.3.0 and headless Chromium 154 (via `agent-browser` 0.27). No sync server was connected, so every write stayed in the local upload queue.

**Setup.** The build used the demo's Vite settings [P21]: `optimizeDeps.exclude: ['@powersync/web']`, `worker.format: 'es'`, `generateSW` with `maximumFileSizeToCacheInBytes: 5 MiB`, and no custom `globPatterns`. On each load the page inserts one row into a synced table, then reports the row count, the number of entries in `ps_crud` (the local upload queue) and whether the service worker controls the page.

**Precache.** The plugin's default glob includes `.wasm`. The generated `sw.js` precached all 31 entries (7,977 KiB):
- four wasm builds: `wa-sqlite` (1.1 MB), `wa-sqlite-async` (2.3 MB), and `mc-*` variants of each (1.3 MB and 2.5 MB);
- the worker chunk;
- every VFS chunk.

Each JS chunk appears twice because the worker has its own module graph. The `mc-*` builds are the SQLite3MultipleCiphers (encryption) variants. With `globIgnores: ['**/mc-*']` the precache drops to 25 entries (4,047 KiB), and the results below are unchanged. The main app chunk is 118 kB (36 kB gzip).

**Results.** The same results held with all 31 entries and without the `mc-*` builds. Steps 1 and 2 were online. Steps 3 and 4 were a full browser shutdown, then a relaunch with the network disabled before the first navigation, on the same persistent profile.

| Step | `IDBBatchAtomicVFS` | `OPFSCoopSyncVFS` |
| --- | --- | --- |
| 1. First visit, online | rows 1, queued 1 (no SW control yet) | rows 1, queued 1 |
| 2. Reload, online | rows 2, queued 2, SW controls | rows 2, queued 2, SW controls |
| 3. Browser restarted, **offline** cold start | rows 3, queued 3, SW controls | rows 3, queued 3, SW controls |

So the shell, workers and wasm load from the precache, the local database reopens with its data, and new writes join the persisted upload queue while offline.

**Gotcha found.** The `@powersync/web` 2.5.0 README shows `new WASQLiteOpenFactory({ dbFilename, vfs })`, but 2.5.0 expects `{ open: { … } }`, and passing the factory there fails with "The provided `database` option is invalid." Passing plain options, `database: { dbFilename, vfs }`, works.

**Not covered.** Safari and iOS, the real upload path to a backend (`uploadData`), and service-worker updates while an upload is queued.

---

## Sources

**PowerSync**
- [P1] Self-Hosting: https://docs.powersync.com/intro/self-hosting
- [P2] GitHub releases: https://github.com/powersync-ja/powersync-service/releases (v1.27.0, 2026-10-06); https://github.com/powersync-ja/powersync-js (Apache-2.0; `@powersync/web` 2.5.0, 2026-10-19)
- [P3] Service licence (FSL-1.1-ALv2): https://github.com/powersync-ja/powersync-service/blob/main/LICENSE
- [P4] Self-Hosted Instance Configuration (storage, PG version table): https://docs.powersync.com/configuration/powersync-service/self-hosted-instances
- [P5] Client Architecture (upload queue, `ps_crud`): https://docs.powersync.com/architecture/client-architecture
- [P6] Writing Client Changes: https://docs.powersync.com/handling-writes/writing-client-changes
- [P7] Handling Write / Validation Errors: https://docs.powersync.com/handling-writes/handling-write-validation-errors
- [P8] Source Database Setup (`wal_level`, publication, PG 11+): https://docs.powersync.com/configuration/source-db/setup
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

**Zero**
- [Z1] Open Source: https://zero.rocicorp.dev/docs/open-source ; https://github.com/rocicorp/mono/blob/main/LICENSE
- [Z2] npm `@rocicorp/zero` (Apache-2.0; 1.0.0 on 2026-03-24, 1.11.1 on 2026-10-19): https://www.npmjs.com/package/@rocicorp/zero
- [Z3] Deployment / Self-host: https://zero.rocicorp.dev/docs/deployment
- [Z4] Provider Support (Postgres 15+, `wal_level`): https://zero.rocicorp.dev/docs/connecting-to-postgres
- [Z5] Connection Status / Offline: https://zero.rocicorp.dev/docs/offline
- [Z6] When To Use: https://zero.rocicorp.dev/docs/when-to-use
- [Z7] Writing Data (mutators): https://zero.rocicorp.dev/docs/mutators
- [Z8] Authentication: https://zero.rocicorp.dev/docs/auth
- [Z9] zero-cache Configuration (deprecated JWK flags, replica file): https://zero.rocicorp.dev/docs/zero-cache-config
- [Z10] Reading Data (queries, context): https://zero.rocicorp.dev/docs/queries
- [Z11] Schema (relationships, migrations): https://zero.rocicorp.dev/docs/zero-schema
- [Z12] REST APIs: https://zero.rocicorp.dev/docs/rest
- [Z13] Docs index: https://zero.rocicorp.dev/llms.txt ; [Z13b] React: https://zero.rocicorp.dev/docs/react
- [Z14] Project Status: https://zero.rocicorp.dev/docs/status
- [Z15] Docs nav (Cloud Zero, "Old Stuff": RLS Permissions, CRUD Mutators): https://zero.rocicorp.dev/docs/status ; Release notes: https://zero.rocicorp.dev/docs/release-notes
- [Z16] Schema migrations: https://zero.rocicorp.dev/docs/zero-schema
- Replicache repo (archived): https://github.com/rocicorp/replicache

**Electric / TanStack DB**
- [E1] Repo (Apache-2.0, releases): https://github.com/electric-sql/electric
- [E2] Electric Sync overview: https://electric.ax/docs/sync
- [E3] TanStack DB (MIT, `@tanstack/react-db` 0.5.11): https://github.com/TanStack/db
- [E4] Deployment guide: https://electric.ax/docs/sync/guides/deployment
- [E5] Installation / Postgres requirements: https://electric.ax/docs/sync/guides/installation ; https://electric.ax/docs/sync/guides/deployment
- [E6] Writes guide: https://electric.ax/docs/sync/guides/writes
- [E7] `@tanstack/offline-transactions` README: https://github.com/TanStack/db/tree/main/packages/offline-transactions
- [E8] Auth guide: https://electric.ax/docs/sync/guides/auth
- [E9] Shapes guide: https://electric.ax/docs/sync/guides/shapes
- [E10] TanStack DB SQLite persistence guide: https://github.com/TanStack/db/blob/main/docs/guides/sqlite-persistence.md
- [E11] Electric 1.0 released (2025-03-17): https://electric.ax/blog/2025/03/17/electricsql-1.0-released
- [E12] Electric docs index / positioning: https://electric.ax/llms.txt

**Better Auth**
- [B1] JWT plugin (EdDSA/Ed25519 default, `/jwks`, issuer/audience/expiry): https://www.better-auth.com/docs/plugins/jwt
