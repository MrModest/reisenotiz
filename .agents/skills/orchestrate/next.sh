#!/usr/bin/env bash
# Usage: next.sh <spec-issue> [ticket to leave alone...]
# Polls GitHub and herdr without AI involvement and changes nothing but its state
# file. Exits only when the orchestrator has something to do, one line per task:
#   ready <n>           open, no open blockers, no worker yet: launch it
#   merged <n> <pr>     a PR from worker <n>'s worktree merged (reported once per PR)
#   done                no open sub-issues and no worker worktrees left
spec=$1; shift
root=$(git rev-parse --show-toplevel)
wts=$root/.claude/worktrees
seen=$(git rev-parse --path-format=absolute --git-common-dir)/orchestrate-$spec.seen
touch "$seen"
declare -A skip
for n in "$@"; do skip[$n]=1; done

# Every branch a worktree has had checked out, so follow-up PRs count too.
branches() {
  git -C "$1" branch --show-current
  git -C "$1" reflog show HEAD --format=%gs | sed -n 's/^checkout: moving from .* to //p'
}

while :; do
  out=()
  open=$(gh api --paginate "repos/{owner}/{repo}/issues/$spec/sub_issues" --jq '.[]|select(.state=="open")|.number') &&
  merged=$(gh pr list --state merged --limit 100 --json number,headRefName --jq '.[]|"\(.headRefName) \(.number)"') ||
    { sleep 120; continue; }

  for wt in "$wts"/implement-*; do
    [ -d "$wt" ] || continue
    n=${wt##*-}
    for pr in $(branches "$wt" | sort -u | while read -r b; do [ -n "$b" ] && awk -v b="$b" '$1==b{print $2}' <<<"$merged"; done); do
      grep -qx "$pr" "$seen" && continue
      echo "$pr" >>"$seen"
      out+=("merged $n $pr")
    done
  done

  for n in $open; do
    [ -d "$wts/implement-$n" ] || [ -n "${skip[$n]}" ] && continue
    blockers=$(gh api --paginate "repos/{owner}/{repo}/issues/$n/dependencies/blocked_by" --jq '.[]|select(.state=="open")|.number') || continue
    [ -z "$blockers" ] && out+=("ready $n")
  done

  [ -z "$open" ] && ! compgen -G "$wts/implement-*" >/dev/null && out+=("done")
  [ ${#out[@]} -gt 0 ] && { printf '%s\n' "${out[@]}"; exit 0; }
  sleep 120
done
