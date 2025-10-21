#!/usr/bin/env bash
set -euo pipefail
ORG="smartflow-systems"
SLUGS=(SmartFlowSite SocialScaleBoosterAIbot SFSDataQueryEngine SFSAPDemoCRM sfs-marketing-and-growth)
ts="$(date -u +%Y%m%dT%H%M%SZ)"

clone_repo() {
  local slug="$1" dest="$HOME/workspace/$slug"
  [ -d "$dest/.git" ] && { echo "FOUND  $slug"; return; }
  mkdir -p "$HOME/workspace"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    gh repo clone "$ORG/$slug" "$dest" -- -q || true
  fi
  [ -d "$dest/.git" ] || git clone "https://github.com/$ORG/$slug" "$dest" --quiet || true
  if [ ! -d "$dest/.git" ] && [ -n "${SFS_PAT:-}" ]; then
    git clone "https://${SFS_PAT}:x-oauth-basic@github.com/$ORG/$slug" "$dest" --quiet || true
  fi
  [ -d "$dest/.git" ] && echo "CLONED $slug -> $dest" || echo "FAIL clone $slug (auth?)"
}

badge_repo() {
  local slug="$1" repo="$HOME/workspace/$slug" f="$HOME/workspace/$slug/README.md"
  [ -d "$repo/.git" ] || { echo "SKIP $slug (no repo)"; return; }
  [ -f "$f" ] && cp "$f" "$f.bak.$ts" || : >"$f"
  grep -qE '^\# ' "$f" || { printf '# %s\n\n' "$slug" | cat - "$f" > "$f.new" && mv "$f.new" "$f"; }
  grep -v 'actions/workflows/ci.yml/badge.svg' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  badge="[![ci](https://github.com/$ORG/$slug/actions/workflows/ci.yml/badge.svg)](https://github.com/$ORG/$slug/actions/workflows/ci.yml)"
  awk -v b="$badge" 'BEGIN{ins=0} { if(!ins && /^# /){ print; print ""; print b; ins=1; next } print }' "$f" > "$f.new" && mv "$f.new" "$f"
  ( cd "$repo"
    git checkout -B docs/badges-ci >/dev/null 2>&1 || git switch -c docs/badges-ci
    git add README.md
    git -c commit.gpgsign=false commit -m "docs(readme): add CI badge" || true
    git push -u origin docs/badges-ci || true
    command -v gh >/dev/null 2>&1 && gh pr create -f -B main -t "docs(readme): add CI badge" -b "Add CI status badge." || true
  )
  echo "BADGE ADDED: $slug"
}

for s in "${SLUGS[@]}"; do clone_repo "$s"; done
for s in "${SLUGS[@]}"; do badge_repo "$s"; done
echo "Done @ $ts"
