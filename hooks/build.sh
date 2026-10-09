#!/usr/bin/env bash
# Called by `ask deploy` with the zip path to produce; runs from a copy of lambda/,
# so everything is resolved from the repo root instead.
set -euo pipefail

BUILD_FILE="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

"$ROOT/node_modules/.bin/esbuild" "$ROOT/lambda/index.ts" \
  --bundle --platform=node --target=node24 --minify --sourcemap \
  --outfile="$OUT/index.js"

rm -f "$BUILD_FILE"
(cd "$OUT" && zip -qrX "$BUILD_FILE" .)
