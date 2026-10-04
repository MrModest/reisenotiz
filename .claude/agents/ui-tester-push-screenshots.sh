#!/usr/bin/env bash
# Usage: push-screenshots.sh <pr-number> <dir-with-pngs>
# Commits the PNGs into <run>/ on branch screenshots-pr-<N> through the GitHub API (no local git),
# creating the branch as an orphan if needed. Prints the raw URL base for this run.
set -euo pipefail
N=$1 DIR=$2
REPO=MrModest/reisenotiz BR=screenshots-pr-$N RUN=$(date -u +%Y%m%d-%H%M%S)

parent=$(gh api "repos/$REPO/git/ref/heads/$BR" -q .object.sha 2>/dev/null || true)

entries=()
for f in "$DIR"/*.png; do
  sha=$(base64 -w0 "$f" | jq -Rs '{encoding: "base64", content: .}' | gh api "repos/$REPO/git/blobs" --input - -q .sha)
  entries+=("$(jq -n --arg p "$RUN/$(basename "$f")" --arg s "$sha" '{path: $p, mode: "100644", type: "blob", sha: $s}')")
done

base_tree=""
[ -n "$parent" ] && base_tree=$(gh api "repos/$REPO/git/commits/$parent" -q .tree.sha)
tree=$(printf '%s\n' "${entries[@]}" | jq -s --arg b "$base_tree" '{tree: .} + (if $b == "" then {} else {base_tree: $b} end)' \
  | gh api "repos/$REPO/git/trees" --input - -q .sha)

commit=$(jq -n --arg t "$tree" --arg p "$parent" --arg m "UI test screenshots for #$N ($RUN)" \
  '{message: $m, tree: $t, parents: (if $p == "" then [] else [$p] end)}' \
  | gh api "repos/$REPO/git/commits" --input - -q .sha)

if [ -n "$parent" ]; then
  gh api -X PATCH "repos/$REPO/git/refs/heads/$BR" -f sha="$commit" >/dev/null
else
  gh api "repos/$REPO/git/refs" -f ref="refs/heads/$BR" -f sha="$commit" >/dev/null
fi

echo "https://raw.githubusercontent.com/$REPO/$BR/$RUN"
