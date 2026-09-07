# Sync

Relays Automerge document changes between a user's devices and stores them durably. Deliberately domain-free: see [ADR-0003](../../docs/adr/0003-sync-server-holds-no-domain-knowledge.md).

## Language

**Document**:
An Automerge document, identified by a URL. To this context a document is opaque — the server never inspects or interprets its contents.
_Avoid_: Doc, record, entity

**Chunk**:
A stored binary piece of a document — a snapshot or an incremental change. The unit this context actually persists.
_Avoid_: Blob, patch, delta

**Storage Key**:
The address a chunk is stored under, shaped `docId/chunkType[/chunkId]`. Range reads use its prefix, which is why the shape is fixed rather than opaque.

**Storage Adapter**:
An implementation of chunk persistence for one backend. SQLite is the default; Postgres is opt-in.
_Avoid_: Driver, backend, store

> There is deliberately no entry here for Trip, Trip Item, or any other travel term. If you find yourself wanting to add one, you are about to violate ADR-0003.
