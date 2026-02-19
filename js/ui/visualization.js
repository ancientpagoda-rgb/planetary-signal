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

function setBar(id, v) {
  const el = document.getElementById(id);
  if (!el) return;
  const clamped = Math.max(0, Math.min(1, v || 0));
  el.style.width = `${Math.round(clamped * 100)}%`;
}
