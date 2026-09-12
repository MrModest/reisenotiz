# One root document per user, one document per trip

Each user has a `RootDoc` (a `tripIndex` of trip URLs, plus `savedAirports` and `savedAccommodationSites`), and each trip is a separate `TripDoc` holding the trip and its items. The root document's URL is persisted in `localStorage`; trip URLs are discovered through the index rather than stored individually.

The alternative — one document holding everything — was rejected because every device would sync every trip's full history on first load. Per-trip documents keep sync incremental and make future per-trip sharing possible.

## Consequences

A trip is reachable only through the root index. Code that loses or fails to load a document must degrade gracefully rather than assume the doc exists.
