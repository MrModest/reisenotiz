---
name: automerge
description: Fresh Automerge knowledge for this project — React hooks (useDocument, useRepo, RepoContext), mutation semantics, updateText for collaborative text, testing patterns, and common gotchas. Use this skill whenever the user is writing, debugging, or reviewing Automerge code, asks how to sync data with Automerge, mentions useDocument/useRepo/changeDoc, is working on the sync engine, asks about CRDT behavior, or is writing tests for Automerge-backed stores. Always load this skill when touching apps/frontend/src/store/automerge/ or apps/frontend/src/contexts/sync*.
---

# Automerge Knowledge Reference

Read `references/automerge-react.md` for full detail. Below is the critical-path summary.

---

## Core React Hooks

### `useDocument<T>(docUrl, options?)`
Primary hook. Returns `[doc, changeDoc]` — reactive snapshot + mutation function.
```tsx
const [doc, changeDoc] = useDocument<TaskList>(docUrl, { suspense: true });
```
- `doc` is `undefined` until loaded. With `suspense: true`, component suspends instead.
- `changeDoc` callback receives a mutable draft — mutations inside it are the ONLY valid way to write.

### `useRepo()`
Returns the `Repo` instance from context. Use to create/find/delete documents imperatively.
```tsx
const repo = useRepo();
const handle = repo.create<MyType>({ ...initialData });
```

### `RepoContext`
Wrap your app tree once. All `useDocument`/`useRepo` calls inside read from it.
```tsx
<RepoContext.Provider value={repo}>
  <App />
</RepoContext.Provider>
```

---

## Mutation Semantics — the #1 gotcha

Automerge tracks *operations*, not snapshots. You MUST mutate in-place inside `changeDoc`. Never spread or replace.

```tsx
// CORRECT — targeted mutation, records the operation
changeDoc((d) => {
  d.tasks[i].done = !d.tasks[i].done;
});

// WRONG — replaces the entire array, destroys merge history
changeDoc((d) => ({
  ...d,
  tasks: d.tasks.map((t, idx) => idx === i ? { ...t, done: !t.done } : t),
}));
```

Any mutation outside `changeDoc` is invisible to Automerge and will not sync.

---

## Collaborative Text — `updateText`

Direct string assignment replaces the whole string (poor merge). Use `updateText` for any user-editable text:

```tsx
import { updateText } from "@automerge/react";

changeDoc((d) => {
  updateText(d, ["notes", "body"], e.target.value);
});
```

`updateText` diffs the old and new strings and emits minimal splice operations, enabling proper multi-user merge.

Automerge v3+: no `Text` class — all collaborative strings are plain `string`. Use `updateText` or `Automerge.splice`.

---

## Testing Patterns

See `references/automerge-react.md#testing` for full patterns.

Key principles:
- **No mocks for Automerge itself** — use a real in-memory `Repo` with `new Repo({ network: [] })` (no storage adapter either — IndexedDB unavailable in jsdom).
- **Wrap test components** in `<RepoContext.Provider value={repo}>`.
- **Create documents** via `repo.create(initialData)` before the hook renders, pass the URL to hooks.
- **Multi-peer tests**: instantiate two `Repo` objects, connect via `MessageChannelNetworkAdapter`.
- **Offline scenarios**: disconnect the adapter, mutate, reconnect — verify sync after.
- **Assert on doc snapshots** not on internal CRDT state: `handle.doc()` synchronously after a change.

### Critical vitest setup (blockers if missing)

**`vite-plugin-wasm` + `vite-plugin-top-level-await`** — Automerge ships a WASM binary. Without these plugins the module fails to load in jsdom:
```ts
// vitest.config.ts
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
export default defineConfig({
  plugins: [wasm(), topLevelAwait(), react()],
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'] },
})
```

**`IS_REACT_ACT_ENVIRONMENT`** — React 19 requires this so `act()` flushes effects:
```ts
// vitest.setup.ts
globalThis.IS_REACT_ACT_ENVIRONMENT = true
```

**`await act()`** — every mutation must be wrapped; `useDocument` uses `useSyncExternalStore` so changes schedule async re-renders:
```tsx
await act(async () => {
  result.current.addItem({ title: 'foo' })
})
// now result.current reflects updated state
```

**Reading raw doc state** — access the document directly from the repo's handle map to assert on CRDT structure independent of hook state:
```ts
import { interpretAsDocumentId } from '@automerge/react'
const handle = repo.handles[interpretAsDocumentId(url)]
const doc = handle.doc() // synchronous after change applied
```

---

## Key Gotchas (quick-reference)

| # | Gotcha | Fix |
|---|--------|-----|
| 1 | Immutability semantics inverted | Always mutate inside `changeDoc` |
| 2 | `useDocument` returns `undefined` until loaded | Guard with `if (!doc) return null` or use `suspense: true` |
| 3 | Schema init on two devices = incompatible docs | Sync or share initial state before independent writes |
| 4 | `Text` class removed in v3 | Use plain `string` + `updateText`/`Automerge.splice` |
| 5 | Array spread kills merge | Use `push`, `unshift`, or indexed assignment |
| 6 | Root doc stored in `localStorage` | Losing the key = losing access (docs still in IndexedDB) |
| 7 | Full history retained, no GC yet | Monitor memory on high-edit-count docs |
| 8 | Multiple adapters are independent | No prioritization — both receive all changes |
| 9 | Fine-grained docs = overhead | Consolidate if sync overhead grows |
| 10 | Merge is automatic, no conflicts | Trust the CRDT; no manual conflict resolution needed |
| 11 | Automerge WASM breaks vitest without plugins | Add `vite-plugin-wasm` + `vite-plugin-top-level-await` to vitest config |
| 12 | React 19 `act()` doesn't flush without flag | Set `globalThis.IS_REACT_ACT_ENVIRONMENT = true` in vitest.setup.ts |

---

Read `references/automerge-react.md` for extended examples, network adapters, and persistence setup.
