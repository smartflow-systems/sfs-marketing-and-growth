#!/usr/bin/env bash
set -euo pipefail
ORG=smartflow-systems
REPOS=(SmartFlowSite SocialScaleBoosterAIbot SFSDataQueryEngine SFSAPDemoCRM sfs-marketing-and-growth)
REUSABLE=smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main
TS="$(date -u +%Y%m%dT%H%M%SZ)"; mkdir -p "$HOME/workspace"

cln(){ # clone via gh→https→PAT
  local s="$1" d="$HOME/workspace/$s"
  [ -d "$d/.git" ] && { echo "FOUND  $s"; return; }
  echo "CLONE  $s"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then gh repo clone "$ORG/$s" "$d" -- -q || true; fi
  [ -d "$d/.git" ] || git clone "https://github.com/$ORG/$s" "$d" --quiet || true
  if [ ! -d "$d/.git" ] && [ -n "${SFS_PAT:-}" ]; then git clone "https://${SFS_PAT}:x-oauth-basic@github.com/$ORG/$s" "$d" --quiet || true; fi
  [ -d "$d/.git" ] || echo "FAIL clone $s (auth?)"
}

ci(){ # write reusable CI file, commit, push, PR
  local s="$1" d="$HOME/workspace/$s" f="$d/.github/workflows/ci.yml"
  [ -d "$d/.git" ] || return
  mkdir -p "$d/.github/workflows"; [ -f "$f" ] && cp "$f" "$f.bak.$TS"
  cat >"$f" <<YML
name: ci
on:
  push: {branches: ["main","tune/**"]}
  pull_request: {branches: ["main"]}
  workflow_dispatch: {}
permissions: {contents: read}
jobs:
  reuse:
    uses: $REUSABLE
    secrets: inherit
YML
  ( cd "$d"; git checkout -B ci/reusable-std >/dev/null 2>&1 || git switch -c ci/reusable-std
    git add "$f"; git -c commit.gpgsign=false commit -m "ci: use SmartFlowSite reusable workflow" || true
    git push -u origin HEAD || true
    command -v gh >/dev/null 2>&1 && gh pr create -f -B main -t "ci: standardize to reusable workflow" -b "Use $REUSABLE with secrets: inherit." || true )
  echo "CI OK: $s"
}

badge(){ # add/update README badge, commit, push, PR
  local s="$1" d="$HOME/workspace/$s" f="$d/README.md"
  [ -d "$d/.git" ] || return
  [ -f "$f" ] && cp "$f" "$f.bak.$TS" || : >"$f"
  grep -qE '^# ' "$f" || { printf '# %s\n\n' "$s" | cat - "$f" > "$f.new" && mv "$f.new" "$f"; }
  grep -v 'actions/workflows/ci.yml/badge.svg' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  B="[![ci](https://github.com/$ORG/$s/actions/workflows/ci.yml/badge.svg)](https://github.com/$ORG/$s/actions/workflows/ci.yml)"
  awk -v b="$B" 'BEGIN{ins=0}{ if(!ins && /^# /){print;print "";print b;ins=1;next} print }' "$f" > "$f.new" && mv "$f.new" "$f"
  ( cd "$d"; git checkout -B docs/badges-ci >/dev/null 2>&1 || git switch -c docs/badges-ci
    git add README.md; git -c commit.gpgsign=false commit -m "docs(readme): add CI badge" || true
    git push -u origin HEAD || true
    command -v gh >/dev/null 2>&1 && gh pr create -f -B main -t "docs(readme): add CI badge" -b "Add CI status badge under H1." || true )
  echo "BADGE OK: $s"
}

for s in "${REPOS[@]}"; do cln "$s"; done
for s in "${REPOS[@]}"; do ci "$s"; done
for s in "${REPOS[@]}"; do badge "$s"; done
echo "Done @ $TS"
