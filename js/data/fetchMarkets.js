// Live BTC market data via CoinGecko (no API key required).
// Docs: https://www.coingecko.com/en/api/documentation

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true';

export async function fetchMarkets() {
  try {
    const res = await fetch(COINGECKO_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const btc = data.bitcoin || {};

    const priceChange = Number(btc.usd_24h_change ?? 0); // % change over 24h
    const volume24h = Number(btc.usd_24h_vol ?? 0);      // 24h volume in USD

    // Derive normalized metrics:
    // Volatility ~ magnitude of 24h change (clamped)
    const volatility = clamp01(Math.abs(priceChange) / 15); // 0–1 around +/-15%

    // Trend ~ sign and strength of change, map -30%..+30% -> -1..+1 (clamped)
    const trend = Math.max(-1, Math.min(1, priceChange / 30));

    // Volume intensity: compare log10(volume) to a rough BTC range
    // Say 10^8 to 10^11 USD
    const logVol = volume24h > 0 ? Math.log10(volume24h) : 8;
    const volumeIntensity = clamp01((logVol - 8) / (11 - 8));

    return {
      volatility,
      trend,
      volume_intensity: volumeIntensity,
    };
  } catch (err) {
    console.error('fetchMarkets error, falling back to static JSON:', err);

    // Fallback to static snapshot if live fetch fails (rate limit, offline, etc.)
    const res = await fetch('public/data/markets.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch fallback markets data');
    return res.json();
  }
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}
