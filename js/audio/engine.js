let audioContext = null;

export async function initAudio() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) throw new Error('WebAudio not supported in this browser.');
    audioContext = new Ctor();
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  return audioContext;
}

export function getContext() {
  return audioContext;
}

export async function suspendAudio() {
  if (audioContext && audioContext.state === 'running') {
    await audioContext.suspend();
  }
}
