import { clamp01 } from '../util/constants.js';
import { easeInOutQuad, remap01 } from './curves.js';

export function computeAudioParams(space, weather, markets, preset = 'default') {
  const s = space ?? { solarActivity: 0, geomagneticStorm: 0, protonFlux: 0 };
  const w = weather ?? { globalStorminess: 0, cloudCover: 0.3, tempAnomaly: 0.4 };
  const m = markets ?? { volatility: 0.2, trend: 0, volumeIntensity: 0.4 };

  const vol01 = clamp01(m.volatility);
  const trend01 = remap01(m.trend, -1, 1);

  let dronePitch = 0.4 + 0.3 * s.solarActivity;
  let droneBrightness = clamp01(s.protonFlux * 1.2);
  let noiseAmount = clamp01(s.geomagneticStorm * 1.4);
  let reverbMix = clamp01(w.cloudCover * 0.7 + s.geomagneticStorm * 0.3);
  let bleepRate = 0.1 + easeInOutQuad(vol01) * 3.0;
  let masterGainLevel = 0.35 + w.globalStorminess * 0.15;

  switch (preset) {
    case 'calm':
      noiseAmount *= 0.3;
      bleepRate *= 0.5;
      masterGainLevel *= 0.7;
      break;
    case 'storm':
      noiseAmount = clamp01(noiseAmount * 1.5 + 0.2);
      bleepRate *= 1.3;
      masterGainLevel *= 1.1;
      break;
    default:
      break;
  }

  const trendShift = (trend01 - 0.5) * 0.1; // ±0.05
  dronePitch = clamp01(dronePitch + trendShift);

  return {
    dronePitch,
    droneBrightness,
    noiseAmount,
    reverbMix,
    bleepRate,
    masterGainLevel,
  };
}
