import { distanceCannonToThree } from "../../core/math.js";

export class InteractionSystem {
  constructor(ecs, input) {
    this.players = ecs.with("controllable", "physicsBody");
    this.interactables = ecs.with("interactable");
    this.input = input;
  }

  update() {
    if (!this.input.wasPressed("interact")) return;

    let playerPos = null;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        playerPos = entity.physicsBody.body.position;
        break;
      }
    }

    if (!playerPos) return;

    let selectedInteractable = null;
    let selectedDistance = Infinity;

    for (const entity of this.interactables) {
      const interactData = entity.interactable;
      if (!interactData?.position || !interactData?.radius || !interactData?.onInteract) {
        continue;
      }

      const candidateDistance = distanceCannonToThree(playerPos, interactData.position);
      if (candidateDistance >= interactData.radius) {
        continue;
      }

      if (candidateDistance < selectedDistance) {
        selectedInteractable = interactData;
        selectedDistance = candidateDistance;
      }
    }

    // Target selection currently prefers the closest valid interactable in range.
    selectedInteractable?.onInteract();
  }
}
