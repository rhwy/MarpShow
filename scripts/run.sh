#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "==> Starting MarkShow in production mode..."
docker compose -f docker-compose.yml up -d --build
echo "==> MarkShow is running at http://localhost:${APP_PORT:-3000}"
