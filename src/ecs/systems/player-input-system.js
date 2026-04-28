import { PARAMS } from "../../config/game-config.js";
import { normalize2D } from "../../core/math.js";

export class PlayerInputSystem {
  constructor(ecs, input) {
    this.query = ecs.with("player", "physicsBody", "controllable");
    this.input = input;
  }

  getMovementInput() {
    let inputX = 0;
    let inputZ = 0;

    if (this.input.isDown("moveForward")) inputZ -= 1;
    if (this.input.isDown("moveBackward")) inputZ += 1;
    if (this.input.isDown("moveLeft")) inputX -= 1;
    if (this.input.isDown("moveRight")) inputX += 1;

    return { inputX, inputZ };
  }

  update() {
    for (const entity of this.query) {
      if (!entity.controllable.active) continue;

      const player = entity.player;
      const phys = entity.physicsBody;

      if (this.input.wasPressed("sit")) {
        player.isSitting = !player.isSitting;
        player.isLaying = false;
      }

      if (this.input.wasPressed("lay")) {
        player.isLaying = !player.isLaying;
        player.isSitting = false;
      }

      if (this.input.wasPressed("jump")) {
        player.isSitting = false;
        player.isLaying = false;
      }

      const { inputX, inputZ } = this.getMovementInput();

      if (inputX !== 0 || inputZ !== 0) {
        player.targetRotation = Math.atan2(inputX, inputZ);
      }

      if (
        this.input.wasPressed("jump") &&
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
        const normalized = normalize2D(inputX, inputZ);
        phys.body.velocity.x = normalized.x * player.moveSpeed;
        phys.body.velocity.z = normalized.z * player.moveSpeed;
      }
    }
  }
}
