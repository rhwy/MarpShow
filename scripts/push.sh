#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

BRANCH=$(git branch --show-current)

echo "==> Pushing branch '$BRANCH' to remote..."
git push -u origin "$BRANCH"
echo "==> Push complete."
