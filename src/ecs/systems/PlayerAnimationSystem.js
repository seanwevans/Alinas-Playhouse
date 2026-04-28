import * as THREE from "https://esm.sh/three";
import { PARAMS } from "../../config/params.js";

export class PlayerAnimationSystem {
  constructor(ecs) {
    this.query = ecs.with("player", "physicsBody");
  }

  update(dt) {
    for (const entity of this.query) {
      const player = entity.player;
      const phys = entity.physicsBody;
      const velX = phys.body.velocity.x;
      const velZ = phys.body.velocity.z;

      if (player.isSitting) {
        player.walkTime = 0;
        player.visualGroup.position.y = THREE.MathUtils.lerp(player.visualGroup.position.y, PARAMS.Player.sitY, PARAMS.Player.poseLerpSpeed);
        player.visualGroup.rotation.x = THREE.MathUtils.lerp(player.visualGroup.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
        player.visualGroup.position.z = THREE.MathUtils.lerp(player.visualGroup.position.z, 0, PARAMS.Player.poseLerpSpeed);
        player.limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(player.limbs.leftLeg.rotation.x, -Math.PI / 2, PARAMS.Player.poseLerpSpeed);
        player.limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(player.limbs.rightLeg.rotation.x, -Math.PI / 2, PARAMS.Player.poseLerpSpeed);
        player.limbs.leftArm.rotation.x = THREE.MathUtils.lerp(player.limbs.leftArm.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
        player.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(player.limbs.rightArm.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
      } else if (player.isLaying) {
        player.walkTime = 0;
        player.visualGroup.position.y = THREE.MathUtils.lerp(player.visualGroup.position.y, PARAMS.Player.layY, PARAMS.Player.poseLerpSpeed);
        player.visualGroup.rotation.x = THREE.MathUtils.lerp(player.visualGroup.rotation.x, -Math.PI / 2, PARAMS.Player.poseLerpSpeed);
        player.visualGroup.position.z = THREE.MathUtils.lerp(player.visualGroup.position.z, PARAMS.Player.layZ, PARAMS.Player.poseLerpSpeed);
        player.limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(player.limbs.leftLeg.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
        player.limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(player.limbs.rightLeg.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
        player.limbs.leftArm.rotation.x = THREE.MathUtils.lerp(player.limbs.leftArm.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
        player.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(player.limbs.rightArm.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
      } else {
        player.visualGroup.position.y = THREE.MathUtils.lerp(player.visualGroup.position.y, 0, PARAMS.Player.poseLerpSpeed);
        player.visualGroup.rotation.x = THREE.MathUtils.lerp(player.visualGroup.rotation.x, 0, PARAMS.Player.poseLerpSpeed);
        player.visualGroup.position.z = THREE.MathUtils.lerp(player.visualGroup.position.z, 0, PARAMS.Player.poseLerpSpeed);
        const isMoving = Math.abs(velX) > 0.1 || Math.abs(velZ) > 0.1;

        if (isMoving) {
          player.walkTime += dt * PARAMS.Player.walkAnimSpeedMult;
          const swing = Math.sin(player.walkTime) * PARAMS.Player.armSwingAmp;
          player.limbs.leftArm.rotation.x = swing;
          player.limbs.rightArm.rotation.x = -swing;
          player.limbs.leftLeg.rotation.x = -swing;
          player.limbs.rightLeg.rotation.x = swing;
        } else {
          player.walkTime = 0;
          player.limbs.leftArm.rotation.x = THREE.MathUtils.lerp(player.limbs.leftArm.rotation.x, 0, PARAMS.Player.idleLerpSpeed);
          player.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(player.limbs.rightArm.rotation.x, 0, PARAMS.Player.idleLerpSpeed);
          player.limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(player.limbs.leftLeg.rotation.x, 0, PARAMS.Player.idleLerpSpeed);
          player.limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(player.limbs.rightLeg.rotation.x, 0, PARAMS.Player.idleLerpSpeed);
        }
      }
    }
  }
}
