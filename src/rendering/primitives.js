export function drawDebugPoint(ctx, p, color) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';
  ctx.stroke();
}

// A tapered "sleeve" segment between two joints (wide at r0, narrower at r1) - flat
// fill only, no shading, to match the flat-illustration torso style.
export function drawTaperedSegment(ctx, p0, r0, p1, r1, color) {
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len, py = dx / len; // unit vector perpendicular to the segment

  ctx.beginPath();
  ctx.moveTo(p0.x + px * r0, p0.y + py * r0);
  ctx.lineTo(p1.x + px * r1, p1.y + py * r1);
  ctx.lineTo(p1.x - px * r1, p1.y - py * r1);
  ctx.lineTo(p0.x - px * r0, p0.y - py * r0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath(); ctx.arc(p0.x, p0.y, r0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(p1.x, p1.y, r1, 0, Math.PI * 2); ctx.fill();
}

// A simple hand: a palm blob plus a few curled "finger" strokes, oriented along the forearm.
// Pass flip:true to mirror it across the forearm axis (e.g. so the palm faces the other way).
export function drawHand(ctx, wrist, fromPt, size, color, flip) {
  const angle = Math.atan2(wrist.y - fromPt.y, wrist.x - fromPt.x);
  ctx.save();
  ctx.translate(wrist.x, wrist.y);
  ctx.rotate(angle);
  if (flip) ctx.scale(1, -1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(size * 0.25, 0, size * 0.95, size * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.3;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.85, i * size * 0.32);
    ctx.quadraticCurveTo(size * 1.5, i * size * 0.36, size * 1.25, i * size * 0.2 + size * 0.55);
    ctx.stroke();
  }
  ctx.restore();
}

// Flat-illustration t-shirt torso: full-width shoulders with a round-neck scoop curving
// down into the top-center (instead of a plain dome or a separate collar ring), straight
// sides below down to the hem.
export function drawDomeTorso(ctx, cx, topY, w, h, color) {
  const r = w / 2;
  const neckW = w * 0.16;          // half-width of the neck opening at its narrowest (top)
  const shoulderDrop = h * 0.05;   // shoulders sit slightly below the garment's highest point
  const neckDipY = topY + h * 0.16; // how far the scoop dips down at center

  ctx.beginPath();
  ctx.moveTo(cx - r, topY + shoulderDrop);
  ctx.lineTo(cx - neckW, topY);
  ctx.quadraticCurveTo(cx, neckDipY, cx + neckW, topY);
  ctx.lineTo(cx + r, topY + shoulderDrop);
  ctx.lineTo(cx + r, topY + h);
  ctx.lineTo(cx - r, topY + h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
