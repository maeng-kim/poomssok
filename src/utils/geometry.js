export function pt(landmarks, i, w, h) {
  const l = landmarks[i];
  return { x: l.x * w, y: l.y * h, v: l.visibility || 0 };
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function mid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
