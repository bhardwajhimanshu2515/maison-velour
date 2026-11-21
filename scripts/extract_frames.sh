#!/usr/bin/env bash
# Extract every frame of a film at full source resolution and maximum WebP quality (no extra compression
# beyond the source video itself), one file per frame. Phones and desktops use the same frames.
# Usage: scripts/extract_frames.sh path/to/video.mp4 [prefix]
#   film 1 (making of the cake):  scripts/extract_frames.sh making.mp4        -> public/frames/d/001..240.webp
#   film 2 (the display case):    scripts/extract_frames.sh vitrine.mp4 v     -> public/frames/vd/001..240.webp
set -euo pipefail
SRC="$1"; P="${2:-}"
OUT="$(dirname "$0")/../public/frames"
rm -rf "$OUT/${P}d"
mkdir -p "$OUT/${P}d"
ffmpeg -v error -i "$SRC" -c:v libwebp -quality 100 -compression_level 6 "$OUT/${P}d/%03d.webp"
if [ -z "$P" ]; then
  # Stills for the collection cards, taken straight from film 1
  mkdir -p "$OUT/../stills"
  for t in 9.6 6.7 5.6 4.6 2.5 0.6; do
    ffmpeg -v error -y -ss "$t" -i "$SRC" -frames:v 1 -vf "scale=900:-2" -c:v libwebp -quality 82 "$OUT/../stills/s${t/./_}.webp"
  done
else
  # Cake cut-outs for the shop cards, taken straight from film 2
  ffmpeg -v error -y -ss 4 -i "$SRC" -frames:v 1 /tmp/vit_a.png
  ffmpeg -v error -y -ss 6.8 -i "$SRC" -frames:v 1 /tmp/vit_b.png
  mkdir -p "$OUT/../cakes"
  python3 "$(dirname "$0")/vitrine_crops.py" /tmp/vit_a.png /tmp/vit_b.png "$OUT/../cakes"
fi
