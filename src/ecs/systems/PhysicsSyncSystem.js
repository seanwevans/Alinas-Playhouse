import { PARAMS } from "../../config/params.js";
import { copyCannonVec3ToThree, copyThreeVec3ToCannon } from "../../core/math.js";

export class PhysicsSyncSystem {
  constructor(ecs, screamFn) {
    this.query = ecs.with("renderable", "physicsBody");
    this.screamFn = screamFn;
  }

  update() {
    for (const entity of this.query) {
      const render = entity.renderable;
      const phys = entity.physicsBody;

      if (entity.player && phys.body.position.y < PARAMS.Physics.screamPlaneY && !entity.player.hasScreamed) {
        entity.player.hasScreamed = true;
        this.screamFn();
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
        let diff = entity.player.targetRotation - render.mesh.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        render.mesh.rotation.y += diff * PARAMS.Player.turnLerp;
      }
    }
  }
}
