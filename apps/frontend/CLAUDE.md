# CLAUDE.md — Frontend

This file applies when working inside `apps/frontend/`. Run all commands from this directory.

## Working Directory

All paths in this document are relative to `apps/frontend/`. The `@/` alias points to `apps/frontend/src/`.

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- Custom dark mode variant using `@custom-variant dark (&:is(.dark *))`
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- **Design System**: `docs/agents/DESIGN_SYSTEM.md` documents the radius/spacing tokens as implemented here
  - ALWAYS consult it when creating or modifying UI components — it is the ground truth for token names and pixel values
  - Default to `rounded-xs` (4px); the UI is deliberately almost-square and compact
  - It describes the current UI rather than a target design; a redesign is planned

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
- Components use the hooks exported from `@/store`: `useTrips`, `useTrip`, `useTripItems`,
  `useTripItem`, `useTimelineElements`, plus `useCreateTrip` / `useUpdateTrip` / `useDeleteTrip`
  and the `TripItem` equivalents. `userRecords` covers saved airports and accommodations.
- **Document model**: one `RootDoc` per user (`tripIndex`, `userAirports`, `userAccommodations`),
  and one `TripDoc` per trip (`trip`, `tripItems`). The root doc URL is persisted in
  `localStorage`; trip URLs are discovered through the root index.
- **Storage**: IndexedDB locally. When `VITE_SYNC_SERVER_URL` is set the repo also connects to
  `apps/sync/` over WebSocket; absent, the app runs local-only with no error.
- **Conflicts** are resolved by Automerge's CRDT merge. Never write custom merge logic.
- Never mutate a document object returned from a hook — mutate inside the change callback.
- See `docs/agents/CRUD_FLOW_BEST_PRACTISE.md` for how drafts stay local until save.

### Component Architecture

**Layout Components** (`src/components/layout/`):
- `AppLayout` provides the main app shell with header context

**UI Components** (`src/components/ui/`):
~20 components built on Base UI primitives with CVA variants, including `Button`, `Input`,
`Textarea`, `Dialog`, `Popover`, `Tabs`, `Collapsible`, `Combobox`, `Calendar`, `Badge`,
`Switch`, `Separator`, `Item` and `Timeline`. Read the existing component before adding a new
one — most needs are already covered.

**Icon Component** (`src/components/icon/index.tsx`):
- Wrapper around Lucide React icons
- All used icons should be wrapped by it before being used
- Whenever you need pass an icon as a variable, DO NOT pass a ReactNote. Use `IconName` as a type and just use the generic `Icon` component with passing the `name={icon}` as property.

**Header Context** (`src/contexts/header-context.tsx`):
- Provides dynamic header title/actions
- `HeaderProvider` wraps the app; use the `useHeader` hook to set page headers

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
