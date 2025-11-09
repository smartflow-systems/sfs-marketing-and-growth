#!/bin/bash
# SmartFlow Auth Check Script

set -euo pipefail

echo "🔍 Checking Replit GitHub CLI auth..."
if ! command -v gh &> /dev/null; then
  echo "❌ gh CLI not installed. Run: nix-env -iA nixpkgs.gh"
  exit 1
fi

# Check token presence
if [[ -z "${SFS_PAT:-}" ]]; then
  echo "❌ ERROR: SFS_PAT not set. Add it to Replit Secrets or export it first."
  exit 1
fi

# Check gh auth status
echo "✅ gh is installed. Verifying auth..."
gh auth status -h github.com || {
  echo "❌ GitHub CLI not authenticated. Run: echo \"\$SFS_PAT\" | gh auth login --with-token"
  exit 1
}

# Show who you are
echo "👤 Authenticated GitHub user:"
gh api user | grep '"login"' || echo "⚠️ Could not resolve user."

# Check access to SFS repo
echo "🔐 Checking repo access..."
if gh repo view smartflow-systems/sfs-marketing-and-growth &> /dev/null; then
  echo "✅ You have access to sfs-marketing-and-growth."
else
  echo "❌ You do NOT have access to smartflow-systems/sfs-marketing-and-growth. Ask for repo invite."
  exit 1
fi
