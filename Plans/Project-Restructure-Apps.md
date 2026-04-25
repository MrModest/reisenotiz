# Plan: Move Frontend into `apps/frontend/`

## Audience

This plan is written to be executed by Sonnet 4.6 in a single Claude Code session. It assumes no prior conversation context. Read top to bottom before executing any step.

## Goal

Move the existing React 19 / Vite PWA out of the repository root into `apps/frontend/`. After this plan:

- `apps/frontend/` contains the entire frontend (source, configs, Dockerfile, nginx config).
- The repository root contains only cross-cutting files: `docker-compose.yml`, `.github/`, `docs/`, `Plans/`, README/ROADMAP/LICENSE/etc., `CLAUDE.md`, `.serena/`, `.claude/`, `.vscode/`, `.gitignore`, `.editorconfig`.
- `CLAUDE.md` is split into a thin root index plus `apps/frontend/CLAUDE.md` with frontend-specific guidance.
- `.serena/memories/` is updated to reflect the new path of the frontend code.
- `docker-compose.yml` and the GitHub workflows reference `apps/frontend/` instead of the old root paths.

Constraints:
- **No monorepo tooling.** No `pnpm-workspace.yaml`, no Turborepo, no shared `package.json`.

## Final Layout

```
reisenotiz/
├── apps/
│   └── frontend/
│       ├── src/
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── pnpm-lock.yaml
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       ├── eslint.config.ts
│       ├── components.json
│       ├── pwa-assets.config.ts
│       ├── .prettierrc
│       ├── Dockerfile          # moved from /docker/Dockerfile
│       ├── nginx.conf          # moved from /docker/nginx.conf
│       ├── .dockerignore       # moved from root
│       └── CLAUDE.md           # frontend-specific guidance
├── docker-compose.yml          # moved from /docker/docker-compose.yml, rewritten
├── .github/
│   └── workflows/
│       ├── _docker-build.yml         # context/file paths point to apps/frontend
│       ├── docker-amd64.yml          # path filter on apps/frontend/**
│       └── docker-arm64.yml          # path filter on apps/frontend/**
├── docs/
├── Plans/
├── docker/                     # DELETED entirely
├── CLAUDE.md                   # rewritten — root index pointing to apps/frontend/CLAUDE.md
├── README.md                   # updated dev/build instructions
├── ROADMAP.md
├── CLA.md
├── CONTRIBUTING.md
├── LICENSE
├── .gitignore
├── .editorconfig
├── .vscode/
├── .claude/
└── .serena/                    # memories updated to reflect new layout
```

## Pre-Flight

