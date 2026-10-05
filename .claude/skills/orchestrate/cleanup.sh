#!/usr/bin/env bash
# Usage: cleanup.sh <ticket>
# Closes worker <ticket>'s panes, removes its worktree and deletes its branches whose
# PR merged. Refuses, changing nothing, if its session is working, the worktree has
# uncommitted changes, or a branch of it has an open PR or commits no merged PR covers.
set -e
n=$1
root=$(git rev-parse --show-toplevel)
wt=$root/.claude/worktrees/implement-$n
[ -d "$wt" ] || { echo "no worktree $wt"; exit 1; }
panes=$(herdr pane list | jq -r --arg wt "$wt" '.result.panes[] | select((.foreground_cwd // "") | startswith($wt)) | "\(.pane_id) \(.agent_status)"')
! grep -q ' working$' <<<"$panes" || { echo "refused: session in $wt is working"; exit 1; }
[ -z "$(git -C "$wt" status --porcelain)" ] || { echo "refused: $wt has uncommitted changes"; exit 1; }

mapfile -t bs < <({ echo "worktree-implement-$n"; git -C "$wt" branch --show-current
  git -C "$wt" reflog show HEAD --format=%gs | sed -n 's/^checkout: moving from .* to //p'; } |
  sort -u | while read -r b; do [ -n "$b" ] && git -C "$root" show-ref -q "refs/heads/$b" && echo "$b"; done)

del=()
for b in "${bs[@]}"; do
  [ "$b" = main ] && continue
  if [ -n "$(gh pr list --state open --head "$b" --json number --jq '.[].number')" ]; then
    echo "refused: $b has an open PR"; exit 1
  fi
  if [ -n "$(gh pr list --state merged --head "$b" --json number --jq '.[].number')" ]; then
    del+=("$b")
  elif [ -n "$(git -C "$root" log --oneline "origin/main..$b")" ]; then
    echo "refused: $b has commits and no merged PR"; exit 1
  else
    del+=("$b")
  fi
done

for p in $(cut -d' ' -f1 <<<"$panes"); do herdr pane close "$p"; done
git -C "$root" worktree remove "$wt"
[ ${#del[@]} -eq 0 ] || git -C "$root" branch -D "${del[@]}"
echo "cleaned $n"
