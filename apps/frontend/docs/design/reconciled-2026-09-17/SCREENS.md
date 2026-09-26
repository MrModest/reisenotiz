# Screens

One section per screen. Read `DESIGN-SYSTEM.md` first — everything true of every screen is there
and is not repeated here.

Each line that is not obvious cites the ticket that decided it. **Where a line and its ticket
disagree, the ticket wins and the line is a bug.** Where something is marked **Open**, it is not
decided and belongs to the map owner.

## The screens

| Screen | Route | Frames |
| --- | --- | --- |
| [Home](#home) | `/` | `01` mobile · `22` desktop |
| [Trip list](#trip-list) | `/trips` | `02` mobile · `24` desktop |
| [Trip form](#trip-form) | `/trips/new` · `/trips/:id/edit` | none |
| [Trip timeline](#trip-timeline) | `/trips/:id` | `03` mobile · `23` desktop |
| [Type picker](#type-picker) | `/trips/:id/items/new` | `13` |
| [Flight view](#flight-view) | `/trips/:id/items/:itemId` | `05` |
| [Stay view](#stay-view) | `/trips/:id/items/:itemId` | `06` |
| [Flight form](#flight-form) | `…/items/new?type=Flight` · `…/items/:itemId/edit` | `14` |
| [Stay form](#stay-form) | `…/items/new?type=Accommodation` · `…/items/:itemId/edit` | `15` |
| [Saved places](#saved-places) | `/saved-places` | none |
| [Place dialog](#place-dialog) | `/saved-places/new` · `/saved-places/:key/edit` | none |
| [Settings](#settings) | `/settings` | none |

The item routes are **children of `/trips/:id`**, so view, edit and create all render into the
timeline's detail slot ([#33](https://github.com/MrModest/reisenotiz/issues/33)). Above 900px that
slot is a 400px column beside the timeline; below it, a full-screen layer over the still-mounted
timeline, so going back restores the scroll position.

**There is no frame for Saved places, Settings, the trip form or the place dialog**, and drawing
one is designing rather than reconciling ([#58](https://github.com/MrModest/reisenotiz/issues/58)).
They inherit the drawn vocabulary — `Item` rows, mono meta, `PageHeader`, the
chip row — rather than a specific layout.

## Navigation

Four destinations, one config, two presentations
([#33](https://github.com/MrModest/reisenotiz/issues/33)):

```
Home  ·  Trips  ·  Saved places  ·  Settings
```

- **Rail** (≥900px): label beside icon, `aria-label='Primary'`. At its foot, the collapse toggle,
  then `SyncStatusBadge variant='rail'`. Nothing else — no recent trips, no `New trip`, no search.
  232px expanded, 64px collapsed to icons only with the name on `title`. The collapsed state
  persists in `localStorage` and defaults to expanded. Frame `22` is drawn in both states.
- **Tab bar** (<900px): label below icon, `aria-label='Main'`, `Saved places` shortened to
  `Places` for its 52px slot. Four items evenly spread, **no centre `+`**. Bottom padding is
  `env(safe-area-inset-bottom)` with a 22px fallback.
- `Statistics` is in neither: no screen, no route, nothing to navigate to.
- `end` is passed by the renderer as `entry.to === routes.root`, so `/` matches exactly and
  everything else by prefix — which keeps `Trips` lit while a trip timeline is open.

**Page titles follow the navigation.** A destination's page title is its nav label, so the lit nav
row and the page heading read the same word
([#49](https://github.com/MrModest/reisenotiz/issues/49)). Home is the one exception.

## `PageHeader`

Every screen's header is the same component, filled differently
([#49](https://github.com/MrModest/reisenotiz/issues/49)).

```
[←]  [type icon]  Title            [status]  [actions]
     subtitle
     children — the chip row, where a screen has one
```

- **`←` renders when `backTo` is set.** It is a `<Link to={backTo} replace>` whose `onClick` calls
  `navigate(-1)` instead whenever `location.key !== 'default'`. History is right every time it
  exists; `backTo` answers "up" only on a cold start from a shared link.
- **The status slot is rendered inside and cannot be passed in.** `SyncStatusBadge variant='header'`
  sits right-aligned on the title row, left of `actions`, hidden above 900px where the rail owns it
  ([#34](https://github.com/MrModest/reisenotiz/issues/34)).
- **Title and subtitle are one line each, truncating**, on every screen and at every width
  ([#55](https://github.com/MrModest/reisenotiz/issues/55)).
- **The title can be absent.** The route's `Suspense` sits below the header, so on the timeline the
  title renders before the trip file exists: an **empty slot that holds its height** while loading,
  `Not found` when the id is not in the index. `Not found` must never be the loading fallback — the
  warm path resolves in milliseconds and it would flash on trips that exist
  ([#54](https://github.com/MrModest/reisenotiz/issues/54)).
- `actions` has exactly one consumer in the whole app: the item view's `···`.
- **Browser tab title** is `useDocumentTitle(name)`, appending ` – Reisenotiz`. Only the outer pages
  call it — home, trip list, timeline, saved places, settings. The pane's view and form do not,
  because above 900px two `PageHeader`s are mounted at once and they would race.

---

## Home

`/` · frames `01` (mobile), `22` (desktop) · [#38](https://github.com/MrModest/reisenotiz/issues/38)

Two columns above 900px — the trip card left, `All time` right at a fixed **400px**, the detail
pane's measure reused. Below 900px they stack, trip card first. CSS only.

**Header**: title `Overview`, `mobileTitle` `Reisenotiz`. No back, no subtitle, no chip row, no
actions, **no search field and no toolbar** — so on desktop `Overview` sits alone on its row
([#33](https://github.com/MrModest/reisenotiz/issues/33),
[#49](https://github.com/MrModest/reisenotiz/issues/49)). This is the only screen in the app whose
title differs by viewport: mobile carries the app name because there is no rail to carry it,
desktop does not because the rail logo is two centimetres to the left.

**Two independent `Suspense` regions**, one per column. The trip card waits on the trip files; the
`All time` column waits on its own source and today paints immediately
([#54](https://github.com/MrModest/reisenotiz/issues/54)).

### Trip card

`HomeTripCard` — a `Card`, `bg-card`, `rounded-xl`, 16px padding, 12px gaps. The one part of this
screen on real data. Which trip: the ongoing one, else the nearest upcoming one, else none —
`selectHomeTrip(trips, now)`, the same function the trip list calls to decide which row it
highlights, so the two can never disagree.

Top to bottom:

1. **Eyebrow** — `ONGOING TRIP` or `UPCOMING TRIP`, mono caps in `text-chart-2`. The glossary's
   words.
2. **Trip name** — 27px/600 mobile, 38px/600 desktop. **Clamps to two lines**, then truncates
   ([#55](https://github.com/MrModest/reisenotiz/issues/55)).
3. **One meta line**, mono — `5 – 16 SEP 2026 · 12 DAYS · 5 ITEMS`. The item count sits on this
   line, not in a bordered stat box: there is no mini-stat grid on the card, because `BOOKED`,
   `TRAVELLERS` and `UNSYNCED` were cut and a lone box in a four-up grid reads as a mistake ([#31](https://github.com/MrModest/reisenotiz/issues/31),
   [#32](https://github.com/MrModest/reisenotiz/issues/32)).
4. **`Separator`.**
5. **Countdown** — a 36px number in `text-chart-2` with a mono caption beneath. One shape for both
   statuses, so the slot does not change form when a trip flips at midnight:
   `7` / `DAYS TO GO` when upcoming, `TODAY` in place of the number on the day it starts, and
   `3` / `OF 12 DAYS` once ongoing. Day one is `1` / `OF 12 DAYS`, no special case.
6. **One button** — `Open timeline`.

**Not rendered**: a `· 4 COUNTRIES` suffix, a route line such as `BER → MUC → INN → LJU → VCE`,
a next-item preview row, and a `Calendar` button
([#31](https://github.com/MrModest/reisenotiz/issues/31),
[#38](https://github.com/MrModest/reisenotiz/issues/38)).

**Empty**: `No upcoming trips`, one line in the same slot, no button. One block covers both a new
user and a user whose trips are all completed. **While loading the slot renders nothing** — no
card-shaped skeleton.

### `All time`

`AllTimeStatsMockup` — one component, **no props**, every number a literal in the markup. It counts
nothing and has no data source, and it is deleted whole when a statistics service exists
([#38](https://github.com/MrModest/reisenotiz/issues/38)).

Section header `All time` + `SINCE 2019`, then a 2×2 grid of stat cards (26px number mobile / 30px
desktop, mono caption): countries, nights away, trips, flights. Then `NIGHTS PER YEAR` — six bar
columns, current year in `bg-chart-2` and the rest `bg-muted`, 46px tall mobile / 90px desktop, mono
year labels. Then `HOW YOU MOVED`, a stacked bar with a legend, and `LONGEST TRIP`.

- **It renders identically on both viewports**, `HOW YOU MOVED` and `LONGEST TRIP` included. The
  year labels are the only thing that varies — two digits below 900px,
  four above, in CSS inside the component.
- **`Mockup` is in the name deliberately.** A comment saying the values are fake is invisible from
  the call site and from a file listing; the page reads `<AllTimeStatsMockup />`.
- **One file, not four.** Splitting it per card would guess the real service's component boundary
  from a drawing.
- **`Add to calendar` and `Export` do not render.** An inert button is a promise the app cannot
  keep ([#38](https://github.com/MrModest/reisenotiz/issues/38)).
- **`Next three days` is cut** ([#38](https://github.com/MrModest/reisenotiz/issues/38)).

---

## Trip list

`/trips` · frames `02` (mobile), `24` (desktop) ·
[#47](https://github.com/MrModest/reisenotiz/issues/47)

**One presentation on both viewports.** There is no table — no columns, no column headers, no
`Table` component. The grouped rows render above and below 900px, full width in the main column with
no maximum measure.

**Header**: title `Trips`. No back, no subtitle, **no chip row**, no actions, no search field.

**Order** — not reverse-chronological:

> Partition on whether the trip has finished. Trips not yet over come first, soonest first;
> completed trips follow, most recent first.

**Groups**, each header carrying its count:

```
ONGOING
UPCOMING 1
2026 2
2025 2
```

`ONGOING` holds at most one trip, and exists so the list can say the one thing the headers could
not otherwise say. **No row carries a status badge** — it would restate its own header, printing
`COMPLETED` on every row to say what the year already says.

### The row

| Slot | Content |
| --- | --- |
| Date block, 38px | `05` at 16px mono over `SEP` at 10px mono muted |
| Name | 17px/600, **clamping to two lines** then truncating |
| Stack, right, top-aligned | items chip; countdown chip **beneath it** when the trip has not finished |
| End | `···` overflow — `Edit`, `Delete` |

- **The items chip renders on every row.**
- **The countdown reads in words, and every unfinished trip carries one** — largest non-zero
  calendar unit, floored: `In 1 day`, `In 7 days`, `In 29 days`, `In 1 month`, `In 3 months`,
  `In 1 year`, and `Day 9 of 12` while ongoing. No threshold and no magic constant, so nothing
  appears or disappears except when a trip actually ends. Calendar-aware via Luxon, never
  `days / 30`.
- **The chips stack rather than sitting in a row** so the name keeps its full track and is the last
  thing to truncate rather than the first. The stack is top-aligned, so a name that wraps to two
  lines grows the row downward without moving the chips.
- **Highlight**: `bg-accent` plus a 2px accent left border on the trip `selectHomeTrip(trips, now)`
  picks — home's function, not a second rule.
- **`Edit` and `Delete` live in the row's `···`**, because the timeline has no overflow menu and
  both had to land somewhere. Delete goes through `ConfirmDialog`.
  Destroying a trip and every item in it should cost two taps.

**`New trip`** is the floating 48×48 `+`, bottom-right inside the scroller, on **both** viewports —
never a header button ([#49](https://github.com/MrModest/reisenotiz/issues/49)).

**Empty**: `No trips yet`, one line, no button — the `+` is more findable on an empty screen than a
full one. **Loading**: `SkeletonRows`, held invisible for 200ms.

**Not rendered**, each already cut elsewhere: the search field, `PENDING · 3 ITEMS`,
`SYNCED · 2m AGO`, `DRAFT`, the countries line, `NIGHTS` and `COUNTRIES`.

---

## Trip form

`/trips/new` · `/trips/:id/edit` · **no frame** ·
[#47](https://github.com/MrModest/reisenotiz/issues/47)

A page, not a dialog — `create-trip-dialog.tsx` is deleted and its four fields move here. One
`TripForm` behind both routes, driven by `defaultValues`, with no `isCreate` flag inside it. React
Router ranks static above dynamic, so `/trips/new` matches before `/trips/:id`.

The rule this comes from, which holds app-wide:

> **A form is a route; it is a dialog only when a route would destroy unsaved state.**

Undrawn territory. It inherits the form vocabulary from the two item forms below: mono caps
`FieldLabel` over the control, 6px gap, 12px between fields, `Cancel` + `Save` at the foot inside
the `<form>`, Save disabled until dirty. **Open**: nothing fixes its field order or grouping.

---

## Trip timeline

`/trips/:id` · frames `03` (mobile), `23` (desktop) ·
[#29](https://github.com/MrModest/reisenotiz/issues/29),
[#52](https://github.com/MrModest/reisenotiz/issues/52),
[#42](https://github.com/MrModest/reisenotiz/issues/42)

**Header**: `←` to `/trips`, title the trip name, subtitle `5 – 16 SEP 2026 · 5 ITEMS`, chip row as
`children`, **no actions at all** — no `···`; trip editing lives on the trip list ([#49](https://github.com/MrModest/reisenotiz/issues/49)).

**Chip row**: `ALL` plus one chip per type **present in this trip**, derived as
`unique(items.map(i => i.type))` — no stored category, nothing to keep in step with the type union
([#32](https://github.com/MrModest/reisenotiz/issues/32)). Single-select with `ALL` as a member, not
multi-select: an `ALL` chip is contradictory inside a multi-select. Labels are the glossary's words — `FLIGHT`, `ACCOMMODATION`. Horizontal
scroll, chips never wrap, `ALL` pinned left. `UNSYNCED` is not a chip; per-item sync state does not
exist.

### The body

**One section per day**, each holding its own header and its own rows — not one flat list of headers
and rows as siblings. Sticky is then bounded by the section, so an outgoing header is pushed out by
the next day rather than covered by it ([#52](https://github.com/MrModest/reisenotiz/issues/52)).

**Day header** — `Sat, 05 Sep`, Inter at foreground weight on a `bg-card` band, sticky at
`top-0` of the scroller. **That is the whole header** — no place line such as
`DAY 1 · BERLIN → INNSBRUCK`, and no `DAY n`. The rows pass underneath it.

**Row** — `time column | 1px rule | icon | title | summary`:

| Part | Detail |
| --- | --- |
| Time column | fixed 44px mobile / 52px desktop, right aligned. `08:40`, 13px mono |
| Date prefix | second line, `5 SEP`, 10px mono, `text-destructive` — **only** when the element's own local date differs from its day bucket's date |
| Icon | 16px, from the registry |
| Title | the item's own name — `LH 1953`, `Hotel Weisses Kreuz` — one line, truncating |
| Summary | one mono line, role first: `DEPARTURE · BER T1 · SEAT 14A`, `ARRIVAL · MUC T2`, `CHECK-IN · HERZOG-FRIEDRICH-STRASSE 31` |

- **One row per timeline element, and one element per data point.** A flight is **two** rows,
  departure and arrival; a stay is two rows, days apart. Never one row with two times
  ([#29](https://github.com/MrModest/reisenotiz/issues/29)).
- **No row shows an end time.** The second line of the time column is the date prefix instead.
- **The summary says what the element is and where, never how long.** `1h 20m` does not render on a
  flight row and `3 NIGHTS` does not render on a check-in row; both live on the item's view
  ([#42](https://github.com/MrModest/reisenotiz/issues/42)).
- **The role goes in the summary, never in the title**, so an item's two rows read identically at
  the title and the mono line tells them apart.
- **No accent dot on a row.** Per-item sync state is out of scope, so such a dot has no source ([#32](https://github.com/MrModest/reisenotiz/issues/32)).
- **Selected row**: `bg-accent` plus an accent left border. Frame `23` marks **both** rows of the
  open item, since both match `/trips/:id/items/:itemId`.
- **Day bucketing is a local date in the trip's origin zone** — the zone of the trip's earliest
  element — fixed for the life of the trip, so buckets never shift under anyone. An element's *time*
  renders in its own place's zone. Sorting is always by instant, never by displayed time.
- **Empty days do not render.** Filtering runs before bucketing and only non-empty days are emitted,
  so a rest day and a fully-filtered-out day drop out through the same path.
- **The timeline is misleading exactly once, by choice**: a flight across zones shows two times
  whose difference is not the elapsed time, unmarked unless the dates differ. Its view states the
  real duration ([#42](https://github.com/MrModest/reisenotiz/issues/42)).

**`Add item`** is the floating 48×48 `+`, bottom-right inside the **timeline column's** scroller, on
both viewports — so with the pane open it floats over the timeline and not over the pane. It does
one thing: navigate to the type picker.

**Empty**: `Nothing planned yet`, one line, no button. **Loading**: `SkeletonRows`.

**Desktop grid**: `1.35fr 400px` with a pane open, `1fr` with none. **No 400px placeholder** — the
pane exists exactly when a child route is active.

---

## Type picker

`/trips/:id/items/new` · frame `13` · [#36](https://github.com/MrModest/reisenotiz/issues/36)

A full screen, not a popover — the old FAB menu with its backdrop and `Escape` handler is deleted
and not rebuilt ([#33](https://github.com/MrModest/reisenotiz/issues/33)).

**Header**: `←` to the timeline, title `Add item`.

**Body**: a 2-column grid of `Item` tiles, fed by the registry's `icon` and `label` — two tiles,
`Flight` and `Stay`, because only those two types exist
([#36](https://github.com/MrModest/reisenotiz/issues/36)). The screen grows for free when types
return.

A tile links to the same route carrying the chosen type — `…/items/new?type=Flight` — which is the
shape `src/lib/routes.ts` already uses. The type picker is that route with no type on it.

**Nothing renders below the grid.** A `Drop a PDF or paste booking text` target does not ship:
parsing is out of scope, and an inert control is a promise the app cannot keep — the rule that cut
`Export` ([#38](https://github.com/MrModest/reisenotiz/issues/38),
[#59](https://github.com/MrModest/reisenotiz/issues/59)).

---

## Flight view

`/trips/:id/items/:itemId` · frame `05` ·
[#39](https://github.com/MrModest/reisenotiz/issues/39),
[#53](https://github.com/MrModest/reisenotiz/issues/53)

**Header**: `←`, `Plane` icon, title **`Flight`** — the type, never the item. `LH 1953` there
would duplicate the 26px title directly beneath it. `actions` is the `···`,
holding `Delete` behind `ConfirmDialog` ([#49](https://github.com/MrModest/reisenotiz/issues/49)).

**Body**, top to bottom:

1. **Title** 26px/600 — the flight number.
2. **Subline**, mono — `LUFTHANSA · SAT, 05 SEP`. No year, and no `AIRBUS A320`: nothing in the app
   can source an aircraft type ([#53](https://github.com/MrModest/reisenotiz/issues/53)).
3. **Hero** — one region, `align-items: flex-start`, in a `bg-card rounded-xl` shell it does not
   share with any other hero. Airport code 26px, then **`UTC+2` beneath the code**, then the time
   18px. A 64px rule between the two ends carrying `1h 20m`. Third line is `terminal · gate`,
   dropping whichever is absent.
   - The offset shows **under both codes, always**, and never as a zone abbreviation like `CET`. It
     goes with the *place*, not with the time, so the time axis
     stays mirrored. Always shown, never conditional on the two zones differing: a conditional
     marker gives the hero two heights and reads as a bug to anyone who does not know the rule
     ([#53](https://github.com/MrModest/reisenotiz/issues/53)).
4. **Fact list** — mono 11px label left, mono 12px value right, rule under each, `last:border-0`.
   **`BAGGAGE · 2 × 23KG` is cut**; nothing can source it.
5. **Two address blocks**, stacked — `DEPARTURE AIRPORT` and `ARRIVAL AIRPORT`, each an
   `AddressLink`. No `Departure` / `Arrival` tabs, because a tab that hides half of two short blocks costs a tap to save four lines, and
   the arrival address is the one you need when you land.
6. **Notes** — 13px/1.6, wrapping, `overflow-wrap: anywhere`.
7. **Attachment chips.**

**Sticky footer**: `Edit`, full width. **`Add to calendar` is cut** — `.ics` export is out of scope
and an inert button is worse than none.

**When the place link dangles**, the hero still renders completely — codes, times, duration,
terminal and gate all come from the item. The address block shows a muted `Unknown place` with no
link ([#37](https://github.com/MrModest/reisenotiz/issues/37)).

---

## Stay view

`/trips/:id/items/:itemId` · frame `06` ·
[#39](https://github.com/MrModest/reisenotiz/issues/39),
[#53](https://github.com/MrModest/reisenotiz/issues/53)

**Header**: `←`, `Bed` icon, title **`Stay`** — the design's word, and the word `CONTEXT.md`'s own
definition uses. `Accommodation` stays the type name in code
([#36](https://github.com/MrModest/reisenotiz/issues/36)). `actions` is the `···` with `Delete`.

**Body**:

1. **Title** 26px/600 — the site's name. Falls back to `Unknown place` on a dangling link.
2. **Subline**, mono — `INNSBRUCK, AUSTRIA · UTC+2`. The offset is appended here because a stay
   names its place *above* the hero, and one marker there covers all four of the hero's times,
   including the accent planned row ([#53](https://github.com/MrModest/reisenotiz/issues/53)).
   Dropped entirely on a dangling link. **No `DOUBLE ROOM` subline** — cut with the booking extras.
3. **Hero** — two stacked regions split by a rule, `align-items: center`, its own card shell.
   - Upper: check-in `SAT, 05 SEP` / `FROM 14:00`, a 20px accent number over `NIGHTS` in the
     centre, check-out / `BY 11:00`. **The check-in window's late end is cut** — the hero reads
     `FROM 14:00`, not `14:00 – 23:00`.
   - Lower: the bordered `YOU ARRIVE` / `YOU LEAVE` row, carrying `5 Sep · 16:40`. **Omitted
     entirely — row and separator both — when there is no planned interval.** Never empty, never
     dashed.
   - **The unused-night note** sits in that planned row, in accent:
     `ARRIVING 6 SEP · 1 PAID NIGHT UNUSED`, and symmetrically
     `LEAVING 7 SEP · 1 PAID NIGHT UNUSED`. It exists only when the planned row does.
4. **Fact list** — guests, rooms, reserved by. **Empty person lists render nothing** rather than
   `0 GUESTS`. **`CONFIRMATION`, `TOTAL` and `CANCELLATION` are cut**: a booking reference is not
   universal for accommodation the way it is for flights, an amount without a currency opens
   per-trip cost tracking, and a cancellation deadline is a reminder feature. All of it belongs in
   the note block, which makes the note block load-bearing here.
5. **One `ADDRESS` block** with the site's phone beneath it.
6. **Notes**, then **attachment chips.**

**Sticky footer**: `Edit`, full width.

**Nights derive from the provided interval alone**, never from the planned times. Timeline placement
is `planned?.in ?? provided.in`.

---

## Flight form

`…/items/new?type=Flight` · `…/items/:itemId/edit` · frame `14` ·
[#39](https://github.com/MrModest/reisenotiz/issues/39)

**Header**: `←`, `Plane` icon, title `New flight` / `Edit flight`. **No actions** — `Cancel` and
`Save` live in the footer, never the header ([#36](https://github.com/MrModest/reisenotiz/issues/36),
[#49](https://github.com/MrModest/reisenotiz/issues/49)).

**Flat, no collapsibles.** `CollapsibleSection` is deleted, along with the `openSections` state and
the `handleInvalid` handlers that existed only to reveal a required field hidden inside a closed
disclosure.

**Two labelled groups** — `DEPARTURE` and `ARRIVAL`, each a mono caps label and a rule, not a
disclosure trigger. Each holds: the place picker, date, time, **terminal** and **gate**. The model
carries terminal and gate, and the flight view displays them, so the form edits them.

Outside the groups: **flight number**, **carrier**, booking code, seat, passengers, notes,
attachments. `carrier` gains a plain labelled input and the `LUFTHANSA · MATCHED FROM SAVED
AIRLINES` subline is dropped — there is no airline dictionary and no seam for one. `seat` is one
free-text string rendered verbatim; `14A · 14B` is what the traveller typed.

**`Times are local to each airport` is cut.** Nothing implemented it, every time is always local to
its own place, and a display variant is the deferred reader-timezone feature entering through the
form.

**The place picker** — a combobox plus one adjacent labelled button, `Add` when nothing is linked
and `Edit` when something is, with a two-line preview beneath the selection: name and code on the
first line, address and timezone on the second
([#39](https://github.com/MrModest/reisenotiz/issues/39)).

- The airport combobox **lists saved airports and dictionary matches in one undifferentiated list**.
  Picking a dictionary entry materialises it into saved places, which is the whole point of the
  seam, so marking which is which would expose plumbing the traveller has no use for.
- The button opens `PlaceDialog` with no key on `Add` and the current key on `Edit`; `onSaved`
  writes the link. Choosing a different entry in the combobox **replaces** the link and never edits
  the place.
- The preview line is the only place `BER` is spelled out as *Berlin Brandenburg* — which is what
  catches a typo that happens to be another valid code.

**Field layout**: mono caps `FieldLabel` over the control, 6px gap, **12px between fields** on both
forms. Multi-field rows use grid spans, never ad-hoc flex ratios. No `md:` utilities anywhere in a
detail or form body — they would fire at 400px inside the desktop pane.

**Footer**, inside the `<form>`: `Cancel` + `Save`. Not `Save flight`. **Save is disabled until the
form is dirty.** **No `Delete`** — it lives in the view's `···`, because a footer `Delete` must know
whether it is creating or editing, which is `isCreate` under another name, and it puts a destructive
action on a surface holding an unsaved draft.

**A new item opens with `DateTime.now()` in the device zone.** The device zone never reaches the
store — submit re-anchors both typed values to the chosen place's zone.

---

## Stay form

`…/items/new?type=Accommodation` · `…/items/:itemId/edit` · frame `15` ·
[#39](https://github.com/MrModest/reisenotiz/issues/39)

**Header**: `←`, `Bed` icon, title `New stay` / `Edit stay`. No actions.

**About nine controls.** The property's name, kind and address are not here — they live in
`PlaceDialog`, one surface over. Guests, rooms, reserved-by, **notes** and **attachments** are.

- **One place picker**, labelled `PROPERTY`. The accommodation combobox **lists saved sites only**,
  so on a fresh install it is empty and `Add` is the first move — the geocoder that would populate
  it is out of scope.
- **The provided interval**, then the **planned** group. The planned interval **must lie within the
  provided one**: `planned.in >= provided.in` and `planned.out <= provided.out`, validated and
  blocking. Two instant comparisons, no time-of-day reasoning.
  - A planned arrival on a **later day** than check-in is legal and saves — the traveller is
    knowingly wasting a paid night. The unused-night note renders in the plan group's header, in
    accent.
  - What does not save is a plan outside the booking: arriving before check-in opens, or leaving
    after the by-time.
- **Cut**: `CONFIRMATION`, `TOTAL`, `CANCELLATION`, the check-in window's late end, and the
  `Add your arrival and departure to calendar` toggle.

**Footer**: `Cancel` + `Save` inside the `<form>`, Save disabled until dirty. **No `Delete`** —
it lives in the view's `···`.

**A new stay opens with `in` and `out` equal**, so its hero reads `0 NIGHTS` until the dates are
set. Anchoring the default to the trip's start date was considered and rejected: the traveller has
to set a real date either way.

**Both forms run 12px between fields**, never a tighter 10px for this one: two pixels no reader can
attribute to intent is drift by the time anyone else touches the file.

---

## Saved places

`/saved-places` · **no frame** · [#37](https://github.com/MrModest/reisenotiz/issues/37)

One flat list, not a hub with a page per kind.

**Header**: title `Saved places`, chip row as `children`, no back, no actions.

**Chip row**: `ALL` plus one chip per type present, derived as `unique(entries.map(e => e.type))` —
the same component and behaviour as the timeline's. Labels are `Airport` and `Accommodation`;
*Accommodation Site* stays the glossary term but reads badly on a chip. Selection is local state,
not a URL parameter.

**A `Show archived` toggle** sits beside the chips. Archived places are hidden by default and carry
a `Restore` action when shown.

**The row is the view.** There is no detail screen for a saved place — the row carries name,
address, and the actions. `Item` / `ItemGroup`, mono meta, name and address one line each and
truncating.

| Place state | Action offered | Effect |
| --- | --- | --- |
| unused | **Delete** | gone from the document |
| linked by any trip item | **Archive**, with the usage count; delete disabled | hidden from pickers, still resolves wherever it is linked |
| archived | **Restore** | back in the pickers |
| link dangles anyway | — | `Unknown place` fallback, never a crash |

**No `Add` button.** Places arrive by themselves the first time you add a flight or a stay, so the
screen manages what exists. It stays cheap to add later — a header slot and a menu over the place
types.

**Empty**: *the airports and places you use on trips appear here*. It says nothing is here yet
rather than inviting you to add something, because there is nothing to press.

**No loading state**, and none would ever be seen: saved places live in the index document itself,
which is the fastest read in the app.

---

## Place dialog

`/saved-places/new` · `/saved-places/:key/edit` · **no frame** ·
[#37](https://github.com/MrModest/reisenotiz/issues/37),
[#47](https://github.com/MrModest/reisenotiz/issues/47)

A dialog, and the **same** dialog from both of its entry points. The Saved places screen reads those
params and mounts it; the list stays mounted underneath, because a dialog is an overlay rather than
a sibling route. The route buys the phone's back gesture.

The second entry point is inside a form — the flight and stay forms open it beside the place picker,
from component state with `onSaved`, so you can add a missing airport without leaving a half-filled
draft. That draft has nowhere to go if the page unmounts, which is the whole reason this one surface
is a dialog.

```
PlaceDialog<T>   { type, placeKey?, onSaved? }

placeKey undefined  →  Add:  write a new saved place, return it
placeKey given      →  Edit: update the saved place at that key, return it
```

It never learns who opened it.

**Shared across both place types**: `PlaceFields` — name, address line, city, country, timezone.
Country is a **dropdown of ISO codes**, never typed
([#31](https://github.com/MrModest/reisenotiz/issues/31)).

**Per type**: an airport adds `code`, whose dictionary lookup **prefills** name, address and
timezone — type `CDG`, correct what is wrong, save. One control covers both jobs, materialising a
known airport or hand-entering one the dictionary lacks. An accommodation site adds `kind` and
`contact`.

**Adding a place from inside a draft trip item writes it immediately.** Abandon the form afterwards
and the place is still saved — and deletable, because nothing links it.

---

## Settings

`/settings` · **no frame** · [#37](https://github.com/MrModest/reisenotiz/issues/37),
[#54](https://github.com/MrModest/reisenotiz/issues/54)

**Header**: title `Settings`. Nothing else.

Two sections:

- **Appearance** — light / dark. Dark is the design's; **light is the default**. This is the first
  time mobile has a theme control: `ThemeSwitcher` lived in a `hidden md:flex` aside in the old
  shell, which is deleted.
- **Sync** — the root document ID field. Today that one string *is* the account.

**No `Records` link, and no link back to Saved places** — it is one tap away in both navigations,
and a settings screen whose job is linking to other destinations is the hub pattern this map
deleted.

**`Reset local data` is deleted.** It removed the only pointer to every document the app owns,
unconfirmed, one click from `Reload`, on a screen a user reaches by being unlucky — and on a build
with no sync server that destroys every trip with no copy anywhere
([#54](https://github.com/MrModest/reisenotiz/issues/54)).
