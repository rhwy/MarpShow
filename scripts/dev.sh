#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "==> Stopping any existing containers..."
docker compose -p markshow-app down --remove-orphans 2>/dev/null || true

echo "==> Starting MarkShow in development mode..."
docker compose -p markshow-app up -d --build
echo "==> MarkShow is running at http://localhost:${APP_PORT:-3737}"
echo "==> Logs: docker compose -p markshow-app logs -f"
