# CLAUDE.md — Frontend

This file applies when working inside `apps/frontend/`. Run all commands from this directory.

## Working Directory

All paths in this document are relative to `apps/frontend/`. The `@/` alias points to `apps/frontend/src/`.

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For what the domain words mean — Trip, Trip Item, Accommodation Site, Timeline Element — read
`CONTEXT.md` in this directory. Use its vocabulary in names, tests and issue titles.

## Development Commands

- `pnpm dev` - Start Vite development server
- `pnpm build` - Type-check with TypeScript and build for production
- `pnpm lint` - Run ESLint on TypeScript/TSX files
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run the Vitest suite once
- `pnpm test:watch` - Vitest in watch mode

## Architecture Overview

### Tech Stack
- **Framework**: React 19 with Vite build tool
- **Routing**: React Router v7 with nested routes
- **Styling**: Tailwind CSS v4 (using @tailwindcss/vite plugin)
- **Date/Time**: Luxon wrapped in custom DateTime class (`src/lib/datetime/`)
- **Animations**: Motion (Framer Motion) library
- **State & persistence**: Automerge (`@automerge/react`) — see the "State & Sync" section below
- **Forms**: React Hook Form + Zod via `@hookform/resolvers`
- **Component Patterns**:
  - Reusing existing shadcn-style components whenever feasible
  - Class-variance-authority (CVA) for component variants
  - Base UI (`@base-ui/react`) primitives — **not Radix**; there is no Radix dependency in this app
  - Lucide React for icons
- **PWA**: Progressive Web App with vite-plugin-pwa and Workbox
- **React Compiler**: Enabled via babel-plugin-react-compiler targeting React 19

### Key Configuration Details

**Path Aliases**: Use `@/` prefix for imports from `src/` directory (e.g., `@/components/ui/button`)

