import * as THREE from "https://esm.sh/three";

const ACTION_KEY_BINDINGS = {
  moveForward: ["ArrowUp", "KeyW"],
  moveBackward: ["ArrowDown", "KeyS"],
  moveLeft: ["ArrowLeft", "KeyA"],
  moveRight: ["ArrowRight", "KeyD"],
  jump: ["Space"],
  sit: ["KeyE"],
  lay: ["KeyQ"],
  interact: ["KeyF"]
};

const PREVENT_DEFAULT_CODES = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space"
]);

export class InputManager {
  constructor(targetDocument = document, targetWindow = window) {
    this.targetDocument = targetDocument;
    this.targetWindow = targetWindow;

    this.down = new Map();
    this.pressed = new Map();
    this.released = new Map();

    this.mousePosition = new THREE.Vector2();

    this.codeToAction = new Map();
    for (const [action, codes] of Object.entries(ACTION_KEY_BINDINGS)) {
      for (const code of codes) {
        this.codeToAction.set(code, action);
      }
      this.initializeActionState(action);
    }

    this.initializeActionState("mousePrimary");

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  registerListeners() {
    this.targetDocument.addEventListener("keydown", this.handleKeyDown);
    this.targetDocument.addEventListener("keyup", this.handleKeyUp);
    this.targetWindow.addEventListener("mousedown", this.handleMouseDown);
    this.targetWindow.addEventListener("mousemove", this.handleMouseMove);
    this.targetWindow.addEventListener("mouseup", this.handleMouseUp);
    this.targetWindow.addEventListener("blur", this.handleWindowBlur);
    this.targetDocument.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  unregisterListeners() {
    this.targetDocument.removeEventListener("keydown", this.handleKeyDown);
    this.targetDocument.removeEventListener("keyup", this.handleKeyUp);
    this.targetWindow.removeEventListener("mousedown", this.handleMouseDown);
    this.targetWindow.removeEventListener("mousemove", this.handleMouseMove);
    this.targetWindow.removeEventListener("mouseup", this.handleMouseUp);
    this.targetWindow.removeEventListener("blur", this.handleWindowBlur);
    this.targetDocument.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  beginFrame() {}

  resetAllActions() {
    for (const action of this.down.keys()) {
      this.down.set(action, false);
    }

    for (const action of this.pressed.keys()) {
      this.pressed.set(action, false);
    }

    for (const action of this.released.keys()) {
      this.released.set(action, false);
    }
  }

  initializeActionState(action) {
    this.down.set(action, false);
    this.pressed.set(action, false);
    this.released.set(action, false);
  }

  endFrame() {
    for (const action of this.pressed.keys()) {
      this.pressed.set(action, false);
      this.released.set(action, false);
    }
  }

  isDown(action) {
    return this.down.get(action) === true;
  }

  wasPressed(action) {
    return this.pressed.get(action) === true;
  }

  wasReleased(action) {
    return this.released.get(action) === true;
  }

  getMousePosition() {
    return this.mousePosition;
  }

  handleKeyDown(e) {
    if (PREVENT_DEFAULT_CODES.has(e.code)) {
      e.preventDefault();
    }

    const action = this.codeToAction.get(e.code);
    if (!action) return;

    if (!this.down.get(action)) {
      this.pressed.set(action, true);
    }
    this.down.set(action, true);
  }

  handleKeyUp(e) {
    const action = this.codeToAction.get(e.code);
    if (!action) return;

    if (this.down.get(action)) {
      this.released.set(action, true);
    }
    this.down.set(action, false);
  }

  updateMousePositionFromEvent(e) {
    this.mousePosition.x = (e.clientX / this.targetWindow.innerWidth) * 2 - 1;
    this.mousePosition.y = -(e.clientY / this.targetWindow.innerHeight) * 2 + 1;
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;

    this.updateMousePositionFromEvent(e);

    if (!this.down.get("mousePrimary")) {
      this.pressed.set("mousePrimary", true);
    }
    this.down.set("mousePrimary", true);
  }


  handleMouseMove(e) {
    this.updateMousePositionFromEvent(e);
  }

  handleMouseUp(e) {
    if (e.button !== 0) return;

    if (this.down.get("mousePrimary")) {
      this.released.set("mousePrimary", true);
    }
    this.down.set("mousePrimary", false);
  }

  handleWindowBlur() {
    this.resetAllActions();
  }

  handleVisibilityChange() {
    if (this.targetDocument.visibilityState === "hidden") {
      this.resetAllActions();
    }
  }
}
