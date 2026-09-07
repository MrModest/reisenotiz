# Handoff: Reisenotiz — travel planner screens

## Overview
Adaptive (mobile + desktop) offline-first trip planner. Three top-level surfaces — Home overview, Trip list, Trip timeline — plus a detail view and a create/edit form for each of seven itinerary types. Dark theme only, orange primary, drawn on the project's shadcn preset.

## About the design files
The two files in this bundle are **design references authored in HTML** (Design Components — a streaming template format). They are prototypes of look and structure, **not production code to copy**. The job is to recreate them in the target codebase: **React Router + shadcn/ui (Base UI variant) + Tailwind v4**, using the preset already in `app.css`.

Do not port the inline styles. Elements in `Travel Planner.dc.html` are annotated with the component they stand for — read those, then write idiomatic shadcn markup with Tailwind classes.

| Attribute | Meaning |
| --- | --- |
| `data-component` | The component to write. Installed shadcn: `Button` `Input` `Label` `Card` `CardTitle` `Badge` `Item` `Empty` `Switch` `ToggleGroupItem` `TableHeader` `TableHead` `TableRow` `SidebarMenuButton`. Yours: `SyncBadge` `TypeMark` `StatCard` `AddressLink` `TabBarItem` `TimelineRow` `TimelineDayHeader` `TripRow`. |
| `data-variant` / `data-size` | The variant to pass — e.g. `Button` `default`/`secondary`/`ghost`, `TypeMark` `labelled` (icon + full type name, used in detail headers) vs bare icon at `data-size` 16/18/20. |
| `data-state` / `data-status` / `data-active` | The state being drawn: `ToggleGroupItem` on/off, `Input` focus, `SyncBadge` synced/pending/offline, active nav item. |
| `data-part="section-caption"` | Mono caps group heading (NOTES, ADDRESS, ATTACHMENTS…). **Not** a `Label` — it has no control. Plain `div`/`h3`. |
| `data-screen-label` | Names the screen frame. |

`data-component="Label"` appears **only** where a real control follows it, so every one maps to a shadcn `Label` with `htmlFor`.

## Fidelity
**High fidelity.** Colours, radii, spacing and type are final and come from the preset; recreate them via Tailwind classes, never as literals. The one thing the drawing does *not* show is interaction (no hover/focus/motion, all elements are divs) — those are specified in words below.

## Design tokens
Everything resolves to the existing preset (`npx shadcn@latest init --preset b1GdgzGvQ --template react-router --pointer`). Dark theme values, for cross-checking a screenshot only:

| Role | Value in the mock | Class to write |
| --- | --- | --- |
| Page background | `oklch(0.145 0 0)` | `bg-background` |
| Card / sidebar / sticky bars | `oklch(0.205 0 0)` | `bg-card`, `bg-sidebar` |
| Selected row, active nav | `oklch(0.269 0 0)` | `bg-accent text-accent-foreground` |
| Divider, card border | `oklch(1 0 0 / 10%)` | `border-border` |
| Field border, secondary button | `oklch(1 0 0 / 15%)` | `border-input` |
| Primary text | `oklch(0.985 0 0)` | `text-foreground` |
| Secondary + fine print | `oklch(0.708 0 0)` | `text-muted-foreground` |
| Filled button | `oklch(0.473 0.137 46.201)` on `oklch(0.987 0.022 95.277)` | `bg-primary text-primary-foreground` |
| Accent ink (countdown, active nav, unsynced, links) | `oklch(0.769 0.188 70.08)` | `text-chart-2` / `text-sidebar-primary` |
| Radii | 4 / 6 / 10 px | `rounded-sm` / `rounded-md` / `rounded-xl` |
| Spacing | 4 6 8 10 12 16 20 26 | `1 1.5 2 2.5 3 4 5 6.5` |

Two tiers of grey only. There is no third, dimmer grey: 10px text at anything below `--muted-foreground` fails 4.5:1 on this background.

**Two additions to `app.css`:**
1. `--font-mono: 'JetBrains Mono', monospace;` in `@theme inline`. Times, codes, counts and all caps labels are mono — without it the timeline's time column stops aligning.
2. Optional `--success` pair if "synced" should read green. The preset has no green, so the mocks show synced as a neutral dot and pending in orange.

Type: Inter (preset) for UI; mono at 14/13/11/10px. Display 36/26, title 20/17/15, body 14/13. Nothing below 10px.

## Icons
Lucide (`lucide-react`, per-icon imports). Paths are inlined in the mock; use the named components.

`Plane` flight · `Bed` stay · `TrainFront` long transfer · `Bus` city transit · `FerrisWheel` amusement · `Utensils` food · `MapPin` place · `Car` car rental · `House` `Luggage` `ChartColumn` `Bookmark` `Settings` nav · `Plus` `Search` `ArrowLeft` `X` `Ellipsis` chrome.

