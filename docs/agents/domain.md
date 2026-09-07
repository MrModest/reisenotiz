# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **multi-context**: a pnpm workspace (`apps/*`) with two contexts, `apps/frontend` (React 19 PWA) and `apps/sync` (sync server).

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`<context>/CONTEXT.md`** (e.g. `apps/frontend/CONTEXT.md`, `apps/sync/CONTEXT.md`) for the context you're working in.
- **`docs/adr/`** at the root: system-wide decisions. Read ADRs that touch the area you're about to work in.
- **`apps/<context>/docs/adr/`**: context-scoped decisions for that app.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT-MAP.md                     ← points at each context's CONTEXT.md
├── docs/adr/                          ← system-wide decisions
└── apps/
    ├── frontend/
    │   ├── CONTEXT.md
    │   ├── docs/adr/                  ← frontend-specific decisions
    │   └── src/
    └── sync/
        ├── CONTEXT.md
        ├── docs/adr/                  ← sync-specific decisions
        └── src/
```

Domain docs are separate from the existing agent guidance files, and answer a different question. `CLAUDE.md` (root and `apps/frontend/CLAUDE.md`) covers **how to work here** — commands, tooling, code style, conventions. `docs/agents/CRUD_FLOW_BEST_PRACTISE.md` and `DESIGN_SYSTEM.md` cover recurring patterns. Domain docs cover **what the words mean** — vocabulary, invariants, and the decisions behind them. A `CONTEXT.md` never documents build commands, and a `CLAUDE.md` never defines domain terms.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

Terms that belong to one context only (e.g. a sync-protocol term) live in that context's `CONTEXT.md`. Only terms shared across both apps belong in the map.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
