import { CDN, CAMERA_CONFIG } from '../config.js';

// Wraps MediaPipe Pose + Camera: streams webcam frames through the pose model and
// forwards each result frame to a caller-supplied callback.
export class PoseTrackingService {
  constructor(videoEl) {
    this._video = videoEl;
    this._camera = null;
  }

  get isRunning() {
    return !!this._camera;
  }

  async start(onResults) {
    if (this._camera) return;
    try {
      const pose = new Pose({ locateFile: CDN.pose });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(onResults);

      this._camera = new Camera(this._video, {
        onFrame: async () => { await pose.send({ image: this._video }); },
        width: CAMERA_CONFIG.width,
        height: CAMERA_CONFIG.height,
        facingMode: CAMERA_CONFIG.facingMode,
      });
      await this._camera.start();
    } catch (err) {
      this._camera = null;
      throw err;
    }
  }
}
