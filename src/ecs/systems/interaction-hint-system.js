import { distanceCannonToThree } from "../../core/math.js";

// Shows a small on-screen "Press F" prompt whenever the active character is
// within range of an interactable, so players know when F will do something.
export class InteractionHintSystem {
  constructor(ecs, targetDocument = typeof document !== "undefined" ? document : null) {
    this.players = ecs.with("controllable", "physicsBody");
    this.interactables = ecs.with("interactable");
    this.visible = false;
    this.element = this.createElement(targetDocument);
  }

  createElement(targetDocument) {
    if (!targetDocument || !targetDocument.body) return null;

    const el = targetDocument.createElement("div");
    el.className = "interact-hint";
    el.textContent = "Press F";
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      position: "fixed",
      bottom: "2rem",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "0.4rem 1.1rem",
      borderRadius: "999px",
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      color: "yellow",
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
      fontSize: "1.1rem",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.15s ease-out",
      zIndex: "9998"
    });
    targetDocument.body.appendChild(el);
    return el;
  }

  findActivePlayerPosition() {
    for (const entity of this.players) {
      if (entity.controllable.active) {
        return entity.physicsBody.body.position;
      }
    }
    return null;
  }

  isNearInteractable(playerPos) {
    for (const entity of this.interactables) {
      const data = entity.interactable;
      if (!data?.position || data.radius == null) continue;
      if (distanceCannonToThree(playerPos, data.position) < data.radius) {
        return true;
      }
    }
    return false;
  }

  update() {
    if (!this.element) return;

    const playerPos = this.findActivePlayerPosition();
    const near = playerPos ? this.isNearInteractable(playerPos) : false;

    if (near !== this.visible) {
      this.visible = near;
      this.element.style.opacity = near ? "1" : "0";
    }
  }
}
