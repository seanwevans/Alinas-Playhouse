import * as THREE from "https://esm.sh/three";
import { playBonk } from "../../audio/effects.js";

export function attachPlayerCollisionEffects(body, gameRef, helpers) {
  if (!gameRef) return;

  const { createBonkSprite, triggerScreenFlash, FloatingTextComponent } = helpers;
  let lastBonkAt = 0;
  const bonkCooldownMs = 200;

  body.addEventListener("collide", (e) => {
    const impactVelocity = Math.abs(e.contact.getImpactVelocityAlongNormal());
    if (impactVelocity <= 1.5) return;

    const now = performance.now();
    if (now - lastBonkAt < bonkCooldownMs) return;
    lastBonkAt = now;

    const impactIntensity = THREE.MathUtils.clamp(impactVelocity / 8, 0.75, 1.6);

    playBonk(gameRef.audioCtx, impactVelocity);
    triggerScreenFlash(impactIntensity);

    const sprite = createBonkSprite();
    sprite.scale.multiplyScalar(impactIntensity);
    sprite.position.set(body.position.x, body.position.y + 1.2, body.position.z);
    gameRef.scene.add(sprite);

    gameRef.ecs.add({
      floatingText: new FloatingTextComponent(sprite, 0.8)
    });
  });
}
