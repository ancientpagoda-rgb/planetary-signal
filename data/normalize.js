// Normalization helpers: convert raw data ranges into 0–1 range.
// These are intentionally simple and conservative. If feeds change,
// the system should still behave reasonably.

export function clamp01(x) {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function normalizeRange(value, min, max) {
  if (max === min) return 0;
  return clamp01((value - min) / (max - min));
}

// Cosmic: Kp index 0–9 (space weather scale)
export function normalizeKp(kp) {
  return normalizeRange(kp, 0, 9);
}

// Planetary: temperature (°C), wind speed (m/s), pressure (hPa)
export function normalizeTemperature(tempC) {
  // Typical terrestrial range -20 to 40°C, clamp extremes
  return normalizeRange(tempC, -20, 40);
}

export function normalizeWindSpeed(ms) {
  // 0–20 m/s (72 km/h) covers breezy to strong wind
  return normalizeRange(ms, 0, 20);
}

export function normalizePressure(hPa) {
  // 960–1040 hPa typical range
  return normalizeRange(hPa, 960, 1040);
}

// Human: price volatility: relative change in BTC price
export function normalizeVolatility(relChange) {
  // relChange is |delta| / price, usually small (<0.05). Map 0–0.1 → 0–1.
  return normalizeRange(relChange, 0, 0.1);
}
