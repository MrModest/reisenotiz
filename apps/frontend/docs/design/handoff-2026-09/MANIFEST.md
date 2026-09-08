# Design handoff — travel planner screens (September 2026)

Source material for the frontend redesign. Produced by the Claude Design agent; imported here so
execution sessions can read it without the original upload.

The map that consumes this is [#28](https://github.com/MrModest/reisenotiz/issues/28).

## Which file to open

| File | Use it for | Notes |
| --- | --- | --- |
| `HANDOFF.md` | The spec in prose | Tokens, registry, routes, interactions, layout constants, copy rules. **Read this first.** |
| `travel-planner.dc.html` | The annotations | 25 frames carrying `data-component`, `data-variant`, `data-state`, `data-screen-label`. The only place the element → shadcn mapping exists. Does not render standalone — see below. |
| `travel-planner.standalone.html` | Reading the frames in a browser | Same document, flattened, fonts inlined. Opens offline with no network. Generated; do not hand-edit. |
| `travel-planner-screens.pdf` | Skimming everything at once | Single vector page, 2595×4589pt, real text. Best fidelity, but one page — an agent reading it gets the whole canvas scaled to illegibility. **Carries no annotations.** |
| `frames/*.png` | Looking at one screen | 21 individual frames at 2× with correct type. What an agent should read. |
| `component-architecture.dc.html` | The reasoning | Token audit, buildability check per custom piece, Base UI deltas, the seven resolved inconsistencies. |
| `shadcn-preset-app.css` | **The authoritative token values** | The `app.css` the preset `b1GdgzGvQ` generates. Every colour and radius the design refers to resolves here. Reference only — do not import it; `src/index.css` is the file we ship. |
| `render-design-frames.mjs` | Regenerating `frames/` and the standalone file | Node script; run it from `apps/frontend`. See "Regenerating the frames" below. |

## Token alignment against the preset

`shadcn-preset-app.css` is where every colour and radius the design refers to resolves. Verified
against the frames:

- **Radius is derived, not enumerated.** `--radius: 0.45rem` (7.2px), then `sm` ×0.6 =
  **4.32px**, `md` ×0.8 = **5.76px**, `lg` ×1 = **7.2px**, `xl` ×1.4 = **10.08px**. The handoff's
  "4 / 6 / 10 px → `rounded-sm` / `rounded-md` / `rounded-xl`" is correct to within rounding.
- **There is no `--radius-xs` step.** `rounded-xs` therefore resolves to Tailwind's stock **2px**,
  which the design never uses — its smallest radius is 4px, i.e. `rounded-sm`. 21 usages across 10
  files still say `rounded-xs` (`button.tsx`, `input-styles.ts`, `tabs.tsx`, the three comboboxes,
  four `trip-item` components); they get rewritten, not protected by adding an `xs` step. See
  [#30](https://github.com/MrModest/reisenotiz/issues/30).
- **Light mode is covered.** `:root` carries a full light palette; the same Tailwind classes
  resolve against it with no component changes.
- **There are no `--spacing-*` custom properties.** Use Tailwind's own scale; `@theme inline`
  already exposes it.
- **`--font-mono` is not part of the preset.** `src/index.css` declares it
  (`JetBrains Mono`); the design needs it for times, codes and all-caps labels.
- **`.dark` re-declares colours only.** Radius is shared, declared once on `:root`.
- **The preset imports `tw-animate-css` and `shadcn/tailwind.css`**, neither of which is in
  `package.json`. `Sheet` / `Dialog` / `AlertDialog` animations likely need the first. Resolved in
  [#30](https://github.com/MrModest/reisenotiz/issues/30).

## Frames

Numbering is the source document's frame order; gaps are the four composite contact sheets
(`Mobile core`, `Mobile detail views`, `Mobile create and edit`, `Desktop`), which are the
individual frames tiled and are not committed.

| Frame | Screen | Cited by |
| --- | --- | --- |
| `01-home-mobile-.png` | Home (mobile) | [#38](https://github.com/MrModest/reisenotiz/issues/38), [#31](https://github.com/MrModest/reisenotiz/issues/31) |
| `02-trip-list-mobile-.png` | Trip list (mobile) | [#31](https://github.com/MrModest/reisenotiz/issues/31) |
| `03-trip-timeline-mobile-.png` | Trip timeline (mobile) | [#29](https://github.com/MrModest/reisenotiz/issues/29), [#32](https://github.com/MrModest/reisenotiz/issues/32) |
| `05-flight-view.png` | Flight detail | [#39](https://github.com/MrModest/reisenotiz/issues/39), [#36](https://github.com/MrModest/reisenotiz/issues/36) |
| `06-stay-view.png` | Accommodation detail | [#39](https://github.com/MrModest/reisenotiz/issues/39) |
| `07-long-transfer-view.png` | Long transfer detail | [#36](https://github.com/MrModest/reisenotiz/issues/36) |
| `08-city-transit-view.png` | Public transport detail | [#36](https://github.com/MrModest/reisenotiz/issues/36) |
| `09-amusement-view.png` | Amusement detail | out of scope — reference only |
| `10-food-view.png` | Food detail | out of scope — reference only |
| `11-generic-poi-view.png` | POI detail | [#36](https://github.com/MrModest/reisenotiz/issues/36) |
| `13-add-item-type-picker.png` | Add item type picker | [#36](https://github.com/MrModest/reisenotiz/issues/36) |
| `14-flight-edit.png` | Flight form | [#39](https://github.com/MrModest/reisenotiz/issues/39) |
| `15-stay-edit.png` | Accommodation form | [#39](https://github.com/MrModest/reisenotiz/issues/39) |
| `16-long-transfer-edit.png` | Long transfer form | [#32](https://github.com/MrModest/reisenotiz/issues/32) |
| `17-city-transit-edit.png` | Public transport form | [#32](https://github.com/MrModest/reisenotiz/issues/32) |
| `18-amusement-edit.png` | Amusement form | out of scope — reference only |
| `19-food-edit.png` | Food form | out of scope — reference only |
| `20-generic-poi-edit.png` | POI form | [#36](https://github.com/MrModest/reisenotiz/issues/36) |
| `22-home-desktop-.png` | Home (desktop) | [#38](https://github.com/MrModest/reisenotiz/issues/38), [#33](https://github.com/MrModest/reisenotiz/issues/33) |
| `23-trip-timeline-desktop-.png` | Trip timeline (desktop) | [#29](https://github.com/MrModest/reisenotiz/issues/29), [#33](https://github.com/MrModest/reisenotiz/issues/33) |
| `24-trip-list-desktop-.png` | Trip list (desktop) | [#31](https://github.com/MrModest/reisenotiz/issues/31), [#33](https://github.com/MrModest/reisenotiz/issues/33) |

## Regenerating the frames

```
pnpm add -D @fontsource/inter @fontsource/jetbrains-mono
node docs/design/handoff-2026-09/render-design-frames.mjs
```

Rewrites `travel-planner.standalone.html` and every file in `frames/` from
`travel-planner.dc.html`. Set `CHROMIUM_PATH` if Playwright cannot find a browser.

**Why a script is needed at all.** `travel-planner.dc.html` wraps its content in `<x-dc>` and
loads `support.js`, the Design Components runtime, which fetches React from **unpkg**. Where unpkg
is unreachable — agent sandboxes, offline, restrictive proxies — the custom element never upgrades
and every frame collapses to `0×0`. The script flattens the document before rendering. `support.js`
is deliberately **not** committed: the handoff states it is not part of the design, and the
flattened file does not need it.

## Reading the drawing correctly

From the handoff's own reproduction notes — these matter more than anything measurable off a frame:

- **The frames are crops.** Each is a fixed 390×844 or 1440×900 box with `overflow:hidden` and a
  14px bezel. The bezel is not part of the app. Everything scrolls in the real app: do not fix
  heights or compress spacing to fit.
- **Sticky is drawn as static.** Day headers, the trip-list search header and every action bar are
  sticky.
- **The 22px / 26px bottom paddings are the home-indicator inset**, not spacing tokens. Use
  `env(safe-area-inset-bottom)` with those as fallback.
- **Every interactive element is a `div`.** No hover, focus or motion is drawn. The interaction
  spec is in `HANDOFF.md`, not in the pixels.
- **Fact lists draw a divider under the last row** because it was easier to draw. Use `last:border-0`.

## Where the prose is wrong

`HANDOFF.md` is the designer's own write-up and contradicts the frames in places. Where they
disagree, **the frames win**. Known errors, all confirmed against the drawing:

- It says "seven types" repeatedly; the picker (`13-add-item-type-picker.png`) draws **eight**:
  Flight, Stay, Long transfer, City transit, Amusement, Food, Generic POI, Car rental.
- Its `ItineraryItem` shape omits **`Show on the timeline`** (drawn in `17-city-transit-edit.png`)
  and the **unscheduled / trip-ideas** toggle (drawn in `20-generic-poi-edit.png`).
- It omits both `MODE` enums — `TRAIN/BUS/FERRY/CAR` on long transfer, `BUS/TRAM/METRO/TAXI/WALK`
  on city transit — and the `TRAVEL/STAY/FOOD/POI` filter buckets, and the `HOW YOU MOVED`
  transport mix. Three overlapping classifications, none modelled. See
  [#32](https://github.com/MrModest/reisenotiz/issues/32).
- It assumes `type` string and display label are one field. They are not: the same type reads
  "Generic POI" on the picker tile and "Place" in the detail header.
- Its `fields: FieldSpec[]` declarative form spec is **rejected** for this project. See
  [#36](https://github.com/MrModest/reisenotiz/issues/36).

## Naming

Original filenames from the upload, renamed here to drop spaces:

- `Travel Planner.dc.html` → `travel-planner.dc.html`
- `Component Architecture.dc.html` → `component-architecture.dc.html`
- `README.md` → `HANDOFF.md` (so it does not read as this directory's own readme)
