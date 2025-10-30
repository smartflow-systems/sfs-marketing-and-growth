#!/usr/bin/env bash
set -euo pipefail
ORG=smartflow-systems
REPOS=(SmartFlowSite SocialScaleBoosterAIbot SFSDataQueryEngine SFSAPDemoCRM sfs-marketing-and-growth)
BRANCHES=(ci/reusable-std docs/badges-ci)

need_gh(){ command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; }

if ! need_gh; then
  echo "gh not authed. Merge via links:"
  for s in "${REPOS[@]}"; do
    for b in "${BRANCHES[@]}"; do
      echo "https://github.com/$ORG/$s/compare/main...$b"
    done
  done
  exit 0
fi

for s in "${REPOS[@]}"; do
  d="$HOME/workspace/$s"
  [ -d "$d/.git" ] || { echo "SKIP $s (not cloned)"; continue; }

  for b in "${BRANCHES[@]}"; do
    git -C "$d" ls-remote --exit-code --heads origin "$b" >/dev/null 2>&1 || { echo "$s | $b: no branch"; continue; }

    # Ensure PR exists (or create one)
    n=$(gh pr list -R "$ORG/$s" -H "$b" --json number --jq '.[0].number' 2>/dev/null || echo "")
    if [ -z "${n:-}" ]; then
      gh pr create -R "$ORG/$s" -B main -H "$b" -t "$b → main" -b "Auto PR from $b" || true
      n=$(gh pr list -R "$ORG/$s" -H "$b" --json number --jq '.[0].number' 2>/dev/null || echo "")
    fi
    if [ -z "${n:-}" ]; then echo "$s | $b: PR not created"; continue; fi

    # Try: enable auto-merge; else attempt immediate merge; else leave pending
    gh pr merge -R "$ORG/$s" "$n" --squash --auto --delete-branch || \
    gh pr merge -R "$ORG/$s" "$n" --squash --delete-branch || \
    echo "$s | $b: merge pending (checks/protection)"

    echo "$s | $b: https://github.com/$ORG/$s/pull/$n"
  done
done
echo "Done."
