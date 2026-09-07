# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **multi-context**: a pnpm workspace (`apps/*`) with two contexts, `apps/frontend` (React 19 PWA) and `apps/sync` (sync server).

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`<context>/CONTEXT.md`** (`apps/frontend/CONTEXT.md`, `apps/sync/CONTEXT.md`) for the context you're working in.
- **`docs/adr/`** at the root: system-wide decisions. Read ADRs that touch the area you're about to work in.
- **`apps/<context>/docs/adr/`**: context-scoped decisions for that app.

These exist. Extend them lazily via `/domain-modeling` — a term goes in when it's resolved, an ADR when a decision meets the bar (hard to reverse, surprising, a real trade-off).

## File structure

```
/
├── CONTEXT-MAP.md                     ← points at each context's CONTEXT.md
├── CLAUDE.md                          ← how to work here (not domain)
├── docs/
│   ├── adr/                           ← system-wide decisions
│   └── agents/                        ← skill config only, not project docs
└── apps/
    ├── frontend/
    │   ├── CONTEXT.md
    │   ├── CLAUDE.md
    │   ├── docs/
    │   │   ├── adr/                   ← frontend-specific decisions
    │   │   └── design/                ← the design handoff
    │   └── src/
    └── sync/
        ├── CONTEXT.md
        ├── CLAUDE.md
        └── src/                       ← docs/adr/ here when the first one is needed
```

Each file answers one question, and only that one:

| File | Answers | Never contains |
| --- | --- | --- |
| `CONTEXT.md` | What do the words mean? | Build commands, file paths, implementation detail |
| `docs/adr/*.md` | Why is it built this way? | Glossary entries, how-to instructions |
| `CLAUDE.md` | How do I work here? | Domain definitions, decision rationale |
| `docs/agents/*.md` | How do the skills operate here? | Anything about this project's code |

When something doesn't fit one of these, it doesn't belong in the documentation structure.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

Terms that belong to one context only (e.g. a sync-protocol term) live in that context's `CONTEXT.md`. Only terms shared across both apps belong in the map.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
