/* ============================================================
   Cursor-Tracking Hero — script.js  (v6, 64-frame sweep ring)

   The reel's technique (Step 3 of the tutorial), refined:
   - The character video is NEVER played or seeked in the
     browser (MP4 seeking lags and freezes).
   - Frames were pre-extracted from the video into
     assets/frames/ring-00..63.webp — SIXTY-FOUR frames sampled
     evenly along the video's own ordered gaze sweep (centre →
     up → up-right → right → down-right → down → down-left →
     left → up-left), one every 5.625°, plus a neutral center
     pose and a blink frame. The video is the clean Flow export,
     so the frames need no cleaning.
   - On a canvas, EXACTLY ONE frame is drawn at 100% opacity —
     no blending (blending two faces = ghosting).
   - The cursor angle is smoothed with circular damping
     (shortest-path), a deadzone around her face shows the
     center pose, and sector hysteresis stops flicker at
     boundaries. With a frame every 5.625°, her head glides
     around the circle like in the reel.
   ============================================================ */

const stage  = document.getElementById('stage');
const canvas = document.getElementById('heroCanvas');
const ctx    = canvas.getContext('2d');
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

/* Ring order follows the screen angle (atan2, y down), starting
   at 0° = right and increasing clockwise: ring-02 = down-right,
   ring-04 = down, ring-08 = left, ring-12 = up, and so on. */
const RING = 64;
const STEP = (Math.PI * 2) / RING;
const POSE_NAMES = [...Array(RING)].map((_, i) => `ring-${String(i).padStart(2, '0')}`)
  .concat(['center', 'blink']);

/* Her face anchor inside the frame (fraction of the stage) —
   angles are measured from here. */
const FACE = { x: 0.499, y: 0.423 };

/* ---------- Preload frames ---------- */
const frames = {};
for (const name of POSE_NAMES) {
  const img = new Image();
  img.src = `assets/frames/${name}.webp`;
  frames[name] = img;
}

/* ---------- Pointer state ---------- */
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let gazeX = targetX, gazeY = targetY;      // smoothed pointer
let hasPointer = false;
let hoveringInteractive = false;

function setTarget(clientX, clientY) {
  targetX = clientX;
  targetY = clientY;
  hasPointer = true;
  cursorDot.style.opacity = '1';
  cursorRing.style.opacity = '1';
}
window.addEventListener('mousemove', e => setTarget(e.clientX, e.clientY), { passive: true });
window.addEventListener('touchstart', e => setTarget(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
window.addEventListener('touchmove',  e => setTarget(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
document.addEventListener('mouseover', e => { hoveringInteractive = !!e.target.closest('a, button'); }, { passive: true });

/* ---------- Smoothing helpers ---------- */
const damp    = (current, goal, tau, dt) => current + (goal - current) * (1 - Math.exp(-dt / tau));
const clampDt = dt => Math.min(Math.max(dt, 0.001), 0.05);

/* Shortest-path circular angle damping (angles wrap at ±180°) */
function dampAngle(current, goal, tau, dt) {
  let diff = ((goal - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return current + diff * (1 - Math.exp(-dt / tau));
}
const wrapIndex = i => ((i % RING) + RING) % RING;

/* ---------- Animation state ---------- */
let smoothAngle = null;         // radians, damped
let currentPose = null;
let currentSector = null;
let dotX = targetX, dotY = targetY;
let ringX = targetX, ringY = targetY, ringScale = 1;
let lastTime = null;

/* Blink scheduling (only from the center pose, like a real blink) */
let nextBlinkAt = performance.now() + 3200;
let blinkUntil = 0;

function drawPose(name) {
  const img = frames[name];
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  canvas.dataset.pose = name;
  currentPose = name;
}

function animate(now) {
  requestAnimationFrame(animate);
  if (lastTime === null) { lastTime = now; return; }
  const dt = clampDt((now - lastTime) / 1000);
  lastTime = now;

  /* 1. Smooth the pointer (tau 0.05s) */
  if (!hasPointer) {   // idle: gaze drifts slowly until first move
    gazeX = window.innerWidth  / 2 + Math.cos(now / 2400) * window.innerWidth  * 0.30;
    gazeY = window.innerHeight / 2 + Math.sin(now / 3100) * window.innerHeight * 0.26;
  } else {
    gazeX = damp(gazeX, targetX, 0.05, dt);
    gazeY = damp(gazeY, targetY, 0.05, dt);
  }

  /* 2. Angle + distance from her face to the gaze point —
        one layout read per frame */
  const s = stage.getBoundingClientRect();
  const faceX = s.left + s.width  * FACE.x;
  const faceY = s.top  + s.height * FACE.y;
  const dx = gazeX - faceX;
  const dy = gazeY - faceY;
  const dist = Math.hypot(dx, dy);

  /* 3. Pick the pose */
  let pose;
  const DEADZONE = 85;   // px around her face = direct eye contact
  if (dist < DEADZONE) {
    pose = 'center';
    smoothAngle = null;   // re-seed when leaving the deadzone
    currentSector = null;
  } else {
    const angle = Math.atan2(dy, dx);
    smoothAngle = (smoothAngle === null) ? angle : dampAngle(smoothAngle, angle, 0.09, dt);
    let sector = wrapIndex(Math.round(smoothAngle / STEP));
    /* Hysteresis: keep the current sector until the smoothed
       angle is clearly past its centre, so borderline angles
       don't flicker between neighbouring frames. */
    if (currentSector !== null && sector !== currentSector) {
      let diff = Math.abs(((smoothAngle - currentSector * STEP + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (diff < STEP * 0.52) sector = currentSector;
    }
    currentSector = sector;
    pose = `ring-${String(sector).padStart(2, '0')}`;
  }

  /* Blink: from center pose only, ~every 4s for 120ms */
  if (pose === 'center' && now >= nextBlinkAt) {
    blinkUntil = now + 120;
    nextBlinkAt = now + 3600 + Math.random() * 1800;
  }
  if (now < blinkUntil && currentPose !== 'blink') drawPose('blink');
  else if (pose !== currentPose) drawPose(pose);
  else if (!currentPose) drawPose('center');

  /* 4. Custom cursor — dot near-instant, ring trails + grows */
  dotX = damp(dotX, targetX, 0.03, dt);
  dotY = damp(dotY, targetY, 0.03, dt);
  cursorDot.style.transform =
    `translate3d(calc(${dotX.toFixed(1)}px - 50%), calc(${dotY.toFixed(1)}px - 50%), 0)`;

  ringX = damp(ringX, targetX, 0.14, dt);
  ringY = damp(ringY, targetY, 0.14, dt);
  ringScale = damp(ringScale, hoveringInteractive ? 1.7 : 1, 0.18, dt);
  cursorRing.style.transform =
    `translate3d(calc(${ringX.toFixed(1)}px - 50%), calc(${ringY.toFixed(1)}px - 50%), 0) scale(${ringScale.toFixed(3)})`;
}

requestAnimationFrame(animate);
