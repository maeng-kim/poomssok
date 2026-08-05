# poomssok

For Minji, who forgot to sign up for the 사녹공방 event — a fan-run commission
service where someone manually photo-edits a fan's face onto a hugging pose
with their favorite idol. This app recreates that effect live, in the
browser, using your webcam.

## What it does

1. Upload a photo — the app finds the face, cuts it out (background removed),
   and holds onto that cutout.
2. Turn on your webcam — your pose (shoulders, ears, nose) is tracked in
   real time.
3. The cutout face + an illustrated arm and torso are composited onto your
   shoulder, so it looks like you're being hugged by the person in the photo.
4. Optionally type a 2-character name to render an "I ❤ {name}" label next
   to the illustration.

## Tech stack

- Vanilla JS (ES modules, no build step, no framework)
- HTML5 Canvas 2D for all compositing/drawing
- [MediaPipe](https://github.com/google-ai-edge/mediapipe) (loaded from CDN as global scripts):
  - `FaceDetection` — locates the face in the uploaded photo
  - `SelfieSegmentation` — removes the background from the uploaded photo
  - `Pose` — tracks shoulders/ears/nose from the live webcam feed
  - `CameraUtils` — drives the webcam → Pose pipeline

## Project structure

```
index.html                 markup + styles + <script type="module"> entry point
src/
  config.js                CDN locators, render constants, camera constraints
  main.js                  orchestrator - wires UI, services, and renderer together
  ui/
    UIController.js        DOM refs + event wiring (file input, name input, status text)
  services/
    FaceDetectionService.js     wraps MediaPipe FaceDetection
    BackgroundRemovalService.js wraps MediaPipe SelfieSegmentation
    PoseTrackingService.js      wraps MediaPipe Pose + Camera (webcam loop)
  domain/
    FaceTexture.js          builds the oval-cropped, transparent face cutout
  rendering/
    AvatarRenderer.js       per-frame compositing: face + torso + arms + label + occlusion
    primitives.js           canvas drawing helpers (tapered limb, hand, dome torso, debug dot)
  utils/
    geometry.js              landmark → pixel point, distance, midpoint helpers
    Smoother.js               exponential smoothing for jitter-free landmark tracking
```

Each MediaPipe model is wrapped in its own service class with a narrow
public method (`detectFaceBox`, `removeBackground`, `start`), so any one of
them can be swapped out or moved server-side later without touching the
rest of the app.

## Main logic

- **Photo intake** (`main.js` → `FaceDetectionService` → `BackgroundRemovalService` → `FaceTexture`):
  detect the face bounding box, strip the background from the whole photo,
  then crop an oval face texture out of the result.
- **Live tracking** (`PoseTrackingService` → `AvatarRenderer.render`): each
  webcam frame is run through MediaPipe Pose; shoulder/ear/nose landmarks
  are smoothed (`Smoother`) to avoid jitter, then used to compute where and
  at what angle to place the face cutout, illustrated torso, and arms.
- **Occlusion**: the live segmentation mask from Pose is used to redraw the
  real person's silhouette *over* the illustration, so the illustrated arm
  looks like it's actually resting behind/around the real body.
- **Mirroring**: the canvas is horizontally flipped so the webcam behaves
  like a mirror, matching how users expect to see themselves.

## Update log

- **Modularized the codebase** — split a single 480-line HTML file into the
  `src/` structure above (service classes per MediaPipe model, a renderer
  class, a UI controller, a thin orchestrator), so future features can be
  added to one module without touching the rest.
- **Fixed mobile layout** — added the missing `<meta name="viewport">` (its
  absence was forcing mobile browsers to render at desktop width and scale
  down, breaking all proportions), and changed the video stage from a
  hardcoded 4:3 box to one that adapts to whatever aspect ratio the camera
  actually negotiates (mobile cameras often aren't 4:3). Also pinned
  `facingMode: 'user'` so the front camera is reliably selected on phones.

## Reference
- https://github.com/gprem09/naruto
