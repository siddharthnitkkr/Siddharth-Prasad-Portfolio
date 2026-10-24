Siddharth Prasad — Portfolio
Personal portfolio of Siddharth Prasad, Senior Support Engineer at Cotiviti (Healthcare IT · EDI · Automation), based in Atlanta, USA.
The hero is an animated portrait of me that follows your cursor — move the mouse anywhere on the page and the character turns his head and eyes toward it, with natural blinking and eye contact when you hover near his face.
🔗 Live demo: https://strong-gingersnap-acc99d.netlify.app
💼 LinkedIn: https://www.linkedin.com/in/siddharth-prasad-583b62161
📄 Resume: assets/Siddharth_Prasad_Resume.pdf
Features
Cursor-tracking hero — 64 pre-extracted gaze frames (one every 5.625°) drawn on a <canvas>; exactly one frame at 100% opacity per angle, so motion is smooth with zero ghosting
Eye contact deadzone — when the cursor is close to the face, the character settles into a neutral front pose and blinks naturally
Custom cursor — instant dot with a trailing aura ring (auto-disabled on touch devices)
Full portfolio sections — About, Experience, Skills, Awards & Publications, Contact
Zero dependencies — plain HTML, CSS and JavaScript; no build step, no framework
How the tracking works
The character video is never played or seeked in the browser (MP4 seeking lags and freezes). Instead:
Frames were extracted from the source video along its ordered gaze sweep (center → up → up-right → right → down-right → down → down-left → left → up-left) and enhanced to 2560×1440 WebP — assets/frames/ring-00.webp … ring-63.webp, plus center.webp and blink.webp.
On every animation frame, the cursor angle around the face anchor (FACE = { x: 0.499, y: 0.423 } of the stage) is computed with atan2 (0° = right, clockwise), smoothed with shortest-path circular damping, and the matching ring frame is drawn.
Sector hysteresis prevents flicker at frame boundaries, and ring order follows the screen angle: ring-00 = right, ring-16 = down, ring-32 = left, ring-48 = up.
Project structure
├── index.html                        # Page: hero + About / Experience / Skills / Recognition / Contact
├── style.css                         # Reel-matched red gradient hero + portfolio section styles
├── script.js                         # Cursor tracking, frame renderer, custom cursor
├── character.mp4                     # Source gaze-sweep video (reference; not played by the page)
└── assets/
    ├── boy.jpg                       # Fallback still shown while frames load
    ├── Siddharth_Prasad_Resume.pdf   # My resume (RESUME button download)
    └── frames/                       # ring-00..63.webp, center.webp, blink.webp (2560×1440)
Run it locally
No build step. Either open index.html directly, or serve the folder:
npx serve .
# or
python3 -m http.server 8000
Then open the printed URL in your browser and move your cursor around the hero.
About me
Senior Support Engineer with 5+ years of experience in Healthcare IT, EDI transaction management, and encounter processing. Specialized in debugging production issues, developing automation tools, and implementing product upgrades — skilled in Edifecs tools, HIPAA compliance, ANSI X12 standards, and healthcare payer systems.
Previously at Edifecs (Associate Implementation Consultant → Implementation Consultant → Support Engineer) and EXL (Analyst, Data Management). MCA from NIT Kurukshetra (9.4 CGPA). Spot Award (Edifecs, 2021) · Star Award (EXL, 2020) · Published researcher (HELPI VIZ, Springer ICCVBIC 2018).
Credits
Character animation generated with Google Flow; hero concept inspired by sl_tech_journal's cursor-tracking portfolio tutorial.
Fonts: Poppins & Dancing Script (Google Fonts).

© 2026 Siddharth Prasad. The code is free to learn from; the portrait, video frames, and resume are personal assets — please don't reuse them.