**Styling Approach**:
- Tailwind CSS v4 with custom theme defined in `src/index.css`
- Uses OKLCH color space for theme colors
- CSS variables for light/dark mode theming
- Custom dark mode variant using `@custom-variant dark (&:is(.dark *))`. Light is the default;
  `useTheme` (`src/hooks/use-theme.ts`) stores an explicit choice in `localStorage`, and the only
  control for it is Settings' Appearance section
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- **Design System**: `docs/design/reconciled-2026-09-17/` defines radius, spacing, colour, type and
  every screen. ALWAYS consult it when creating or modifying UI components; start at its
  `DESIGN-SYSTEM.md`, then `SCREENS.md` for the screen you are building
  - `docs/design/handoff-2026-09-07/` is a **frozen archive** of the original handoff. It is
    superseded in 95 recorded places and nothing is built from it
  - Token values live in `src/index.css`: the shadcn preset `b1GdgzGvQ` (kept verbatim for
    reference in `docs/design/reconciled-2026-09-17/app.css`) plus a `--brand` ink and a light
    `--card` one step off white. Write Tailwind classes, never the literal values
  - Orange that is read — text, links, active nav, a selected row's edge — is `text-brand` /
    `border-brand`, never a `chart-*` colour
  - Radius is **derived** from `--radius: 0.45rem`: `rounded-sm` 4.32px, `rounded-md` 5.76px,
    `rounded-lg` 7.2px, `rounded-xl` 10.08px. There is no `xs` step — the smallest radius the
    design uses is `rounded-sm`
  - Two text tiers only: `text-foreground` and `text-muted-foreground`
  - Times, codes, counts and all-caps labels are `font-mono`. Numbers set in Inter need
    `tabular-nums`
  - The UI is under redesign, tracked by [#28](https://github.com/MrModest/reisenotiz/issues/28);
    existing components may not match the design yet

**Code Style**:
- No semicolons (enforced by ESLint @stylistic/semi rule and Prettier)
- Single quotes
- 2-space indentation
- TypeScript strict mode enabled

### Application Structure
- Store (`src/store/`) — Automerge-backed data access; see "State & Sync"
- Sync wiring (`src/contexts/sync-context.tsx`, `sync-repo.ts`, `root-doc-context.ts`)
- Services (`src/services/`)
- Development Stubs (`src/stubs/`)
- DateTime Utilities (`src/lib/datetime/`)

### State & Sync

Data lives in **Automerge documents**, not in a client-side store library. There is no Zustand
in this app.

- **Read the `automerge` skill before touching `src/store/` or `src/contexts/sync*`.** It covers
  `useDocument` / `changeDoc` semantics, `updateText` for collaborative text, and testing patterns.
- Components use the hooks exported from `@/store`: `useTrips` (newest start first),
  `useTripSummaries` (each trip with its item count, unsorted), `useTrip`, `useTripItems`,
  `useTripItem`, plus `useCreateTrip` / `useUpdateTrip` / `useDeleteTrip`
  and the `TripItem` equivalents. Saved places come from `useSavedPlaces()` (tagged
  `{ type, key, place }` entries), `useSavedPlace(placeKey)` and `useSavedPlaceMutations()`
  (`add`, `update`, `archive`, `restore`, `remove(type, key)`, `materialiseAirport`). Each checks
  the document inside its own change, since another device may have changed it since the render:
  `add` refuses a key already saved and `update` a place deleted meanwhile, both as a typed
  `PlaceSaveResult` (`key-taken` / `not-found`), and `archive`, `restore` and `remove` of a
  missing place change nothing.
- **Document model**: `RootDoc` per user, `TripDoc` per trip — see
  `/docs/adr/0004-automerge-document-model.md` for the shape and why.
- `RootDoc` holds the saved places in two maps keyed differently on purpose: `savedAirports` by
  IATA code, `savedAccommodationSites` by uuid. A place's type is known from which map it sits in;
  nothing stored says it. Both maps are optional in `RootDoc`, because a root document made before
  them lacks them; the store reads a missing map as empty and creates it on the first write.
- **Storage**: IndexedDB locally. When `VITE_SYNC_SERVER_URL` is set the repo also connects to
  `apps/sync/` over WebSocket; absent, the app runs local-only with no error.
- **Conflicts** are resolved by Automerge's CRDT merge. Never write custom merge logic
  (`/docs/adr/0002-automerge-crdt-for-sync.md`).
- Never mutate a document object returned from a hook — mutate inside the change callback.

### Create / View / Edit Flows

Drafts stay in local form state until saved; only valid, complete entities reach the store.
The reasoning is in `docs/adr/0001-drafts-never-enter-the-store.md`. In practice:

- **Routes are explicit**, never a `mode` flag: `.../new` to create, `.../:id` to view,
  `.../:id/edit` to edit.
- **One form component serves create and edit.** A trip item form takes `{ item, onSubmit, onCancel }`:
  the create page passes the type's `createDraft(tripId)`, the edit page the stored item. `TripForm`
  takes `{ defaultValues, onSubmit, onCancel }` instead. The form renders inputs, holds draft state
  and validates; it never fetches, never navigates, and never knows which flow it is in.
- **Pages orchestrate**: read route params, read from the store, supply defaults, call the
  mutation hook, then navigate.
- **Views are read-only** — no form, no draft state.
- **Validate twice**: the form for UX (required, lengths), the store mutation hook for
  invariants.

### Component Architecture

**Layout Components** (`src/components/layout/`):
- `AppShell` is the root route's component: an `h-dvh` shell whose page never scrolls. Above 900px
  it shows the collapsible rail (`aria-label='Primary'`, 232px / 64px, collapse state in
  `localStorage`); below it, the four-slot tab bar (`aria-label='Main'`). One `NavEntry` list
  feeds both. Both are always rendered and CSS hides one
- **The 900px breakpoint** is `--breakpoint-shell` in `src/index.css`'s `@theme`, and the `shell:`
  / `max-shell:` variants appear **only in `AppShell`**. There is no `matchMedia`,
  `useMediaQuery` or `isMobile`. A part of a page that only one presentation shows carries
  `data-shell='mobile'` or `data-shell='desktop'`, and `AppShell` hides it. A part styled
  differently above 900px carries a `data-slot`, and `AppShell` holds its `shell:` rule
- **Every page is a flex column of `PageHeader` · scroller · optional footer**, rendered as
  siblings inside the shell's `main`. The scroller is `min-h-0 flex-1 overflow-y-auto`; there is no
  centred column
- `PageHeader` takes `title`, `mobileTitle?` (Home only), `subtitle?`, `icon?`, `backTo?`,
  `actions?` and `children`. It renders the header's `SyncStatusBadge` itself, hidden above 900px.
  `backTo` renders `←`, which goes back in history unless the page was the first one opened, then
  to `backTo`. Pass `title=''` while the data behind it loads — never `Not found`
- `SyncStatusBadge` reads `useSyncStatus()` itself; `variant='rail'` adds a second line for
  offline and for no sync server
- `useGoBack(fallback)` (`src/hooks/`) is that rule, and the only place it lives: back in history,
  or to `fallback` when the page was the first one opened. The `←` and the trip form pages' `Cancel` and
  `Save` call it
- `useDocumentTitle(name)` (`src/hooks/`) sets `<name> – Reisenotiz`. Only outer pages call it,
  never a trip item view or form

**Loading and error** (`src/routes.tsx`, `src/components/route-error-boundary.tsx`):
- Every child route gets its own `Suspense` (fallback: nothing) and `RouteErrorBoundary` from
  `withBoundaries()` in `src/routes.tsx`, so the rail and tab bar survive both a wait and a throw. There is
  no boundary on the root route and no `Suspense` above the router. An unmatched URL is a
  catch-all child route reading `Not found`
- A trip id missing from the index is not an error: pages gate on `useTripExists` /
  `useTripItemExists` and `PageHeader` reads `Not found`
- `RouteErrorBoundary` classifies with `isDocumentUnavailableError` (`src/store/automerge/`), the
  only place the library's `Document … is unavailable` message is matched. A trip file that has not
  reached this device shows `NotSyncedYet`, titled `Not synced yet`: no button, and it calls `window.location.reload()` on
  the first transition to a connected sync state, at most once per mount. Anything else shows
  `UnexpectedError`, titled `Error`: one sentence and `Reload`; the error goes to `console.error` and is never
  rendered
- `SkeletonRows` (`src/components/ui/`) is the only loading visual, used on the trip list and the
  timeline. Its rows are held invisible for 200ms by a CSS animation delay. Everything else
  suspends to nothing; nothing in the app spins

**UI Components** (`src/components/ui/`):
~20 components built on Base UI primitives with CVA variants, including `Button`, `Input`,
`Textarea`, `Dialog`, `AlertDialog`, `Popover`, `Tabs`, `Collapsible`, `Combobox`, `Calendar`,
`Badge`, `Switch`, `Separator`, `Skeleton`, `Item`, `DropdownMenu` and `ToggleGroup`. Read the existing component
before adding a new one — most needs are already covered.
- `ConfirmDialog` is the app's confirmation, built on `AlertDialog`
- `ChipRow` is the single-select chip row on `ToggleGroup`: exactly one chip is on, and pressing
  the active chip does nothing
- shadcn installs come from `base-mira` with `--dry-run` and `--diff`, never `-y`: an install can
  overwrite `button.tsx` and drop its `ButtonVariant` export, and it writes `import { cn } from "cn"`,
  which must be `@/lib/utils`

**Trip Item Registry** (`src/components/trip-items/`):
- `registry.ts` maps every `TripItemType` (`'Flight' | 'Accommodation'`) to a `TripItemModule`:
  `type`, `label` (`Flight`, `Stay`), `icon`, `createDraft(tripId)`, `toTimelineElements(item)`,
  `View` and `Form`. The map is exhaustive, so a new type does not compile until it has a module.
- Every per-type decision goes through `getTripItemModule(type)`, never a `switch (type)`. It
  returns `undefined` for a type this build does not know, and the caller shows a short message.
  `tripItemModules` lists them for the type picker; `presentTripItemModules(items)` lists the
  types present, in registry order, for the timeline's chips, and `toTimelineElements(items)` every
  element of the items it knows.
- `toTimelineElements(item)` returns one `TimelineElement` per data point — a flight's departure
  and arrival, a stay's check-in and check-out at `planned?.in ?? provided.in` and
  `planned?.out ?? provided.out`. The title is the item's own name; the summary is role first,
  then where, never how long, in natural case: `Departure · BER T1 · Seat 14A`.
- Each type has its own folder — `flight/`, `accommodation/` — holding `module`, `view`, `form`,
  `schema` and `draft`. Parts both types use live in `shared/`.
- `createDraft` defaults every time to `DateTime.now()` in the device zone.
- `View` takes `{ item }`. Its delete goes through `shared/use-delete-trip-item.ts`, which removes
  the item and navigates back.
- The type interfaces in `src/types/` import nothing from the app; `ZonedInstant` lives in
  `src/types/common/` for that reason.

**Places** (`src/components/places/`):
- A `Place` is a name, an `Address` and a timezone; `Airport` adds `code`, `AccommodationSite` adds
  `kind` and `contact`. `SavedPlace<T>` adds `archived`. The types live in `src/types/trip/place.ts`.
- `registry.ts` maps each `PlaceType` (`'Airport' | 'AccommodationSite'`) to a `PlaceTypeModule`:
  `type`, `label` (`Airport`, `Accommodation`), `icon`, `Row` and `Form`. `placeTypeModules` is in
  display order.
- `PlaceDialog` takes `{ type, placeKey?, onSaved?, onClose }`: no key adds, a key edits, and
  `onSaved` gets the key and the saved place. It never learns who opened it. A refusal from the
  store goes back to the form: an airport code already saved shows on the code field. The Places screen
  opens it by route (`/saved-places/new?type=…`, `/saved-places/:placeKey/edit`) over the
  still-mounted list; the flight and stay forms open it from component state.
- Both forms share `PlaceFields` (name, address line, city, country dropdown, timezone) inside
  `PlaceForm`, whose `Save` is disabled until the form is dirty. The airport's code is fixed once
  saved, because it is the key; typing a code the airport dictionary knows prefills the rest.
- `SavedPlaceRow` owns its `min-w-0`. The Places screen (`src/pages/saved-places.tsx`) owns the row
  shell and its `Archive` / `Restore` / `Delete` actions, and derives its chips from the types
  present.
- Trip items hold a copy of their place, with no key back to it. The stay form therefore offers
  `Edit` only for a site picked in that form. The airport picker (`useAirports()`) lists saved
  airports that are not archived and the dictionary airports that are not saved; picking one
  materialises it into `savedAirports` before the flight copies it.

**Countries** (`src/services/dictionaries/`):
- `Address.countryCode` is an ISO 3166-1 alpha-2 code, chosen from a dropdown and never typed.
- `countryDictionary` is built from `public/dicts/countries.csv`. The airport dictionary converts
  each row's country name to its code as it loads; a name the country list lacks throws.
- `countryName(code)` is the display name; an unmapped code is a bug and throws.
  `getCountryFlag(code)` (`src/lib/utils/`) builds the flag from the code alone.
- The root route's loader loads `countryDictionary` and `airportDictionary`.

**Icon Component** (`src/components/icon/index.tsx`):
- Exports `Icon` and `IconName` and nothing else. Its body is a static map from `IconName` to
  named Lucide imports, so icons are bundled and tree-shaken; `LucideIcon` never leaves the file
- Add an icon by importing it there and giving it a name in the map
- Pass an icon as `IconName` (`<Icon name={icon} />`), never as a `ReactNode`

**Date formatting** (`src/lib/datetime/`):
- `formatTo` holds the eight shapes of `DESIGN-SYSTEM.md` and no others: `time`, `dayShort`,
  `dayMonth`, `dayOfMonth` + `monthShort`, `dateRange`, `utcOffset`, `duration`, `dateISO`
- `convertTime(date, time, zone)` builds a `ZonedInstant` from a form's `yyyy-MM-dd` and `HH:mm`
  strings in `zone`
- Each renders in its own `ZonedInstant`'s zone, never the reader's, and returns natural case;
  uppercase is CSS
- The locale is fixed to English in `DateTime`, never read from the browser; every shape spells
  its own tokens, so times are 24-hour and numeric dates day-first. `Calendar` starts weeks on
  Monday

**Trip facts** (`src/lib/trip/`):
- `getTripStatus` (`upcoming` / `ongoing` / `completed`), `getTripDuration`, `getTripDayIndex`,
  `getTripCountdown`, `getHomeCountdown`, `selectHomeTrip(summaries, now)` and
  `groupTrips(summaries, now)` are pure functions. Each takes `now` and none reads the clock
- A trip's days are calendar dates in its start zone. It turns ongoing at its start instant and
  completes the day after its last day
- The countdown is the calendar difference in years, months and days, printing the largest
  non-zero unit, floored: `In 1 day`, `In 3 months`, `In 1 year`; `Today` on the first day before
  the start instant; `Day 9 of 12` while ongoing; none once completed. It is a fact about a trip,
  not a date shape, so it is not in `formatTo`
- `getHomeCountdown` is the home card's slot: whole days to go (`7` / `Days to go`, never a larger
  unit), `Today` with no caption on the first day before the start instant, and the day index over
  the duration (`3` / `Of 12 days`) while ongoing
