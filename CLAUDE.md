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

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`MrModest/reisenotiz`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: a root `CONTEXT-MAP.md` pointing at per-app `CONTEXT.md` files, with root and per-app `docs/adr/`. See `docs/agents/domain.md`.