Sizes: 16 in rows, 18 in headers and chrome, 20 in navigation. `strokeWidth` 2 throughout. Icons inherit colour from the parent (`text-muted-foreground`, or `text-chart-2` when the item is next up or selected).

## The itinerary registry (the most important part)
Seven types share **one** detail component and **one** form component. Do not write `FlightView`, `StayView`, … — that is fourteen components that drift. One module per type:

```ts
type ItineraryModule = {
  type: 'flight' | 'stay' | 'transfer' | 'transit' | 'amusement' | 'food' | 'place' | 'car';
  label: string;              // 'Flight', 'Long transfer', 'City transit', 'Place'
  icon: LucideIcon;
  schema: ZodSchema;          // drives the form and validation
  toSummary(item): string;    // the single line under a timeline row title
  toFacts(item): Fact[];      // label/value pairs for the detail list
  Hero?: ComponentType<{item}>;// the one visually distinct block, see below
  fields: FieldSpec[];        // form layout
};
```

Registered in a `Record<ItineraryType, ItineraryModule>`. Adding a type = one module + one map entry. No screen, route or list changes.

**Heroes — there are only three**, shared across types:
- `EndpointHero` — flight (BER · 1h 20m · MUC) and stay (check-in / nights / check-out + planned arrival row).
- `LegHero` — long transfer and city transit: a dot rail with origin/destination and times, plus a meta footer (duration, stops, line).
- `MediaHero` — amusement (photo / ticket slot).
- Food and place have no hero.

## Data shapes
```ts
type SyncStatus = 'synced' | 'pending' | 'offline' | 'conflict';

type Trip = {
  id: string; title: string;
  startsAt: string; endsAt: string;      // ISO
  countries: string[];                    // ['DE','AT','SI','IT']
  nights: number; itemCount: number; travellers: number;
  status: 'upcoming' | 'draft' | 'completed';
  sync: SyncStatus;
};

type ItineraryItem = {
  id: string; tripId: string; type: ItineraryType;
  title: string;
  startsAt: string; endsAt?: string;      // ISO, local to its own place
  address?: { formatted: string; lat?: number; lon?: number };
  notes?: string;
  attachments: { id: string; name: string; localOnly: boolean }[];
  details: Record<string, unknown>;       // type-specific, validated by the module schema
  sync: SyncStatus; updatedAt: string;
};

// stay.details — note the two nullable planning fields
type StayDetails = {
  kind: 'hotel' | 'rental' | 'hostel' | 'other';
  checkInDate: string; checkInFrom: string; checkInUntil?: string;
  checkOutDate: string; checkOutBy: string;
  plannedArrivalAt?: string;   // ISO date-time, may be a LATER DAY than check-in
  plannedDepartureAt?: string;
  confirmation?: string; guests: number; total?: Money; cancellation?: string;
};
```

**Stay planning rule.** Nights are derived from the booking, never from the planned times. Timeline placement uses `plannedArrivalAt ?? checkInDate+checkInFrom`. A planned arrival on a later day than check-in is **legal** — the traveller is knowingly wasting a paid night — so it is a note ("ARRIVING 6 SEP · 1 PAID NIGHT UNUSED"), not a validation error. A planned time outside the property's daily window (before `checkInFrom`, after `checkOutBy`) *is* an error.

## Routes
| Route | Mobile | Desktop |
| --- | --- | --- |
| `/` | Home, scrolls | Home, two columns (trip 1.55fr / stats 1fr) |
| `/trips` | Grouped rows (Upcoming, then year headers) | Table |
| `/trips/:id` | Timeline, full width | Timeline (1.35fr) + detail pane (400px) |
| `/trips/:id/items/:itemId` | Full-screen detail | Renders into the timeline's right pane |
| `/trips/:id/items/:itemId/edit` | Full-screen form | Sheet or the same pane |
| `/trips/:id/items/new` | Type picker, then form | Dialog |

One route element per URL. It must not contain an `isMobile` branch — the shell decides where it renders.

## Screens
Read the corresponding `[data-screen-label]` frame in the mock alongside each entry.

### Home (mobile 390×844 / desktop 1440×900)
- **Header** — app name + `SyncBadge` chip, right aligned.
- **Upcoming trip card** (`Card`, `bg-card`, `rounded-xl`, 16px padding, 12px gaps): eyebrow "UPCOMING TRIP" in `text-chart-2` + duration; title 27px/600 mobile, 38px/600 desktop; date + country line in mono; an airport-code route line (`BER → MUC → INN → LJU → VCE`) with muted arrows; `Separator`; countdown — 36px number in accent + "days"; the next item as a one-row preview (icon, title, mono meta); actions "Open timeline" (`Button`) + "Calendar" (`Button variant="secondary"`).
- **Statistics** — section header "All time" + "SINCE 2019"; a 2×2 grid of `StatCard` (26px number mobile / 30px desktop, mono caption): countries, nights away, trips, flights; "Nights per year" bars (six columns, current year in accent, 46px tall mobile / 90px desktop, mono year labels); desktop adds a stacked "How you moved" bar (44/26/18/12) with a legend and a "Longest trip" row.
- **Desktop only** — a "Next three days" row of three small cards, and the toolbar (search field + "Add item").

