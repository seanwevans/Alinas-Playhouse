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
