import { CDN } from '../config.js';

// Wraps MediaPipe SelfieSegmentation: strips the background out of a still image, keeping
// only the person/hair, so background never peeks through the face crop oval.
export class BackgroundRemovalService {
  constructor() {
    this._segmenter = null;
  }

  _getSegmenter() {
    if (this._segmenter) return this._segmenter;
    this._segmenter = new SelfieSegmentation({ locateFile: CDN.selfieSegmentation });
    this._segmenter.setOptions({ modelSelection: 1 });
    return this._segmenter;
  }

  async removeBackground(img) {
    const seg = this._getSegmenter();
    return new Promise((resolve) => {
      seg.onResults((results) => {
        const full = document.createElement('canvas');
        full.width = img.naturalWidth;
        full.height = img.naturalHeight;
        const fctx = full.getContext('2d');
        fctx.drawImage(img, 0, 0, full.width, full.height);
        fctx.globalCompositeOperation = 'destination-in';
        fctx.drawImage(results.segmentationMask, 0, 0, full.width, full.height);
        fctx.globalCompositeOperation = 'source-over';
        resolve(full);
      });
      seg.send({ image: img });
    });
  }
}
