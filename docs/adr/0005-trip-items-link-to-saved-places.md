# Trip items link to saved places, they do not copy them

A trip item refers to a place by key — `FlightPoint.placeKey`, `Accommodation.placeKey` — and the place itself lives once, in the root document's `savedAirports` or `savedAccommodationSites`. Correcting a hotel's address corrects every trip that uses it.

Copying the place into the item, so each trip keeps the place as it was, was rejected: the common case is a correction, and the rare case is wanting a trip to show what was true at the time. Rewriting history on trips already taken is the accepted cost — this is a planner, not an archive.

Every place a trip item refers to is a saved place, airports from the bundled dictionary included: picking one writes it into `savedAirports` first, and the flight links to that. So a link never points at the CSV cached in `localStorage`, which can be empty on a first offline load and changes whenever a new dictionary ships, nor at a remote geocoder. A search source produces candidates to materialise; it is never something trip data depends on.

That is also what makes the cross-document reference safe. ADR 0004 puts saved places in the root document and trip items in per-trip documents, and `tripIndex` sits in the root document too — so a device that can reach a trip necessarily holds the document its places are in.

A saved place nothing refers to is deleted outright; one that is referred to can only be archived, hidden from the pickers but still resolving where it is used. The rule cannot be enforced: two devices can concurrently delete a place and refer to it, and both writes are legal.

ADR 0001 looks like it forbids adding a place from inside a half-filled trip item form. It does not — the draft item stays in form state, and what gets written is a complete, valid saved place, which is its own entity rather than part of the draft.

## Consequences

Reading a trip item's place is a lookup rather than a field access, so code that resolves a link renders a placeholder instead of assuming the place exists — the obligation ADR 0004 already states for documents. A function that needs places and is not a component takes them as an argument rather than reaching for a store. Abandoning a trip item form leaves any place added from it saved; nothing refers to it, so it can be deleted.