1. Confirm working tree is clean: `git status`. Abort if dirty.
2. Confirm branch: `git branch --show-current`. Create a feature branch: `git checkout -b chore/restructure-apps`.
3. Confirm `pnpm` is available: `pnpm --version`.
4. Read these files in full once before any moves so you have ground truth:
   - `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `eslint.config.ts`, `.prettierrc`, `components.json`, `pwa-assets.config.ts` (no path edits expected — all use relative paths within the app).
   - `docker/Dockerfile`, `docker/nginx.conf`, `docker/docker-compose.yml`, `.dockerignore`.
   - `.github/workflows/*.yml`.
   - `.serena/memories/*.md`.
   - `CLAUDE.md` (root) — capture the full content before overwriting.

## Step 1 — Create the `apps/frontend/` Directory

```bash
mkdir -p apps/frontend
```

## Step 2 — Move Frontend Files

Use `git mv` for everything (preserves history). Run from the repo root:

```bash
# Source and assets
git mv src apps/frontend/src
git mv public apps/frontend/public
git mv index.html apps/frontend/index.html

# Package + lockfile
git mv package.json apps/frontend/package.json
git mv pnpm-lock.yaml apps/frontend/pnpm-lock.yaml

# TS configs
git mv tsconfig.json apps/frontend/tsconfig.json
git mv tsconfig.node.json apps/frontend/tsconfig.node.json

# Build / lint / format / component configs
git mv vite.config.ts apps/frontend/vite.config.ts
git mv eslint.config.ts apps/frontend/eslint.config.ts
git mv .prettierrc apps/frontend/.prettierrc
git mv components.json apps/frontend/components.json
git mv pwa-assets.config.ts apps/frontend/pwa-assets.config.ts

# Docker artefacts (frontend-specific)
git mv docker/Dockerfile apps/frontend/Dockerfile
git mv docker/nginx.conf apps/frontend/nginx.conf
git mv .dockerignore apps/frontend/.dockerignore
```

After these moves the `docker/` dir still contains `docker-compose.yml` — handled in Step 4.

### Verify

```bash
ls apps/frontend/
ls -la apps/frontend/   # confirm dotfiles (.prettierrc, .dockerignore) moved
```

## Step 3 — Update the Dockerfile

The Dockerfile previously assumed build context = repo root, so it had `COPY docker/nginx.conf …`. Build context is now `apps/frontend/` (set in Step 4 + Step 5).

Edit `apps/frontend/Dockerfile`:

- Line `COPY docker/nginx.conf /etc/nginx/conf.d/default.conf` → `COPY nginx.conf /etc/nginx/conf.d/default.conf`
- Every other `COPY` line is already relative to the build context and remains unchanged.

No other edits required.

### Clean stale `.dockerignore` lines

`apps/frontend/.dockerignore` currently contains:

```
# Docker
docker/docker-compose.yml
Dockerfile*
.dockerignore
```

Remove the `docker/docker-compose.yml` line (file is no longer reachable from this context). Keep `Dockerfile*` and `.dockerignore` — those still correctly exclude the Dockerfile itself from the build payload.

## Step 4 — Move and Rewrite `docker-compose.yml`

Move:

```bash
git mv docker/docker-compose.yml docker-compose.yml
rmdir docker
```

The old version had a malformed image tag (`sha-5d84e0b-arm64:edge-amd64`) — that is a pre-existing bug. Replace with a clean `edge-amd64` tag and a comment about ARM.

Rewrite `/docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    image: ghcr.io/mrmodest/reisenotiz:edge-amd64 # change to `edge-arm64` for ARM64
    ports:
      - '8080:8080'
    # Uncomment to run with custom UID/GID
    # user: "1000:1000"
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
```

If the user explicitly asks to preserve the old broken image tag, revert that single `image:` line. Otherwise the clean form above is correct.

## Step 5 — Update GitHub Actions Workflows

Adjust the existing workflows so they point at the new frontend path.

### `.github/workflows/_docker-build.yml`

In the `Build and push Docker image` step, change:

```yaml
        with:
          context: .
          file: docker/Dockerfile
```

to:

```yaml
        with:
          context: ./apps/frontend
          file: ./apps/frontend/Dockerfile
```

Leave everything else (cache scope, metadata, login) unchanged.

### `.github/workflows/docker-amd64.yml` and `docker-arm64.yml`

Add path filters so unrelated changes don't trigger image rebuilds. Edit each file's `on:` block to:

```yaml
on:
  push:
    branches: [main]
    tags: ['v*.*.*']
    paths:
      - 'apps/frontend/**'
      - '.github/workflows/_docker-build.yml'
      - '.github/workflows/docker-amd64.yml'   # use docker-arm64.yml in the arm64 file
  pull_request:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - '.github/workflows/_docker-build.yml'
      - '.github/workflows/docker-amd64.yml'   # use docker-arm64.yml in the arm64 file
```

Leave the `jobs:` block unchanged. The image name and tag-suffix stay as they are.

## Step 6 — Rewrite Root `CLAUDE.md`

The root file becomes a thin index that points to the frontend's CLAUDE.md.

Replace `/CLAUDE.md` with:

```markdown
# CLAUDE.md

Guidance for Claude Code (claude.ai/code) at the **repo root**.

## Layout

- `apps/frontend/` — React 19 PWA. See `apps/frontend/CLAUDE.md` for app-specific guidance.

## When to Work in Which Directory

- Touching React UI, components, hooks, stores, PWA config → `cd apps/frontend` first, then read `apps/frontend/CLAUDE.md`.
- Touching `docker-compose.yml`, GitHub workflows, `docs/`, `Plans/`, root README/ROADMAP → stay at the root.

## Cross-Cutting Reference Documents

- `docs/agents/DESIGN_SYSTEM.md` — UI design system.
- `docs/agents/CRUD_FLOW_BEST_PRACTISE.md` — Create/View/Edit flow patterns.

## Tooling

- Use `pnpm` (never `npm` or `yarn`) inside the app directory.
- Run all package commands from inside the app directory: `cd apps/frontend && pnpm dev`. Not from the root.
- The root has no `package.json` — there are no root-level scripts.

## Docker

- The frontend builds from `./apps/frontend` via its own `Dockerfile`.
- `docker-compose.yml` at the root orchestrates the frontend service (`app`).
```

## Step 7 — Create `apps/frontend/CLAUDE.md`

Move the frontend-specific guidance out of the old root `CLAUDE.md` into a per-app file. All paths inside (`src/index.css`, `src/lib/datetime/`, etc.) remain valid because the app's own root is `apps/frontend/`.

Write `/apps/frontend/CLAUDE.md` with:

1. A short "Working Directory" preamble at the top.
2. The full original content of the **old root** `CLAUDE.md` (captured during Pre-Flight) below it, verbatim.

```markdown
# CLAUDE.md — Frontend

This file applies when working inside `apps/frontend/`. Run all commands from this directory.

## Working Directory

All paths in this document are relative to `apps/frontend/`. The `@/` alias points to `apps/frontend/src/`.

---

```

Then append the original CLAUDE.md content (Development Commands, Architecture Overview, Code Style, Custom Instructions, etc.) below the `---` separator.

## Step 8 — Update Serena Memories

Serena memories live at `.serena/memories/` and are scoped to one project. They currently describe a layout where the frontend lives at the repo root. Update each affected file so the paths point at `apps/frontend/`.

**Do not delete memories.** Overwrite with new content using the `Write` tool.

### `.serena/memories/project_overview.md`

Replace with:

```markdown
# Project Overview: Reisenotiz

The Reisenotiz frontend lives at `apps/frontend/`. The repository root has no `package.json`; all build, lint, and dev commands run from inside `apps/frontend/`.

## Purpose
Reisenotiz is a travel notes/trip planning Progressive Web App (PWA). It allows users to manage trips with timeline items such as flights, accommodations, and other travel-related entries. Users can also manage personal records (e.g., custom airport entries).

## Tech Stack
- **Language**: TypeScript (strict mode)
- **Framework**: React 19 with Vite 7
- **Routing**: React Router v7 (browser router, nested routes)
- **Styling**: Tailwind CSS v4 (OKLCH color space, CSS variables for light/dark theming)
- **State Management**: Zustand (with LocalStorage persistence)
- **Forms**: React Hook Form v7 + @hookform/resolvers v5 + Zod v4 validation
- **Date/Time**: Luxon (wrapped in custom DateTime class)
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React (wrapped via custom Icon component)
- **Component Variants**: Class-variance-authority (CVA)
- **UI Primitives**: Base UI (@base-ui/react) for Tabs, Switch, etc.
- **IDs**: uuid v13 for generating unique identifiers
- **PWA**: vite-plugin-pwa with Workbox
- **Build Optimization**: React Compiler (babel-plugin-react-compiler targeting React 19)
- **Package Manager**: pnpm

## Key Architecture Decisions
- **Offline-first**: Uses Zustand + LocalStorage, no backend yet
- **No Server Components**: Pure client-side React app
- **Draft vs Persisted state**: Drafts are local form state, only validated entities enter global store
- **Reusable forms**: Same form component for Create & Edit, pages orchestrate
- **forwardRef deprecated**: React 19 pattern — pass `ref` as a regular prop
- **Path aliases**: `@/` maps to `apps/frontend/src/`
- **User records**: Users can manage their own data records (e.g., custom airports) stored in a separate Zustand store
```

### `.serena/memories/codebase_structure.md`

Rewrite the top-level tree. Re-root every existing `src/...` path under `apps/frontend/`. Drop the old root-level config files (`package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.ts`, `.prettierrc`, `.editorconfig`, `pwa-assets.config.ts`, `components.json`, `index.html`, `public/`, `docker/`) from the root tree and re-list them under `apps/frontend/`.

Use this skeleton, then fill the inner `apps/frontend/` content with the existing detailed tree from the current memory file (the `src/`, `pages/`, `types/`, `store/`, `hooks/`, `contexts/`, `lib/`, `services/`, `stubs/` blocks). Keep the existing "Routes" section unchanged at the bottom.

```markdown
# Codebase Structure

## Repository Root

\`\`\`
reisenotiz/
├── apps/
│   └── frontend/              # React 19 PWA — see "Frontend" below
├── docker-compose.yml         # orchestrates frontend container
├── .github/workflows/         # frontend build pipelines
├── docs/
├── Plans/
├── CLAUDE.md                  # root index (points to apps/frontend/CLAUDE.md)
├── README.md / ROADMAP.md / LICENSE / CLA.md / CONTRIBUTING.md
└── .serena/ .claude/ .vscode/ .gitignore .editorconfig
\`\`\`

## Frontend (`apps/frontend/`)

\`\`\`
apps/frontend/
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── routes.ts
│   ├── vite-env.d.ts
│   ├── components/   ...   (full structure as before)
│   ├── pages/        ...
│   ├── types/        ...
│   ├── store/        ...
│   ├── hooks/        ...
│   ├── contexts/     ...
│   ├── lib/          ...
│   ├── services/     ...
│   └── stubs/        ...
├── public/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.ts
├── .prettierrc
├── components.json
├── pwa-assets.config.ts
├── index.html
├── Dockerfile
├── nginx.conf
├── .dockerignore
└── CLAUDE.md
\`\`\`

## Routes
(unchanged — copy verbatim from existing memory)
```

When filling in the `src/` subtree, copy the existing detailed listing from the current memory file as-is — only the outer wrapper changes.

### `.serena/memories/suggested_commands.md`

Replace with:

```markdown
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
```

### `.serena/memories/task_completion_checklist.md`

Replace with:

```markdown
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
```

### `.serena/memories/code_style_and_conventions.md` and `user_records_feature.md`

Read both files. If they reference paths like `src/...` directly, prefix with `apps/frontend/` so the references stay accurate. If they only describe conventions without paths, leave unchanged.

## Step 9 — Update `README.md`

Replace the **Build from source** block with:

```markdown
### Build from source

Requires Node.js 24+ and pnpm.

\`\`\`bash
cd apps/frontend
pnpm install
pnpm build
pnpm preview
\`\`\`
```

The existing **Docker Compose (example)** block uses the published image directly and does not need to change. Leave it as-is.

Leave Features, Roadmap, AI Disclaimer, License sections unchanged.

## Step 10 — Verify

Run from the repo root, in order:

1. `ls apps/frontend && ls -la apps/frontend` — confirm the layout matches "Final Layout".
2. `cd apps/frontend && pnpm install && pnpm build && pnpm lint && cd ../..` — frontend still builds clean and lints clean.
3. `docker compose config` — compose file parses and resolves the build context.
4. `docker compose build app` — frontend image builds.
5. `git status` — confirm only intended files changed/moved/created. No stray edits to `apps/frontend/src/**`.
6. `git diff --stat` — sanity-check the moves are recorded as renames (Git should show `R` lines, not `D` + `A`).
7. `grep -rn "docker/Dockerfile\|docker/nginx.conf\|docker/docker-compose.yml" .github/ docker-compose.yml apps/ 2>/dev/null` — confirm no stale references to the old `docker/` paths remain. Should produce no output.

## Step 11 — Commit

Make one commit per logical phase so a reviewer can follow the move:

1. `chore: move frontend into apps/frontend` — Steps 1–3 (file moves + Dockerfile path fix + .dockerignore cleanup).
2. `chore: rewrite docker-compose for new frontend path` — Step 4.
3. `ci: update docker workflows for apps/frontend layout` — Step 5.
4. `docs: split CLAUDE.md into root index and apps/frontend/CLAUDE.md` — Steps 6–7.
5. `docs: update Serena memories for new layout` — Step 8.
6. `docs: update README build-from-source path` — Step 9.

Use `git mv` for all renames so history follows. Do **not** use `--no-verify`. If a hook fails, fix the underlying issue.

## Out of Scope

- Anything outside the move itself: no refactoring of frontend code, no new features, no test framework setup.
- Touching `LICENSE`, `CLA.md`, `CONTRIBUTING.md`, `ROADMAP.md`.
- Changing the published image registry path or organisation.
- Renaming the compose service `app` to anything else — keep it as `app` to minimise churn.

## Risks and Notes

- **Lost git history on moves**: only happens if you copy + delete instead of `git mv`. Always use `git mv`.
- **Frontend path aliases**: `vite.config.ts`'s `@/` alias is resolved relative to the config file, so the move does not break it. Verify by running `pnpm build` post-move.
- **Image tag bug in old compose**: the original `image:` line had `:sha-…:edge-amd64` (two tags). The rewrite in Step 4 fixes this. If asked to preserve old behaviour exactly, revert that single line.
- **Stale `.dockerignore` lines**: the original ignored `docker/docker-compose.yml`. After the move that path is unreachable from the build context — the Step 3 cleanup removes the line.
- **Workflow path filters**: adding `paths:` filters means PRs that touch only root files (README, CLAUDE.md, docs) will no longer trigger image builds. That is intentional.
