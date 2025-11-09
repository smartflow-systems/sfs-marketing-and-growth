#!/bin/bash
# SmartFlow Dev Sync Script — Rebase your branch onto latest main

set -euo pipefail

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$BRANCH" == "main" ]]; then
  echo "❌ ERROR: You’re on main. Create a feature/fix branch first."
  exit 1
fi

echo "📦 Fetching latest from origin/main..."
git fetch origin main

echo "🔄 Rebasing [$BRANCH] onto origin/main..."
git rebase origin/main

echo "✅ Rebase complete. VERIFY the following:"
echo " - All tests pass"
echo " - CI is still wired"
echo " - Branch is clean: git status"

echo "♻️ If issues, you can undo with:"
echo "   git rebase --abort"
echo "   or git reset --hard ORIG_HEAD"
