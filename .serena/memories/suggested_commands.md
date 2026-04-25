# Suggested Commands

All package commands run **inside `apps/frontend/`**, not at the repo root.

## Development (`cd apps/frontend`)
- `pnpm dev` — Start Vite development server
- `pnpm build` — Type-check (`tsc`) then build for production
- `pnpm lint` — Run ESLint on TypeScript/TSX files (zero warnings)
- `pnpm preview` — Preview production build locally
- `pnpm generate-pwa-assets` — Generate PWA asset icons

## Docker (run from repo root)
- `docker compose build` — Build the frontend image
- `docker compose up` — Run the frontend container

## System Utilities (macOS / Darwin)
- `git`, `ls`, `find`, `grep` (BSD variants)
- Package manager: `pnpm` (never `npm` or `yarn`)

## Notes
- There is **no root `package.json`**. The repo root has no scripts.
- No test framework is configured.
- No formatting command in scripts; Prettier is configured in `apps/frontend/.prettierrc`. IDE handles formatting.
