// Ownership: per-floor reveal state for elevated zones (upstairs, attic) + their fade/shadow toggles.
import * as THREE from "three";
import { PARAMS } from "../../config/game-config.js";

export class UpstairsVisibilitySystem {
  constructor(ecs) {
    this.levels = PARAMS.World.floorRevealThresholdsY.map((thresholdY) => ({
      thresholdY,
      opacity: PARAMS.World.opacityHidden,
      isFullyOpaque: false,
      shadowsEnabled: false,
      shadowStateChanged: false
    }));

    this.players = ecs.with("controllable", "physicsBody");
    this.upstairsElements = ecs.with("upstairsElement");
  }

  levelFor(element) {
    const index = Math.min(Math.max(element.level, 1), this.levels.length) - 1;
    return this.levels[index];
  }

  update() {
    let activePlayerY = -Infinity;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        activePlayerY = entity.physicsBody.body.position.y;
        break;
      }
    }

    for (const level of this.levels) {
      const targetOpacity =
        activePlayerY > level.thresholdY
          ? PARAMS.World.opacityVisible
          : PARAMS.World.opacityHidden;

      level.opacity = THREE.MathUtils.lerp(
        level.opacity,
        targetOpacity,
        PARAMS.World.upstairsLerp
      );

      level.isFullyOpaque = level.opacity > PARAMS.World.opacityOpaqueReq;

      const enableShadows = level.opacity > PARAMS.World.opacityShadowReq;
      level.shadowStateChanged = level.shadowsEnabled !== enableShadows;
      level.shadowsEnabled = enableShadows;
    }

    for (const entity of this.upstairsElements) {
      const el = entity.upstairsElement;
      const level = this.levelFor(el);

      el.material.opacity = level.opacity;
      el.material.transparent = !level.isFullyOpaque;
      el.material.depthWrite = level.isFullyOpaque;

      if (level.shadowStateChanged) {
        el.mesh.castShadow = level.shadowsEnabled;
        el.mesh.receiveShadow = level.shadowsEnabled;
      }
    }
  }
}