- `groupTrips` returns `Ongoing` (at most one trip, no count), `Upcoming n`, then one group per
  year of completed trips. Unfinished trips run soonest first, completed trips most recent first.
  Labels are natural case; uppercase is CSS
- `selectHomeTrip` takes and returns `TripSummary`, picking the ongoing trip, else the nearest
  upcoming one. The home card leads with it and the trip list highlights it
- `useNow()` (`src/hooks/`) is the only clock read for these: a `DateTime` re-read on
  `visibilitychange`, so a restored PWA shows the present without a tap

**Trip timeline** (`src/pages/trip-timeline.tsx`, `src/components/trip-timeline/`, `src/lib/timeline/`):
- `TimelineElement` is `{ id, tripItemId, type, at, title, summary }`. `buildTimelineDays(elements,
  filter?)` is pure: it sorts by instant, buckets by local date in the origin zone (the zone of the
  earliest element, filtered or not), filters before bucketing, emits only non-empty days as
  `{ date, elements }[]` and sets `otherDay` on an element whose own local date differs from its
  day. The page reads `useTripItems` once and derives the chips, the days and the unknown rows from
  that one array
- One `section` per day: a sticky `TimelineDayHeader`, the app's only `position: sticky`, then a
  `TimelineRow` per element, each in its own zone, with a `5 Sep` prefix when `otherDay`. Items of
  a type this build does not know follow the days as muted `UnknownItemRow`s, under `All` only
