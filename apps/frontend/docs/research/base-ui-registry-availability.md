# Base UI / `base-mira` registry availability

**Question:** which shadcn components the redesign handoff assumes are installable in *this*
project's setup, and which have to be hand-written?

**Short answer:** all 13 are installable. None has to be hand-written. The real work is not
"write the missing components", it is "install them without clobbering the ones we already
hand-edited", plus three genuine API deltas versus Radix-era shadcn (`ToggleGroup` has no
`type` prop, plain-`div` components have no `render`/`asChild`, and there is no `Form`
component for this style).

Verified 2026-09-07 against the live shadcn registry, `base-ui.com` docs, the published
`shadcn@4.21.0` CLI, and `@base-ui/react@1.6.0` (the version `pnpm-lock.yaml` resolves).

---

## How style resolution works here

`apps/frontend/components.json` declares `"style": "base-mira"` and `"registries": {}`.
The shadcn CLI builds the item URL as `` `${registryUrl}/styles/${config.style}/${name}.json` ``
— verified directly in the published CLI bundle
(`shadcn@4.21.0`, `dist/chunk-B2MD6U5O.js`: `` styles/${t?.style??"new-york-v4"}/${n$1}.json ``).

So with this `components.json`, a plain `pnpm dlx shadcn@latest add card` resolves to
<https://ui.shadcn.com/r/styles/base-mira/card.json>. No `@base` prefix, no registry entry,
no extra flag is needed. Every install command in the table below is exactly that plain form.

`https://ui.shadcn.com/r/styles/index.json` still lists only the legacy `new-york` / `default`
styles and does **not** mention `base-mira`. That index is stale; the per-style item endpoint
is authoritative and returns 200 for every name below.

---

## 1. Availability table

