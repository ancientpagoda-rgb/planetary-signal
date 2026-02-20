import {
  normalizeKp,
  normalizeTemperature,
  normalizeWindSpeed,
  normalizePressure,
  normalizeVolatility,
} from './normalize.js';
import { createSmoother } from './smoothing.js';

// Public/no-key APIs only. Fallbacks are provided if a fetch fails.

// Cosmic: NOAA SWPC planetary K-index (Kp). We'll use a simple JSON feed.
// Example (no key): https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
async function fetchCosmic() {
  try {
    const res = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    // The feed is an array of arrays; last entry has latest Kp at index 1 or 2 depending on schema.
    const last = json[json.length - 1];
    const kpRaw = parseFloat(last[1] ?? last[2] ?? 0);
    return normalizeKp(kpRaw);
  } catch (e) {
    console.warn('Cosmic data fetch failed, using fallback', e);
    // Fallback: slowly wandering pseudo-random value
    return Math.random() * 0.5 + 0.25;
  }
}

// Planetary: Open-Meteo API, no key required.
// We'll use a fixed location (e.g., approximate mid-latitude) to avoid geolocation.
async function fetchPlanetary() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=40.0&longitude=-100.0&current=temperature_2m,pressure_msl,wind_speed_10m';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    const c = json.current || {};
    const t = normalizeTemperature(c.temperature_2m ?? 15);
    const w = normalizeWindSpeed(c.wind_speed_10m ?? 3);
    const p = normalizePressure(c.pressure_msl ?? 1013);
    // Simple average of three channels
    const avg = (t + w + p) / 3;
    return avg;
  } catch (e) {
    console.warn('Planetary data fetch failed, using fallback', e);
    return Math.random() * 0.4 + 0.3;
  }
}

// Human systems: BTC price volatility from Coindesk or other no-key endpoint.
// We'll track current vs previous sample to estimate relative volatility.
const BTC_ENDPOINT = 'https://api.coindesk.com/v1/bpi/currentprice/BTC.json';

async function fetchBtcPrice() {
  const res = await fetch(BTC_ENDPOINT, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const json = await res.json();
  const usd = json?.bpi?.USD?.rate_float ?? parseFloat(json?.bpi?.USD?.rate?.replace(/,/g, ''));
  if (!usd || !Number.isFinite(usd)) throw new Error('Invalid BTC price');
  return usd;
}

export function createDataController({
  onCosmicUpdate,
  onPlanetaryUpdate,
  onHumanUpdate,
  onError,
}) {
  const cosmicSmoother = createSmoother(0.4, 0.04);
  const planetarySmoother = createSmoother(0.5, 0.06);
  const humanSmoother = createSmoother(0.3, 0.08);

  let lastBtcPrice = null;

  async function updateCosmic() {
    try {
      const norm = await fetchCosmic();
      const smoothed = cosmicSmoother.next(norm);
      onCosmicUpdate(smoothed);
    } catch (e) {
      onError?.('cosmic', e.message || String(e));
    }
  }

  async function updatePlanetary() {
    try {
      const norm = await fetchPlanetary();
      const smoothed = planetarySmoother.next(norm);
      onPlanetaryUpdate(smoothed);
    } catch (e) {
      onError?.('planetary', e.message || String(e));
    }
  }

  async function updateHuman() {
    try {
      const price = await fetchBtcPrice();
      let norm = 0.2;
      if (lastBtcPrice != null && price > 0) {
        const rel = Math.abs(price - lastBtcPrice) / price;
        norm = normalizeVolatility(rel);
      }
      lastBtcPrice = price;
      const smoothed = humanSmoother.next(norm);
      onHumanUpdate(smoothed);
    } catch (e) {
      console.warn('Human systems data fetch failed, using synthetic volatility', e);
      // Synthetic slow-changing volatility fallback
      const synthetic = humanSmoother.next(Math.random() * 0.5);
      onHumanUpdate(synthetic);
      onError?.('human', e.message || String(e));
    }
  }

  function updateAll() {
    updateCosmic();
    updatePlanetary();
    updateHuman();
  }

  return {
    updateAll,
  };
}
