// Mapping utilities to keep data → audio relationships clear.
// All functions expect smoothed, normalized (0–1) input values.

function lerp(min, max, t) {
  return min + (max - min) * t;
}

function expScale(min, max, t) {
  const exp = Math.pow(10, t) - 1;
  const norm = exp / (Math.pow(10, 1) - 1);
  return lerp(min, max, norm);
}

export function mapCosmicToAudio(norm) {
  // Cosmic intensity → low drone weight
  // Filter in 40–150 Hz band, logarithmic-ish scaling to favor low end
  const filterFreq = expScale(40, 150, norm * 0.9 + 0.1);
  const gain = lerp(0.15, 0.32, norm);
  return { filterFreq, gain };
}

export function mapPlanetaryToAudio(norm) {
  // Wind/pressure/temperature aggregate
  // Center frequency 200–800 Hz
  const centerFreq = expScale(200, 800, norm * 0.85 + 0.15);
  const gain = lerp(0.1, 0.22, norm);
  return { centerFreq, gain };
}

export function mapHumanToAudio(norm) {
  // Market volatility → faster/more present tremolo in 800–3000 Hz
  const centerFreq = expScale(800, 3000, norm * 0.9 + 0.1);
  const tremoloRate = lerp(0.3, 3.0, norm); // very slow to gentle pulse
  const tremoloDepth = lerp(0.02, 0.16, norm); // modulation depth
  const gain = lerp(0.05, 0.18, norm);
  return { centerFreq, tremoloRate, tremoloDepth, gain };
}
