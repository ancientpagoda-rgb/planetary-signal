export function setupUI({ onStart, onStop, onToggleLayer }) {
  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');

  const cosmicToggle = document.getElementById('cosmicLayerToggle');
  const planetaryToggle = document.getElementById('planetaryLayerToggle');
  const humanToggle = document.getElementById('humanLayerToggle');

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    try {
      await onStart?.();
      stopBtn.disabled = false;
    } catch (e) {
      console.error('Failed to start audio', e);
      startBtn.disabled = false;
    }
  });

  stopBtn.addEventListener('click', () => {
    onStop?.();
    stopBtn.disabled = true;
    startBtn.disabled = false;
  });

  const handlers = [
    ['cosmic', cosmicToggle],
    ['planetary', planetaryToggle],
    ['human', humanToggle],
  ];

  handlers.forEach(([name, el]) => {
    el.addEventListener('change', () => {
      onToggleLayer?.(name, el.checked);
    });
  });

  return {
    setLayerEnabled(name, enabled) {
      const entry = handlers.find(([layer]) => layer === name);
      if (!entry) return;
      const [, el] = entry;
      el.checked = enabled;
    },
  };
}
