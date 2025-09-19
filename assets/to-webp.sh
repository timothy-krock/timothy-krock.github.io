#!/usr/bin/env bash
set -euo pipefail

DIR="${1:-.}"

shopt -s nullglob

# Find common raster types (case-insensitive)
find "$DIR" -type f \( \
   -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o \
   -iname '*.tif' -o -iname '*.tiff' -o -iname '*.gif' \
\) -print0 | while IFS= read -r -d '' f; do
  base="${f%.*}"
  out="${base}.webp"

  # Skip if already exists
  if [[ -f "$out" ]]; then
    echo "skip (exists): $out"
    continue
  fi

  ext="${f##*.}"
  ext_lower="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"

  # Choose settings based on source
  case "$ext_lower" in
    png)
      # Lossless (keeps transparency perfectly)
      echo "png → webp (lossless): $f"
      cwebp -quiet -lossless -z 9 -alpha_q 100 -metadata icc,exif,xmp "$f" -o "$out"
      ;;
    jpg|jpeg|tif|tiff)
      # Photographic lossy
      echo "photo → webp (q=82): $f"
      cwebp -quiet -q 82 -metadata icc,exif,xmp "$f" -o "$out"
      ;;
    gif)
      # Static GIFs convert fine; animated GIFs: this captures first frame only.
      echo "gif → webp (q=82, first frame): $f"
      cwebp -quiet -q 82 "$f" -o "$out"
      ;;
    *)
      echo "unknown type, skipping: $f"
      ;;
  esac
done

echo "Done."
