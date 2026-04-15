#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "==> Recreating container (fresh .next volume)..."
docker compose -p markshow-app down --remove-orphans 2>/dev/null || true
docker compose -p markshow-app up -d --build

echo "==> Waiting for container to be ready..."
sleep 5

echo "==> Building MarkShow..."
docker compose -p markshow-app exec -e NODE_ENV=production markshow pnpm build
echo "==> Build complete."

echo "==> Restarting dev server..."
docker compose -p markshow-app down --remove-orphans 2>/dev/null || true
docker compose -p markshow-app up -d --build
echo "==> Done. Dev server running at http://localhost:${APP_PORT:-3737}"
