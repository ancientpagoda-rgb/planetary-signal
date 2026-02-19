import { createDroneVoice, createNoiseVoice, createBleepVoice } from './voices.js';

let ctx = null;
let masterGain;
let voices = {};

export function initMixer(audioCtx) {
  ctx = audioCtx;
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.4;
  masterGain.connect(ctx.destination);

  const drone = createDroneVoice(ctx);
  const noise = createNoiseVoice(ctx);
  const bleep = createBleepVoice(ctx);

  drone.output.connect(masterGain);
  noise.output.connect(masterGain);
  bleep.output.connect(masterGain);

  voices = { drone, noise, bleep };
}

export function applyParams(params) {
  if (!ctx || !masterGain) return;

  const {
    dronePitch = 0.5,
    droneBrightness = 0.5,
    noiseAmount = 0.0,
    reverbMix = 0.2, // unused stub
    bleepRate = 0.2,
    masterGainLevel = 0.4,
  } = params || {};

  voices.drone.setParams({ pitch: dronePitch, brightness: droneBrightness });
  voices.drone.setGain(0.3 + 0.3 * droneBrightness);

  voices.noise.setParams({ amount: noiseAmount });

  voices.bleep.setParams({
    pitch: 0.4 + 0.4 * dronePitch,
    eventRate: bleepRate,
  });

  masterGain.gain.setTargetAtTime(masterGainLevel, ctx.currentTime, 0.3);
}
