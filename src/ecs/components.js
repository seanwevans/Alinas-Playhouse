// Ownership: ECS component data-only definitions shared by factories and systems.
import { PARAMS } from "../config/game-config.js";

export class C_Renderable {
  constructor(mesh) {
    this.mesh = mesh;
  }
}

export class C_PhysicsBody {
  constructor(body) {
    this.body = body;
  }
}

export class C_Player {
  constructor(
    visualGroup,
    limbs,
    moveSpeed = PARAMS.Player.moveSpeed,
    initialRotation = 0
  ) {
    this.visualGroup = visualGroup;
    this.limbs = limbs;
    this.moveSpeed = moveSpeed;
    this.isSitting = false;
    this.isLaying = false;
    this.walkTime = 0;
    this.targetRotation = initialRotation;
    this.hasScreamed = false;
  }
}

export class C_Controllable {
  constructor(active = false) {
    this.active = active;
  }
}

export class C_Interactable {
  constructor(position, radius, onInteract) {
    this.position = position;
    this.radius = radius;
    this.onInteract = onInteract;
  }
}

export class C_UpstairsElement {
  constructor(material, mesh) {
    this.material = material;
    this.mesh = mesh;
  }
}

export class C_StudentAnimator {
  constructor(offsetIndex) {
    this.offsetIndex = offsetIndex;
  }
}

export class C_FloatingText {
  constructor(sprite, duration) {
    this.sprite = sprite;
    this.duration = duration;
    this.time = 0;
    this.startY = sprite.position.y;
  }
}
