const state = {
  preset: 'default',
  sources: {
    space: true,
    weather: true,
    markets: true,
  },
};

let presetChangedCb = () => {};

export function setupControls(onPresetChanged) {
  presetChangedCb = onPresetChanged || (() => {});

  const spaceCb = document.getElementById('source-space');
  const weatherCb = document.getElementById('source-weather');
  const marketsCb = document.getElementById('source-markets');
  const presetSelect = document.getElementById('preset-select');

  spaceCb.addEventListener('change', () => {
    state.sources.space = spaceCb.checked;
  });

  weatherCb.addEventListener('change', () => {
    state.sources.weather = weatherCb.checked;
  });

  marketsCb.addEventListener('change', () => {
    state.sources.markets = marketsCb.checked;
  });

  presetSelect.addEventListener('change', () => {
    state.preset = presetSelect.value;
    presetChangedCb(state.preset);
  });
}

export function getControlState() {
  return JSON.parse(JSON.stringify(state));
}
