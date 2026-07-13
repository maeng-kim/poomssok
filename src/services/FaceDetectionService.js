import { CDN } from '../config.js';

// Wraps MediaPipe FaceDetection: given a still image, resolves the primary face's bounding box.
export class FaceDetectionService {
  constructor() {
    this._detector = null;
  }

  _getDetector() {
    if (this._detector) return this._detector;
    this._detector = new FaceDetection({ locateFile: CDN.faceDetection });
    this._detector.setOptions({ model: 'short', minDetectionConfidence: 0.5 });
    return this._detector;
  }

  async detectFaceBox(img) {
    const detector = this._getDetector();
    return new Promise((resolve) => {
      detector.onResults((results) => {
        resolve(results.detections && results.detections.length ? results.detections[0].boundingBox : null);
      });
      detector.send({ image: img });
    });
  }
}