Every one of the 13 resolves under `base-mira` with HTTP 200. "Primitive" is the
`@base-ui/react` subpath the installed file imports (verified present in the installed 1.6.0
package's 81 export subpaths).

| Handoff name | Available? | Registry name | Install command | Primitive used | Source |
| --- | --- | --- | --- | --- | --- |
| ButtonGroup | Yes | `button-group` | `pnpm dlx shadcn@latest add button-group` | none — `useRender` + `mergeProps` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/button-group.json) |
| Card | Yes | `card` | `pnpm dlx shadcn@latest add card` | none — plain `div`s | [item JSON](https://ui.shadcn.com/r/styles/base-mira/card.json) |
| Empty | Yes | `empty` | `pnpm dlx shadcn@latest add empty` | none — plain `div`s + CVA | [item JSON](https://ui.shadcn.com/r/styles/base-mira/empty.json) |
| Skeleton | Yes | `skeleton` | `pnpm dlx shadcn@latest add skeleton` | none — one `div` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/skeleton.json) |
| ToggleGroup | Yes | `toggle-group` | `pnpm dlx shadcn@latest add toggle-group` | `@base-ui/react/toggle-group`, `.../toggle` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/toggle-group.json) · [Base UI docs](https://base-ui.com/react/components/toggle-group) |
| Table | Yes | `table` | `pnpm dlx shadcn@latest add table` | none — semantic `<table>` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/table.json) |
| Sheet | Yes | `sheet` | `pnpm dlx shadcn@latest add sheet` | `@base-ui/react/dialog` (aliased `SheetPrimitive`) | [item JSON](https://ui.shadcn.com/r/styles/base-mira/sheet.json) |
| AlertDialog | Yes | `alert-dialog` | `pnpm dlx shadcn@latest add alert-dialog` | `@base-ui/react/alert-dialog` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/alert-dialog.json) · [Base UI docs](https://base-ui.com/react/components/alert-dialog) |
| ScrollArea | Yes | `scroll-area` | `pnpm dlx shadcn@latest add scroll-area` | `@base-ui/react/scroll-area` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/scroll-area.json) · [Base UI docs](https://base-ui.com/react/components/scroll-area) |
| Sidebar | **Yes** | `sidebar` | `pnpm dlx shadcn@latest add sidebar` | none directly — `useRender` + the `sheet` wrapper | [item JSON](https://ui.shadcn.com/r/styles/base-mira/sidebar.json) |
| Alert | Yes | `alert` | `pnpm dlx shadcn@latest add alert` | none — plain `div`s + CVA | [item JSON](https://ui.shadcn.com/r/styles/base-mira/alert.json) |
| Spinner | Yes | `spinner` | `pnpm dlx shadcn@latest add spinner` | none — one icon + `animate-spin` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/spinner.json) |
| Progress | Yes | `progress` | `pnpm dlx shadcn@latest add progress` | `@base-ui/react/progress` | [item JSON](https://ui.shadcn.com/r/styles/base-mira/progress.json) · [Base UI docs](https://base-ui.com/react/components/progress) |

The registry index at <https://ui.shadcn.com/r/index.json> lists 63 components and tags each
with the bases it supports (`base`, `aria`, `radix`). All 13 above carry `base`. The only
items *without* `base` support are the react-aria-only ones (`attachment`, `bubble`,
`marker`, `message`, `message-scroller`) and `form` (see §5).

### Transitive installs — read this before running anything

`registryDependencies` are pulled in transitively, and several point at files this repo has
**already customised**:

| Install | Also writes |
| --- | --- |
| `button-group` | `separator` |
| `alert-dialog` | `button` |
| `sheet` | `button` |
| `toggle-group` | `toggle` (new file — fine) |
| `sidebar` | `button`, `input`, `separator`, `sheet`, `skeleton`, `tooltip`, `hooks/use-mobile` |

Two confirmed casualties if those land unguarded:

- `src/components/ui/separator.tsx` exports a **project-local `SeparatorWithLabel`** that does
  not exist in the registry item. An overwrite deletes it.
- `src/components/ui/button.tsx` is an **older registry snapshot**. Diffing the live
  `base-mira` `button` against ours shows base-class drift (`rounded-md` vs our `rounded-xs`,
  a new `active:not-aria-[haspopup]:translate-y-px`, and `secondary` moving from
  `hover:bg-secondary/80` to a `color-mix(...)` hover). Same story for `separator`, which has
  moved from `data-[orientation=horizontal]:` to the shorter `data-horizontal:` variants.
  Overwriting is a silent visual change across the whole app.

`shadcn add` defaults to `--overwrite false` and prompts on conflict
([CLI docs](https://ui.shadcn.com/docs/cli)), so this is survivable — but do not pass `-y`.
Recommended: `--dry-run` first, then `--diff` the files you already own, and decline the
overwrite for `button` / `input` / `separator`.

### Two more install-time details

- **`use-mobile`.** `sidebar` ships `hooks/use-mobile.ts` (a 768px `matchMedia` hook). No
  such file exists in `src/hooks/` today, so no collision — but note `@base-ui/react` already
  exports `unstable-use-media-query`, so we would be carrying two media-query mechanisms.
- **Icons.** The raw JSON contains `<IconPlaceholder lucide="XIcon" tabler=... />` and an
  import from `@/app/(create)/components/icon-placeholder`. That is **not** a broken registry
  item: the CLI rewrites it using `components.json`'s `iconLibrary` (verified in
  `shadcn@4.21.0`, `dist/chunk-G5AI2VJ6.js` — it strips the placeholder, emits
  `<XIcon />`, adds the `lucide-react` import, and removes the placeholder import). With
  `"iconLibrary": "lucide"` we get direct `lucide-react` imports. Three of the 13 use it:
  `sheet` (`XIcon`), `spinner` (`Loader2Icon`), `sidebar` (`PanelLeftIcon`). This repo's
  convention (`apps/frontend/CLAUDE.md`: "All used icons should be wrapped by" `Icon`) means a
  post-install hand-edit to route those through `@/components/icon` — exactly what was already
  done to `dialog.tsx`.
- **Sidebar CSS tokens.** The `sidebar` item carries **no** `cssVars`, so it relies on
  `--sidebar*` already existing. They do: `apps/frontend/src/index.css` defines
  `--sidebar`, `--sidebar-foreground`, `--sidebar-primary(-foreground)`,
  `--sidebar-accent(-foreground)`, `--sidebar-border`, `--sidebar-ring` in both themes and
  maps them via `--color-sidebar*`. Nothing to add.

---

## 2. Sidebar — definitive answer

**It exists in the `base-mira` (Base UI) style, and installs.** The handoff's "verify this"
flag can be closed, and the "fall back to a Sheet plus a nav list" plan is unnecessary.

Evidence:

- <https://ui.shadcn.com/r/styles/base-mira/sidebar.json> returns 200 with a complete
  ~711-line `registry/base-mira/ui/sidebar.tsx`.
- The registry index marks `sidebar` as supporting all three bases (`base,aria,radix`).
- The file imports nothing from Radix. Its only primitive-level imports are
  `@base-ui/react/merge-props` and `@base-ui/react/use-render`.

The nuance worth stating plainly: **there is no Base UI `Sidebar` primitive.**
`https://base-ui.com/react/components/sidebar.md` returns **404**, and the installed
`@base-ui/react@1.6.0` has no `sidebar` export subpath. shadcn's sidebar *is* essentially
"a Sheet plus a nav list" — it renders `<Sheet>/<SheetContent>` on mobile (guarded by
`useIsMobile()`) and a CSS-grid rail on desktop — but shadcn has already written that for us,
along with `SidebarProvider`, cookie-persisted open state (`sidebar_state`, 7-day max-age),
a Cmd/Ctrl+B shortcut, `SidebarRail`, `SidebarInset`, `SidebarMenuSkeleton`, and 24 exports.
Writing it by hand would be re-deriving that file.

Judgement call for this app: a mobile-first PWA may not want a desktop rail at all. If the
redesign only needs the mobile drawer, installing `sheet` alone (and skipping `sidebar`) keeps
five extra transitive overwrites — `button`, `input`, `separator`, `skeleton`, `tooltip` —
off the table. Also note Base UI 1.6.0 ships a real `drawer` primitive
(<https://base-ui.com/react/components/drawer>, `@base-ui/react/drawer`) with a matching
`base-mira` registry item, which is a better fit than `sheet` for a swipe-dismissable
bottom sheet on mobile.

---

## 3. ToggleGroup — single *and* multiple, but **there is no `type` prop**

Both selection modes are supported. The API is **not** Radix's `type="single" | "multiple"`.

Base UI's `ToggleGroup` takes a boolean `multiple` (default `false`) and its value is
**always an array**, in both modes:

```ts
// @base-ui/react@1.6.0 — toggle-group/ToggleGroup.d.ts
value?: readonly Value[] | undefined
defaultValue?: readonly Value[] | undefined
onValueChange?: (groupValue: Value[], eventDetails: ToggleGroup.ChangeEventDetails) => void
multiple?: boolean | undefined   // @default false
```

Docs confirm it: "Add the `multiple` prop to allow pressing more than one toggle at a time"
(<https://base-ui.com/react/components/toggle-group>), whose single-select example is
`<ToggleGroup defaultValue={['left']}>` — an array even for one value.

The `base-mira` wrapper does not add a `type` prop; it types itself as
`ToggleGroupPrimitive.Props & VariantProps<typeof toggleVariants>` and only adds `variant`,
`size`, `spacing`, `orientation`. So:

- **Timeline filter bar (multiple):** `<ToggleGroup multiple value={kinds} onValueChange={setKinds}>` — direct fit.
- **Stay-kind / meal pickers (single):** `<ToggleGroup value={v ? [v] : []} onValueChange={([next]) => setV(next ?? null)}>`.
  Wrapping that array↔scalar adapter once (e.g. a `SingleToggleGroup`) is worth it if more
  than a couple of call sites need it; react-hook-form `Controller`s will otherwise each
  carry the boxing.
- Single mode still permits **deselecting** to an empty array. If a required choice must never
  be empty, guard in `onValueChange`.
- `ToggleGroupItem` is Base UI `Toggle`, so each item needs its own `value`.
- Also note `data-multiple` and `data-orientation` attributes are exposed for styling.

---

## 4. `asChild` → `render`

Confirmed, and it works for React Router `<Link>`.

Base UI's composition guide (<https://base-ui.com/react/handbook/composition>) is explicit:
"Use the `render` prop to compose a Base UI part with your own React components", accepting
either a `ReactElement` (`<Menu.Trigger render={<MyButton />}>`) or a render *function*
`(props, state) => ReactElement`. Its one contract: **"The custom component must forward the
`ref`, and spread all the received props on its underlying DOM node."**

Who takes `render`:

- **Every Base UI part.** `render` appears in the props table of each part in the API
  reference (checked on Field, Dialog, AlertDialog, Progress, ScrollArea, ToggleGroup pages).
  So all Base-UI-backed pieces of the 13 — `sheet`, `alert-dialog`, `progress`,
  `scroll-area`, `toggle-group` — inherit it.
- **shadcn wrappers built on `useRender`.** Of the new 13: `ButtonGroup`
  (`useRender.ComponentProps<"div">`) and five sidebar parts — `SidebarGroupLabel`,
  `SidebarGroupAction`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuSubButton`
  (`useRender.ComponentProps<"button" | "a" | "div">`). This is the same pattern this repo
  already uses in `src/components/ui/item.tsx`.
- **No `render` at all** on the plain-markup ones: `Card`, `Table`, `Empty`, `Alert`,
  `Skeleton`, `Spinner` are typed `React.ComponentProps<'div'|'table'|...>`. To make a Card a
  link, nest an `<a>`/`<Link>` inside it or render your own wrapper — there is no `asChild`
  escape hatch and adding one means editing the file.

**React Router `<Link>` satisfies the contract.** In `react-router@7`, `Link` is a
`React.forwardRef` whose body destructures its own router props and spreads `...rest` onto the
`<a>`, merging refs with `mergeRefs(forwardedRef, prefetchRef)`. So for navigable rows:

```tsx
<Item render={<Link to={`/trips/${id}`} />}>…</Item>
<SidebarMenuButton render={<Link to="/settings" />}>…</SidebarMenuButton>
```

Caveats worth knowing:
- `Link` sets `href` **after** spreading `...rest`, so `Link` wins on `href` — correct, but it
  means you cannot override the href through the Base UI part.
- `Link`'s `onClick` composition calls your handler first and skips navigation if
  `event.defaultPrevented` — so a Base-UI-supplied `onClick` (merged via `mergeProps`) still
  behaves correctly and can cancel navigation.
- `SidebarMenuButton` has a tooltip path; when `tooltip` is set it wraps in `Tooltip`, which is
  itself `render`-composed — nesting `render` props is the documented pattern.

---

## 5. Field — and what it means for react-hook-form

Two different things share the name. This matters.

**(a) Base UI's `Field` primitive genuinely ships all of it.** `@base-ui/react/field` exports
`Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, `Field.Error`,
`Field.Validity`, `Field.Item` (<https://base-ui.com/react/components/field>). It has real
validity state: `Field.Root` exposes `data-valid` / `data-invalid` / `data-dirty` /
`data-touched` / `data-filled` / `data-focused`, plus a `Root.State` of
`{disabled, touched, dirty, valid, filled, focused}`. `Field.Error` takes
`match` (`'valueMissing' | 'patternMismatch' | … | boolean`). `Field.Validity` is a render-prop
exposing the full `ValidityState` plus `errors`, `error`, `value`, `initialValue`.

Crucially for us, `Field.Root` accepts `dirty`, `touched`, `invalid` — each documented as
"Useful when the field state is controlled by an external library" — and `Field.Error`'s
`match` docs say specifying `true` "lets external libraries control the visibility". Base UI
designed this to be driven *by* RHF, not to compete with it.

**(b) The `field` we already have is NOT that.** `apps/frontend/src/components/ui/field.tsx`
is shadcn's base-agnostic `field` item: plain `div`/`fieldset`/`legend` markup plus CVA,
importing only `label` and `separator`. Verified by diffing against
<https://ui.shadcn.com/r/styles/base-mira/field.json> — no `@base-ui` import anywhere in it.
It exports `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`,
`FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`.

**Implication for react-hook-form — the important one:**
`https://ui.shadcn.com/r/styles/base-mira/form.json` returns 200 but is an **empty item**:

```json
{ "$schema": "…/registry-item.json", "name": "form", "type": "registry:ui" }
```

— no `files`, no `dependencies`. (The Radix style's `form.json`, by contrast, still lists
`react-hook-form`, `@hookform/resolvers`, `zod`.) The registry index confirms `form` is the one
component with **no** base support at all. **There is no `Form` / `FormField` /
`useFormField` component for this style, and none is coming via the registry.**

shadcn's own current guidance matches: <https://ui.shadcn.com/docs/forms/react-hook-form>
documents wiring RHF's `<Controller>` **directly** to the `Field` components, with no Form
wrapper layer:

```tsx
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>…</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      …
    </Field>
  )}
/>
```

So: nothing to install, nothing blocked. This repo's existing `src/hooks/use-form-field.ts`
and `src/components/trip-item/field-errors.tsx` are already the local stand-in for the missing
`Form` layer, and RHF is already used across nine form files. **Recommendation: keep the
plain-`div` `field.tsx` + `Controller` pattern and do not adopt Base UI's `Field` primitive.**
Mixing them would put two independent validity models (RHF's `fieldState` and Base UI's own
`ValidityState`/`validate`) on the same input; Base UI's `Field.Control` also wants to own the
control element, which fights `{...field}` spreading. If a Base UI part is ever needed for its
a11y wiring, drive it in "external library" mode: `<Field.Root invalid={fieldState.invalid}
dirty={fieldState.isDirty} touched={fieldState.isTouched}>` with `<Field.Error match />`.

---

## 6. Name collisions with the ~20 existing `src/components/ui/*`

**No filename collisions and no exported-symbol collisions.** None of
`button-group.tsx`, `card.tsx`, `empty.tsx`, `skeleton.tsx`, `toggle-group.tsx`, `table.tsx`,
`sheet.tsx`, `alert-dialog.tsx`, `scroll-area.tsx`, `sidebar.tsx`, `alert.tsx`, `spinner.tsx`,
`progress.tsx` exists today, and every export they introduce is namespaced by its own prefix.

The collisions that do exist are **indirect or semantic**:

| Kind | Detail |
| --- | --- |
| **Overwrite (real risk)** | `button`, `input`, `separator` are pulled transitively (see §1). `separator` would lose the local `SeparatorWithLabel`; `button`/`separator` would jump forward a registry generation. This is the only category that can actually break the build or change the design. |
| **New transitive files** | `toggle.tsx`, `tooltip.tsx` (from `toggle-group` / `sidebar`) and `hooks/use-mobile.ts`. New names, no clash. |
| **Semantic duplicate** | `Spinner` vs the existing `Loader` (`loader.tsx` — a centred, padded `Icon name='loader'`). They are not the same thing: `Loader` is a page-level block, `Spinner` is an inline glyph. Decide which one call sites use, or reimplement `Loader` on top of `Spinner`. |
| **Semantic duplicate** | `AlertDialog*` vs the existing `ConfirmDialog` (`confirm-dialog.tsx`, built on our `Dialog` with title/description/confirm/cancel props). `AlertDialog` is the a11y-correct primitive for exactly that job; the sensible move is to re-implement `ConfirmDialog`'s API on top of `AlertDialog` rather than run both. |
| **Near-miss, no conflict** | `Empty` vs `ComboboxEmpty` / `TimelineEmpty`; `ButtonGroupSeparator` / `SidebarSeparator` vs `Separator`; `SidebarInput` vs `Input`. All distinct identifiers. |

---

## Verified / not verified

**Verified first-hand**

- All 13 `base-mira` item JSONs fetched (HTTP 200) and their `.tsx` contents read.
- `@base-ui/react@1.6.0` installed from npm and inspected: 81 export subpaths; `alert-dialog`,
  `dialog`, `drawer`, `field`, `progress`, `scroll-area`, `toggle`, `toggle-group`,
  `merge-props`, `use-render` all present; **no** `sidebar`, `sheet`, `card`, `table`,
  `skeleton`, `spinner`, `alert`, `empty`, `button-group`.
- `base-ui.com/react/components/{sidebar,sheet,card,table,skeleton,spinner,alert,empty,button-group}.md`
  → 404; `{toggle-group,scroll-area,progress,alert-dialog,drawer}.md` → 200.
- `shadcn@4.21.0` installed and its bundle read for style-URL construction and the
  `IconPlaceholder` → icon-library transform.
- `react-router@7.18.3` installed and `Link`'s implementation read directly.
- Local diffs of `button.tsx` / `separator.tsx` / `field.tsx` against their live registry items.
- `pnpm-lock.yaml` resolves `@base-ui/react` to `1.6.0` (the manifest range is `^1.1.0`).

**Not verified / gaps**

- `node_modules` is not installed in this checkout, so nothing was type-checked or run. The
  claim "these compile against our TS/Tailwind config" is **unverified** — in particular the
  registry's newer Tailwind variant syntax (`data-horizontal:`, `data-vertical:`) was not
  exercised against our `tailwindcss@4.2.2` build.
- No actual `shadcn add` was executed (no `--dry-run` either), so the prompt-on-conflict
  behaviour is taken from the CLI docs and the `--overwrite` default, not observed.
- `unpkg.com` is blocked by the agent proxy; all package inspection went through `npm install`
  instead.
- Whether `lucide-react@^1.7.0` exports the exact names the registry emits
  (`XIcon`, `Loader2Icon`, `PanelLeftIcon`) is **unverified**.
- shadcn does not publish a changelog entry pinning when `base-mira` became the default Base
  UI style; the drift observed in `button`/`separator` is measured, but its date is unknown.
