# Research: A Library-First, Self-Owned Auth Stack for Reisenotiz

> **Verified:** 2026-07-06. Where the ecosystem is in flux (Better Auth, Lucia) the verified version/date is noted inline.

---

## 1. Question & constraints

Pick a **library-first** auth stack the project mostly **owns** (minimal custom auth code), **not** a hosted provider, for Reisenotiz — an offline-first React 19 PWA that recently migrated to Automerge Repo for local-first storage + cross-device sync. There is no real auth today; "pairing" two devices means manually pasting a root Automerge document URL.

Hard constraints every option is judged against:

1. **Built-in credential auth is the DEFAULT**, with no dependency on a foreign/hosted provider (no Clerk/Auth0/hosted Authentik/WorkOS in the core flow). Must stay viable if we run our own SaaS.
2. **Token / bearer**, working in a **no-cookie client like curl** — not cookie-session-only.
3. **Friendly to future third-party app authorization** — ideally can be, or grow cleanly into, an **OAuth2 authorization server** issuing tokens to third-party native/mobile apps.
4. **Optional OIDC *client*** so power users can plug their own SSO (Authentik, Google, …) as an **opt-in**, never required.
5. **Multi-user.**
6. Must cooperate with an **Automerge sync server's** auth model (authenticate the websocket/sync connection; per-document / per-root-doc access control).

---

## 2. How Automerge sync auth works today (and what our stack must feed it)

This constraint shapes everything, so it comes first.

