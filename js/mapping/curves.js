export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function remap01(x, inMin, inMax) {
  if (inMax === inMin) return 0;
  const t = (x - inMin) / (inMax - inMin);
  return Math.min(1, Math.max(0, t));
}
