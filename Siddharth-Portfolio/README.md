# Cursor-Tracking Hero — Boy Rebuild (Oct 2026)

This is the finished plain HTML/CSS/JS project (the 64-frame sweep-ring
build), with the character swapped from the girl to Siddharth's own
"boy" video — the clean Flow render he uploaded on Oct 23, 2026 (one
clockwise gaze sweep ending on a neutral front pose, with a real blink).

What changed vs. the girl version:
- All 66 frames re-extracted from the boy video and enhanced to
  2560x1440 (ring-00..63 + center + a REAL blink frame from the video,
  f222). NOTE the ring order: this script measures angles with atan2
  (0 deg = right), so the frames were rotated +16 slots vs. the React
  build's up-first ordering — ring-00 = RIGHT, ring-16 = DOWN,
  ring-32 = LEFT, ring-48 = UP.
- Face anchor re-measured for him: FACE = { x: 0.499, y: 0.423 }.
- Page gradient re-matched to his video's reds (#ad0f0c -> #870806);
  fallback still is now assets/boy.jpg; character.mp4 is his video.
- Canvas backing store raised to 2560x1440 so the frames stay crisp
  on large screens.
- Verified in Chromium (tools/cdp-test-boy.mjs): deadzone eye
  contact, 8/8 ring directions, natural blink — all checks passed.

---

# Cursor-Tracking Hero

A small website in plain HTML, CSS and JavaScript, modelled on
sl_tech_journal's cursor-tracking portfolio reel. Move your cursor
anywhere on the page and the girl turns her head and eyes toward it.

**v6 — the reel's method, complete:** Siddharth regenerated the
video in Google Flow with the tutorial's exact Step 2 prompt and
sent the downloaded file — a clean, ordered gaze sweep (center →
up → up-right → right → down-right → down → down-left → left →
up-left → center). 64 frames were sampled evenly along that sweep
(`assets/frames/ring-00` to `ring-63`, one every 5.625°) and the
canvas draws exactly one per cursor angle, so her head glides
around the full circle like the reel. Earlier versions (v4/v5)
were built from a screen recording of the animation; that file is
kept as `character-screen-recording.mp4` for provenance.

## Run it

Option 1 — just open `index.html` in a browser.

Option 2 — serve it (recommended):

```bash
cd cursor-tracking-hero
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure: nav, portrait stage, two eye overlays, hero text |
| `style.css` | Red hero layout, eye sockets, pupil/iris styling, blink animation |
| `script.js` | Cursor tracking: angle math + smooth pupil movement |
| `assets/girl.jpg` | The portrait (cropped from the uploaded image, screen borders removed) |

## How the eye tracking works

1. The portrait sits in a `.stage` wrapper whose aspect ratio matches the
   image exactly (1580 × 1102), so the eyes can be positioned in %.
2. Each eye is an overlay positioned where the painted eye is:
   - her right eye (image-left): `left: 48.6%`, `top: 43.5%`
   - her left eye (image-right): `left: 62.8%`, `top: 40.0%`
3. On every animation frame, `script.js` (v3) first smooths the pointer
   itself, then: her HEAD turns toward it — a second copy of the
   portrait, clipped to the head + hair (`.head-layer` in index.html),
   tilts with slow damping (~0.3s) — and her PUPILS glide after it
   with faster frame-rate-independent damping (~0.09s), so the motion
   is equally smooth on 60 Hz and 144 Hz screens. Pupil travel uses a
   soft saturation curve, decelerating into the edge of the eye white
   instead of stopping dead at a hard cap.
4. Extras: the eyes blink every ~5 seconds, a glowing custom cursor
   (instant dot + trailing ring that grows over links) replaces the
   native cursor, and on touch devices her gaze follows your finger.
   Before any mouse movement, her gaze drifts gently on its own.
   Layout matches the reel: full-bleed character on the right,
   HI, I'M + cursive name + bio + RESUME / LET'S TALK on the left.

## If you swap in a different portrait

Re-measure the eye centres as percentages of the new image, update the
two positions in `style.css` (`.eye-right` / `.eye-left`), and set the
`.stage` aspect ratio to the new image's dimensions.

## How the frames were made

The video Siddharth sent was a screen recording of the animation
playing (his cursor was baked into it, following her around), so the
poses were curated by hand instead of sampled blindly:

| Pose | Video time | Notes |
|---|---|---|
| center | 9.55s | neutral, eyes at camera |
| up | 1.25s | head tilted up |
| up-right | 0.00s | clean frame, no cursor |
| right | 2.55s | head turned right |
| down-right | 6.20s | |
| down | 6.05s | head bowed |
| down-left | 4.05s | drawn arc removed |
| left | 3.25s | head turned left |
| up-left | 0.55s | cursor on mouth inpainted |
| blink | 9.30s | eyes closed; shown briefly from center pose |

In every other frame the recorded cursor arrow was located and
cleaned out (clone-stamp / gradient inpaint). The frames live in
`assets/frames/` as 1000px WebP files (~25KB each, 300KB total).
`tools/extract_frames.py` holds the general-purpose extractor used
for inspection; `character.mp4` is kept for re-extraction.

Renderer rules (from the tutorial): never play/seek the MP4 in the
browser, draw exactly one frame at full opacity (no blending =
no ghosting), deadzone around the face = center pose, and smooth
the angle with shortest-path circular damping plus sector
hysteresis so poses don't flicker at boundaries.

## v6 sweep map (64-frame ring)

Direction peaks in the video: up 1.35s, up-right 2.35s, right
3.10s, down-right 3.75s, down 4.50s, down-left 5.60s, left 6.50s,
up-left 7.50s; center holds at 0-0.5s and 8.25-10s (center frame
8.75s, blink 9.50s). Ring frame times are interpolated linearly
between the peaks by angle. Ring-43 (241.9°) uses 7.82s because
the exact sweep frame at 7.95s catches her mid-blink. Frames are
1000x562 WebP (~24KB each). Face anchor (angle origin) is the
eye midpoint at (0.496, 0.413) of the frame. Verified in
Chromium: 32 points swept around a full circle produced the
exact expected ring frame at every point, plus center in the
deadzone.
