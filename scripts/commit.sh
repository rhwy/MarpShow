#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Get commit message from argument or prompt
if [ $# -ge 1 ]; then
  COMMIT_MSG="$1"
else
  echo "Usage: ./scripts/commit.sh \"commit message\""
  exit 1
fi

echo "==> Step 1/3: Building project..."
docker compose exec -e NODE_ENV=production markshow pnpm build
echo "    Build passed."

echo "==> Step 2/3: Running tests..."
docker compose exec markshow pnpm test
echo "    Tests passed."

echo "==> Step 3/3: Committing..."
git add -A
git commit -m "$COMMIT_MSG"
echo "==> Commit complete: $COMMIT_MSG"
