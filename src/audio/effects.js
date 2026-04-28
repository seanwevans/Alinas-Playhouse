export function playBonk(audioCtx, impactVelocity) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  const duration = 0.15;

  osc.type = "sine";
  osc.frequency.setValueAtTime(550, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + duration);

  const volume = Math.min(impactVelocity / 15, 0.5);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

export function playScream(audioCtx) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  const mainGain = audioCtx.createGain();

  osc.type = "sawtooth";
  lfo.type = "sine";

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  osc.connect(mainGain);
  mainGain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  const duration = 1.5;

  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + duration);

  lfo.frequency.setValueAtTime(30, now);
  lfoGain.gain.setValueAtTime(50, now);

  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  mainGain.gain.setValueAtTime(0.2, now + duration - 0.2);
  mainGain.gain.linearRampToValueAtTime(0.01, now + duration);

  osc.start(now);
  lfo.start(now);
  osc.stop(now + duration);
  lfo.stop(now + duration);
}

export function playDogBark(audioCtx, intensity = 1) {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const totalDuration = 0.2;
  const baseVolume = Math.min(0.22 * intensity, 0.28);

  const osc = audioCtx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(230 + Math.random() * 35, now);
  osc.frequency.exponentialRampToValueAtTime(120 + Math.random() * 15, now + totalDuration);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(baseVolume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

  const noiseBuffer = audioCtx.createBuffer(
    1,
    Math.floor(audioCtx.sampleRate * totalDuration),
    audioCtx.sampleRate
  );
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.45;
  }

  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(900, now);
  noiseFilter.Q.setValueAtTime(0.6, now);

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.001, now);
  noiseGain.gain.exponentialRampToValueAtTime(baseVolume * 0.55, now + 0.01);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + totalDuration);
  noiseSource.start(now);
  noiseSource.stop(now + totalDuration);
}
