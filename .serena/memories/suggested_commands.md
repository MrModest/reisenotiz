# Suggested Commands

## Development
- `pnpm dev` — Start Vite development server
- `pnpm build` — Type-check with TypeScript (`tsc`) and build for production
- `pnpm lint` — Run ESLint on TypeScript/TSX files (zero warnings allowed)
- `pnpm preview` — Preview production build locally
- `pnpm generate-pwa-assets` — Generate PWA asset icons

## System Utilities (macOS / Darwin)
- `git` — Version control
- `ls`, `find`, `grep` — File and content search (standard BSD variants)
- Package manager: `pnpm` (not npm or yarn)

## Notes
- There are no test commands configured — no test framework is set up
- No formatting command exists in scripts, but Prettier is configured via `.prettierrc`
- The build script runs `tsc` first for type-checking before Vite build
