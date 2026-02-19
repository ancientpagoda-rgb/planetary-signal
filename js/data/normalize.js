import { clamp01 } from '../util/constants.js';

export function normalizeSpace(raw) {
  const kIndex = raw.kp_index ?? 3;        // 0–9
  const protonFlux = raw.proton_flux ?? 5; // arbitrary

  return {
    solarActivity: clamp01((raw.solar_flux ?? 120) / 300),
    geomagneticStorm: clamp01(kIndex / 9),
    protonFlux: clamp01(protonFlux / 10),
  };
}

export function normalizeWeather(raw) {
  const globalStorms = raw.storm_count ?? 0;          // e.g. 0–50
  const cloud = raw.global_cloud_cover ?? 0.5;        // 0–1
  const temp = raw.temp_anomaly ?? 0;                 // -5 – +5 C

  return {
    globalStorminess: clamp01(globalStorms / 30),
    cloudCover: clamp01(cloud),
    tempAnomaly: clamp01((temp + 5) / 10),
  };
}

export function normalizeMarkets(raw) {
  const vol = raw.volatility ?? 0.2;          // 0–1
  const trend = raw.trend ?? 0;               // -1 – +1
  const volume = raw.volume_intensity ?? 0.5; // 0–1

  return {
    volatility: clamp01(vol),
    trend,
    volumeIntensity: clamp01(volume),
  };
}

export function smooth(prev, next, alpha = 0.2) {
  if (!prev) return { ...next };
  const out = {};
  for (const key of Object.keys(next)) {
    const p = prev[key] ?? next[key];
    out[key] = p + alpha * (next[key] - p);
  }
  return out;
}
