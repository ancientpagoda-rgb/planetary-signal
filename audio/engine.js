import { createLayers } from './layers.js';

export function createAudioEngine() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let masterGain = null;
  let layers = null;
  let started = false;

  function ensureContext() {
    if (!ctx) {
      ctx = new AudioContextClass();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5; // overall level
      masterGain.connect(ctx.destination);
      layers = createLayers(ctx, masterGain);
    }
  }

  async function start() {
    ensureContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    started = true;
  }

  function stop() {
    if (!ctx) return;
    ctx.suspend();
    started = false;
  }

  function setLayerEnabled(layerName, enabled) {
    if (!layers) return;
    const layer = layers[layerName];
    if (layer && layer.setEnabled) {
      layer.setEnabled(enabled);
    }
  }

  function updateLayer(layerName, value) {
    if (!layers || !started) return;
    const layer = layers[layerName];
    if (layer && layer.updateFromData) {
      layer.updateFromData(value);
    }
  }

  return {
    start,
    stop,
    setLayerEnabled,
    updateLayer,
  };
}
