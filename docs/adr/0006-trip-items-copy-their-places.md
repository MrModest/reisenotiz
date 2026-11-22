# Trip items copy their places, and saved places are templates

A trip item holds a full copy of each place it uses: `FlightPoint.place`, `Accommodation.place`. Saved places live in one `savedPlaces` collection in the root document and exist only to suggest and autofill places in trip item forms. Nothing in a trip refers to them. This replaces ADR 0005.

Under ADR 0005 a trip item linked to a saved place by key. That forced a lot of machinery onto every place: a link could dangle, so views needed an `Unknown place` fallback; a place in use could not be deleted, so the store counted usage across every trip file it had loaded and offered archiving instead; and a trip document was not self-contained, which would block sharing a single trip. Copying removes all of it. The cost is the case ADR 0005 was written for: correcting a saved place no longer corrects the trips that already use it. That is accepted, and past trips now keep what was true when they were planned.

Every place has one `id` that says where it came from. A place from a provider keeps the provider's id, such as `iata:BER` from the airport dictionary. A place typed in by hand gets `custom:<uuid>`. Two places with different ids are different places, even when they describe the same airport. A single id replaced a uuid key plus a separate `sourceId`, because the two always answered the same question.

Only custom places are saved. A provider already offers its own places, so a saved copy of one would only duplicate it. Saving happens automatically: when a trip item is saved, each custom place it holds is written to `savedPlaces` under its id, overwriting what is there. A deleted saved place is therefore written back the next time an item holding its copy is saved. That was accepted rather than adding tombstones.

A single place provider supplies places from outside sources and hides which source answered. Today it wraps the airport CSV dictionary. Photon, for accommodation sites, will be another source behind the same interface, which is why the interface is async. The selector shows saved places and provider results in one list, ranked together, with saved places marked. Duplicates between the two are not removed.

## Consequences

A trip item can always be rendered from its own document. Saved places are one map keyed by id and carry their own `type`, so adding a place type is a new entry in the type registries, not a new map. Stored places from before this decision are not migrated; the data was wiped.