**automerge-repo has no built-in auth.** The core library is "a wrapper for the Automerge CRDT library … with pluggable networking and storage" ([automerge-repo README](https://github.com/automerge/automerge-repo)). The only access-control primitive in the core is the Repo's **`sharePolicy`**:

- `sharePolicy: async (peerId, documentId) => boolean` — "The default setting is to share all documents with all peers"; a custom function "should return a promise resolving to a boolean value indicating whether the document should be shared with the peer." ([automerge-repo packages README, raw](https://raw.githubusercontent.com/automerge/automerge-repo/main/packages/automerge-repo/README.md); [RepoConfig TypeDoc](https://automerge.org/automerge-repo/interfaces/_automerge_automerge-repo.RepoConfig.html))
- **Critical limitation:** `sharePolicy` "will not stop a document being _requested_ by another peer by its `DocumentId`." ([packages README, raw](https://raw.githubusercontent.com/automerge/automerge-repo/main/packages/automerge-repo/README.md)) It only suppresses *automatic announcement*. **It is not a security boundary** — a peer who knows a DocumentId can still request it.

**The official sync server is unauthenticated.** "The server is an unsecured Express app. It is partly for demonstration purposes but it's also a reasonable way to run a public sync server." ([automerge-repo-sync-server README](https://github.com/automerge/automerge-repo-sync-server)) It does not authenticate connections or restrict document access.

**Therefore the real gate is the network/peer layer, at connection time — not `sharePolicy`.** Two established approaches:

- **Authenticate the transport before the sync handshake.** Reisenotiz's own sync PRD already commits to this: "Adding authentication means inserting a token-validation middleware **before** the `NodeWSServerAdapter` handshake and a `permissions(userId, docId, role)` table behind a `/invite` endpoint." (`Plans/PRDs/Sync-Engine - Automerge.md`, "Further Notes"). This is the minimal, owned path: verify a bearer token on the WebSocket upgrade, resolve it to a `userId`, then enforce a `permissions(userId, docId, role)` table (which for us maps a user → their root doc URL → their per-trip docs).
- **Peer-level cryptographic auth (localfirst/auth).** `@localfirst/auth-provider-automerge-repo` "uses the localfirst/auth library to provide Automerge Repo with authentication and end-to-end encryption **without a central server**" by **wrapping the network adapter**, intercepting its `peer-candidate` event and running an invitation/team protocol before the peer is surfaced to the Repo; "The Repo never sees a peer until they've been authenticated." ([search summary of @localfirst/auth-provider-automerge-repo + auth-syncserver](https://www.npmjs.com/package/@localfirst/auth-provider-automerge-repo)) Powerful for decentralized E2E-encrypted sharing, but it is a **different identity model** (capabilities/invitations, not user accounts + password login) and does not by itself give us a credential login or an OAuth server.

**What our auth stack must feed the sync server:** a **verifiable bearer token** (ideally a signed JWT with a **JWKS** endpoint so the sync server verifies **statelessly**, no DB round-trip per connection) carrying a stable `sub` (userId). The sync server then: (a) rejects the WebSocket upgrade if the token is missing/invalid, (b) maps `sub → userId`, (c) consults `permissions(userId, docId, role)` to authorize the specific root/trip documents. This is exactly the shape a JWT-issuing auth library gives us for free.

---

## 3. Comparison table

Legend: ✅ yes / native · ⚠️ partial / with caveats · ❌ no. Every cell cited below the table.

| Option | Bearer/token-native? | Can be an OAuth2 **provider**? | OIDC **client**? | Credential auth built-in? | Multi-user? | Framework-agnostic server? | Maintenance health (verified 2026-07-06) | License |
|---|---|---|---|---|---|---|---|---|
| **Better Auth** | ⚠️→✅ Bearer plugin ("alternative to browser cookies", works via `Authorization: Bearer`, but flagged as opt-in add-on) [a] · JWT plugin issues JWTs + JWKS for stateless external verify [b] | ✅ **OAuth Provider plugin** = full OAuth 2.1 + OIDC AS (auth-code+PKCE, refresh, client-credentials, dynamic client reg, consent) [c] | ✅ Generic OAuth plugin: "any OAuth 2.0 / OIDC provider", opt-in [d] | ✅ built into core (not default — set `emailAndPassword.enabled: true`), scrypt default, argon2 swappable [e] | ✅ Organization plugin: members, roles, invites, teams [f] | ✅ Node/Bun/Deno/serverless; DB adapters Postgres/SQLite/MySQL/MongoDB/Prisma/Drizzle/Kysely [g] | Actively developed; latest stable **v1.6.10 (2026-05-09)**, v2 major in progress (OAuth hardening, DPoP, back-channel logout) [h] | MIT [i] |
| **Lucia** | n/a (you write it) | ❌ (you'd build it) | ❌ (delegate to Arctic) | ⚠️ you implement it | ⚠️ you implement it | ✅ (it's your code) | **Deprecated as a library (v3, by March 2025); now a "learning resource on implementing auth from scratch"** [j] | MIT (repo) |
| **oslo / arctic** (Lucia ecosystem) | oslo = JWT/crypto primitives; arctic = OAuth **client** | ❌ | ✅ **Arctic = OAuth2 client only**, "Only the authorization code flow is supported", ~80+ providers [k] | ❌ (primitives only) | ❌ | ✅ runtime-agnostic (Fetch-based) [k] | Arctic active (pilcrowonpaper) [k] | MIT |
| **node-oidc-provider** (panva) | ✅ issues real OAuth/OIDC bearer + JWT access tokens | ✅ **full certified OAuth2/OIDC AS** (Basic/Implicit/Hybrid, FAPI 1.0/2.0, Device Flow, PKCE, DPoP, JAR/PAR) [l] | ❌ (it's the AS, not an RP) | ❌ **explicitly no user store / credential UI / account mgmt** — you build those [l] | ⚠️ (server issues for many users, but you own the user store) | ✅ mounts on connect/express/fastify/hapi/koa [l] | Actively maintained, **v9.x (v9.8.x, mid-2026)**; v8 security-only [l] | MIT |
| **Auth.js / NextAuth** | ⚠️ default session = **JWE JWT in an HttpOnly cookie**; `getToken` can read `Authorization: Bearer`, but the token is an **encrypted session token**, not a standard third-party bearer [m] | ❌ consumer/RP only (no AS mode) [n] | ✅ many OAuth/OIDC providers as client [n] | ⚠️ Credentials provider exists but is deliberately limited (JWT-strategy only, you supply the check) | ✅ | ⚠️ runs on Next/SvelteKit/Qwik/Express, but **cookie-session-first** by design [m][n] | Active | ISC |
| **Ory Hydra/Kratos**, **Zitadel**, **Keycloak**, **Authentik** | ✅ (real IdPs) | ✅ full OAuth2/OIDC AS | ✅ | ✅ | ✅ | separate service (Go/Java) | Active | Apache-2.0 / MPL-2.0 etc. | **Treated only as the OPTIONAL self-hosted / OIDC-integration target — explicitly NOT the default core** (see §5). |
| **jose** (panva) | primitive: sign/verify JWT, JWS/JWE/JWK/**JWKS**, all runtimes [o] | — | — | — | — | ✅ zero-dep, tree-shakeable, Node/browser/Workers/Deno/Bun [o] | Active, **v6.x** [o] | MIT |
| **@node-rs/argon2 / argon2 / bcrypt** | password hashing primitive (pair with any of the above) | — | — | ✅ (the hash step) | — | ✅ | Active | MIT/Apache |
| **oauth4webapi** (panva) | OIDC **client** primitive (OAuth 2.1 RP, PKCE, DPoP, PAR, DCR) [p] | ❌ client only | ✅ | — | — | ✅ browser+server, zero-dep, **v3.8.x (2026-04)** [p] | — | MIT |

**Citations**
[a] Better Auth Bearer plugin — "authentication using Bearer tokens as an alternative to browser cookies … adding the Bearer token to the Authorization header"; shown with curl; cautioned as "intended only for APIs that don't support cookies". https://www.better-auth.com/docs/plugins/bearer
[b] Better Auth JWT plugin — "endpoints to retrieve a JWT token and a JWKS endpoint to verify the token"; "verified in your own service, without the need for an additional verify call or database check"; EdDSA default (ES256/RS256/PS256/… supported); obtain via `authClient.token()` / `/api/auth/token` / `set-auth-jwt` header. https://www.better-auth.com/docs/plugins/jwt
[c] Better Auth OAuth Provider plugin — "turn your authentication server into an OAuth provider with OIDC compatibility"; OAuth 2.1, auth-code + PKCE (S256), refresh via `offline_access`, client-credentials (M2M), RFC 7591 dynamic client registration, consent screens; successor to the (now-deprecating) OIDC Provider plugin. https://www.better-auth.com/docs/plugins/oauth-provider — note the older https://www.better-auth.com/docs/plugins/oidc-provider states "This plugin will soon be deprecated in favor of the OAuth Provider Plugin" and "not be suitable for production use."
[d] Better Auth Generic OAuth plugin — "flexible way to integrate authentication with any OAuth provider … OAuth 2.0 and OpenID Connect (OIDC) flows"; helpers for Auth0/Okta/Keycloak/etc.; explicitly opt-in. https://www.better-auth.com/docs/plugins/generic-oauth
[e] Better Auth email/password — built into core, enabled via `emailAndPassword.enabled: true`; "Better Auth uses `scrypt` to hash passwords … natively supported by Node.js"; customizable to Argon2. https://www.better-auth.com/docs/authentication/email-password
[f] Better Auth Organization plugin — members/teams, roles (owner/admin/member), invitations, granular permissions. https://www.better-auth.com/docs/plugins/organization
[g] Better Auth database — adapters for PostgreSQL/SQLite/MySQL/MSSQL/MongoDB and Prisma/Drizzle/Kysely; runs in serverless (Cloudflare Workers). https://www.better-auth.com/docs/concepts/database
[h] Better Auth releases — stable v1.6.10 (2026-05-09); active v2 work. https://github.com/better-auth/better-auth/releases
[i] Better Auth repo (MIT). https://github.com/better-auth/better-auth
[j] Lucia — "Lucia v3 will be deprecated by March 2025. Lucia is now a learning resource on implementing auth from scratch." https://github.com/lucia-auth/lucia and https://lucia-auth.com/
[k] Arctic — "a collection of OAuth 2.0 clients for popular providers. Only the authorization code flow is supported"; ~80+ providers; Fetch-based, runtime-agnostic; by pilcrowonpaper (Lucia author). https://arcticjs.dev/
[l] node-oidc-provider — OAuth 2.0 AS + OIDC; certified (Basic/Implicit/Hybrid, FAPI 1.0/CIBA/2.0, Device Flow, PKCE, DPoP, JWT access tokens); "mounted to existing connect, express, fastify, hapi, or koa applications"; does NOT include user stores / credential UIs / account management; v9.x actively maintained. https://github.com/panva/node-oidc-provider
[m] Auth.js/NextAuth session strategies — default JWT session stored in an HttpOnly, JWE-encrypted cookie; `getToken` reads `Authorization: Bearer`. https://authjs.dev/concepts/session-strategies and https://next-auth.js.org/configuration/options
[n] Auth.js installation — SvelteKit/Qwik/Express supported besides Next; framed entirely around consuming external providers (client/RP), not acting as an AS. https://authjs.dev/getting-started/installation
[o] jose — JWT/JWS/JWE/JWK/JWKS, zero-dep, all runtimes, v6.x. https://github.com/panva/jose
[p] oauth4webapi — low-level OAuth 2.1 / OIDC **client** (RP), PKCE/DPoP/PAR/DCR, browser+server, v3.8.6 (2026-04-27), by panva. https://github.com/panva/oauth4webapi

---

## 4. Reading of the field

- **Better Auth is the only single library that satisfies all 6 constraints without gluing several projects together.** Credential auth in core [e], bearer + JWT/JWKS for stateless sync-server verification [a][b], a real OAuth 2.1 **provider** plugin for future third-party apps [c], a generic OAuth/OIDC **client** for opt-in SSO [d], organizations/multi-user [f], and a framework-agnostic server with mainstream DB adapters [g]. Caveats: the bearer path is an opt-in plugin the docs flag for careful use [a], and the provider story is **new and moving** (the OIDC plugin is being superseded by the OAuth Provider plugin; verify plugin stability at build time) [c].
- **Lucia is out** as a dependency — it is now a *tutorial*, not a maintained library [j]. Its ecosystem lives on as **primitives**: **arctic** (OAuth client only) [k], **oslo**, and **jose** [o]. "Choosing Lucia" today means "hand-roll auth with jose + argon2 + arctic," i.e. maximal ownership but you build sessions, multi-user, and (later) an OAuth server yourself.
- **node-oidc-provider is the gold standard AS** but deliberately gives you **no user store, no login UI, no account management** [l] — it is a component, not a stack. You still need credential auth + user DB around it.
- **Auth.js is a poor fit for our constraints:** cookie-session-first, encrypted-JWT-in-cookie by default, RP-only (cannot be an OAuth provider) [m][n]. Bearer is a bolt-on and the token is an opaque encrypted session, not a clean third-party bearer.
- **Ory/Zitadel/Keycloak/Authentik** are full IdPs and satisfy constraints 2–5 easily — but they are **separate self-hosted services**, which is exactly what constraint 1 says must **not** be in the default core. They belong on the *other* side of our OIDC-client plugin (constraint 4): the optional SSO a power user points us at.
- **Primitives to keep in the toolbox regardless:** **jose** (verify JWTs on the sync server) [o], **@node-rs/argon2** (password hashing) [e], **oauth4webapi**/**arctic** (if we ever want the OIDC-client leg without Better Auth's plugin) [k][p].

---

## 5. The pivotal decision

**Do we stand up a full OAuth2 authorization server NOW, or ship simple owned token auth NOW and retrofit an OAuth provider later?**

| | **A. Full OAuth2 AS now** (Better Auth OAuth Provider plugin, or node-oidc-provider) | **B. Simple owned bearer/JWT auth now, add OAuth provider later** |
|---|---|---|
| Third-party app authZ (constraint 3) | Drops in immediately — issue tokens to third-party/mobile apps day one | Deferred; needs a later, additive migration |
| OIDC SSO opt-in (constraint 4) | Clean, standards-shaped from the start | Added later alongside the provider |
| Sync-server integration | Same JWT/JWKS either way — sync server just verifies a bearer token | Same |
| Complexity now | Higher: clients, consent, scopes, dynamic registration, token lifetimes to reason about | Lower: login → session → JWT → verify on WS upgrade |
| Rework risk | Low (already standards-based) | Moderate — but low **if** we pick a stack where the provider is an additive plugin, not a rewrite |
| Maturity risk | The Better Auth provider plugin is new/moving [c]; node-oidc-provider is mature but bring-your-own everything [l] | Minimal — bearer + JWT are stable primitives |

**Recommendation: option B, executed on a stack that makes the option-A upgrade a config/plugin flip, not a rebuild — i.e. Better Auth.**

Rationale: our *actual* near-term need (constraints 1, 2, 5, 6) is "log a user in and hand the sync server a verifiable bearer token." That is small and stable. Constraint 3 (third-party apps) has **no consumer today** — building a full AS now is speculative surface area on a plugin that is itself still stabilizing [c]. Better Auth lets us ship **email/password + JWT/JWKS + organizations** now [b][e][f], then **enable the OAuth Provider plugin** when a real third-party integration appears [c] — same server, same user store, same tokens. That collapses option B's usual "rework risk" to near zero, which is the whole reason to prefer a batteries-included framework over hand-rolled Lucia-style primitives or a bare node-oidc-provider.

**The first architectural decision that follows:** issue an **asymmetrically-signed JWT (EdDSA/ES256) with a published JWKS**, and have the **sync server verify it statelessly** with `jose` on the WebSocket upgrade [b][o] — never a shared secret, never a DB round-trip per connection. This one choice is what makes every later step (OAuth provider, SSO, multiple backend services) additive rather than a migration.

---

## 6. Recommendation, mapped to the 6 constraints

**Primary stack: Better Auth** (server) **+ its Bearer, JWT, Organization, Generic-OAuth, and (later) OAuth-Provider plugins**, with **jose** on the sync server for token verification and **@node-rs/argon2** for hashing.

| # | Constraint | How the stack meets it |
|---|---|---|
| 1 | Credential auth is default, no hosted provider | Email/password in Better Auth core, scrypt/argon2 hashing, runs entirely in our own backend [e][g] |
| 2 | Bearer, works with curl (no cookies) | Bearer plugin + JWT plugin: `Authorization: Bearer`, obtainable via `authClient.token()` / `/api/auth/token` [a][b] |
| 3 | Grows into an OAuth2 provider for third-party apps | OAuth Provider plugin = OAuth 2.1 AS (auth-code+PKCE, refresh, client-credentials, dynamic client reg, consent) — enable when needed [c] |
| 4 | Optional OIDC client for user-supplied SSO | Generic OAuth plugin, opt-in, "any OAuth 2.0 / OIDC provider" (Authentik, Google, Keycloak, …) [d] |
| 5 | Multi-user | Organization plugin: members, roles, invitations, teams [f] |
| 6 | Cooperates with Automerge sync auth | JWT + JWKS → sync server verifies statelessly on WS upgrade, maps `sub → userId`, enforces `permissions(userId, docId, role)`; matches the PRD's "middleware before the NodeWSServerAdapter handshake" [b][o] and §2 |

**Fallback (maximal ownership / minimal deps): hand-rolled auth = `jose` (JWT+JWKS) + `@node-rs/argon2` (hashing) + `arctic`/`oauth4webapi` (opt-in OIDC client), following the Lucia guide's patterns** [j][k][o][p]. Choose this only if Better Auth's provider-plugin churn or its DB-schema/opinions prove unacceptable; the cost is that you build sessions, multi-user, and (eventually) an OAuth server yourself — for the AS, mount **node-oidc-provider** rather than writing one [l]. This fallback and the primary share the **same** sync-server contract (a JWT verified via JWKS), so switching between them does not touch the sync server.

**Explicitly not in the core:** Clerk/Auth0/WorkOS/hosted-Authentik and self-hosted Ory/Zitadel/Keycloak/Authentik. The latter are only ever the *target* of constraint 4's opt-in OIDC client.

---

## 7. Open questions for the design phase

1. **Same process or separate?** Does the Automerge sync server (`apps/sync/`) run the auth server in-process, or is auth a separate service the sync server only *verifies* tokens from? JWKS-based verification (§5) makes "separate service" cheap and is the more future-proof default — confirm.
2. **Token lifetimes & refresh.** Access-token TTL vs. long-lived WebSocket connections: does the sync server re-check token expiry on a live socket, or only at upgrade? Define refresh-token flow for long-lived mobile/offline sessions.
3. **Permissions model granularity.** The PRD's `permissions(userId, docId, role)` — is access per-root-doc (a user owns one root) or truly per-trip-doc (needed for the "share a single trip URL" story in the PRD)? This decides whether the sync server checks the root doc or each trip doc.
4. **Device-pairing UX replacement.** Today = paste root doc URL. With accounts, pairing becomes "log in on device 2 → server returns the user's root doc URL." Confirm the server-side `userId → rootDocUrl` mapping (the PRD lists this as intentionally deferred to the auth phase) and the login-based recovery of a lost root doc URL.
5. **`sharePolicy` vs. real gating.** Since `sharePolicy` cannot stop explicit `DocumentId` requests (§2), confirm the enforcement point is the authenticated WS upgrade + permissions check, and treat `sharePolicy` only as a bandwidth/announcement optimization.
6. **Better Auth provider-plugin stability.** Before committing to constraint 3 on Better Auth, re-verify the OAuth Provider plugin's production status at build time (it superseded the OIDC plugin recently) [c]; if not ready, keep option B and mount node-oidc-provider for the AS leg [l].
7. **localfirst/auth?** Decide whether the future "share a trip with another *user*" story wants capability/invitation-based E2E auth (`@localfirst/auth-provider-automerge-repo`) layered on top, or whether server-side `permissions` is sufficient. These can coexist but answer up front.

---

### Sources (primary)
- Automerge: [automerge-repo README](https://github.com/automerge/automerge-repo) · [packages README (sharePolicy), raw](https://raw.githubusercontent.com/automerge/automerge-repo/main/packages/automerge-repo/README.md) · [RepoConfig TypeDoc](https://automerge.org/automerge-repo/interfaces/_automerge_automerge-repo.RepoConfig.html) · [sync-server README](https://github.com/automerge/automerge-repo-sync-server) · [@localfirst/auth-provider-automerge-repo](https://www.npmjs.com/package/@localfirst/auth-provider-automerge-repo)
- Better Auth: [bearer](https://www.better-auth.com/docs/plugins/bearer) · [jwt](https://www.better-auth.com/docs/plugins/jwt) · [oauth-provider](https://www.better-auth.com/docs/plugins/oauth-provider) · [oidc-provider (deprecating)](https://www.better-auth.com/docs/plugins/oidc-provider) · [generic-oauth](https://www.better-auth.com/docs/plugins/generic-oauth) · [email-password](https://www.better-auth.com/docs/authentication/email-password) · [organization](https://www.better-auth.com/docs/plugins/organization) · [database](https://www.better-auth.com/docs/concepts/database) · [releases](https://github.com/better-auth/better-auth/releases)
- Lucia/ecosystem: [lucia repo](https://github.com/lucia-auth/lucia) · [lucia-auth.com](https://lucia-auth.com/) · [Arctic](https://arcticjs.dev/)
- Panva primitives: [node-oidc-provider](https://github.com/panva/node-oidc-provider) · [jose](https://github.com/panva/jose) · [oauth4webapi](https://github.com/panva/oauth4webapi)
- Auth.js: [session-strategies](https://authjs.dev/concepts/session-strategies) · [installation](https://authjs.dev/getting-started/installation)
- Repo internal: `Plans/PRDs/Sync-Engine - Automerge.md`
