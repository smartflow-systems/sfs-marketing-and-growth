#!/usr/bin/env bash
set -euo pipefail

# Enter repo (standard)
for d in "$HOME/workspace/sfs-marketing-and-growth" "$HOME/sfs-marketing-and-growth" "$PWD"; do
  [ -d "$d/.git" ] && { cd "$d"; break; }
done; git rev-parse --is-inside-work-tree >/dev/null

# Tools & auth
command -v gh >/dev/null || nix-env -iA nixpkgs.gh
: "${SFS_PAT:?Add SFS_PAT in Replit → Tools → Secrets}"; echo "$SFS_PAT" | gh auth login --with-token
gh auth status -h github.com >/dev/null

# Detect slug
url="$(git remote get-url origin)"; read OWNER REPO <<<"$(echo "$url" | sed -E 's#.*github.com[:/]{1}([^/]+)/([^/.]+)(\.git)?#\1 \2#')"
SLUG="${OWNER}/${REPO}"

# Branch
BR="ci/adopt-sfs-reusable-$(date +%Y%m%d%H%M%S)"
git checkout -b "$BR"

# Files
mkdir -p .github/workflows docs

# [ .github/workflows/ci.yml ] (OVERWRITE)
cat > .github/workflows/ci.yml <<'YAML'
name: SFS Deploy
on:
  push:
    branches: ["**"]
  pull_request:
jobs:
  call:
    uses: smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main
YAML

# [ docs/CI-HowTo.md ] (create if missing)
[ -f docs/CI-HowTo.md ] || cat > docs/CI-HowTo.md <<'MD'
# CI How-To (SmartFlow)
This repo uses the reusable workflow from SmartFlowSite. Push to any branch or open a PR to run checks.
MD

# [ docs/Secrets-Checklist.md ] (create if missing)
[ -f docs/Secrets-Checklist.md ] || cat > docs/Secrets-Checklist.md <<'MD'
# Secrets Checklist
Required: SFS_PAT (Org → Settings → Secrets → Actions). Optional: REPLIT_TOKEN, SFS_SYNC_URL.
MD

git add .github/workflows/ci.yml docs/*.md
git commit -m "ci: adopt SmartFlow reusable workflow + docs"
git push -u origin "$BR"

# Open PR
gh pr create -R "$SLUG" \
  --title "ci: adopt SmartFlow reusable workflow" \
  --body "Adds [.github/workflows/ci.yml] calling SmartFlowSite reusable workflow and baseline docs."

# Show PR URL and latest run
echo "PR URL:"; gh pr view -R "$SLUG" --json url -q .url
echo "Latest run (after push):"; gh run list -R "$SLUG" -L 1 --json status,conclusion,displayTitle,createdAt \
  --jq '.[0]? // {} | if .=={} then "none yet" else "\(.displayTitle) — \(.status)/\(.conclusion) at \(.createdAt)" end'
