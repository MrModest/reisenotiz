# Design System — Implemented Tokens

Token-level reference for Reisenotiz UI work: the radius and spacing scales **as they exist in
`apps/frontend/src/index.css` today**, and the values components actually use.

**Scope.** This file is the ground truth for *token names and pixel values*. For brand, colour,
typography, voice, iconography and composition, use the **`reisenotiz-design` skill** — it is the
design authority. This file exists because the skill documents a *differently named* radius scale
(see [Known discrepancy](#known-discrepancy) at the bottom); when you are writing Tailwind classes
against this codebase, the names below are the ones that compile.

## Border Radius Scale

Defined in the `@theme inline` block of `src/index.css`, so each maps to a `rounded-*` utility:

| Token          | Value              | Tailwind class |
| -------------- | ------------------ | -------------- |
| `--radius-xs`  | 0.25rem (4px)      | `rounded-xs`   |
| `--radius-sm`  | 0.375rem (6px)     | `rounded-sm`   |
| `--radius-md`  | 0.5rem (8px)       | `rounded-md`   |
| `--radius-lg`  | 0.75rem (12px)     | `rounded-lg`   |
| `--radius`     | `var(--radius-md)` | — (default)    |

`rounded-xl`, `rounded-2xl`, `rounded-full` and `rounded-none` are **not** redefined in the theme,
so they resolve to Tailwind's stock values.

### What components actually use

The app is dominated by `rounded-xs` (4px) — the "almost square" default. Match the neighbours of
the component you are touching rather than reaching for a bigger radius:

| Component type              | Radius in the code | Example                              |
| --------------------------- | ------------------ | ------------------------------------ |
| Buttons                     | `rounded-xs`       | `ui/button.tsx` base class           |
| Buttons, `xs` / `icon-xs`   | `rounded-sm`       | `ui/button.tsx` size variants        |
| Inputs                      | `rounded-xs`       | `ui/input-styles.ts`                 |
| Textareas                   | `rounded-sm`       | `ui/textarea.tsx`                    |
| Tabs, comboboxes            | `rounded-xs`       | `ui/tabs.tsx`, `ui/combobox/*`       |
| Dialogs                     | `rounded-xl`       | `ui/dialog.tsx`                      |
| Badges (pill)               | `rounded-full`     | `ui/badge.tsx`                       |
| Pill toggles                | `rounded-full`     | `ui/switch.tsx`, `ui/timeline/*`     |
| Flush / edge-to-edge blocks | `rounded-none`     | `ui/input-group.tsx`, `ui/calendar.tsx` |

## Spacing Scale

| Token          | Value           |
| -------------- | --------------- |
| `--spacing-xs` | 0.375rem (6px)  |
| `--spacing-sm` | 0.5rem (8px)    |
| `--spacing-md` | 0.75rem (12px)  |
| `--spacing-lg` | 1rem (16px)     |
| `--spacing-xl` | 1.25rem (20px)  |

Tailwind's own `gap-*` / `p-*` scale is based on `--spacing: 0.25rem`, so `gap-2` = 8px,
`gap-3` = 12px, `gap-4` = 16px. Prefer the Tailwind utilities in components; use the
`--spacing-*` variables in raw CSS.

### Padding conventions

- Form fields: `px-3` horizontal, minimal vertical
- Form field gaps: `gap-0.5` (2px) for tight label-to-input spacing
- Cards and collapsible sections: `p-3`
- Dialogs: `p-4`
- Popovers: `p-3`

## Implementation Notes

- Tokens live in `src/index.css`, exposed to Tailwind via `@theme inline`.
- Light values are on `:root`, dark overrides on `.dark` (via `@custom-variant dark`).
- Prefer Tailwind utilities (`rounded-xs`, `gap-4`) over hardcoded values; in raw CSS use
  `var(--radius-xs)`, `var(--spacing-md)`.
- Test both light and dark modes.

## Design Philosophy

- **Almost-square** — 4px is the working default; 12px is already large here
- **Compact** — tight gaps, minimal padding, dense information
- **Hierarchy through size and weight**, not rounding

## Known discrepancy

The `reisenotiz-design` skill documents a radius scale with the **same names but different
values** (`--radius-md` = 4px there, 8px here; it also defines `--radius-2xl`, which this
codebase does not). Both agree on the *philosophy* — a 4px almost-square default — but an agent
following the skill's table and writing `rounded-md` on a button would get 8px instead of the
intended 4px.

**Until that is reconciled, the table in this file is what compiles.** Reconciling means either
renaming the scale in `src/index.css` and updating every `rounded-*` call site (a real visual
change, needs review) or correcting the skill's table. Neither has been done.
