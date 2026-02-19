// Simple voices: drone, noise, and bleep.

export function createDroneVoice(ctx) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const gain = ctx.createGain();
  gain.gain.value = 0.0; // start silent

  osc.connect(gain);
  osc.start();

  return {
    input: null,
    output: gain,
    setParams({ pitch = 0.5, brightness = 0.5 }) {
      const minHz = 40;
      const maxHz = 220;
      const freq = minHz + (maxHz - minHz) * pitch;
      osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.2);
      // brightness could be mapped to filter later; stub here
    },
    setGain(level) {
      gain.gain.setTargetAtTime(level, ctx.currentTime, 0.3);
    },
  };
}

export function createNoiseVoice(ctx) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  noise.connect(gain);
  noise.start();

  return {
    input: null,
    output: gain,
    setParams({ amount = 0.0 }) {
      gain.gain.setTargetAtTime(amount * 0.4, ctx.currentTime, 0.4);
    },
  };
}

export function createBleepVoice(ctx) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  const gain = ctx.createGain();
  gain.gain.value = 0;

  osc.connect(gain);
  osc.start();

  let lastTrigger = 0;
  let rate = 0.2; // events/sec

  function trigger() {
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  }

  function update() {
    const now = ctx.currentTime;
    if (rate > 0 && now - lastTrigger > 1 / rate) {
      trigger();
      lastTrigger = now;
    }
    requestAnimationFrame(update);
  }
  update();

  return {
    input: null,
    output: gain,
    setParams({ pitch = 0.6, eventRate = 0.2 }) {
      const minHz = 300;
      const maxHz = 2000;
      const freq = minHz + (maxHz - minHz) * pitch;
      osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
      rate = eventRate;
    },
  };
}
