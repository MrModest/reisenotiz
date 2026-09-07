# The sync server holds no domain knowledge

`apps/sync/` stores and relays opaque Automerge chunks and never imports `Trip`, `TripItem` or any other domain type. It is a generic Automerge relay that happens to serve this app.

This is deliberate and load-bearing: it keeps domain evolution entirely client-side, so a change to the trip model needs no server deploy. Adding domain awareness to the server — validation, projections, filtering — would reverse it, so don't, even when it looks convenient.
