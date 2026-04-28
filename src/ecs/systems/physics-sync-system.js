import { playScream } from "../../audio/effects.js";
import { PARAMS } from "../../config/game-config.js";
import {
  copyCannonVec3ToThree,
  copyThreeVec3ToCannon,
  shortestAngleDelta
} from "../../core/math.js";

export class PhysicsSyncSystem {
  constructor(ecs, gameRef) {
    this.query = ecs.with("renderable", "physicsBody");
    this.gameRef = gameRef;
  }

  update() {
    for (const entity of this.query) {
      const render = entity.renderable;
      const phys = entity.physicsBody;

      if (
        entity.player &&
        phys.body.position.y < PARAMS.Physics.screamPlaneY &&
        !entity.player.hasScreamed
      ) {
        entity.player.hasScreamed = true;
        if (this.gameRef && this.gameRef.audioCtx) {
          playScream(this.gameRef.audioCtx);
        }
      }

      if (phys.body.position.y < PARAMS.Physics.killPlaneY) {
        copyThreeVec3ToCannon(phys.body.position, PARAMS.Physics.respawnPos);
        phys.body.velocity.set(0, 0, 0);
        phys.body.angularVelocity.set(0, 0, 0);

        if (entity.player) {
          entity.player.hasScreamed = false;
        }
      }

      copyCannonVec3ToThree(render.mesh.position, phys.body.position);

      if (entity.player) {
        const diff = shortestAngleDelta(
          render.mesh.rotation.y,
          entity.player.targetRotation
        );
        render.mesh.rotation.y += diff * PARAMS.Player.turnLerp;
      }
    }
  }
}
