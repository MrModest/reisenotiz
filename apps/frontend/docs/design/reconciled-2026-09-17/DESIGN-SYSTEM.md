# Design system — Reisenotiz

What is true of every screen. For what is true of one screen, read `SCREENS.md`.

This folder is the design of record for the frontend. It is the reconciled outcome of the design
handoff that arrived in September 2026 and the decisions taken on
[#28](https://github.com/MrModest/reisenotiz/issues/28), and it is the only design material a
session building this app should open.

## What is in this folder

| File | What it is |
| --- | --- |
| `DESIGN-SYSTEM.md` | This file. Tokens, type, icons, interaction, layout constants. |
| `SCREENS.md` | One section per screen: route, composition, states. |
| `app.css` | The stylesheet the shadcn preset `b1GdgzGvQ` generates, exactly as the preset emits it. **Reference only.** |
| `frames/` | The drawn screens: `NN-name-dark.png` and `NN-name-light.png` per frame, `mockups.html` to read them all in a browser with a theme toggle, and `mockups.mjs` + `build.mjs` that produce both. |

**`app.css` is not imported by anything and must not be.** `src/index.css` is the file the app
ships. It carries the preset's palette plus the two font faces and `--font-mono` the preset does
not include ([#30](https://github.com/MrModest/reisenotiz/issues/30)), and it departs from the
preset in exactly three light-theme values, all for legibility
([#59](https://github.com/MrModest/reisenotiz/issues/59)): the added `--brand`, `--card` at
`oklch(0.985 0 0)`, and `--sidebar-primary` equal to `--brand`. `app.css` is here so a colour or a
radius can be checked against its source. Any other disagreement between the two is a bug to fix
rather than a choice to make.

The preset is regenerated with
`npx shadcn@latest init --preset b1GdgzGvQ --template react-router --pointer`.

## When something is undecided

Everything on these two documents was decided on the map and is cited. Where a question is genuinely
open, it is marked **Open** and belongs to the map owner, not to the session that finds it. Do not
resolve one by inventing an answer; a decision made in passing during a build is exactly what this
folder exists to prevent.

## Precedence

Three things can describe this app, and they rank:

1. **The decisions** — the map and its closed tickets. Top, always.
2. **The frames** in this folder, which are drawn *from* those decisions.
3. **The code**, which is neither a specification nor a record of one.

There is no fourth authority. The prose in `handoff-2026-09-07/` is history and does not rank at
all.

Where the drawing and a decision disagree, the drawing is wrong and is corrected. Where this
document and a cited ticket disagree, the ticket wins and the line here is a bug.

## Colour

Everything resolves to `src/index.css`. **Write Tailwind classes, never literal values** — not in
components, not in the drawing.

| Role | Class | Light | Dark |
| --- | --- | --- | --- |
| Page background | `bg-background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| Card, sticky bar, rail | `bg-card`, `bg-sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| Selected row, active nav | `bg-accent text-accent-foreground` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| Divider, card border | `border-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| Field border, secondary button | `border-input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| Primary text | `text-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| Secondary text and fine print | `text-muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| Filled button | `bg-primary text-primary-foreground` | `oklch(0.555 0.163 48.998)` | `oklch(0.473 0.137 46.201)` |
| Brand ink — eyebrow, countdown, active nav, links, selected-row edge, a needs-attention status | `text-brand`, `border-brand` | `oklch(0.555 0.163 48.998)` | `oklch(0.769 0.188 70.08)` |
| A value that contradicts its own context | `text-destructive` | preset | preset |
| Charts | `chart-2` → `chart-5`; `bg-muted` for an inactive bar | preset | preset |

**The brand is one orange, in two shades.** Every orange a reader must *read* — text, links, the
countdown, the active nav icon, the edge of a selected row — is `brand`, never a chart colour. It is
the dark theme's amber on dark, and on white the deeper shade the light theme's filled button already
uses, because no single orange reads on both: the amber is 2.2:1 on white, and the best compromise
value fails 4.5:1 on both backgrounds. `brand` is 5.05:1 on white, 4.84:1 on a light card and 9.2:1
on the dark background ([#59](https://github.com/MrModest/reisenotiz/issues/59)). The chart colours
keep their preset values, because a chart mark is not read as text. `--sidebar-primary` equals
`--brand` in both themes, so the rail and the tab bar light the same orange.

**Light cards are one step off white.** `--card` is `oklch(0.985 0 0)`, the light rail's value, so
in both themes a card and the rail share one surface colour. It is the darkest card on which
`text-muted-foreground` still passes 4.5:1 — 4.53:1 — so a grey caption on a card stays legible. The
separation from the page is slight, 1.04:1 against 1.10:1 in dark; borders still do most of it
([#59](https://github.com/MrModest/reisenotiz/issues/59)).

**Two text tiers, and no third.** There is no dimmer grey below `text-muted-foreground`: at 10px it
already fails 4.5:1 on this background.

**Both themes ship.** Dark is the design's own; light is the preset's neutral on a white page,
and the same classes resolve against it with no component changes.
The theme control lives in Settings on both viewports
([#37](https://github.com/MrModest/reisenotiz/issues/37)).

**No `--success` pair, and no green anywhere.** Declined on
[#34](https://github.com/MrModest/reisenotiz/issues/34): it would be the only colour in the app
outside the preset, spent on the state that needs the least attention.

**No shadows.** Surfaces separate with `border-border`. `--shadow-*` was removed from
`src/index.css` on [#30](https://github.com/MrModest/reisenotiz/issues/30) — Tailwind v4 reads
those from `@theme`, so the declarations were inert besides.

## Radius

Derived from `--radius: 0.45rem`, declared once on `:root`. There is **no `xs` step**, and
`rounded-xs` appears nowhere in `src/` — it resolves to Tailwind's stock 2px, which the design never
uses.

| Class | Resolves to | Used for |
| --- | --- | --- |
| `rounded-sm` | 4.32px | chips, badges, tab triggers |
| `rounded-md` | 5.76px | inputs, buttons, tab containers, combobox inputs, dropdown rows |
| `rounded-lg` | 7.2px | — |
| `rounded-xl` | 10.08px | cards, popovers, the 48px floating button |

Read off the drawing's own `border-radius` values on
[#30](https://github.com/MrModest/reisenotiz/issues/30): inputs and buttons 6px, badges and chips
4px, cards 10px.

**`ui/badge.tsx` still defaults to `rounded-full`**, which disagrees with every badge in the design.
Fixing the component default is owed
([#30](https://github.com/MrModest/reisenotiz/issues/30)).

## Spacing

Tailwind's own scale. There are no `--spacing-*` custom properties, and the ones that existed were
removed unused. The design's values map as `4 6 8 10 12 16 20 26` → `1 1.5 2 2.5 3 4 5 6.5`.

The 22px and 26px bottom paddings in the drawing are the **home-indicator inset**, not a spacing
token. Use `env(safe-area-inset-bottom)` with 22px as the fallback
([#33](https://github.com/MrModest/reisenotiz/issues/33)).

## Type

**Inter** for UI, **JetBrains Mono** for times, codes, counts and all-caps labels. Both are loaded
from `@fontsource-variable/*` as runtime dependencies and imported at the top of `src/index.css`.
Without `--font-mono` the timeline's time column stops aligning.

- Display 36 / 26 · title 20 / 17 / 15 · body 14 / 13 · mono 14 / 13 / 11 / 10. Nothing below 10px.
- **The mono caps label** is one class string:
  `font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground`. It is a plain `div` or
  `h3`, **not** a `Label` — it has no control.
- A `Label` is used only where a real control follows, and always carries `htmlFor`.
- **Numbers set in Inter take `tabular-nums`** — stat values, the countdown. Times and codes are
  mono already.
- **Uppercase is CSS, never the formatter.** Formatters return natural case
  ([#53](https://github.com/MrModest/reisenotiz/issues/53)).

## Dates and times

Eight named shapes in `src/lib/datetime/`, and no screen invents a ninth
([#53](https://github.com/MrModest/reisenotiz/issues/53)).

| Name | Output | Where it is spent |
| --- | --- | --- |
| `time` | `08:40` | timeline time column; both flight hero ends; stay hero `FROM 14:00` / `BY 11:00`; both forms' time fields |
| `dayShort` | `Sat, 05 Sep` | timeline day header; both stay hero dates; flight view subline |
| `dayMonth` | `5 Sep` | timeline row date prefix; stay hero planned row; the unused-night note |
| `dayOfMonth` + `monthShort` | `05` / `Sep` | the trip-list date block, as two values |
| `dateRange` | `5 – 16 Sep 2026` | home card meta line; timeline `PageHeader` subtitle |
| `utcOffset` | `UTC+2` | under each flight hero airport code; stay view subline |
| `duration` | `1h 20m` | flight hero |
| `dateISO` | `2026-09-05` | both forms' date inputs — machine format |

- **Formatting is fixed in the app**, never read from the browser locale. 24-hour, Monday first,
  English month names. All-numeric dates are day-first.
- **One shape carries a year** — `dateRange`, which names a trip and is read from a list spanning
  many. Every other date is read inside a trip whose year is already established.
- **Every time renders in its own place's zone**, never the reader's
  ([#29](https://github.com/MrModest/reisenotiz/issues/29)). `ZonedInstant` carries the zone, and
  `DateTime.from` applies it.
- **`UTC+2`, not `+02:00` and not `CET`.** Always defined, and subtractable.

The trip countdown — `In 7 days`, `In 3 months`, `Day 9 of 12` — is **not** a date shape. It is a
fact about a trip, and lives in `src/lib/trip/` beside `getTripStatus` and `getTripDayIndex`,
taking `now` as an argument ([#47](https://github.com/MrModest/reisenotiz/issues/47),
[#53](https://github.com/MrModest/reisenotiz/issues/53)).

`now` comes from one thin `useNow()` refreshed on `visibilitychange`. Never read the clock inside a
derivation: a backgrounded PWA that is restored does not re-render, so a trip that became ongoing at
midnight would read `UPCOMING` until the next tap.

## Icons

Lucide, through `src/components/icon/index.tsx`, which exports `Icon` and `IconName` and **nothing
else**. `LucideIcon` never leaves that file, so swapping icon libraries is one file's work
([#36](https://github.com/MrModest/reisenotiz/issues/36)).

- Pass an icon as `IconName`, never as a `ReactNode`.
- The body is a static map built from named imports, not a runtime `DynamicIcon` lookup — the
  dynamic version gave every icon its own chunk, made them appear a frame late, and tree-shook
  nothing.
- **Sizes**: 16 in rows, 18 in headers and chrome, 20 in navigation. `strokeWidth` 2 throughout.
- Icons inherit colour from the parent — `text-muted-foreground`, or `text-brand` when the item
  is next up or selected.
- Assigned today: `Plane` flight · `Bed` stay · `House` `Luggage` `Bookmark` `Settings` navigation ·
  `Plus` `ArrowLeft` `Ellipsis` chrome.

## Components

**Installed** from the `base-mira` registry with plain `pnpm dlx shadcn@latest add <name>`
([#35](https://github.com/MrModest/reisenotiz/issues/35)): `Button` `ButtonGroup` `Card` `Badge`
`Separator` `Item` `Empty` `Skeleton` `Input` `InputGroup` `Textarea` `Label` `Switch` `ToggleGroup`
`Sheet` `Dialog` `AlertDialog` `Popover` `Calendar` `ScrollArea` `Alert` `Progress`.

**Not installed**, each by decision:

- **`Sidebar`** — the desktop rail is hand-built. `Sidebar` transitively overwrites `button`,
  `input`, `separator`, `sheet`, `skeleton` and `tooltip`, and ships 24 exports for a fixed rail
  with no submenus ([#33](https://github.com/MrModest/reisenotiz/issues/33)).
- **`Spinner`** — nothing in the app spins
  ([#54](https://github.com/MrModest/reisenotiz/issues/54)).
- **`Table`** — the one table in the design was cut
  ([#47](https://github.com/MrModest/reisenotiz/issues/47)).

**Written here**: `SyncStatusBadge`, `PageHeader`, `SkeletonRows`, `ConfirmDialog` (on
`AlertDialog`), `useMapUrl()`, the timeline row and day header, the trip row, the saved place row,
and each type's own view, form and hero.

**Always run `--dry-run` and `--diff` on an install, never `-y`.** Several components pull others
and overwrite them.

**Base UI, not Radix.** There is no Radix dependency.

- `asChild` is the `render` prop. Every Base UI part takes an element or a
  `(props, state) => element`; forward the ref and spread all received props. `<Item render={<Link
  to={…} />}>` composes correctly with React Router.
- `Card`, `Table`, `Empty`, `Alert`, `Skeleton` are plain markup with no `render` — wrap them
  normally.
- `ToggleGroup` takes **`multiple?: boolean`**, not `type`, and `value` is always an array in both
  modes.
- **Do not adopt Base UI's `Field`.** `base-mira/form.json` is an empty item; keep the plain-`div` +
  React Hook Form `Controller` pattern. Layering Base UI's `Field` on top gives two competing
  validity models on one input. Keep RHF everywhere, including the simple forms.
- Popover and Dialog use Root / Trigger / Portal / Positioner / Popup. `Calendar` is
  react-day-picker. Base UI has no time field, so the time half of a date · time pair is a masked
  `Input`.

## Interaction

The drawing shows none of this. Every interactive element in a frame is a `div`; in the app it is a
`button`, an `a`, or a labelled input.

- **Rows and cards are links**, not click handlers.
- **Hover**: `hover:bg-accent/50` on rows and nav items, 150ms, no transform. Buttons take the
  shadcn defaults.
- **Focus**: the preset's `outline-ring/50`. Never removed.
- **Targets**: 44px minimum on mobile — the tab bar, the timeline row, every form control.
- **Forms** validate on blur and on submit against the type's zod schema (`mode: 'onTouched'`).
  **Save is disabled until the form is dirty**
  ([#56](https://github.com/MrModest/reisenotiz/issues/56)) — a no-op save writes a change into
  document history that then syncs to every device.
- **A half-filled form is not persisted, and there is no unsaved-changes guard.** Reloading or
  closing the tab loses it. Accepted deliberately on
  [#56](https://github.com/MrModest/reisenotiz/issues/56); wanted in a future iteration.
- **Offline is a working state, not an error.** Nothing warns, blocks or toasts when the connection
  drops ([#34](https://github.com/MrModest/reisenotiz/issues/34)).
- **Maps**: `useMapUrl(place)` builds one URL — `geo:` on Android, `maps://` on iOS,
  `https://www.google.com/maps/search/?api=1&query=` elsewhere. Platform sniffing lives in that hook
  and nowhere else.

## The shell

One breakpoint, **900px**, declared once as a named breakpoint in `@theme` and used only inside
`AppShell` ([#33](https://github.com/MrModest/reisenotiz/issues/33)). Tailwind's stock `md` (768px)
is untouched and its remaining usages die screen by screen.

**No `matchMedia`, no `useMediaQuery`, no `isMobile`, anywhere.** Both navigations render on every
page and CSS hides one. The detail pane is **one node in one position**, styled as a 400px grid
column above 900px and as `fixed inset-0` below it. Nothing in the app mounts twice.

Two consequences that are easy to trip over:

- **Both navigations are in the accessibility tree at once**, so each carries its own `aria-label` —
  `Primary` on the rail, `Main` on the tab bar. A test scopes with
  `within(screen.getByRole('navigation', { name: 'Primary' }))`, never `getAllByRole(...)[0]`.
- **The detail pane is in the DOM regardless of viewport.** A test expecting it absent below 900px
  is wrong.

**The page never scrolls.** The shell is `h-dvh` — not `h-screen`, whose `vh` includes the mobile
browser's collapsing URL bar and would cut off the tab bar. Each region owns its own scroller: the
rail, the main column, the detail pane.

**A region is a flex column of header · scroller · optional footer**, and only the middle element
scrolls ([#49](https://github.com/MrModest/reisenotiz/issues/49)). `PageHeader` is a **static
sibling above** that scroller, never `sticky` inside it, so it cannot scroll away and costs no
stacking context.

**Exactly one `position: sticky` survives in the app**: the timeline's day headers, at `top-0` of
their own scroller, which lands them directly under the static header.

No ancestor between a sticky element and its scroller may set `overflow`, `transform`, `filter` or
`contain` — each creates a containing block and kills sticky with no error.

**There is no centred column and no maximum measure.** `.w-default` is deleted. The only fixed
measures in the app are the rail (232px expanded, 64px collapsed) and the detail pane (400px), and
home's right column reuses the pane's 400px so the app has one fixed content width rather than two
near-identical ones.

## Truncation and overflow

One rule ([#55](https://github.com/MrModest/reisenotiz/issues/55)):

> **A surface truncates when something beside it needs protecting, and wraps when nothing does.**

| Surface | Behaviour |
| --- | --- |
| Trip row name, home card name | **two lines**, then ellipsis |
| Timeline row title and summary | one line each, ellipsis |
| Saved place row name and address | one line each, ellipsis |
| `PageHeader` title and subtitle | one line, ellipsis, every screen |
| Combobox and picker rows | one line, ellipsis |
| Chips and badges | `whitespace-nowrap` + `shrink-0`, truncating at a max width |
| Detail views — title, fact values, address, notes | **wrap, never truncate** |
| Anchors, anywhere | one line, ellipsis |
| Free text, anywhere | wraps, with `overflow-wrap: anywhere` |

**`min-w-0` ships inside the component that owns the flex row**, together with that row's truncate
or clamp class — `TripRow`, `TimelineRow`, `SavedPlaceRow`, `PageHeader`, `FactRow`. A screen author
never types it and never omits it. Without it the text does not clip, it *pushes*, shoving the chips
and the `···` out of the row; jsdom computes no layout, so nothing can test for it and no lint rule
can find it.

**Nothing in this app cuts a string in JavaScript.** `text-overflow: ellipsis` clips what is
painted and leaves the content whole, so a truncated link still copies and opens in full.

**Names are capped at 100 characters** through `schemas.string('Name', 100)` — trip name, saved
place name, `Person.fullname`, attachment name. `description`, `note` and attachment links stay
uncapped. 100 clears the longest airport name in `airports.csv` (90 characters), which must
validate because a saved place is materialised from that row.

**The app has exactly two horizontal scrollers**: the timeline's chip row and Saved places' chip
row, both with `ALL` pinned left. If any region scroller scrolls sideways, a rule above is being
violated somewhere.

## Loading, empty and error

Settled whole on [#54](https://github.com/MrModest/reisenotiz/issues/54).

**One `Suspense` and one error boundary per route, inside the shell, around the region's scroller** —
so navigation and `PageHeader` survive both a wait and a throw. On a phone, a boundary that takes the
navigation down leaves the back gesture as the only way out of a screen the app broke.

**`SkeletonRows` is the app's only loading visual**, on the trip list and the timeline only — the two
surfaces that read every trip file. It is *n* plain rectangles, **held invisible for 200ms** by a
CSS animation delay. The delay is the load-bearing half: without it the skeleton is a flicker on
every warm path, because a document already in memory never waits. Everything else that suspends
renders nothing.

**Four empty states, each one line, none with a button.** The floating `+` is more findable on an
empty screen than a full one, so a second control for the same action is noise.

| Surface | Copy |
| --- | --- |
| Home trip card | `No upcoming trips` |
| Trip list | `No trips yet` |
| Trip timeline | `Nothing planned yet` |
| Saved places | *the airports and places you use on trips appear here* |

**There is no filtered-empty state anywhere, and there cannot be.** Every chip row is derived from
what is present, so a chip exists only when something behind it does.

**Three things can go wrong and only two are errors:**

1. **The id is not in the index** — gated inline by `useTripExists`; `PageHeader` reads `Not found`.
2. **The trip file has not arrived** — `NotSyncedYet`. No button. It reads `useSyncStatus()` and
   reloads itself **once per mount** on the first transition to connected. This becomes the normal
   first-run state on every new device once an auth layer exists.
3. **Something actually broke** — `UnexpectedError`: one sentence and `Reload`. The internal message
   goes to `console.error` and is never rendered.

**There is no conflict state at any level.** The CRDT merges and this app never writes merge logic.
One rule keeps it true: *a screen that reads a single trip file and offers to delete it must
navigate away before `repo.delete` runs.*

## Layout constants

Measured, not derived.

| Element | Value |
| --- | --- |
| Desktop rail | 232px expanded · 64px collapsed |
| Desktop detail pane | 400px |
| Home's right column | 400px — the pane's measure, reused |
| Timeline grid, pane open | `1.35fr 400px`; `1fr` with no pane |
| Timeline time column | 44px mobile · 52px desktop, right aligned |
| Trip-list date block | 38px |
| Tab bar item | 52px min-width · 44px min-height |
| Floating add button | 48 × 48, `rounded-xl` |
| Switch | 38 × 22, fully rounded, 18px thumb |
| Dot rail markers | 8px — 2px ring at origin, filled accent at destination |
| Fact row | mono 11px label left · mono 12px value right · rule under each · 10px vertical padding · `last:border-0` |

## Reading and regenerating the drawing

- **The frames are crops.** Each is a fixed 390×844 or 1440×900 viewport with `overflow: hidden`.
  Content runs past the bottom edge where a screen is long; everything scrolls in the real app, so
  never fix a height or compress spacing to make content fit.
- **Frame numbers are what tickets cite**, never filenames. Numbers with no frame were retired with
  the trip item types they drew. Two frames are drawn twice: `06` with and without a planned
  interval, and `22` with the rail expanded and collapsed.
- **Each frame states its `now`** in `mockups.html`. Home, the trip list and the countdowns depend on
  it, and frame `01` is drawn a week before the trip while `02`, `22` and `24` are drawn on its
  ninth day.
- **Sticky and static look identical in a drawing.** What sticks is listed under *The shell* above,
  and it is one thing.
- **The sample data is illustrative.** A string in a frame is an example of its shape, not copy to
  reproduce.
- **Regenerate with `pnpm design:frames`** from `apps/frontend`. The drawing is styled by
  `src/index.css` itself, compiled by the app's own Tailwind, so a token change reaches the frames
  on the next render. It writes `mockups.html` and every PNG in both themes. Capturing needs
  Playwright's Chromium, which is not a dependency of the app.
- **Every colour in the drawing is a Tailwind class.** The theme toggle flips the whole drawing
  because of it; a frame that does not flip cleanly has a literal colour in it, which is a bug.
- **Fonts are inlined from `node_modules/@fontsource-variable/*`**, never fetched. The build fails if
  Inter or JetBrains Mono did not load, because a silent fallback to a system font makes every
  measurement in the drawing wrong.