- The header's `children` is `TimelineChips`: `All` plus one chip per type present, single-select,
  held in local state. A filter whose last item went away is cleared, so `All` stays active when
  that type returns
- The item routes are children of `/trips/:tripId`. View, edit, create and the type picker
  (`items/new` with no `type`) render into one `data-slot='detail-pane'` node, which exists
  exactly when `useOutlet()` is non-null. `AppShell` makes it the 400px column of a
  `1.35fr 400px` grid above 900px; below, it is `fixed inset-0` over the still-mounted timeline.
  Both rows of the open item carry `bg-accent` and a `border-brand` edge
- The floating `+` links to the type picker; a picker tile replaces it with
  `…/items/new?type=…`, so back and save return to the timeline. Empty reads `Nothing planned
  yet`; loading shows `SkeletonRows`

**Trip list** (`src/pages/trips.tsx`, `src/components/trip/`): one grouped list on both viewports,
no table, tabs or chip row. `TripRow` owns its `min-w-0`, clamps the name to two lines and stacks
the items chip over the countdown chip, top-aligned. No row carries a status badge. Each row's `···`
(`DropdownMenu`) holds `Edit`, to `/trips/:id/edit`, and `Delete`, behind `ConfirmDialog`. The
floating 48×48 `+` sits bottom-right over the list's scroller on both viewports and links to
`/trips/new`. Empty reads `No trips yet`; loading shows `SkeletonRows`

