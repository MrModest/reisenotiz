# Authentication library for reisenotiz (October 2026)

**Question.** Which library should provide sign-in, and simple per-document authorisation, embedded
in `apps/sync` (Hono on Node) on its existing SQLite or Postgres database?

**Sources.** Read on 2026-10-13. Sources are the npm registry (`registry.npmjs.org/<pkg>`), the
GitHub source at `main`, official docs and the MCP spec. Where a claim could not be checked, it is
marked **(unverified)**.

## Constraints from this repo

- `apps/sync` is a Hono app (`hono`, `@hono/node-server`, `@hono/node-ws`) that runs an
  automerge-repo `Repo` with `NodeWSServerAdapter`, `sharePolicy: async () => true`, and storage on
  better-sqlite3 by default or `pg` (`apps/sync/src/server.ts`, `apps/sync/CLAUDE.md`).
- The server holds no domain knowledge: no `Trip`, no validation and no projection of document
  contents (`docs/adr/0003-sync-server-holds-no-domain-knowledge.md`). Authorisation must therefore
  be framed as "user U may sync document D".
- Each trip is one Automerge document, and each user has one root document
  (`docs/adr/0004-automerge-document-model.md`). Sharing a trip means granting access to one
  document ID.
- The frontend opens the socket with `new WebSocketClientAdapter(VITE_SYNC_SERVER_URL)`
  (`apps/frontend/src/contexts/sync-repo.ts`). The adapter calls a bare `new WebSocket(url)`
  ([WebSocketClientAdapter.ts](https://github.com/automerge/automerge-repo/blob/main/packages/automerge-repo-network-websocket/src/WebSocketClientAdapter.ts)),
  so it cannot send custom headers. A browser WebSocket can carry only cookies, or a token in the
  URL.
- docker-compose runs the frontend on `:8080` and sync on `:4000` as two containers
  (`docker-compose.yml`).

## MCP authorisation spec (current: 2026-07-28)

Source: [modelcontextprotocol.io/specification/latest/basic/authorization](https://modelcontextprotocol.io/specification/latest/basic/authorization).

- The MCP server is an OAuth 2.1 resource server. It **MUST** serve Protected Resource Metadata
  (RFC 9728) and **MUST** validate the token audience (RFC 8707).
- The authorisation server **MUST** implement OAuth 2.1 and **MUST** offer RFC 8414 or OIDC
  discovery. It **SHOULD** support Client ID Metadata Documents (CIMD) and **SHOULD** send `iss`
  in the authorisation response (RFC 9207). It **MAY** support Dynamic Client Registration, which
  the spec keeps as a deprecated mechanism.
- Clients send `Authorization: Bearer`. Tokens **MUST NOT** be placed in the query string.

The spec therefore rules out plain API keys for third-party MCP clients. The future MCP server
needs an embedded OAuth 2.1 authorisation server with PKCE, CIMD and resource binding.

## Candidates

| Candidate | Status | Hono | SQLite (better-sqlite3) / Postgres + migrations | Passkeys | Email + password | Generic OIDC | API tokens | OAuth provider / MCP | Licence |
|---|---|---|---|---|---|---|---|---|---|
| **Better Auth** 1.7.7 | Active: 1.7.7 released 2026-09-30, 105 npm releases in 2026, commits on 2026-10-13 [1] | Mounted directly via `auth.handler(c.req.raw)` [2] | Both supported. Pass a `better-sqlite3` `Database` or a `pg` `Pool`, and `auth migrate` applies the schema through Kysely [3] | `@better-auth/passkey`, built on SimpleWebAuthn [4] | Built in [5] | `genericOAuth` (OIDC discovery, PKCE, issuer check) and `@better-auth/sso` (OIDC and SAML) [6] | `@better-auth/api-key`, with per-key permissions and optional sessions for API keys [7] | `@better-auth/oauth-provider` (OAuth 2.1, introspection, revocation, DPoP), plus `@better-auth/mcp` and `@better-auth/cimd`, which target the MCP 2026-07-28 profile. DCR is off by default [8] | MIT [9] |
| Auth.js (`@auth/core` 0.41.3, `@hono/auth-js` 1.1.1) | Maintenance only: the Better Auth team took over Auth.js in 2025-09, patches only security and urgent issues, and recommends Better Auth for new projects [10]. 2 releases in 2026 [1] | `@hono/auth-js` [1] | Through adapters (unverified for better-sqlite3) | Experimental: "not recommended for production use" [11] | The developer writes sign-up and password hashing [12] | Yes | No | No | ISC |
| Lucia | Deprecated in March 2025. The npm package is marked deprecated, and the site now offers a single-file copy-paste replacement [13] | — | DIY | DIY | DIY | DIY | DIY | DIY | MIT |
| Oslo (`@oslojs/*`) and Arctic | Every version is marked "Package no longer supported" on npm. The GitHub repos show no archive notice (unverified why) [1][14] | — | DIY | DIY (`@oslojs/webauthn` is flagged too) | DIY | Arctic only | DIY | DIY | MIT |
| OpenAuth (`@openauthjs/openauth` 0.4.3) | Stale: last release 2025-03-04 and still labelled "beta" [1][15] | Yes | Key-value store only (Cloudflare KV, DynamoDB, memory). No SQL [15] | Not offered [15] | Yes | Partial | No | It is an OAuth server, but has no MCP profile [15] | (not stated on npm) |
| `@simplewebauthn/server` 14.0.3 | Active, 9 releases in 2026 [1] | n/a | n/a | Building block | — | — | — | — | MIT |
| Hono built-in `jwt` / `bearer-auth` | Part of Hono | Yes | None | — | — | — | — | — | MIT. Verifies tokens only; no accounts or sign-in [16] |
| `oidc-provider` (panva) 9.12.2 | Active, released 2026-09-05 [1] | Koa-based, needs mounting (unverified effort) | You write the storage adapter | — | — | — | — | Full OIDC/OAuth server, but no user model | MIT |
| Keycloak, Ory, Zitadel, Supabase Auth, Logto, Stack Auth | Separate services or hosted | Violate rule 3 (separate container), so ruled out without detailed review | | | | | | | |

A broad search found no newer TypeScript-native, embeddable library that covers passkeys, an OAuth
provider and MCP together (search on 2026-10-13, secondary sources only).

### Better Auth details that matter here

- **Sessions.** A server-side `session` row identified by the `session_token` cookie. It lasts 7
  days by default and rolls forward each time `updateAge` passes; both values are configurable. An
  optional signed `cookieCache` exists, but it delays revocation until its `maxAge` [17]. For an
  offline-first PWA this works: offline use never touches auth, and a long rolling `expiresIn`
  (for example 60 days) covers devices that sync rarely.
- **Bearer and one-time tokens.** The `bearer()` plugin accepts the session token in
  `Authorization` [18]. The `oneTimeToken()` plugin mints single-use tokens [19]. Because a browser
  WebSocket cannot send headers, a one-time token in the WS URL is the cross-site fallback when
  cookies cannot be used.
- **Organisations and roles.** The `organization` plugin exists for SaaS tenancy later [20].
  Per-document sharing does not need it.
- **Dependency weight (server only).** `better-auth` is 2.0 MB unpacked. It depends on `kysely`,
  `zod`, `jose`, `@noble/*`, `nanostores`, `better-call`, and thin adapter packages [1]. The heavy
  ORMs (Prisma, Drizzle) are optional peers. The size of the browser client
  (`better-auth/client`) is unverified.
- **Telemetry** is "optional, transparent, and disabled by default" [21].
- **Security track record.** Several advisories were published from June to September 2026,
  including Critical ones (OAuth state usable as a magic link; SCIM takeover) and High ones in
  SSO, OAuth proxy and device flow [22]. Most affect plugins this repo would not enable (SCIM,
  OAuth proxy, magic link, organisation SSO). The project fixes them quickly, but the count is
  high.

## How auth plugs into Automerge sync

Verified against the automerge-repo source on `main` and the published 2.5.5 typings:

1. **WS upgrade.** In `@hono/node-ws` 1.3.1 the HTTP upgrade request passes through `app.request()`,
   so Hono middleware runs first. If the handler does not reach `upgradeWebSocket`, the socket is
   closed with the response status, for example 401 [23]. Cookies sent with the upgrade request are
   visible to `auth.api.getSession({ headers })`.
2. **Per-document access.** `RepoConfig.shareConfig = { announce, access }` (marked
   `@experimental`) [24]. The relevant behaviour:
   - `access(peerId, documentId)` gates both reading and writing. A peer that is denied receives
     `doc-unavailable`, and its sync messages are not applied [25].
   - `repo.shareConfigChanged()` re-evaluates every peer, and a peer that loses access is notified
     [24][25].
   - The legacy `sharePolicy` maps only to `announce`, and `access` then defaults to `true` [24].
     The current `sharePolicy: async () => true` therefore gives no protection.
   - `shareConfig` already ships in 2.5.5 [26].
3. **Peer identity is client-chosen.** `NodeWSServerAdapter` takes `senderId` from the client's
   `join` message. A second join with the same ID closes the earlier socket [27]. The server must
   bind the `peerId` to the user authenticated on that socket, and reject a join whose `peerId` is
   already bound to another user.
4. **Newer access control.** The automerge-repo remote has `auth-provider-*`, `authenticate`,
   `jtfm/subduction-keyhive-and-policies` and `beelay` branches, and npm carries
   `authors`, `subduction` and `3.0.0-experimental` dist-tags [1]. None of these is a released
   API. Their scope is unverified.

## Recommendation

**Primary: Better Auth** (`better-auth` with `@better-auth/passkey` and `@better-auth/api-key`,
and later `@better-auth/mcp` with `@better-auth/cimd`), embedded in `apps/sync`.

- It is the only maintained, embeddable TypeScript option that covers all four sign-in methods.
- It mounts in Hono with one line.
- It runs on the existing better-sqlite3 or `pg` connection, with a built-in migrator.
- It ships an OAuth 2.1 provider that targets the current MCP spec, so no extra service is needed.

**Fallback: build on primitives.** Use `@simplewebauthn/server` for passkeys, `node:crypto` scrypt
for passwords, a hand-written session table and Hono `jwt` middleware. Add `oidc-provider` only
when MCP arrives. This costs far more code and leaves OAuth-server security to us. Oslo and Arctic
are not suitable building blocks, because npm flags them as unsupported.

## Integration sketch (apps/sync)

```
apps/sync/src/
  auth/auth.ts        betterAuth({ database: <same better-sqlite3 Database | pg Pool>,
                        emailAndPassword, plugins: [passkey(), apiKey(), bearer(), oneTimeToken()] })
  auth/doc-access.ts  table document_access(document_id, user_id) + access(peerId, docId)
  server.ts           app.on(['GET','POST'], '/api/auth/*', c => auth.handler(c.req.raw))
                      app.get('/', requireSession, upgradeWebSocket(...))
```

- **Database.** Better Auth's tables (`user`, `session`, `account`, `verification`, `passkey`,
  `apikey`) live next to the chunk table. `document_access` stores only opaque document IDs and
  user IDs, with no domain terms, so it stays within ADR-0003. Run the schema with `auth migrate`,
  or generate SQL with `auth generate` and apply it in the existing storage init.
- **Frontend session.** Use `createAuthClient` from `better-auth/react`, with sign-in screens in
  `apps/frontend`.
  - Serve the frontend and sync under one site (for example `app.example.org` and
    `sync.example.org`, or one origin behind a reverse proxy). The `session_token` cookie then
    rides the WS upgrade automatically. Configure `trustedOrigins`, Hono `cors({ credentials: true })`
    and Better Auth's cross-subdomain cookies.
  - If the two are on different sites, fetch a one-time token and open
    `wss://sync…/?ott=…` instead.
  - The local-only mode, with no `VITE_SYNC_SERVER_URL`, stays unauthenticated.
- **WS upgrade.** `requireSession` middleware calls `auth.api.getSession({ headers })`, or verifies
  the one-time token. It returns 401 on failure, otherwise it records `userId` on `c.env.incoming`
  (the Node `IncomingMessage`), which `wss.on('connection', (ws, req) => …)` receives.
- **Peer binding.** Subclass `NodeWSServerAdapter` and override
  `receiveMessage(bytes, socket)`:
  1. Decode the message with `cbor` from `@automerge/automerge-repo`.
  2. On `join`, bind `senderId → userId(socket)`. Close the socket if the `senderId` is already
     bound to another user.
  3. Hand the message to `super`.
- **Per-document check.** Pass `shareConfig: { announce: async () => false, access: (peerId, docId) => hasAccess(userOf(peerId), docId) }`.
  - A document with no ACL rows is claimed by the first user who requests it. Document IDs are
    random, so that user is its creator.
  - Sharing is `POST /access/:docId { userId | email }`, allowed only for a user who already has
    access, followed by `repo.shareConfigChanged()`. Revoking is a delete followed by the same
    call.
- **Long-lived sockets.** Keep a `sessionId → sockets` map. On sign-out or revocation (Better Auth
  `databaseHooks` on session delete), close those sockets. As a safety net, re-check sessions on a
  timer.
- **MCP later.** Add `jwt()`, `mcp({ resource, loginPage, consentPage })` and
  `cimd({ metadataProfile: "mcp-2026-07-28" })`. The MCP server validates audience-bound JWTs
  against `/jwks`, then calls the same `hasAccess` with the token's `sub`. API keys stay available
  for personal scripts.

## Open risks

- `shareConfig` is `@experimental` and "will very likely change without a major release" [24]. The
  repo depends on `^2.5.5`, so pin it and cover `access` with a test.
- The server must bind `peerId` to the socket's user itself (finding 3 above), which means adding
  an adapter subclass.
- Better Auth's high advisory rate [22]: pin versions, watch GHSA, and enable only the plugins in
  use.
- Revocation does not reach an open socket unless the server closes it explicitly. With
  `cookieCache` on, revocation also lags by up to `maxAge` [17].
- Cookie scope depends on deployment. The current docker-compose exposes two ports with no shared
  domain, so self-hosters need a reverse proxy or the one-time-token path.
- Documents that existed before auth have no owner. The first sign-in must seed ACL rows, for
  example by assigning every existing document to the first or admin user. Otherwise
  first-request claiming lets any authenticated user claim an existing document whose ID they know.
- Better Auth has no UI. The frontend must build the sign-in, passkey and (for MCP) consent
  screens.

## Sources

1. npm registry metadata, read 2026-10-13:
   - [better-auth](https://registry.npmjs.org/better-auth)
   - [@auth/core](https://registry.npmjs.org/@auth/core)
   - [@hono/auth-js](https://registry.npmjs.org/@hono/auth-js)
   - [@openauthjs/openauth](https://registry.npmjs.org/@openauthjs/openauth)
   - [@oslojs/crypto](https://registry.npmjs.org/@oslojs/crypto)
   - [@oslojs/webauthn](https://registry.npmjs.org/@oslojs/webauthn)
   - [arctic](https://registry.npmjs.org/arctic)
   - [lucia](https://registry.npmjs.org/lucia)
   - [@simplewebauthn/server](https://registry.npmjs.org/@simplewebauthn/server)
   - [oidc-provider](https://registry.npmjs.org/oidc-provider)
   - [@automerge/automerge-repo](https://registry.npmjs.org/@automerge/automerge-repo)

   Better Auth `main` latest commit is 2026-10-13: [better-auth/better-auth](https://github.com/better-auth/better-auth).
2. [Better Auth: Hono integration](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/integrations/hono.mdx)
3. Better Auth database docs:
   - [SQLite adapter](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/adapters/sqlite.mdx)
   - [PostgreSQL adapter](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/adapters/postgresql.mdx)
   - [CLI](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/cli.mdx)
4. Better Auth passkeys:
   - [Passkey plugin](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/passkey.mdx)
   - [`packages/passkey/package.json`](https://github.com/better-auth/better-auth/blob/main/packages/passkey/package.json) (depends on `@simplewebauthn/server` ^13)
5. [Better Auth: email and password](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/authentication/email-password.mdx)
6. Better Auth OIDC:
   - [Generic OAuth](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/generic-oauth.mdx)
   - [SSO](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/sso.mdx)
7. Better Auth API keys:
   - [API Key](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/api-key/index.mdx)
   - [API Key, advanced](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/api-key/advanced.mdx)
8. Better Auth OAuth and MCP:
   - [OAuth Provider](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/oauth-provider.mdx)
   - [MCP](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/mcp.mdx)
   - [CIMD](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/cimd.mdx)
9. [Better Auth LICENSE](https://github.com/better-auth/better-auth/blob/main/LICENSE.md)
10. [Better Auth blog: "Auth.js is now part of Better Auth" (2025-09-22)](https://github.com/better-auth/better-auth/blob/main/docs/content/blogs/authjs-joins-better-auth.mdx)
11. [Auth.js: WebAuthn](https://authjs.dev/getting-started/authentication/webauthn)
12. [Auth.js: Credentials](https://authjs.dev/getting-started/authentication/credentials)
13. [lucia-auth.com](https://lucia-auth.com/)
14. [oslo-project/crypto](https://github.com/oslo-project/crypto)
15. [toolbeam/openauth](https://github.com/toolbeam/openauth)
16. [Hono: JWT middleware](https://hono.dev/docs/middleware/builtin/jwt)
17. [Better Auth: session management](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/session-management.mdx)
18. [Better Auth: Bearer plugin](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/bearer.mdx)
19. [Better Auth: One-Time Token plugin](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/one-time-token.mdx)
20. [Better Auth: Organization plugin](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/organization.mdx)
21. [Better Auth: telemetry](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/reference/telemetry.mdx)
22. [Better Auth security advisories](https://github.com/better-auth/better-auth/security/advisories)
23. `@hono/node-ws` 1.3.1, `dist/index.js` (`injectWebSocket`), from the [npm tarball](https://registry.npmjs.org/@hono/node-ws)
24. [automerge-repo `Repo.ts`](https://github.com/automerge/automerge-repo/blob/main/packages/automerge-repo/src/Repo.ts) (`ShareConfig`, `shareConfigChanged`, legacy `sharePolicy` mapping)
25. [automerge-repo `DocSynchronizer.ts`](https://github.com/automerge/automerge-repo/blob/main/packages/automerge-repo/src/synchronizer/DocSynchronizer.ts) (`#mayReceive`, denied peers, `reevaluateSharePolicy`)
26. [`@automerge/automerge-repo@2.5.5` `dist/Repo.d.ts`](https://unpkg.com/@automerge/automerge-repo@2.5.5/dist/Repo.d.ts)
27. [automerge-repo `WebSocketServerAdapter.ts`](https://github.com/automerge/automerge-repo/blob/main/packages/automerge-repo-network-websocket/src/WebSocketServerAdapter.ts) (`receiveMessage`, join handling)
