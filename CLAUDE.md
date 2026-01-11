# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start Vite development server
- `pnpm build` - Type-check with TypeScript and build for production
- `pnpm lint` - Run ESLint on TypeScript/TSX files
- `pnpm preview` - Preview production build locally

## Architecture Overview

### Tech Stack
- **Framework**: React 19 with Vite build tool
- **Routing**: React Router v7 with nested routes
- **Styling**: Tailwind CSS v4 (using @tailwindcss/vite plugin)
- **Date/Time**: Luxon wrapped in custom DateTime class (`src/lib/datetime/`)
- **Animations**: Motion (Framer Motion) library
- **Component Patterns**:
  - Class-variance-authority (CVA) for component variants
  - Radix UI primitives (Slot, Tabs, Separator)
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

**Code Style**:
- No semicolons (enforced by ESLint @stylistic/semi rule and Prettier)
- Single quotes
- 2-space indentation
- TypeScript strict mode enabled

### Application Structure

**Routing** (`src/routes.ts`):
- Nested routes under `AppLayout` wrapper
- Main routes: `/` (home), `/trips`, `/trips/:tripId`, `/trips/:tripId/items/:itemId`, `/settings`
- Edit routes follow pattern: `.../:itemId/edit`

**Domain Types** (`src/types/trip/`):
- Core types: `Trip`, `TripItem`, `Flight`, `Accomodation`, `Person`, `Address`, `Attachment`
- `TripItem` is the base interface for timeline elements with `TripItemType` discriminator

**Services** (`src/services/`):
- Dictionary pattern using class-based service (`Dictionary` class)
- Dictionaries provide lookup data (airports, etc.)

**Development Stubs** (`src/stubs/`):
- Mock data for trips, trip items, airports, timeline elements
- Used during development before backend integration

**DateTime Utilities** (`src/lib/datetime/`):
- Custom `DateTime` class wrapping Luxon
- Formatters for consistent date/time display

### Component Architecture

**Layout Components** (`src/components/layout/`):
- `AppLayout` provides the main app shell with header context

**Timeline Components** (`src/components/timeline/`):
- Compound component pattern with multiple sub-components exported
- `TimelineLayout` is a wrapper that handles data mapping and animations
- Core `Timeline` component with sub-components: `TimelineItem`, `TimelineTime`, `TimelineIcon`, `TimelineConnector`, etc.
- Supports loading and error states
- Props are typed via `TimelineElement` interface in `types.ts`
- Layout reverses items array for chronological display (oldest at bottom)

**UI Components** (`src/components/ui/`):
- `Button` - CVA-based with `asChild` pattern via Radix Slot
- `Tabs` - Radix UI tabs wrapper
- `Separator` - Radix UI separator
- `Item` - List item component

**Icon Component** (`src/components/icon/icon.tsx`):
- Wrapper around Lucide React icons
- All used icons should be wrapped by it before being used

**Header Context** (`src/contexts/header-context.tsx`):
- Provides dynamic header title/actions
- Use `useHeaderTitle` hook to set page headers

### Build Configuration

**Vite** (`vite.config.ts`):
- React plugin with React Compiler enabled (target: '19')
- Tailwind CSS via @tailwindcss/vite
- PWA configuration with auto-update, offline support, and workbox strategies
- CSS modules with camelCase convention

**ESLint** (`eslint.config.ts`):
- Flat config format
- TypeScript ESLint parser
- React Hooks rules (recommended-latest)
- React Refresh warnings for HMR
- Stylistic rules for semicolons (never)
- Unused vars warnings disabled

**TypeScript** (`tsconfig.json`):
- Bundler module resolution
- React JSX transform
- Strict mode with additional checks (noUnusedLocals, noUnusedParameters)

### PWA Configuration

The app is configured as a Progressive Web App:
- Auto-updates service worker on new deployments
- Workbox caching for JS, CSS, HTML, SVG, PNG, ICO files
- Manifest with app name "Reisenotiz", standalone display mode

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
