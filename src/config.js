// MediaPipe wasm/model asset locators - each service resolves its own files off this CDN.
export const CDN = {
  faceDetection: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${f}`,
  selfieSegmentation: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`,
  pose: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
};

export const RENDER_CONFIG = {
  FLIP_SIDE: false,
  ARM_WIDTH: 34,
  ARM_COLOR: '#e0a15c',
  SHOW_DEBUG: false,
  USE_OCCLUSION: true,
  // Shifts the face cutout toward the torso's outward offset (in faceW units) so it sits
  // centered over the illustrated body like a head instead of floating beside it.
  FACE_OFFSET: 0.18,
};

// width/height are ideal constraints only - mobile devices often negotiate a different
// aspect ratio (e.g. portrait sensors), which the .stage/canvas CSS now adapts to.
export const CAMERA_CONFIG = { width: 960, height: 720, facingMode: 'user' };