**Trip form** (`src/pages/trip-create.tsx`, `src/pages/trip-edit.tsx`, `src/components/trip/`):
`/trips/new` and `/trips/:id/edit` render the one `TripForm` — name, start and end date, description.
`trip-form-schema.ts` holds its zod schema (name capped at 100 through `schemas.string`, end date not
before start) and the two conversions: `tripFormValues(trip)` reads each date in the trip's own zone,
and `tripFromFormValues(values, zone)` anchors each date to the start of that day in `zone` — the
device zone on create, the trip's start zone on edit. `Cancel` and `Save` sit in a footer bar inside
the `<form>`, and `Save` is disabled until the form is dirty, so a save always writes a real change.
Creating replaces the form with the new trip's timeline in history

**Home** (`src/pages/home.tsx`, `src/components/home/`): `HomeTripCard` on the left and
`AllTimeStatsMockup` in a 400px column on the right above 900px, stacked below it. Each sits in its
own `Suspense` with no fallback, so the card slot is empty while trips load and `All time` paints at
once. `HomeTripCard` takes the summary `selectHomeTrip` picked and `now`; with none it reads
`No upcoming trips` with no button. `AllTimeStatsMockup` takes no props and every value is a literal:
it is deleted whole when a statistics service exists. Its content is the same on both viewports;
only its year labels change, two digits on mobile and four on desktop, via `data-shell`

