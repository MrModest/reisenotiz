# Roadmap

Planned features and improvements. Priorities and scope may change.

## Shipped

- [x] Multi-device sync — Automerge CRDT over a WebSocket sync server (`apps/sync/`), offline-first with IndexedDB locally. See `plans/archived/Sync-Engine-Automerge.md`.
- [x] Backend with persistent storage — `apps/sync/`, SQLite by default and Postgres opt-in.

## Planned

- [ ] Train / bus / car trip items
- [ ] Export trip data to a JSON file
- [ ] User authentication ([better-auth](https://github.com/better-auth/better-auth)?) — see `docs/research/auth-stack-library-first.md`
- [ ] Document storage (boarding passes, booking confirmations)
- [ ] Trip sharing and collaboration
- [ ] Calendar export (iCal)
- [ ] Map view for trip itineraries
- [ ] Budget tracking per trip
- [ ] Auto-filling flights based on public API
- [ ] Auto-filling accommodation sites based on Map API (Photon?)
- [ ] Import from booking emails or PDFs
- [ ] Multi-language support (i18n)
