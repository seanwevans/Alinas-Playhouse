import { distanceCannonToThree } from "../../core/math.js";

export class InteractionSystem {
  constructor(ecs, input) {
    this.players = ecs.with("controllable", "physicsBody");
    this.interactables = ecs.with("interactable");
    this.input = input;
  }

  update() {
    if (!this.input.interact) return;

    let playerPos = null;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        playerPos = entity.physicsBody.body.position;
        break;
      }
    }

    if (!playerPos) return;

    for (const entity of this.interactables) {
      const interactData = entity.interactable;
      if (distanceCannonToThree(playerPos, interactData.position) < interactData.radius) {
        interactData.onInteract();
      }
    }
  }
}
