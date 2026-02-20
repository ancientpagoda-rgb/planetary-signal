import { initAudio, suspendAudio } from './audio/engine.js';
import { initMixer, applyParams } from './audio/mixer.js';
import { scheduler } from './util/scheduler.js';
import { fetchSpaceWeather } from './data/fetchSpace.js';
import { fetchWeather } from './data/fetchWeather.js';
import { fetchMarkets } from './data/fetchMarkets.js';
import {
  normalizeSpace,
  normalizeWeather,
  normalizeMarkets,
  smooth,
} from './data/normalize.js';
import { computeAudioParams } from './mapping/mappingEngine.js';
import { updateBars, setStatus, setBtcStatus } from './ui/visualization.js';
import { setupControls, getControlState } from './ui/controls.js';
import { POLL_INTERVAL_MS } from './util/constants.js';

let mixerInitialized = false;
let spaceState = null;
let weatherState = null;
let marketsState = null;
let lastMarketsRaw = null;

export function initApp() {
  const startBtn = document.getElementById('start-audio');
  const stopBtn = document.getElementById('stop-audio');

  setupControls(onPresetChanged);

  startBtn.addEventListener('click', async () => {
    try {
      const ctx = await initAudio();
      if (!mixerInitialized) {
        initMixer(ctx);
        mixerInitialized = true;
      }
      startBtn.disabled = true;
      stopBtn.disabled = false;
      setStatus('Audio running. Fetching data…');

      scheduler.start(async () => {
        await updateFromData();
      }, POLL_INTERVAL_MS);

      // immediate first update
      await updateFromData();
    } catch (err) {
      console.error(err);
      setStatus('Failed to start audio: ' + err.message);
    }
  });

  stopBtn.addEventListener('click', () => {
    scheduler.stop();
    suspendAudio();
    stopBtn.disabled = true;
    startBtn.disabled = false;
    setStatus('Audio stopped.');
  });
}

async function updateFromData() {
  const controls = getControlState();

  try {
    const [spaceRaw, weatherRaw, marketsRaw] = await Promise.all([
      controls.sources.space ? fetchSpaceWeather() : null,
      controls.sources.weather ? fetchWeather() : null,
      controls.sources.markets ? fetchMarkets() : null,
    ]);

    if (spaceRaw) {
      const norm = normalizeSpace(spaceRaw);
      spaceState = smooth(spaceState, norm);
    }

    if (weatherRaw) {
      const norm = normalizeWeather(weatherRaw);
      weatherState = smooth(weatherState, norm);
    }

    if (marketsRaw) {
      const norm = normalizeMarkets(marketsRaw);
      marketsState = smooth(marketsState, norm);
      lastMarketsRaw = marketsRaw;
    }

    const params = computeAudioParams(
      spaceState,
      weatherState,
      marketsState,
      controls.preset,
    );

    applyParams(params);

    updateBars({
      space: spaceState?.solarActivity ?? 0,
      weather: weatherState?.globalStorminess ?? 0,
      markets: marketsState?.volatility ?? 0,
    });

    setBtcStatus(lastMarketsRaw);

    setStatus('Last update: ' + new Date().toLocaleTimeString());
  } catch (err) {
    console.error(err);
    setStatus('Error updating data: ' + err.message);
  }
}

function onPresetChanged() {
  // next updateFromData will pick it up via getControlState()
  setStatus('Preset changed. Awaiting next data tick…');
}
