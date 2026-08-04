#!/usr/bin/env bash
#
# Rasterize the extension icons from the brand SVG master.
# Run once per icon change; the PNGs are committed so builds don't need
# ImageMagick. Uses IM6 `convert` (what's on the dev machine). If the SVG
# renders poorly at 16px, switch to a sharp-based node script (librsvg).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="../../apps/web/public/icons/icon.svg"
for n in 16 32 48 128; do
  convert -background none -density 384 "$SRC" -resize ${n}x${n} icons/icon-${n}.png
  echo "icons/icon-${n}.png"
done
