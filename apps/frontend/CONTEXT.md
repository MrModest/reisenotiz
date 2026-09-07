# Travel Planning

What a traveller plans and records: trips, the things that happen during them, and the details worth saving for next time.

## Language

### Trips

**Trip**:
A single journey with a name, a description and a start and end date. The top-level thing a user creates.
_Avoid_: Journey, vacation, holiday

**Trip Item**:
Something that happens during a trip — a flight, a stay, a transfer, a point of interest. Every item belongs to exactly one trip and has a type.
_Avoid_: Event, entry, booking, activity

**Timeline Element**:
One dated marker on a trip's timeline, derived from a trip item for display. Most trip items produce two — a flight yields a departure and an arrival, a stay yields a check-in and a check-out — and a POI produces one. Every element of a trip item leads back to that same item.
_Avoid_: Timeline item, timeline event, timeline row

**Timeline Day**:
One day of a trip, holding the timeline elements that fall on it. A trip has as many days as one fixed clock passes through, so moving between timezones never adds or removes a day.
_Avoid_: Day group, timeline section

### Trip item types

**Flight**:
A trip item for one flight segment, with a departure and an arrival.
_Avoid_: Leg, segment

**Accommodation**:
A trip item for one stay: which site, which rooms, how many guests, and over what interval.
_Avoid_: Hotel, booking, reservation, lodging

**Accommodation Site**:
The physical place a stay happens at — its name, kind, address and timezone. Distinct from the Accommodation, which is one traveller's stay at it. The same site can be stayed at on many trips.
_Avoid_: Hotel, venue, property

**POI**:
A trip item for a place the traveller intends to visit that is neither transport nor a stay.
_Avoid_: Attraction, sight, activity

**Long Transfer**, **Public Transport**:
Trip items for movement between places — the former between cities or regions, the latter within one.
_Avoid_: Transit, transportation

### Details

**Stay Interval**:
The check-in and check-out pair for an accommodation. An accommodation carries a *provided* interval (what the booking says) and optionally a *planned* one (what the traveller intends); the planned interval wins for display when present.

**Flight Point**:
One end of a flight — the airport, the time, and optionally terminal and gate.
_Avoid_: Endpoint, stop

**Airport**:
An airport identified by its code, with a name, address and timezone.

**Person**:
A named human with contacts, used as a flight passenger. Not an account or a user of the app.
_Avoid_: User, traveller, guest, passenger

**Attachment**:
A link and a name hung off a trip item — a boarding pass, a booking confirmation.
_Avoid_: Document, file

**Zoned Instant**:
A moment in time together with the timezone it should be read in. Travel crosses timezones, so a bare timestamp is never sufficient.
_Avoid_: Timestamp, datetime

### Saved records

**User Record**:
Something the user has saved for reuse across trips — currently airports and accommodation sites. Distinct from trip data: deleting a trip never removes user records.
_Avoid_: Favourite, saved item, dictionary
