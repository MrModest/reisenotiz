# Task Completion Checklist

After completing a coding task, run through these steps:

1. **Type-check**: Run `pnpm build` (runs `tsc` first) to verify no TypeScript errors
2. **Lint**: Run `pnpm lint` to ensure no ESLint violations (zero warnings policy)
3. **Manual verification**: If the change is UI-related, suggest the user run `pnpm dev` and check visually
4. **Check for unused code**: TypeScript strict mode enforces `noUnusedLocals` and `noUnusedParameters`

## Things to Verify
- No semicolons added (enforced but worth noting)
- Single quotes used consistently
- No `forwardRef` usage (React 19 pattern: pass ref as prop)
- No `"use server"` or `"use client"` directives
- Icons wrapped with custom `Icon` component
- Design system spacing/rounding followed (see `docs/agents/DESIGN_SYSTEM.md`)
- Path imports use `@/` alias
- No draft/incomplete entities stored in Zustand

## Notes
- No test framework is configured, so no test commands to run
- Prettier is configured but no format script exists — IDE handles formatting
