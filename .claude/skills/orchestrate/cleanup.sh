#!/usr/bin/env bash
# Usage: cleanup.sh <ticket>
# Closes worker <ticket>'s panes, removes its worktree and deletes its branches. Refuses,
# changing nothing, if its session is working, the worktree has uncommitted changes, or
# a branch has an open PR or a tip that is neither on origin/main nor a merged PR's head.
set -euo pipefail
n=$1
root=$(git rev-parse --show-toplevel)
wt=$root/.claude/worktrees/implement-$n
[ -d "$wt" ] || { echo "no worktree $wt"; exit 1; }
panes=$(herdr pane list | jq -r --arg wt "$wt" '.result.panes[] | select((.foreground_cwd // "") as $cwd | $cwd == $wt or ($cwd | startswith($wt + "/"))) | "\(.pane_id) \(.agent_status)"')
! grep -q ' working$' <<<"$panes" || { echo "refused: session in $wt is working"; exit 1; }
[ -z "$(git -C "$wt" status --porcelain)" ] || { echo "refused: $wt has uncommitted changes"; exit 1; }

# Every branch the worktree has had checked out, so follow-up branches count too.
branches=()
while read -r branch; do
  [ -n "$branch" ] && [ "$branch" != main ] && git -C "$root" show-ref -q "refs/heads/$branch" && branches+=("$branch")
done < <({ echo "worktree-implement-$n"; git -C "$wt" branch --show-current
  git -C "$wt" reflog show HEAD --format=%gs | sed -n 's/^checkout: moving from .* to //p'; } | sort -u)

for branch in "${branches[@]}"; do
  if [ -n "$(gh pr list --state open --head "$branch" --json number --jq '.[].number')" ]; then
    echo "refused: $branch has an open PR"; exit 1
  fi
  tip=$(git -C "$root" rev-parse "$branch")
  merged_heads=$(gh pr list --state merged --head "$branch" --json headRefOid --jq '.[].headRefOid')
  if [ -n "$(git -C "$root" log --oneline "origin/main..$branch")" ] && ! grep -qx "$tip" <<<"$merged_heads"; then
    echo "refused: $branch has commits no merged PR covers"; exit 1
  fi
done

for p in $(cut -d' ' -f1 <<<"$panes"); do herdr pane close "$p"; done
git -C "$root" worktree remove "$wt"
[ ${#branches[@]} -eq 0 ] || git -C "$root" branch -D "${branches[@]}"
echo "cleaned $n"
