#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "==> Seeding sample presentations..."
docker compose -p markshow-app exec markshow npx tsx scripts/seed-data.ts
echo "==> Seed complete."
