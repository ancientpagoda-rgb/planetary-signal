import { createAudioEngine } from './audio/engine.js';
import { createDataController } from './data/sources.js';
import { setupUI } from './ui/controls.js';

const UPDATE_INTERVAL_MS = 120000; // 2 minutes – within 60–300s spec

let audioEngine = null;
let dataController = null;
let updateTimer = null;

function setStatus(layer, text) {
  const el = document.getElementById(layer + 'Status');
  if (el) el.textContent = text;
}

async function init() {
  audioEngine = createAudioEngine();
  dataController = createDataController({
    onCosmicUpdate: (value) => {
      setStatus('cosmic', 'live');
      audioEngine.updateLayer('cosmic', value);
    },
    onPlanetaryUpdate: (value) => {
      setStatus('planetary', 'live');
      audioEngine.updateLayer('planetary', value);
    },
    onHumanUpdate: (value) => {
      setStatus('human', 'live');
      audioEngine.updateLayer('human', value);
    },
    onError: (layer, msg) => {
      setStatus(layer, 'fallback');
      console.warn(`[${layer}] data error:`, msg);
    },
  });

  const ui = setupUI({
    onStart: async () => {
      if (!audioEngine) return;
      await audioEngine.start();
      scheduleUpdates();
    },
    onStop: () => {
      if (!audioEngine) return;
      audioEngine.stop();
      if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
      }
    },
    onToggleLayer: (layer, enabled) => {
      if (!audioEngine) return;
      audioEngine.setLayerEnabled(layer, enabled);
    },
  });

  // Initial status
  setStatus('cosmic', 'waiting');
  setStatus('planetary', 'waiting');
  setStatus('human', 'waiting');
}

function scheduleUpdates() {
  const run = () => {
    dataController.updateAll();
  };

  run();
  if (updateTimer) clearInterval(updateTimer);
  updateTimer = setInterval(run, UPDATE_INTERVAL_MS);
}

window.addEventListener('DOMContentLoaded', init);
