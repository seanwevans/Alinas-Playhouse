import { playBonk } from "../audio/effects.js";
import { createBonkSprite } from "./bonk-text.js";
import { triggerScreenFlash } from "./screen-flash.js";

export function runPlayerImpactEffects({
  gameRef,
  impactVelocity,
  impactIntensity,
  position,
  addFloatingText
}) {
  playBonk(gameRef.audioCtx, impactVelocity);
  triggerScreenFlash(impactIntensity);

  const sprite = createBonkSprite();
  if (!sprite) return;

  sprite.scale.multiplyScalar(impactIntensity);
  sprite.position.set(position.x, position.y + 1.2, position.z);
  gameRef.scene.add(sprite);

  addFloatingText(sprite);
}
