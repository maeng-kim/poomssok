// Builds an offscreen canvas holding just the cropped face (transparent outside the oval),
// so it can be layered behind/in front of the tracked person independent of the source photo.
export function buildFaceTexture(img, cx, cy, rx, ry) {
  const OUT = 320;
  const outH = Math.round(OUT * (ry / rx));
  const c = document.createElement('canvas');
  c.width = OUT;
  c.height = outH;
  const cctx = c.getContext('2d');
  cctx.save();
  cctx.beginPath();
  cctx.ellipse(OUT / 2, outH / 2, OUT / 2, outH / 2, 0, 0, Math.PI * 2);
  cctx.clip();
  cctx.drawImage(img, cx - rx, cy - ry, rx * 2, ry * 2, 0, 0, OUT, outH);
  cctx.restore();
  return c;
}
