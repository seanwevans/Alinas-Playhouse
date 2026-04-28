import * as THREE from "https://esm.sh/three";
import { PARAMS } from "../../config/game-config.js";

export class UpstairsVisibilitySystem {
  constructor(ecs) {
    this.upstairsOpacity = PARAMS.World.opacityHidden;
    this.shadowsEnabled = false;

    this.players = ecs.with("controllable", "physicsBody");
    this.upstairsElements = ecs.with("upstairsElement");
  }

  update() {
    let isUpstairs = false;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        if (entity.physicsBody.body.position.y > PARAMS.World.upstairsThresholdY) {
          isUpstairs = true;
        }
        break;
      }
    }

    const targetOpacity = isUpstairs
      ? PARAMS.World.opacityVisible
      : PARAMS.World.opacityHidden;

    this.upstairsOpacity = THREE.MathUtils.lerp(
      this.upstairsOpacity,
      targetOpacity,
      PARAMS.World.upstairsLerp
    );

    const isFullyOpaque = this.upstairsOpacity > PARAMS.World.opacityOpaqueReq;
    const enableShadows = this.upstairsOpacity > PARAMS.World.opacityShadowReq;

    const shadowStateChanged = this.shadowsEnabled !== enableShadows;
    this.shadowsEnabled = enableShadows;

    for (const entity of this.upstairsElements) {
      const el = entity.upstairsElement;
      el.material.opacity = this.upstairsOpacity;
      el.material.transparent = !isFullyOpaque;
      el.material.depthWrite = isFullyOpaque;

      if (shadowStateChanged) {
        el.mesh.castShadow = enableShadows;
        el.mesh.receiveShadow = enableShadows;
      }
    }
  }
}
