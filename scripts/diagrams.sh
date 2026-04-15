#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIAGRAMS_DIR="$PROJECT_DIR/docs/diagrams"

cd "$DIAGRAMS_DIR"

# Check if likec4 is available
if ! command -v likec4 &>/dev/null; then
  echo "likec4 CLI not found. Install it with:"
  echo "  npm install -g likec4"
  echo ""
  echo "Or run directly with npx:"
  echo "  npx likec4 serve   # Interactive preview"
  echo "  npx likec4 export png -o ./docs/diagrams/export"
  exit 1
fi

ACTION="${1:-serve}"

case "$ACTION" in
  serve|dev)
    echo "==> Starting LikeC4 interactive preview..."
    echo "    Open the URL shown below in your browser."
    likec4 serve
    ;;
  build)
    echo "==> Building static diagram site..."
    likec4 build -o "$DIAGRAMS_DIR/dist"
    echo "==> Built to docs/diagrams/dist/"
    ;;
  export-png)
    echo "==> Exporting diagrams as PNG..."
    mkdir -p "$DIAGRAMS_DIR/export"
    likec4 export png -o "$DIAGRAMS_DIR/export"
    echo "==> Exported to docs/diagrams/export/"
    ;;
  validate)
    echo "==> Validating C4 diagrams..."
    likec4 validate
    echo "==> Validation passed."
    ;;
  *)
    echo "Usage: ./scripts/diagrams.sh [serve|build|export-png|validate]"
    echo ""
    echo "  serve       Interactive preview with hot-reload (default)"
    echo "  build       Build static website to docs/diagrams/dist/"
    echo "  export-png  Export all views as PNG images"
    echo "  validate    Check syntax of .c4 files"
    exit 1
    ;;
esac
