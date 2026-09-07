# Automerge CRDT for multi-device sync

Trips must be editable offline on several devices and converge without the user resolving conflicts. We use Automerge CRDT documents synced over WebSocket instead of a REST API with server-side conflict resolution (Kinto was the original candidate on the roadmap).

## Consequences

Conflict resolution is Automerge's, not ours — never write custom merge logic. The cost is that the document shape is now a wire and storage format: changing it is a migration, not a refactor.
