export function updateBars(levels) {
  const { space = 0, weather = 0, markets = 0 } = levels || {};
  setBar('bar-space', space);
  setBar('bar-weather', weather);
  setBar('bar-markets', markets);
}

export function setStatus(text) {
  const el = document.getElementById('status-text');
  if (el) el.textContent = text;
}

export function setBtcStatus(marketsRaw) {
  const el = document.getElementById('status-btc');
  if (!el || !marketsRaw) return;

  const price = marketsRaw.btc_price_usd;
  const change = marketsRaw.btc_change_24h_pct;
  const vol = marketsRaw.btc_volume_24h_usd;

  if (typeof price !== 'number' || price <= 0) {
    el.textContent = 'BTC: (using fallback snapshot)';
    return;
  }

  const changeStr =
    (change >= 0 ? '+' : '') + change.toFixed(2).padStart(0) + '%';

  const absVol = Math.abs(vol);
  let volStr = '';
  if (absVol >= 1e9) {
    volStr = '$' + (absVol / 1e9).toFixed(1) + 'B';
  } else if (absVol >= 1e6) {
    volStr = '$' + (absVol / 1e6).toFixed(1) + 'M';
  } else {
    volStr = '$' + absVol.toFixed(0);
  }

  el.textContent = `BTC: $${price.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })} · ${changeStr} (24h) · vol ~ ${volStr}`;
}

function setBar(id, v) {
  const el = document.getElementById(id);
  if (!el) return;
  const clamped = Math.max(0, Math.min(1, v || 0));
  el.style.width = `${Math.round(clamped * 100)}%`;
}