### Trip list
Reverse chronological by start date, newest first. Mobile: sticky header (title, `SyncBadge`, search), then "UPCOMING" and per-year group headers, rows of `date block (38px: 16px day / 10px month) | title, mono meta, badges`. The upcoming trip is highlighted (`bg-accent` + a 2px accent left border). Desktop: filter tabs with counts (ALL 41 / UPCOMING 2 / DRAFTS 1 / PAST 38) then a `Table` — START 130px, TRIP flex, COUNTRIES 180px, NIGHTS 90px, ITEMS 90px, STATUS 130px, header row on `bg-card` with 10px mono caps.

### Trip timeline
Header: back, trip title, item count, overflow; a `ToggleGroup type="multiple"` filter row (ALL / TRAVEL / STAY / FOOD / POI, desktop adds UNSYNCED). Body: sticky day header per day (`bg-card`, weekday + "DAY 1 · BERLIN → INNSBRUCK") followed by rows: **time column, fixed 44px mobile / 52px desktop, right aligned** (start 13px, optional end 10px muted) · 1px rule · icon · title 15px/500 · one mono summary line · an accent dot when unsynced. Fixed width on the time column is what keeps the rules aligned. The selected row is `bg-accent` + accent left border.

### Itinerary detail (7 views)
Header: `ArrowLeft`, then **type icon + full type name** ("Flight", "Stay", "Long transfer", "City transit", "Amusement", "Food", "Place"), overflow right. Body: title 26px/600 + mono subline; the type's hero; a fact list (`Item`, mono 11px label left / mono 12px value right, `border-border` under each, 10px vertical padding); `AddressLink`; notes 13px/1.6; `SyncBadge` row. Sticky footer: "Edit" + "Add to calendar".

### Itinerary create/edit (7 forms + type picker)
Header: "Cancel" · icon + type + verb · "Save" (accent when dirty, muted when not). Body: `Label` (mono 10px caps, `tracking-[.08em]`, muted) over the control, 6px gap, 10–12px between fields; multi-field rows use grid spans (never ad-hoc flex ratios). Sticky footer: "Save changes" + "Delete". The type picker is a 2-column grid of `Item` tiles plus a "paste a confirmation" `Empty` drop target.

## Interactions & behaviour
The mock shows none of this; implement it from here.
- **Navigation** — rows and cards are links, not click handlers. Mobile detail is a push; desktop selects into the pane.
- **Hover** — rows and nav items `hover:bg-accent/50`; buttons per shadcn defaults. 150ms, no transform.
- **Focus** — the preset's `outline-ring/50`. Never remove it. Every interactive element must be a `button`, `a`, or labelled input; in the mock they are all divs.
- **Targets** — 44px minimum on mobile. The tab bar already respects it; the timeline row and the form controls must too.
- **Forms** — validate on blur and on submit, per the module's zod schema. Save is disabled until dirty. Persist a draft locally on every change so a backgrounded app loses nothing.
- **Offline** — mutations write locally and queue. `SyncStatus` is derived from the queue, never passed in as a string. Show `pending` on the item, the trip, and in the nav simultaneously.
- **Conflict** — an `Alert variant="destructive"` above the detail body with "keep mine / take theirs"; the timeline row keeps its accent dot.
- **Calendar** — a `.ics` per item (stay exports arrival + departure using the planned times when set). Web: download; installed PWA: share sheet.
- **Maps** — `useMapUrl(address, coords)` builds one URL: `geo:` on Android, `maps://` on iOS, `https://www.google.com/maps/search/?api=1&query=` elsewhere. Platform sniffing lives in that hook only, never in a screen.
- **Empty / loading** — `Empty` and `Skeleton`. Every list and detail needs both defined; the mock only shows the populated state.
- **Responsive** — one breakpoint, owned by `AppShell`: below 900px `TabBar`, above it shadcn `Sidebar`. Both read the same nav config array. Inside the detail body use **container queries**, not media queries — it renders at 390px (sheet) and 400px (pane).

## What you build vs what you install
Install: `Button` `ButtonGroup` `Card` `Badge` `Separator` `Item` `Empty` `Skeleton` `Field` `Input` `InputGroup` `Textarea` `Label` `Switch` `ToggleGroup` `Table` `Sheet` `Dialog` `AlertDialog` `Popover` `Calendar` `ScrollArea` `Sidebar` `Alert` `Spinner` `Progress`.

