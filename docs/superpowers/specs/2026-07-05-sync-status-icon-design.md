# Design: Sync Status Icon in Header

## Context

The Automerge sync backend (see `plans/sync-engine-automerge.md`, Phase 6 "Connection status UI") is live and cross-device sync works, but there is no visual feedback in the app about whether sync is connected, actively syncing, offline, or failing. This closes that gap with a small icon in the main header.

## Scope

One new hook + one new component, wired into the existing header. No changes to sync mechanics themselves.

## Visibility

The icon renders only when sync is configured (`VITE_SYNC_SERVER_URL` set at build time). When unset, the app is local-only by design and the icon is not rendered at all — matches the existing Phase 3/4 behavior of degrading gracefully with no sync server.

## States

Four states, each mapped to an existing `Icon` name (new entries added to `IconName`) and a color, in this precedence order (highest wins when multiple conditions are true simultaneously):

| State | Icon (lucide) | Color | Trigger |
|---|---|---|---|
| `error` | `circle-x` | `text-destructive` | `repo` emitted `unavailable-document` within the last 5s |
| `offline` | `circle-alert` | amber (`text-amber-600/70` light, adjust for dark) | zero peers currently connected on `repo.networkSubsystem` |
| `syncing` | `refresh-cw` (spinning) | `text-muted-foreground` | at least one peer connected AND a sync message was seen on `networkSubsystem` within the last 800ms |
| `synced` | `circle-check` | green (`text-green-600/70`, consistent with existing usage in `item-form.tsx`) | at least one peer connected, idle (no message in the last 800ms) |

The icon is always shown (one of the four above) whenever sync is configured — there is no "hidden while idle" mode. This gives constant positive confirmation that sync is alive, matching the original Phase 6 acceptance criteria (distinguish online-and-synced / online-syncing / offline).

## Data flow — `useSyncStatus()`

New hook, colocated with the other sync context files (`src/contexts/use-sync-status.ts`):

- Returns `SyncStatus | null` where `SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'`. Returns `null` when sync isn't configured (checked via an `isSyncEnabled` boolean exported from `sync-repo.ts`, derived from the same `VITE_SYNC_SERVER_URL` check already used to decide whether to construct a `WebSocketClientAdapter`).
- Reads `repo` via `useRepo()`.
- Maintains local state via `useEffect` subscriptions:
  - `repo.networkSubsystem.on('peer', ...)` / `on('peer-disconnected', ...)` maintain a `Set<PeerId>`; peer count > 0 ⇒ connected.
  - `repo.networkSubsystem.on('message', ...)` marks `syncing`, clearing after a debounced 800ms timeout back to `synced`/`offline` based on connection state.
  - `repo.on('unavailable-document', ...)` marks `error`, clearing after a 5s timeout back to the current connection-derived state.
- Cleans up all listeners and pending timers on unmount.

## Component — `<SyncStatusIcon>`

New component in `src/components/layout/sync-status-icon.tsx`:
- Calls `useSyncStatus()`; renders `null` if the result is `null`.
- Renders the `Icon` for the current state with the color above, wrapped in an element with a `title` attribute naming the state (e.g. `title="Synced"`, `title="Syncing…"`, `title="Offline"`, `title="Sync error"`) for a plain-HTML tooltip — no new tooltip component needed.
- The `refresh-cw` icon gets `animate-spin` while in the `syncing` state.

## Wiring

`header.tsx` renders `<SyncStatusIcon />` in the right-hand action row, to the left of the existing per-page `actions` buttons.

## New icon names

Add to `IconName` in `src/components/icon/index.tsx`: `circle-x` (maps to lucide `circle-x`), `refresh-cw` (maps to lucide `refresh-cw`). (`circle-check` and `circle-alert` already exist as `check-circle` and `circle-alert`.)

## Testing

- Unit test for `useSyncStatus()`: use an in-memory `Repo` with a fake network adapter (or the real `MessageChannelNetworkAdapter` pattern already used in `trips-sync.test.tsx`) to simulate peer connect/disconnect, message events, and `unavailable-document`, asserting the returned state transitions (including the syncing→synced debounce and error→cleared timeout, using vitest fake timers).
- No test needed for the purely-presentational `<SyncStatusIcon>` beyond what the hook test already covers; existing lint/typecheck covers the `Icon` switch exhaustiveness.

## Out of scope

- Any indicator inside the settings page beyond what already exists (the "Sync Document ID" field).
- Retrying or exposing manual "reconnect" controls — `WebSocketClientAdapter` already auto-reconnects.
- Distinguishing *which* document is unavailable — the icon is a single global indicator, not per-document.
