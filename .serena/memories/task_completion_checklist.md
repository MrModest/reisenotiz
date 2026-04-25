# Task Completion Checklist

After completing a coding task, run through these steps:

1. **Type-check + build**: `cd apps/frontend && pnpm build` (runs `tsc` then Vite)
2. **Lint**: `cd apps/frontend && pnpm lint` (zero warnings policy)
3. **Manual verification**: if UI-related, suggest the user run `pnpm dev` and check visually
4. **Unused code**: TypeScript strict mode enforces `noUnusedLocals` and `noUnusedParameters`

## Things to Verify
- No semicolons added (enforced)
- Single quotes used consistently
- No `forwardRef` usage (React 19 pattern: pass ref as prop)
- No `"use server"` or `"use client"` directives
- Icons wrapped with the custom `Icon` component
- Design system spacing/rounding followed (see `docs/agents/DESIGN_SYSTEM.md`)
- Path imports use `@/` alias (resolves to `apps/frontend/src/`)
- No draft/incomplete entities stored in Zustand

## Docker / compose changes
- `docker compose build` succeeds
- `docker compose up` starts the frontend without restart loops

## Notes
- No test framework is configured, so no test commands to run.
- Prettier is configured but no format script exists — IDE handles formatting.