Write: **`SyncBadge`** (Badge + Spinner + Alert, with the status→copy map) and **`useMapUrl()`**. Everything else in the mock is composition — the facts list is `ItemGroup`, the dashed placeholder is `Empty`, the combined date · time field is `InputGroup` + Date Picker, the action bar is `ButtonGroup`, the mono caps label is a `Label` with `font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground`.

**Base UI notes** (this preset uses the Base UI variant): `asChild` becomes the `render` prop — relevant on every navigable row wrapping a React Router `Link`. `Field` is first-class in Base UI (Label / Description / Error / validity), so react-hook-form is optional on the simpler forms; keep zod as the schema source either way. Popover and Dialog use Root / Trigger / Portal / Positioner / Popup. `Calendar` is react-day-picker in both variants, and Base UI has no time field, so the time half of a date · time pair stays a masked `Input`. Card, Badge, Item, Empty, Skeleton, Table and Separator are plain markup and identical under either variant. Confirm `Sidebar` is in the Base UI registry for your version; if not, the desktop rail is a `Sheet` plus a nav list.

## Build order
1. Preset init, add `--font-mono`, then `AppShell` with its two navigations from one nav config.
2. `SyncBadge` and `useMapUrl`, in isolation.
3. The registry with **two** types only — flight (richest) and place (thinnest) — behind `ItemDetailLayout` and `ItemFormLayout`. If both layouts survive those two, the other five are data.
4. Timeline, trip list, home.
5. Remaining five types, then calendar export and map links.

## Copy
All strings in the mock are final and deliberate, including the mono caps ("PENDING · SAVED ON THIS DEVICE", "OFFLINE-READY · 41 TRIPS CACHED", "ARRIVING 6 SEP · 1 PAID NIGHT UNUSED"). Sample trip data (Alps & Adriatic, Sep 2026) is placeholder — replace with real fixtures.

Sync vocabulary is fixed: every instance leads with one of **SYNCED / PENDING / OFFLINE / CONFLICT**, detail after a middot.

## Reproduction notes
Read these before measuring anything off the mock.

- **The frames are crops.** Each screen is a fixed 390×844 / 1440×900 box with `overflow:hidden` and a 14px bezel. The bezel is not part of the app, and the content is tuned to fill the crop. Everything scrolls in the real app — do not fix heights or compress spacing to make content fit.
- **Truncation** (not drawn): titles in rows and table cells `truncate`; detail-view titles wrap to two lines then truncate; mono meta lines truncate; fact values wrap and never truncate. Every flex child holding text needs `min-w-0`.
- **The airport-code route line** has no drawn overflow state. Show the first three codes then `+7`, full chain in trip settings.
- **Fact lists** draw a divider under the last row because it was easier to draw. Use `ItemGroup` separators or `last:border-0`.
- **Sticky is drawn as static.** Timeline day headers, the trip-list search header and every action bar are sticky; day headers stick under the screen header, action bars above the safe area.
- **The 22px / 26px bottom paddings** are the home-indicator inset, not spacing tokens — use `env(safe-area-inset-bottom)` with those as fallback.
- **Numbers in Inter** (stat values, countdown) need `tabular-nums`. Times and codes are mono already.
- **Charts** use the preset ramp: `chart-2 → chart-5` for the transport mix, `bg-muted` for inactive year bars, `bg-chart-2` for the current year. Compute percentages from raw values and give tiny segments a min width.

### Layout constants (measure, don't derive)
| Element | Value |
| --- | --- |
| Desktop rail | 232px fixed |
| Desktop detail pane | 400px fixed |
| Timeline time column | 44px mobile · 52px desktop, right aligned |
| Trip-list date block | 38px |
| Trip table columns | 130 / flex / 180 / 90 / 90 / 130 |
| Mobile add button | 48 × 48, radius 10 |
| Tab bar item | 52px min-width · 44px min-height |
| Switch | 38 × 22, fully rounded, 18px thumb |
| Media hero | 140px tall |
| Dot rail markers | 8px — 2px ring at origin, filled accent at destination |

The Stay edit form runs a 10px content gap where other forms use 12px. That is deliberate density, not drift.

## Files
- `Travel Planner.dc.html` — all 21 screens, annotated with `data-component`, `data-variant`, `data-state`, `data-status`, `data-screen-label`. Open it in a browser.
- `Component Architecture.dc.html` — the reasoning: token audit, screen-element → shadcn map, buildability check per custom piece, Base UI deltas, and the seven inconsistencies that were resolved (plus the two left to code).

Both are self-contained HTML apart from a Google Fonts link and a sibling `support.js` (the DC runtime, not part of the design).

_Generated 2026-09-07T10:20:35.972Z_
