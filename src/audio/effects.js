import * as THREE from "https://esm.sh/three";

export function Bonk(audioCtx, impactVelocity) {
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

export function createBonkSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  ctx.font = '900 72px "Arial Black", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ff0000";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.strokeText("BONK", 128, 64);
  ctx.fillText("BONK", 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.5, 0.75, 1);
  return sprite;
}

export function triggerScreenFlash() {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100vw";
  flash.style.height = "100vh";
  flash.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
  flash.style.pointerEvents = "none";
  flash.style.transition = "opacity 0.2s ease-out";
  flash.style.zIndex = "9999";
  document.body.appendChild(flash);
  flash.getBoundingClientRect();

  requestAnimationFrame(() => {
    flash.style.opacity = "0";
    setTimeout(() => flash.remove(), 200);
  });
}

export function Scream(audioCtx) {
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
