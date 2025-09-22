#!/usr/bin/env python3
import argparse, sys, subprocess, shlex
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".gif"}
VIDEO_EXTS = {".mov", ".mp4", ".m4v", ".mkv", ".avi", ".webm", ".wmv", ".flv", ".mts", ".m2ts"}

def which_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except Exception:
        return False

def run(cmd, dry_run=False):
    print("→", cmd)
    if dry_run:
        return 0
    proc = subprocess.run(shlex.split(cmd))
    return proc.returncode

def should_skip(dst: Path, force: bool):
    return (dst.exists() and not force)

def convert_image(src: Path, to_webp: bool, to_avif: bool, q_webp: int, png_lossless: bool, q_avif: int, force: bool, dry: bool):
    stem = src.with_suffix("")
    ext = src.suffix.lower()
    # WEBP
    if to_webp:
        dst_webp = stem.with_suffix(".webp")
        if not should_skip(dst_webp, force):
            # lossless for PNG-like assets
            if png_lossless and ext in {".png", ".tif", ".tiff", ".bmp"}:
                cmd = f'ffmpeg -y -i "{src}" -c:v libwebp -lossless 1 -compression_level 6 -preset picture "{dst_webp}"'
            else:
                # photos/graphics lossy
                # ffmpeg libwebp quality ~ 0-100; 80–86 is a sweet spot
                cmd = f'ffmpeg -y -i "{src}" -c:v libwebp -lossless 0 -q:v {q_webp} -compression_level 6 -preset picture "{dst_webp}"'
            run(cmd, dry)
    # AVIF
    if to_avif:
        dst_avif = stem.with_suffix(".avif")
        if not should_skip(dst_avif, force):
            # libaom-av1 still slow; use speed 6-8 for balance
            # q scale ~ 0(best)-63(worst); 28-32 is decent
            cmd = f'ffmpeg -y -i "{src}" -c:v libaom-av1 -crf {q_avif} -b:v 0 -row-mt 1 -still-picture 1 -cpu-used 6 "{dst_avif}"'
            run(cmd, dry)

def convert_video(src: Path, make_webm: bool, make_mp4: bool, webm_crf: int, mp4_crf: int,
                  poster: bool, force: bool, dry: bool):
    stem = src.with_suffix("")
    # WEBM (VP9 + Opus)
    if make_webm:
        dst_webm = stem.with_suffix(".webm")
        if not should_skip(dst_webm, force):
            # Good VP9 settings; b:v 0+CRF enables VBR; row-mt speeds up
            cmd = (
                f'ffmpeg -y -i "{src}" -c:v libvpx-vp9 -b:v 0 -crf {webm_crf} -row-mt 1 '
                f'-pix_fmt yuv420p -c:a libopus -b:a 128k "{dst_webm}"'
            )
            run(cmd, dry)
    # MP4 (H.264 + AAC) +faststart for web
    if make_mp4:
        dst_mp4 = stem.with_suffix(".mp4")
        if not should_skip(dst_mp4, force):
            cmd = (
                f'ffmpeg -y -i "{src}" -c:v libx264 -preset slow -crf {mp4_crf} -pix_fmt yuv420p '
                f'-c:a aac -b:a 160k -movflags +faststart "{dst_mp4}"'
            )
            run(cmd, dry)
    # Poster frame (first keyframe)
    if poster:
        dst_jpg = stem.with_suffix(".poster.jpg")
        if not should_skip(dst_jpg, force):
            cmd = f'ffmpeg -y -i "{src}" -frames:v 1 -q:v 3 "{dst_jpg}"'
            run(cmd, dry)

def walk_and_convert(root: Path, args):
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        try:
            if ext in IMAGE_EXTS:
                convert_image(
                    p,
                    to_webp=not args.no_webp,
                    to_avif=args.avif,
                    q_webp=args.webp_quality,
                    png_lossless=not args.webp_no_png_lossless,
                    q_avif=args.avif_crf,
                    force=args.force,
                    dry=args.dry_run
                )
            elif ext in VIDEO_EXTS:
                convert_video(
                    p,
                    make_webm=not args.no_webm,
                    make_mp4=not args.no_mp4,
                    webm_crf=args.webm_crf,
                    mp4_crf=args.mp4_crf,
                    poster=args.poster,
                    force=args.force,
                    dry=args.dry_run
                )
        except KeyboardInterrupt:
            raise
        except Exception as e:
            print(f"!! error on {p}: {e}", file=sys.stderr)

def main():
    ap = argparse.ArgumentParser(
        description="Recursively convert images to WEBP (and optionally AVIF) and videos to WEBM+MP4. Skips existing outputs."
    )
    ap.add_argument("root", type=Path, help="Root folder to scan")
    ap.add_argument("--force", action="store_true", help="Overwrite existing outputs")
    ap.add_argument("--dry-run", action="store_true", help="Print commands only")
    # images
    ap.add_argument("--no-webp", action="store_true", help="Do not produce .webp images")
    ap.add_argument("--avif", action="store_true", help="Also produce .avif images")
    ap.add_argument("--webp-quality", type=int, default=82, help="WEBP quality (0-100, higher=better; default 82)")
    ap.add_argument("--webp-no-png-lossless", action="store_true", help="Disable lossless WEBP for PNG/TIFF/BMP")
    ap.add_argument("--avif-crf", type=int, default=30, help="AVIF CRF (0-63, lower=better; default 30)")
    # videos
    ap.add_argument("--no-webm", action="store_true", help="Do not produce .webm videos")
    ap.add_argument("--no-mp4", action="store_true", help="Do not produce .mp4 fallbacks")
    ap.add_argument("--webm-crf", type=int, default=32, help="WEBM (VP9) CRF (lower=better; default 32)")
    ap.add_argument("--mp4-crf", type=int, default=20, help="MP4 (H.264) CRF (lower=better; default 20)")
    ap.add_argument("--poster", action="store_true", help="Generate a .poster.jpg per video")
    args = ap.parse_args()

    if not which_ffmpeg():
        print("ffmpeg not found on PATH. Install it (e.g., `brew install ffmpeg` or your package manager).", file=sys.stderr)
        sys.exit(1)

    root = args.root
    if not root.exists():
        print(f"Root not found: {root}", file=sys.stderr)
        sys.exit(1)

    walk_and_convert(root, args)

if __name__ == "__main__":
    main()

