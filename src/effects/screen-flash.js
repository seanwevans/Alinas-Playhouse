import * as THREE from "https://esm.sh/three";

export function triggerScreenFlash(intensity = 1) {
  if (typeof document === "undefined" || !document.body) return;
  if (typeof requestAnimationFrame === "undefined") return;

  const clampedIntensity = THREE.MathUtils.clamp(intensity, 0.75, 1.6);
  const alpha = THREE.MathUtils.lerp(
    0.25,
    0.55,
    (clampedIntensity - 0.75) / 0.85
  );
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
