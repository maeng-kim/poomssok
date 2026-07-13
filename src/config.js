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
};

export const CAMERA_CONFIG = { width: 960, height: 720 };
