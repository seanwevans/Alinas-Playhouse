import { PARAMS } from "../../config/params.js";

export class PlayerInputSystem {
  constructor(ecs, input) {
    this.query = ecs.with("player", "physicsBody", "controllable");
    this.input = input;
  }

  update() {
    for (const entity of this.query) {
      if (!entity.controllable.active) continue;

      const player = entity.player;
      const phys = entity.physicsBody;
      const input = this.input;

      if (input.sit) {
        player.isSitting = !player.isSitting;
        player.isLaying = false;
      }

      if (input.lay) {
        player.isLaying = !player.isLaying;
        player.isSitting = false;
      }

      if (input.jump) {
        player.isSitting = false;
        player.isLaying = false;
      }

      let inputX = 0;
      let inputZ = 0;

      if (input.forward) inputZ -= 1;
      if (input.backward) inputZ += 1;
      if (input.left) inputX -= 1;
      if (input.right) inputX += 1;

      if (inputX !== 0 || inputZ !== 0) {
        player.targetRotation = Math.atan2(inputX, inputZ);
      }

      if (
        input.jump &&
        Math.abs(phys.body.velocity.y) < PARAMS.Player.groundedVelocityY &&
        !player.isSitting &&
        !player.isLaying
      ) {
        phys.body.velocity.y = PARAMS.Player.jumpForce;
      }

      if (player.isSitting || player.isLaying) {
        phys.body.velocity.x = 0;
        phys.body.velocity.z = 0;
      } else {
        let velocityX = inputX * player.moveSpeed;
        let velocityZ = inputZ * player.moveSpeed;

        if (inputX !== 0 && inputZ !== 0) {
          const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
          velocityX = (inputX / length) * player.moveSpeed;
          velocityZ = (inputZ / length) * player.moveSpeed;
        }

        phys.body.velocity.x = velocityX;
        phys.body.velocity.z = velocityZ;
      }
    }
  }
}
