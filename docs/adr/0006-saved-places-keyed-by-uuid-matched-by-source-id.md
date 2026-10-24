---
status: proposed
---

# Saved places are keyed by uuid and matched to their source by a source id

Every saved place is keyed by a uuid, airports included. A saved place that came from a place source records which entry it came from as a `sourceId` qualified by its source: `iata:BER`, `osm:N123456`. The airport's code stays on the airport as data. A pick resolves in one order for every place type:

1. take the saved places,
2. drop the archived ones,
3. let what remains override the source's candidates with the same `sourceId`.

Materialising a candidate that no active saved place matches creates a new saved place, so archiving a place retires that copy and never hides the source entry behind it. The archived copy stays with the trip items that already link it.

This reverses the asymmetric keying of #37, where an airport was keyed by its IATA code so that "at most one saved airport per code" could not be violated by construction. That key made an archived airport and its source entry the same thing: archiving a customised BER hid the dictionary's BER as well, and picking BER again could only bring back the archived copy. Each place type needed its own rule there; with uuid keys, airports, accommodation sites and any later source (a train station list, a geocoder) behave the same.

The invariant becomes "at most one active saved place per `sourceId`", held by the pick order above instead of by the key. Two devices that both materialise the same entry offline can briefly hold two active copies. That is accepted: one traveller rarely edits from two devices at the same time.

## Considered Options

- **Keep IATA keys, and on a pick overwrite the archived airport with the source's data and restore it.** It drops the customisation and rewrites trips already taken, and it is a rule for airports alone.
- **Version saved places**, keeping old versions for the trip items that link them. A new copy under a new uuid already is a version; a version field adds nothing.

## Consequences

`FlightPoint.placeKey` holds a uuid, so a flight reads its airport's code through the lookup, as a stay already reads its site, and a dangling link reads `Unknown place`. A saved place typed in by hand with no source entry behind it has no `sourceId`, is never matched, and stays hidden once archived. Local documents made under IATA keys are not migrated.
