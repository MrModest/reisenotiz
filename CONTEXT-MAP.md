# Context Map

## Contexts

- [Travel Planning](./apps/frontend/CONTEXT.md): the trips, trip items and saved records a traveller works with
- [Sync](./apps/sync/CONTEXT.md): relaying and storing document changes between a user's devices

## Relationships

- **Travel Planning → Sync**: Travel Planning owns every domain term. Sync knows none of them — it moves opaque documents and never learns what a Trip is. See [ADR-0003](./docs/adr/0003-sync-server-holds-no-domain-knowledge.md).
- The only vocabulary the two share is Automerge's own: document, change, chunk.
