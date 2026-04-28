// Ownership: visual-only transient effects utilities (screen flash + BONK sprite assets).
import * as THREE from "https://esm.sh/three";

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
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.5, 0.75, 1);
  return sprite;
}

export function triggerScreenFlash(intensity = 1) {
  const clampedIntensity = THREE.MathUtils.clamp(intensity, 0.75, 1.6);
  const alpha = THREE.MathUtils.lerp(0.25, 0.55, (clampedIntensity - 0.75) / 0.85);
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100vw";
  flash.style.height = "100vh";
  flash.style.backgroundColor = `rgba(255, 0, 0, ${alpha})`;
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
