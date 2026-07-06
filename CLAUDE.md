# CLAUDE.md

Guidance for Claude Code (claude.ai/code) at the **repo root**.

## Layout

- `apps/frontend/` — React 19 PWA. See `apps/frontend/CLAUDE.md` for app-specific guidance.

## When to Work in Which Directory

- Touching React UI, components, hooks, stores, PWA config → `cd apps/frontend` first, then read `apps/frontend/CLAUDE.md`.
- Touching `docker-compose.yml`, GitHub workflows, `docs/`, `Plans/`, root README/ROADMAP → stay at the root.

## Cross-Cutting Reference Documents

- For UI design system, please refer to the `reisenotiz-design` skill.
- `docs/agents/CRUD_FLOW_BEST_PRACTISE.md` — Create/View/Edit flow patterns.

## Tooling

- Use `pnpm` (never `npm` or `yarn`) inside the app directory.
- Run all package commands from inside the app directory: `cd apps/frontend && pnpm dev`. Not from the root.
- The root has no `package.json` — there are no root-level scripts.

## Docker

- The frontend builds from `./apps/frontend` via its own `Dockerfile`.
- `docker-compose.yml` at the root orchestrates the frontend service (`app`).
