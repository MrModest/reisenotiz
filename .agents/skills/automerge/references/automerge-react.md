# Automerge React — Extended Reference

Source: https://automerge.org/llms-full.txt (fetched 2026-05-01)

---

## Table of Contents

1. [Setup & Repo initialization](#setup)
2. [Hooks in depth](#hooks)
3. [Mutation patterns](#mutations)
4. [Collaborative text](#text)
5. [Network adapters](#network)
6. [Persistence (IndexedDB)](#persistence)
7. [Testing patterns](#testing)
8. [Document granularity and root doc pattern](#granularity)
9. [Migration v2 → v3](#migration)
10. [Full gotcha list](#gotchas)

---

## Setup {#setup}

```bash
pnpm add @automerge/automerge-repo @automerge/react
```

```tsx
import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { RepoContext } from "@automerge/react";

const repo = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
  storage: new IndexedDBStorageAdapter(),
});

function Root() {
  return (
    <RepoContext.Provider value={repo}>
      <App />
    </RepoContext.Provider>
  );
}
```

---

## Hooks in Depth {#hooks}

### `useDocument<T>(url, options?)`

```tsx
const [doc, changeDoc] = useDocument<MyType>(url);
```

- Returns `[undefined, changeDoc]` while loading.
- `{ suspense: true }` — component suspends until loaded (use `<Suspense>` boundary above).
- `doc` is a readonly frozen snapshot — do not mutate it directly.
- `changeDoc` queues a change; the next render gets the updated snapshot.

### `useHandle<T>(url)`

Lower-level. Returns the `DocHandle<T>` directly. Useful when you need to listen to events or pass handles between components without re-rendering on every change.

```tsx
const handle = useHandle<MyType>(url);
handle.on("change", ({ doc }) => { /* ... */ });
```

### `useRepo()`

```tsx
const repo = useRepo();

// Create a new document
const handle = repo.create<MyType>({ title: "", items: [] });
console.log(handle.url); // automerge:<base58>

// Find an existing document
const existing = repo.find<MyType>(url);
```

---

## Mutation Patterns {#mutations}

### Always mutate inside `changeDoc`

```tsx
// Add item
changeDoc((d) => {
  d.items.push({ id: uuid(), text: "", done: false });
});

// Toggle
changeDoc((d) => {
  d.items[i].done = !d.items[i].done;
});

// Delete
changeDoc((d) => {
  d.items.splice(i, 1);
});

// Update nested field
changeDoc((d) => {
  d.metadata.updatedAt = Date.now();
});
```

### Anti-patterns (cause merge loss)

```tsx
// BAD: returning a new object
changeDoc((d) => ({ ...d, title: "New" }));

// BAD: replacing array
changeDoc((d) => {
  d.items = d.items.filter((_, idx) => idx !== i);
  // splice is correct, filter-replace is not
});
```

---

## Collaborative Text {#text}

`updateText` applies a diff-based edit script. Required for any text the user types character-by-character.

```tsx
import { updateText } from "@automerge/react";

// In a textarea onChange
changeDoc((d) => {
  updateText(d, ["body"], e.target.value);
});

// Nested path
changeDoc((d) => {
  updateText(d, ["sections", sectionIdx, "content"], newValue);
});
```

`Automerge.splice` for lower-level control:
```ts
import * as A from "@automerge/automerge";

changeDoc((d) => {
  A.splice(d, ["body"], cursorPos, deleteCount, insertText);
});
```

---

## Network Adapters {#network}

### Same-origin multi-tab sync

```ts
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
const repo = new Repo({ network: [new BroadcastChannelNetworkAdapter()] });
```

### Cross-device via WebSocket

```ts
import { WebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
const repo = new Repo({
  network: [
    new BroadcastChannelNetworkAdapter(),          // same-origin tabs
    new WebSocketClientAdapter("wss://my-server"), // remote peers
  ],
});
```

Multiple adapters are independent — all receive the same changes with no prioritization.

---

## Persistence (IndexedDB) {#persistence}

```ts
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
const repo = new Repo({ storage: new IndexedDBStorageAdapter() });
```

Documents survive page reload. The sync server can also persist via its own storage adapter.

**Root document pattern** — the "entry point" document URL stored in `localStorage`:

```ts
const rootUrl = localStorage.getItem("rootDocUrl");
let handle;
if (rootUrl) {
  handle = repo.find(rootUrl);
} else {
  handle = repo.create({ trips: [] });
  localStorage.setItem("rootDocUrl", handle.url);
}
```

Losing this `localStorage` key means losing access to associated docs, though the documents themselves remain in IndexedDB.

---

## Testing Patterns {#testing}

### Required vitest config — WASM support

Automerge ships a WASM binary. Without these plugins the module fails to load in jsdom:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [wasm(), topLevelAwait(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

```ts
// vitest.setup.ts — React 19 act() flushing
declare global { var IS_REACT_ACT_ENVIRONMENT: boolean }
globalThis.IS_REACT_ACT_ENVIRONMENT = true
export {}
```

### Unit tests — in-memory Repo

```ts
import { Repo } from "@automerge/automerge-repo";
import { render } from "@testing-library/react";
import { RepoContext } from "@automerge/react";

function wrapper({ children }) {
  // No storage adapter — IndexedDB not available in jsdom
  const repo = new Repo({ network: [] });
  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}

test("adds an item", async () => {
  const repo = new Repo({ network: [], storage: [] });
  const handle = repo.create<MyDoc>({ items: [] });

  const { getByRole } = render(
    <RepoContext.Provider value={repo}>
      <MyComponent docUrl={handle.url} />
    </RepoContext.Provider>
  );

  // interact and assert
  await userEvent.click(getByRole("button", { name: /add/i }));
  const doc = await handle.doc();
  expect(doc.items).toHaveLength(1);
});
```

### Multi-peer sync test

```ts
import { MessageChannelNetworkAdapter } from "@automerge/automerge-repo-network-messagechannel";

test("syncs between two peers", async () => {
  const { port1, port2 } = new MessageChannel();

  const repo1 = new Repo({
    network: [new MessageChannelNetworkAdapter(port1)],
    storage: [],
  });
  const repo2 = new Repo({
    network: [new MessageChannelNetworkAdapter(port2)],
    storage: [],
  });

  const handle1 = repo1.create<{ count: number }>({ count: 0 });
  const handle2 = repo2.find<{ count: number }>(handle1.url);

  handle1.change((d) => { d.count = 42; });

  // wait for sync
  await new Promise((r) => setTimeout(r, 50));

  const doc2 = await handle2.doc();
  expect(doc2.count).toBe(42);
});
```

### Offline scenario

```ts
test("merges offline edits on reconnect", async () => {
  const { port1, port2 } = new MessageChannel();
  const adapter1 = new MessageChannelNetworkAdapter(port1);
  const adapter2 = new MessageChannelNetworkAdapter(port2);

  // connect
  const repo1 = new Repo({ network: [adapter1], storage: [] });
  const repo2 = new Repo({ network: [adapter2], storage: [] });
  const handle1 = repo1.create<{ a: number; b: number }>({ a: 0, b: 0 });
  const handle2 = repo2.find(handle1.url);

  await new Promise((r) => setTimeout(r, 20)); // initial sync

  // disconnect
  port1.close();
  port2.close();

  // offline edits
  handle1.change((d) => { d.a = 1; });
  handle2.change((d) => { d.b = 2; });

  // reconnect with fresh channel
  const { port3, port4 } = new MessageChannel();
  repo1.networkSubsystem.addNetworkAdapter(new MessageChannelNetworkAdapter(port3));
  repo2.networkSubsystem.addNetworkAdapter(new MessageChannelNetworkAdapter(port4));

  await new Promise((r) => setTimeout(r, 50));

  const merged = await handle1.doc();
  expect(merged.a).toBe(1);
  expect(merged.b).toBe(2); // both edits survive
});
```

### What NOT to do in tests

- Don't mock `useDocument` or `useRepo` — test against real Automerge behavior.
- Don't assert on internal CRDT structures — assert on the `doc` snapshot.
- Don't skip `await handle.doc()` — the change is async.

---

## Document Granularity and Root Doc Pattern {#granularity}

**Fine-grained**: one doc per entity (e.g., one doc per trip). Enables selective sync but increases overhead.

**Coarse-grained**: one large doc. Simple, but full doc loads on every peer.

**Root doc pattern** (used by PushPin, good for this project):
- One root doc holds references (URLs) to child docs.
- Root doc URL stored in `localStorage`.
- Child docs load lazily via `repo.find(url)`.

```ts
// Root doc shape
type RootDoc = {
  tripUrls: string[];
};

// Child doc shape
type TripDoc = {
  title: string;
  entries: Entry[];
};
```

---

## Migration v2 → v3 {#migration}

| v2 | v3 |
|----|----|
| `import { Text } from "@automerge/automerge"` | Removed. All strings are `string`. |
| `new Automerge.Text("hello")` | Just `"hello"` |
| `import { next as A } from "@automerge/automerge"` | `import * as A from "@automerge/automerge"` |
| `A.updateText(doc, path, value)` | `updateText` from `@automerge/react` OR `A.splice` |

---

## Full Gotcha List {#gotchas}

1. **Mutations outside `changeDoc` are invisible** — no sync, no re-render.
2. **`useDocument` returns `undefined` while loading** — always guard or use `suspense`.
3. **Independent schema init = incompatible docs** — share initial state or hard-code init bytes.
4. **`Text` class gone in v3** — use `string` + `updateText`.
5. **Array spread/replace kills merge ops** — use `push`, `splice`, indexed assignment.
6. **Root doc URL in `localStorage` is the access key** — back it up.
7. **Full history, no GC** — memory grows proportional to edit count.
8. **Multiple network adapters have no priority** — both get all changes.
9. **Thousands of fine-grained docs = sync overhead** — consolidate if needed.
10. **Concurrent edits auto-merge** — no conflict resolution needed, but understand the last-write-wins semantics for object properties vs. append-semantics for arrays.
