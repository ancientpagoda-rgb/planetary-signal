import { mapCosmicToAudio, mapPlanetaryToAudio, mapHumanToAudio } from './mapping.js';

export function createLayers(ctx, masterGain) {
  // COSMIC: low drone 40–150 Hz via filtered noise + very slow sine
  const cosmicNoise = ctx.createBufferSource();
  const cosmicNoiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = cosmicNoiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  cosmicNoise.buffer = cosmicNoiseBuffer;
  cosmicNoise.loop = true;

  const cosmicFilter = ctx.createBiquadFilter();
  cosmicFilter.type = 'lowpass';
  cosmicFilter.frequency.value = 120;

  const cosmicGain = ctx.createGain();
  cosmicGain.gain.value = 0.25;

  const cosmicLfo = ctx.createOscillator();
  cosmicLfo.type = 'sine';
  cosmicLfo.frequency.value = 0.02; // very slow
  const cosmicLfoGain = ctx.createGain();
  cosmicLfoGain.gain.value = 10; // subtle filter wobble

  cosmicNoise.connect(cosmicFilter).connect(cosmicGain).connect(masterGain);
  cosmicLfo.connect(cosmicLfoGain).connect(cosmicFilter.frequency);
  cosmicNoise.start();
  cosmicLfo.start();

  let cosmicEnabled = true;

  // PLANETARY: band-passed noise / gentle texture 200–800 Hz
  const planetaryNoise = ctx.createBufferSource();
  const planetaryBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const pdata = planetaryBuffer.getChannelData(0);
  for (let i = 0; i < pdata.length; i++) {
    pdata[i] = (Math.random() * 2 - 1) * 0.5;
  }
  planetaryNoise.buffer = planetaryBuffer;
  planetaryNoise.loop = true;

  const planetaryFilter = ctx.createBiquadFilter();
  planetaryFilter.type = 'bandpass';
  planetaryFilter.frequency.value = 400;
  planetaryFilter.Q.value = 0.8;

  const planetaryGain = ctx.createGain();
  planetaryGain.gain.value = 0.18;

  planetaryNoise.connect(planetaryFilter).connect(planetaryGain).connect(masterGain);
  planetaryNoise.start();

  let planetaryEnabled = true;

  // HUMAN SYSTEMS: higher band noise + tremolo 800–3000 Hz
  const humanNoise = ctx.createBufferSource();
  const humanBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const hdata = humanBuffer.getChannelData(0);
  for (let i = 0; i < hdata.length; i++) {
    hdata[i] = (Math.random() * 2 - 1) * 0.35;
  }
  humanNoise.buffer = humanBuffer;
  humanNoise.loop = true;

  const humanFilter = ctx.createBiquadFilter();
  humanFilter.type = 'bandpass';
  humanFilter.frequency.value = 1200;
  humanFilter.Q.value = 0.9;

  const humanGain = ctx.createGain();
  humanGain.gain.value = 0.12;

  // Tremolo
  const humanLfo = ctx.createOscillator();
  humanLfo.type = 'sine';
  humanLfo.frequency.value = 1.2;
  const humanLfoGain = ctx.createGain();
  humanLfoGain.gain.value = 0.08; // depth modulated by volatility

  humanNoise.connect(humanFilter).connect(humanGain).connect(masterGain);
  humanLfo.connect(humanLfoGain).connect(humanGain.gain);

  humanNoise.start();
  humanLfo.start();

  let humanEnabled = true;

  function applyEnabledStates() {
    cosmicGain.gain.value = cosmicEnabled ? 0.25 : 0.0;
    planetaryGain.gain.value = planetaryEnabled ? 0.18 : 0.0;
    humanGain.gain.value = humanEnabled ? 0.12 : 0.0;
  }

  applyEnabledStates();

  return {
    cosmic: {
      setEnabled(enabled) {
        cosmicEnabled = enabled;
        applyEnabledStates();
      },
      updateFromData(value) {
        const mapped = mapCosmicToAudio(value);
        // Map to low-frequency filter cutoff + subtle gain
        cosmicFilter.frequency.setTargetAtTime(mapped.filterFreq, ctx.currentTime, 4.0);
        cosmicGain.gain.setTargetAtTime(mapped.gain, ctx.currentTime, 6.0);
      },
    },
    planetary: {
      setEnabled(enabled) {
        planetaryEnabled = enabled;
        applyEnabledStates();
      },
      updateFromData(value) {
        const mapped = mapPlanetaryToAudio(value);
        planetaryFilter.frequency.setTargetAtTime(mapped.centerFreq, ctx.currentTime, 2.0);
        planetaryGain.gain.setTargetAtTime(mapped.gain, ctx.currentTime, 3.0);
      },
    },
    human: {
      setEnabled(enabled) {
        humanEnabled = enabled;
        applyEnabledStates();
      },
      updateFromData(value) {
        const mapped = mapHumanToAudio(value);
        humanFilter.frequency.setTargetAtTime(mapped.centerFreq, ctx.currentTime, 1.0);
        humanLfo.frequency.setTargetAtTime(mapped.tremoloRate, ctx.currentTime, 1.5);
        humanLfoGain.gain.setTargetAtTime(mapped.tremoloDepth, ctx.currentTime, 1.5);
        humanGain.gain.setTargetAtTime(mapped.gain, ctx.currentTime, 2.5);
      },
    },
  };
}
