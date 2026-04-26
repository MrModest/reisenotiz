# Reisenotiz Design System

## About the Product

**Reisenotiz** (German: "travel note") is a self-hosted, offline-first travel notes PWA. It helps users track trips, flights, accommodations, and travel documents — all stored locally in the browser via localStorage. MVP stage; no backend sync yet.

- **GitHub**: https://github.com/MrModest/reisenotiz
- **Tech stack**: React 19, Vite, Tailwind CSS v4, Zustand, Lucide React, Base UI, React Hook Form, Zod, Luxon
- **Platform**: Mobile-first PWA (installable), with a responsive desktop layout (sidebar + main content)

### Source materials used
- Codebase: `MrModest/reisenotiz` GitHub repo (main branch)
- `apps/frontend/src/index.css` — full token definitions
- `docs/agents/DESIGN_SYSTEM.md` — spacing + radius guidelines
- `apps/frontend/CLAUDE.md` — architecture + code style
- `docs/screenshots/` — three reference screenshots (TripTimeline, FlightView, HotelView)

---

## CONTENT FUNDAMENTALS

### Tone & Voice
- **Practical, no-nonsense**: copy is minimal and functional. No marketing fluff.
- **Second-person ("you")**: actions are framed from the user's perspective.
- **Lowercase labels**: nav items and button labels use sentence case, not title case (e.g. "New Trip", "Check-in").
- **No emoji** in the app UI; icons (Lucide) handle visual communication. **Exception:** country flag emoji (🇩🇪, 🇯🇵, etc.) are permitted in airport/location pickers where Lucide has no equivalent.
- **German-origin name** but the UI is English throughout.
- **Concise descriptions**: item descriptions are short one-liners (e.g. "Dummy-hotel-straße 345, 12345 Leipzig").
- **Time formats**: 24-hour clock (e.g. "19:00"), short date format (e.g. "Mon, 01 Dec").
- **Confirmation dialogs** use plain declarative language: "Are you sure you want to delete X? This action cannot be undone."
- Placeholder / error copy: "Trip not found", "No timeline items to display" — simple, lowercase after first word.

### Casing
- Page titles: Title Case (e.g. "Trip to Japan")
- Buttons: Title Case for primary actions ("New Trip", "Delete"), sentence case for secondary
- Navigation labels: Title Case ("Home", "Trips", "Settings")

---

## VISUAL FOUNDATIONS

### Colors
The palette uses **OKLCH color space** throughout. Two themes: light and dark.

**Primary (brand orange/terracotta):**
- `--primary`: oklch(0.6397 0.172 36.44) — warm orange-red, used for CTAs, active states, timeline icons
- Light and dark mode share the same primary color

**Background family (light):**
- `--background`: oklch(0.9383 0.0042 236.50) — cool off-white with a faint blue tint
- `--card`: oklch(1 0 0) — pure white cards
- `--sidebar`: oklch(0.903 0.0046 258.33) — slightly cooler sidebar

**Background family (dark):**
- `--background`: oklch(0.2598 0.0306 262.67) — deep blue-navy
- `--card`: oklch(0.3106 0.0301 268.64) — slightly lighter blue-navy card
- `--sidebar`: oklch(0.31 0.0283 267.74) — sidebar matches card

**Text:**
- `--foreground`: oklch(0.3211 0 0) light / oklch(0.9219 0 0) dark — near-black / near-white
- `--muted-foreground`: muted gray for secondary labels

**Semantic:**
- `--destructive`: oklch(0.6368 0.2078 25.33) — warm red-orange for delete/error states
- `--accent`: blue-tinted highlight for hover/active states

### Typography
- **Sans (primary)**: Inter — used for all UI text
- **Serif**: Source Serif 4 — available but not used in current UI
- **Mono**: JetBrains Mono — code / IDs

**Use the semantic type tokens**, never inline `fontSize` / `fontWeight`. Apply via `font: var(--text-X)`:

| Token | Spec | Use for |
|---|---|---|
| `--text-display`  | 24px / 600 | Page headers |
| `--text-title`    | 18px / 600 | Section titles |
| `--text-time`     | 20px / 600 | Time, airport codes (often in `--primary`) |
| `--text-subtitle` | 14px / 600 | Card titles, header titles, dialog titles |
| `--text-itemtitle`| ~13px / 600 | Timeline item titles |
| `--text-body`     | 14px / 400 | Default body |
| `--text-ui`       | 12px / 500 | Buttons, inputs, labels, nav items |
| `--text-caption`  | 12px / 400 | Muted descriptions |
| `--text-micro`    | 11px / 500 | Small metadata, dates |
| `--text-overline` | ~10px / 600 | ALL-CAPS field labels (pair with `text-transform:uppercase; letter-spacing:0.06em`) |
| `--text-mono`     | 12px / 400 | Code / IDs |

