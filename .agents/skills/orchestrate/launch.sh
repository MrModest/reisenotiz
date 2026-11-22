#!/usr/bin/env bash
# Usage: launch.sh <spec-issue> <ticket>
# Starts a worker for <ticket>: a Claude session running /implement in worktree
# .claude/worktrees/implement-<ticket>, in a pane of the "#<spec>" tab. Refuses if the
# ticket already has a worktree or a pane titled with "#<ticket>".
set -euo pipefail
spec=$1 n=$2
root=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
ws=${HERDR_WORKSPACE_ID:?not running inside herdr}

[ ! -d "$root/.claude/worktrees/implement-$n" ] || { echo "refused: worktree implement-$n exists"; exit 1; }
panes=$(herdr pane list)
if jq -e --arg n "$n" 'any(.result.panes[]; (.terminal_title // "") | test("#" + $n + "\\b"))' >/dev/null <<<"$panes"; then
  echo "refused: a pane titled with #$n exists"; exit 1
fi

tab=$(herdr tab list --workspace "$ws" | jq -r --arg l "#$spec" 'first(.result.tabs[] | select(.label == $l) | .tab_id) // ""')
if [ -z "$tab" ]; then
  pane=$(herdr tab create --workspace "$ws" --cwd "$root" --label "#$spec" --no-focus | jq -r .result.root_pane.pane_id)
else
  # Split the most recent pane in the tab, alternating right and down.
  read -r last count < <(jq -r --arg t "$tab" '[.result.panes[] | select(.tab_id == $t) | .pane_id] | "\(last) \(length)"' <<<"$panes")
  dir=$([ $((count % 2)) = 1 ] && echo right || echo down)
  pane=$(herdr pane split "$last" --direction "$dir" --no-focus | jq -r .result.pane.pane_id)
fi

git -C "$root" fetch -q origin
prompt="/implement #$n. In a new well-named branch. Create a PR. Once you done, spawn a ui-tester sub-agent and share the PR link with it. Hard fail if you can't spawn the sub-agent. Do not run the UI test inside the main session. Raise the problem and wait."
herdr pane run "$pane" "cd '$root' && claude -w implement-$n -n 'Implement #$n' --model claude-opus-5-5 --effort medium \"$prompt\""
# Return only once the worktree exists, so the next poll sees the ticket as taken.
for _ in $(seq 60); do
  [ -d "$root/.claude/worktrees/implement-$n" ] && { echo "launched $n in $pane"; exit 0; }
  sleep 1
done
echo "failed: worktree implement-$n did not appear within 60s, check pane $pane"; exit 1
