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
- **Styling**: Tailwind CSS v4 (using @tailwindcss/vite plugin)
- **Animations**: Motion (Framer Motion) library
- **Component Patterns**:
  - Class-variance-authority (CVA) for component variants
  - Radix UI primitives (Slot component)
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

**Code Style**:
- No semicolons (enforced by ESLint @stylistic/semi rule and Prettier)
- Single quotes
- 2-space indentation
- TypeScript strict mode enabled
- React Refresh for Fast Refresh during development

### Component Architecture

**Timeline Components** (`src/components/timeline/`):
- Compound component pattern with multiple sub-components exported
- `TimelineLayout` is a wrapper that handles data mapping and animations
- Core `Timeline` component with sub-components: `TimelineItem`, `TimelineTime`, `TimelineIcon`, `TimelineConnector`, etc.
- Supports loading and error states
- Props are typed via `TimelineElement` interface in `types.ts`
- Layout reverses items array for chronological display (oldest at bottom)

**Button Component** (`src/components/ui/button.tsx`):
- Uses CVA for variant management
- Supports `asChild` pattern via Radix Slot for composition
- Multiple size and variant options

**Icon Component** (`src/components/icon/icon.tsx`):
- Wrapper around Lucide React icons
- All used icons should be wrapped by it before being used.

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
- Path aliases configured to match Vite

### PWA Configuration

The app is configured as a Progressive Web App:
- Auto-updates service worker on new deployments
- Workbox caching for JS, CSS, HTML, SVG, PNG, ICO files
- Manifest with app name "Reisenotiz", standalone display mode
- Icons: logo192.png and logo512.png

## Custom instructions

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

From the official React 19 documentation:
> "In React 19, forwardRef is no longer necessary. Pass ref as a prop instead. forwardRef will be deprecated in a future release."

Propagate `ref` property ONLY if it's used. Like, for example, when you need the component as a part of the React Hook Forms (see more below).

### React Hook Forms specifics

This is an example from official doc on the output of `register` function:

```tsx
const { onChange, onBlur, name, ref } = register('firstName');
// include type check against field path with the name you have supplied.

<input
  onChange={onChange} // assign onChange event
  onBlur={onBlur} // assign onBlur event
  name={name} // assign name prop
  ref={ref} // assign ref prop
/>
// same as above
<input {...register('firstName')} />
```

The snippet implies that RHF expects from custom component to provide `ref` property and to propagate it to a proper form input element.
