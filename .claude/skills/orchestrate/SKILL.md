---
name: orchestrate
description: "Run a spec issue's sub-issues as parallel /implement sessions in herdr panes, until all are closed."
disable-model-invocation: true
argument-hint: "<spec issue number>"
---

You are the **orchestrator** for spec issue `#$ARGUMENTS`. Each open sub-issue is a ticket that one **worker** (a Claude session in its own herdr pane and worktree) implements. You don't implement anything, and you don't read the spec's or the tickets' bodies. GitHub's sub-issue and `blocked_by` links are all you need.

## Loop

The polling is `next.sh`, a plain script, so waiting costs no turns. It changes nothing except a `.git/orchestrate-<spec>.seen` file that records which merged PRs it has already reported. It exits only when there's something for you to do. Run it with `run_in_background`, passing every ticket you're leaving alone:

```bash
.claude/skills/orchestrate/next.sh <spec> [ticket...]
```

When it exits, handle each line of its output, then run it again straight away. Don't poll, read panes or report between runs. A run with nothing to do never exits, so your turn simply ends.

| Line | Do |
|---|---|
| `ready <n>` | Run `.claude/skills/orchestrate/launch.sh <spec> <n>` and tell the user in one line. If it refuses because a pane is titled with `#<n>`, a worker was started outside this loop: add `<n>` to the leave-alone list. |
| `merged <n> <pr>` | Report it to the user. See [Cleanup](#cleanup). |
| `done` | Stop. Report the merged PRs. |

## Cleanup

Only the user decides when a worker is finished. After a PR merges they may still ask the worker for a **follow-up**: another branch and PR in the same session, because the session already has the context.

On `merged <n> <pr>`, tell the user in one line that worker `#<n>`'s PR `#<pr>` merged and the worker is ready for cleanup when they say so. A follow-up PR that merges later is reported the same way.

When the user gives the go-ahead for a worker, run:

```bash
.claude/skills/orchestrate/cleanup.sh <n>
```

It closes the worker's pane, removes its worktree and deletes its merged branches. It refuses, changing nothing, if the session is working, the worktree has uncommitted changes, or a branch has an open PR or commits that no merged PR covers. Report a refusal to the user, and leave the worker in place.
