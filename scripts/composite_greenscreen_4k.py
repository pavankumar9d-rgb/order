import cv2
import numpy as np
import subprocess
import sys
import os

PROJECT_DIR = r"c:\Users\saipa\OneDrive\Desktop\hyd to del"
TEMPLATE_PATH = os.path.join(PROJECT_DIR, "watermark-removed-Gemini_Generated_Image_8k6doh8k6doh8k6d.png")
VIDEO_PATH = os.path.join(PROJECT_DIR, "Video Project 31 (1).mp4")
AUDIO_PATH = os.path.join(PROJECT_DIR, "test_looped_audio.m4a")
OUTPUT_PATH = os.path.join(PROJECT_DIR, "pavan_express_4k_greenscreen_showcase.mp4")
FFMPEG_PATH = r"C:\Users\saipa\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"

def main():
    print("=" * 60)
    print("  PAVAN EXPRESS - 4K GREEN SCREEN VIDEO COMPOSITOR")
    print("=" * 60)

    # 1. Load template and resize to 4K Vertical (2160 x 3840)
    print("1. Loading template and scaling to 4K (2160 x 3840)...")
    template = cv2.imread(TEMPLATE_PATH)
    if template is None:
        raise FileNotFoundError(f"Template not found at {TEMPLATE_PATH}")

    orig_h, orig_w = template.shape[:2]
    target_w, target_h = 2160, 3840
    template_4k = cv2.resize(template, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

    # 2. Open input video
    print(f"2. Opening input video: {VIDEO_PATH}...")
    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open video {VIDEO_PATH}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    vw = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    vh = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"   Source: {vw}x{vh} @ {fps:.1f} fps | {total_frames} frames ({total_frames / fps:.2f}s)")

    # 3. Compute Perspective Transform Matrix
    sx = target_w / orig_w
    sy = target_h / orig_h

    # Bounding box & quad corners in original template
    # Top-Left: [-5, 171], Top-Right: [742, 218], Bottom-Right: [751, 654], Bottom-Left: [52, 772]
    pts_dst = np.float32([
        [-5 * sx, 171 * sy],
        [742 * sx, 218 * sy],
        [751 * sx, 654 * sy],
        [52 * sx, 772 * sy]
    ])

    # Crop 6px from bottom (removes green recording line) and 10px from right (removes scrollbar)
    crop_bottom = 8
    crop_right = 10
    pts_src = np.float32([
        [0, 0],
        [vw - crop_right - 1, 0],
        [vw - crop_right - 1, vh - crop_bottom - 1],
        [0, vh - crop_bottom - 1]
    ])

    M = cv2.getPerspectiveTransform(pts_src, pts_dst)

    # 4. Compute High Precision Alpha Mask for Monitor Screen
    print("3. Generating screen mask with anti-aliased edge blending...")
    b, g, r = cv2.split(template_4k)
    green_mask = (g > 85) & (g > 1.18 * r) & (g > 1.18 * b)
    y_coords = np.arange(target_h).reshape(-1, 1)
    monitor_y_mask = (y_coords >= 150 * sy) & (y_coords <= 800 * sy)
    green_mask = green_mask & monitor_y_mask

    # 5px blur for seamless sub-pixel anti-aliasing against the bezel
    mask_f = green_mask.astype(np.float32)
    mask_f = cv2.GaussianBlur(mask_f, (5, 5), 1.2)
    mask_3d = np.repeat(mask_f[:, :, np.newaxis], 3, axis=2)
    inv_mask_3d = 1.0 - mask_3d

    # Pre-multiply template with inverted mask for maximum speed
    template_bg = (template_4k.astype(np.float32) * inv_mask_3d)

    # 5. Start FFmpeg pipe for 4K encoding
    print("4. Starting FFmpeg 4K H.264 encoder stream...")
    ffmpeg_cmd = [
        FFMPEG_PATH,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{target_w}x{target_h}",
        "-pix_fmt", "bgr24",
        "-r", str(int(round(fps))),
        "-i", "-",
        "-i", AUDIO_PATH,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "16",
        "-c:a", "copy",
        "-shortest",
        OUTPUT_PATH
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    # 6. Stream frames
    print("5. Compositing and streaming frames...")
    frame_idx = 0
    t_start = cv2.getTickCount()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Crop out recorder borders
        cropped_frame = frame[0:vh - crop_bottom, 0:vw - crop_right]

        # Perspective warp
        warped = cv2.warpPerspective(cropped_frame, M, (target_w, target_h), flags=cv2.INTER_LINEAR)

        # Blend
        composite = (warped.astype(np.float32) * mask_3d + template_bg).astype(np.uint8)

        # Write to FFmpeg stdin
        try:
            proc.stdin.write(composite.tobytes())
        except (BrokenPipeError, OSError):
            break

        frame_idx += 1
        if frame_idx % 100 == 0 or frame_idx == total_frames:
            pct = (frame_idx / total_frames) * 100
            elapsed = (cv2.getTickCount() - t_start) / cv2.getTickFrequency()
            fps_proc = frame_idx / elapsed if elapsed > 0 else 0
            eta = (total_frames - frame_idx) / fps_proc if fps_proc > 0 else 0
            print(f"   [{pct:5.1f}%] Frame {frame_idx}/{total_frames} | Speed: {fps_proc:4.1f} fps | ETA: {eta:3.0f}s")

    cap.release()
    proc.stdin.close()
    _, stderr = proc.communicate()

    if proc.returncode != 0:
        print("FFmpeg error:", stderr.decode("utf-8", errors="replace"))
        sys.exit(proc.returncode)

    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print("=" * 60)
    print("  4K COMPOSITE VIDEO COMPLETED SUCCESSFULLY!")
    print(f"  Output: {OUTPUT_PATH}")
    print(f"  Size: {file_size_mb:.1f} MB | Resolution: {target_w}x{target_h} | Frames: {frame_idx}")
    print("=" * 60)

if __name__ == "__main__":
    main()
