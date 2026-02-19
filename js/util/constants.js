export const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}