### Border Radius (subtle, almost square)
The dominant rounding philosophy is **almost-square**: most UI elements use 4–6px, never big pill or card curves.

- `--radius-none`: 0px — sharp corners
- `--radius-sm`: 0.125rem (2px) — minimal rounding (e.g. badges, toggles)
- `--radius-md`: 0.25rem (4px) — **default**; buttons, inputs, chips, action menus
- `--radius-lg`: 0.375rem (6px) — cards, list items, dialogs, section cards
- `--radius-xl`: 0.5rem (8px) — FAB, popovers, dropdowns
- `--radius-2xl`: 0.75rem (12px) — reserved; do not use in the app UI
- `--radius-full`: 9999px — badges (pill shape only)

### Spacing (compact)
- `--spacing-xs`: 0.375rem (6px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 0.75rem (12px)
- `--spacing-lg`: 1rem (16px)
- `--spacing-xl`: 1.25rem (20px)
- Cards use `p-3` (12px) internal padding
- Form field gaps: `gap-0.5` (2px) tight label-to-input

### Shadows (monotonic progression)
Each tier is visibly larger than the previous — use the smallest one that reads.
- `--shadow-xs` — hairline (1px y, 2px blur) — inputs, dividers
- `--shadow-sm` — default card rest state
- `--shadow-md` — card hover
- `--shadow-lg` — popovers, dropdowns
- `--shadow-xl` — modals
- `--shadow-2xl` — dialog overlay, FAB lift

Hover cards scale up slightly: `hover:scale-[1.02]`; active: `active:scale-[0.98]`

### Backgrounds & Surfaces
- No gradients in the app UI
- No illustrations or background images
- Flat surfaces with very subtle shadows
- Dark mode has a blue-navy depth: background → card → popover layered by OKLCH lightness

### Borders
- `--border`: oklch(0.885 0.0052 247.88) light / oklch(0.3843 0.0301 269.73) dark
- Borders are used sparingly — mainly on sidebar, header, and outlined items
- Most cards are borderless with shadow only

### Animations & Motion
- `transition-all duration-200` on cards
- `transition-colors duration-100` on items
- Framer Motion (`motion` library) used for timeline item entrance animations
- Hover: `hover:scale-[1.02]`, active: `active:scale-[0.98]` — subtle scale interactions
- No bounce; ease-in-out transitions
- FAB (+ button) appears bottom-right with a fixed position

### Interactive States
- Hover: `hover:bg-accent hover:text-accent-foreground` — blue tinted highlight
- Active nav: `bg-accent text-accent-foreground`
- Press: `active:scale-[0.98]`
- Focus: `focus-visible:ring-[2px] focus-visible:ring-ring/30`
- Disabled: `opacity-50 pointer-events-none`
- Destructive hover: `hover:bg-destructive/20`

### Cards
- Background: `--card`
- Rounded: `--radius-lg` (6px) — subtle, not pill-like
- Shadow: `shadow-sm`, upgrades to `shadow-md` on hover
- Padding: `p-3`
- Scale on hover: `hover:scale-[1.02]`

### Layout
- **Mobile**: full-width content, fixed bottom nav bar (h-16), content has `pb-16`
- **Desktop**: left sidebar (collapsible, 64px–256px wide) + main content area
- **Content max-width**: `w-full md:w-[480px]` — centered, max 480px on desktop
- Header: sticky top, `border-b border-border bg-background`, height ~52px
- No full-bleed backgrounds; content is padded `px-4 pt-2`

### Color Vibe of Imagery
- No imagery used in the app currently
- If used: cool/dark photography would fit the dark navy palette

---

## ICONOGRAPHY

### System
- **Lucide React** (`lucide-react ^1.7.0`) via `DynamicIcon` — stroke-based, consistent line weight
- All icons wrapped in `<Icon name={IconName} />` at `src/components/icon/index.tsx`
- Use `IconName` type for props; pass as string `name="trip"`, never as ReactNode
- CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.js`

### Full Icon Name → Lucide Mapping

| App name | Lucide name | Usage |
|---|---|---|
| `logo` | `map` | App logo fallback in header |
| `home` | `house` | Nav: Home |
| `trip` | `tickets-plane` | Nav: Trips, trip list items |

> **Note:** The UI kit prototype uses `map` as the Trips nav icon for brevity; production code should use `tickets-plane`.
| `settings` | `settings` | Nav: Settings |
| `timeline` | `calendar-fold` | Trip timeline |
| `flight` | `plane` | Flight items |
| `flight-departure` | `plane-takeoff` | Departure section |
| `flight-arrival` | `plane-landing` | Arrival section |
| `flight-checkin` | `id-card` | Flight check-in |
| `accommodation` | `bed` | Hotel/lodging items |
| `hotel-checkIn` | `square-arrow-right-enter` | Hotel check-in event |
| `hotel-checkOut` | `square-arrow-right-exit` | Hotel check-out event |
| `map-pin` | `map-pin` | Location pin |
| `back` | `chevron-left` | Back navigation |
| `add` | `circle-plus` | Add/create action |
| `edit` | `square-pen` | Edit action |
| `save` | `save` | Save action |
| `cancel` | `ban` | Cancel action |
| `trash` | `trash-2` | Delete action |
| `close` | `circle-x` | Close/dismiss |
| `x` | `x` | Close icon (compact) |
| `search` | `search` | Search |
| `check` | `check` | Checkmark |
| `check-circle` | `circle-check` | Success state |
| `person` | `user` | Passenger/person |
| `attachment` | `paperclip` | File attachment |
| `calendar` | `calendar` | Date picker |
| `time` | `clock-4` | Time |
| `info` | `info` | Info tooltip |
| `warning` | `triangle-alert` | Warning state |
| `no-data` | `circle-question-mark` | Missing/unknown data |
| `loader` | `loader-circle` | Loading spinner |
| `menu` | `panel-left` | Show sidebar |
| `sidebar-close` | `panel-left-close` | Collapse sidebar |
| `light-theme` | `sun` | Light mode toggle |
| `dark-theme` | `moon` | Dark mode toggle |
| `car` | `car` | Car transport |
| `train` | `train` | Train transport |
| `arrow-right` | `move-right` | Directional arrow |
| `chevron-down` | `chevron-down` | Expand/collapse |

### Sizes
- Nav items: `size-5` (20px)
- Default button icons: `size-3.5` (14px)
- Large button icons: `size-4` (16px)
- Timeline dot icons: `size-4` or `size-5`

### Logo
- Custom SVG at `assets/logo.svg` — black line art, transparent background
- On dark backgrounds: apply `filter: invert(1)` to show as white
- PWA icons: `assets/pwa-192x192.png`, `assets/pwa-512x512.png`
- No emoji used anywhere in the UI

---

## File Index

```
README.md                       ← This file
SKILL.md                        ← Agent skill definition
colors_and_type.css             ← Full CSS token library (light + dark)

assets/
  logo.svg                      ← App logo SVG
  pwa-192x192.png               ← PWA icon 192px
  pwa-512x512.png               ← PWA icon 512px
  favicon.ico                   ← Favicon
  screenshots/
    TripTimeline.png            ← Reference screenshot: Trip Timeline view
    FlightView.png              ← Reference screenshot: Flight detail view
    HotelView.png               ← Reference screenshot: Hotel detail view

preview/
  colors-light.html             ← Light mode color palette
  colors-dark.html              ← Dark mode color palette
  colors-semantic.html          ← Semantic color tokens
  typography.html               ← Type scale + font specimens
  spacing-radius.html           ← Spacing + border radius tokens
  shadows.html                  ← Shadow scale
  buttons.html                  ← Button variants + sizes
  badges.html                   ← Badge variants
  items.html                    ← Item list components
  timeline.html                 ← Timeline component
  forms.html                    ← Form fields + inputs
  navigation.html               ← Nav bar + header

ui_kits/
  app/
    README.md                   ← UI kit overview
    index.html                  ← Interactive prototype (main entry)
    AppShell.jsx                ← Layout shell with header + nav
    TripList.jsx                ← Trips list screen
    TripTimeline.jsx            ← Timeline screen
    TripItemView.jsx            ← Flight/Hotel detail view
    Dialogs.jsx                 ← Create trip dialog
```
