// Light extra smoothing on top of MediaPipe's own landmark smoothing, keyed by landmark index.
export class Smoother {
  constructor() {
    this._points = {};
  }

  smooth(key, p, alpha) {
    const prev = this._points[key];
    if (!prev) {
      this._points[key] = p;
      return p;
    }
    const s = {
      x: prev.x + (p.x - prev.x) * alpha,
      y: prev.y + (p.y - prev.y) * alpha,
      v: p.v,
    };
    this._points[key] = s;
    return s;
  }
}
