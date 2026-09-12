# Travel Planning

What a traveller plans and records: trips, the things that happen during them, and the details worth saving for next time.

## Language

### Trips

**Trip**:
A single journey with a name, a description and a start and end date. The top-level thing a user creates.
_Avoid_: Journey, vacation, holiday

**Trip Status**:
Where a trip sits relative to now — *upcoming*, *ongoing* or *completed*. Derived from the trip's start and end dates, never stored, so a trip changes status on its own as time passes.
_Avoid_: Draft, published, state, phase

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
A trip item for one stay: which site, which rooms, who is staying, and over what interval.
_Avoid_: Hotel, booking, reservation, lodging

**POI**:
A trip item for a place the traveller intends to visit that is neither transport nor a stay.
_Avoid_: Attraction, sight, activity

**Long Transfer**:
A trip item for a movement the traveller is committed to: a ticket for a named service leaving at a fixed time, lost if missed. Its kind is a train, a bus, a ferry or a shuttle — a shuttle being a booked door-to-door leg where the operator, not the traveller, chooses the vehicle.
_Avoid_: Transit, transportation, intercity

**Local Ride**:
A trip item for a movement the traveller is not committed to — a city bus, a metro hop, a taxi, a rented bike, a walk. Ad-hoc by nature, so it records roughly where it starts and ends and roughly when, and describes the movement itself in free text.
_Avoid_: Public transport, transit, commute, leg

The line between the two is commitment, not distance. A regional train boarded on a travel pass is a Local Ride; a booked express on the same route is a Long Transfer.

### Details

**Stay Interval**:
The check-in and check-out pair for an accommodation. An accommodation carries a *provided* interval (what the booking says) and optionally a *planned* one (what the traveller intends); the planned interval wins for display when present. The planned interval lies within the provided one: arriving a day after check-in is allowed and wastes a paid night, but arriving before check-in opens or leaving after check-out is not a stay the booking covers.

**Flight Point**:
One end of a flight — the airport, the time, and optionally terminal and gate.
_Avoid_: Endpoint, stop

**Person**:
A named human with contacts — who is on a flight, on a transfer, or staying at an accommodation. Not an account or a user of the app.
_Avoid_: User, traveller, guest, passenger

**Attachment**:
A link and a name hung off a trip item — a boarding pass, a booking confirmation.
_Avoid_: Document, file

**Zoned Instant**:
A moment in time together with the timezone it should be read in. Travel crosses timezones, so a bare timestamp is never sufficient.
_Avoid_: Timestamp, datetime

### Places

**Place**:
A location in the world — its name, its address, and the timezone its clocks run on. Airports and accommodation sites are both places.
_Avoid_: Location, venue, spot

**Saved Place**:
A place the traveller keeps for reuse across trips. A trip item refers to a saved place rather than holding a copy of it, so correcting one corrects every trip that uses it — including trips already taken. Distinct from trip data: deleting a trip never removes a saved place. A saved place something still refers to can be archived but not deleted.
_Avoid_: User record, favourite, saved item, dictionary

**Place Type**:
Which kind of place a place is — an airport, or an accommodation site. Distinct from an accommodation site's own kind, which says whether it is a hotel, a hostel, an apartment and so on.
_Avoid_: Category, class, kind

**Airport**:
A place identified by its code, where flights depart and arrive.
_Avoid_: Aerodrome, terminal

**Accommodation Site**:
The place a stay happens at, together with the kind of property it is and how to contact it. Distinct from the Accommodation, which is one traveller's stay at it. The same site can be stayed at on many trips.
_Avoid_: Hotel, venue, property
