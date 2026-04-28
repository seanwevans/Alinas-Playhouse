import * as THREE from "https://esm.sh/three";

export function createBonkSprite() {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

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