## Testing

`pnpm test` runs the suite and CI runs it on every pull request, so a change that breaks a test
breaks the build.

**Test a decision, never a rendering.** A pure function or a calculation is always tested, on its
own, with no rendering and no providers — hand it values and check what comes back. A component
earns a test when it *chooses* something: which state it shows, whether a control is enabled, what
a filter does to a list, what a dialog writes. A component that only paints the props it was given
gets no test; asserting that a row renders the name it was passed restates the JSX and fails only
when someone changes it deliberately.

**Not owed, and not an oversight.** Anything visual — spacing, colour, truncation, clamping,
reserved widths — and the 900px breakpoint. jsdom computes no layout, so a test cannot see any of
it. Both presentations of the shell are verified by looking at them, not by asserting on them.

**No snapshots, no visual or end-to-end testing.** A snapshot's only failure mode here is "accept
the new one", which trains people to approve diffs unread.

**Prefer a seam to a mock; mock only what the environment cannot provide.**

- Automerge is always real: an in-memory `Repo` (`new Repo({ network: [] })`), never a fake store
  or a stubbed hook. Two repos connected over `MessageChannelNetworkAdapter` cover sync, as
  `src/store/trips-sync.test.tsx` does. Mocking a CRDT tests your model of merge, not merge.
- Time enters as an argument. The functions in `src/lib/trip/` take `now`; pass a date rather than
  freezing a clock.
- `Dictionary` takes its `fetcher` in config, so a test supplies rows instead of HTTP.
- `window.location.reload` is the one thing that must be stubbed, because jsdom does not implement
  it.

Reaching for a mock usually means an argument is missing. Add the argument — but only once
something real needs it, not on the chance that a test might.

**Components take props; pages call the store hooks.** Most components then need no repo, no
wrapper and no stub at all, because props are data rather than fakes.

**Clear `localStorage` between cases.** The theme, the root document URL, the rail's collapse state
and the dictionary caches all live there.

**Both navigations are in the DOM at once.** The shell renders the rail and the tab bar on every
page and hides one with CSS, which jsdom does not apply, so every navigation link appears twice.
Scope the query to the one you mean — `within(screen.getByRole('navigation', { name: 'Primary' }))`
— or query inside `main`. Never `getAllByRole(...)[0]`: it depends on DOM order and keeps passing
while pointing at the wrong element.

**Tests land with the code they cover**, in the same change, not in a later pass.

## Custom Instructions

### Creating React Components with Refs
**IMPORTANT**: In React 19, `forwardRef` is deprecated and should not be used for new components.

Instead of wrapping components with `forwardRef`, pass `ref` as a regular prop:

```tsx
// ❌ DON'T use forwardRef (deprecated in React 19)
const MyComponent = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref}>{props.children}</div>;
});

// ✅ DO pass ref as a prop
function MyComponent({ ref, ...props }: Props & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref}>{props.children}</div>;
}
```

Propagate `ref` property ONLY if it's used (e.g., for React Hook Form integration).

### React Hook Forms specifics

RHF expects custom components to accept and propagate `ref` to the underlying form input:

```tsx
const { onChange, onBlur, name, ref } = register('firstName');

<input
  onChange={onChange}
  onBlur={onBlur}
  name={name}
  ref={ref}
/>
// same as above
<input {...register('firstName')} />
```

### Never use Server Components

This project doesn't use and doesn't intent to use Server Components in any way. So you should not have anything like "use server" or "use client". Moreover, be very accurate when using async functions since React components supports them not everywhere.
