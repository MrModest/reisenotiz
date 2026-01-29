# Code Style and Conventions

## Formatting
- **No semicolons** (enforced by ESLint `@stylistic/semi` and Prettier)
- **Single quotes** (Prettier config)
- **2-space indentation** (EditorConfig + Prettier)
- **LF line endings** (EditorConfig)
- **UTF-8 encoding**
- **Trailing newline** at end of files

## TypeScript
- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- Bundler module resolution
- ES2020 target
- Path alias: `@/*` → `./src/*`

## React Patterns
- **React 19**: Do NOT use `forwardRef`. Pass `ref` as a regular prop when needed.
- **No Server Components**: No `"use server"` or `"use client"` directives
- **React Compiler** enabled — code should be compatible with it
- **Component variants**: Use CVA (class-variance-authority)
- **Class merging**: Use `cn()` utility from `@/lib/utils`

## Icon Usage
- All icons come from Lucide React
- Always wrap with the custom `Icon` component from `@/components/icon/icon.tsx`
- When passing icons as variables, use `IconName` type and the generic `Icon` component with `name={icon}` prop

## Design System
- Subtle rounding (almost square): 4px–12px max
- Compact spacing with tight padding
- See `docs/agents/DESIGN_SYSTEM.md` for full border radius and spacing scales
- Components should use Tailwind theme variables, not hardcoded (even Tailwind-provided) colors
- Design tokens defined in `src/index.css` via `@theme` directive

## State Management
- Zustand for global state (only valid, complete entities)
- React Hook Form + Zod for form state and validation
- Draft state stays local (never in global store)

## CRUD Flow Pattern
- Separate routes for Create/View/Edit (no mode flags)
- Reusable form components (don't fetch, navigate, or know create vs edit)
- Pages orchestrate data, navigation, and persistence
- See `docs/agents/CRUD_FLOW_BEST_PRACTISE.md` for detailed patterns

## File Organization
- Components in `src/components/` (grouped by domain: ui, layout, timeline, trip, etc.)
- Pages in `src/pages/`
- Types in `src/types/`
- Hooks in `src/hooks/`
- Store in `src/store/`
- Utilities in `src/lib/`
- Services in `src/services/`
- Mock data in `src/stubs/`
