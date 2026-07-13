// On-screen touch controls for mobile: a movement d-pad plus action buttons,
// wired into the same InputManager action states the keyboard uses. Hidden on
// devices with a fine pointer (mouse) via a media query, so desktop is
// unaffected.

const STYLE_ID = "touch-controls-style";

const CSS = `
.touch-controls { display: none; }
@media (hover: none) and (pointer: coarse) {
  .touch-controls { display: block; }
}
.touch-controls {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
.touch-controls .tc-cluster {
  position: absolute;
  bottom: 1.5rem;
  pointer-events: none;
}
.touch-controls .tc-dpad { left: 1.5rem; display: grid; grid-template-columns: repeat(3, 3.5rem); grid-template-rows: repeat(3, 3.5rem); gap: 0.3rem; }
.touch-controls .tc-actions { right: 1.5rem; display: grid; grid-template-columns: repeat(2, 4rem); gap: 0.5rem; }
.touch-controls .tc-btn {
  pointer-events: auto;
  touch-action: none;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
  color: yellow;
  font-family: "Comic Sans MS", "Chalkboard SE", sans-serif;
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-user-select: none;
  user-select: none;
}
.touch-controls .tc-btn:active { background: rgba(0, 0, 0, 0.65); }
.touch-controls .tc-up { grid-column: 2; grid-row: 1; }
.touch-controls .tc-left { grid-column: 1; grid-row: 2; }
.touch-controls .tc-right { grid-column: 3; grid-row: 2; }
.touch-controls .tc-down { grid-column: 2; grid-row: 3; }
.touch-controls .tc-actions .tc-btn { width: 4rem; height: 4rem; font-size: 1.1rem; }
`;

const DPAD_BUTTONS = [
  { label: "▲", action: "moveForward", cls: "tc-up" },
  { label: "◀", action: "moveLeft", cls: "tc-left" },
  { label: "▶", action: "moveRight", cls: "tc-right" },
  { label: "▼", action: "moveBackward", cls: "tc-down" }
];

const ACTION_BUTTONS = [
  { label: "Jump", action: "jump" },
  { label: "F", action: "interact" },
  { label: "Sit", action: "sit" },
  { label: "Lay", action: "lay" }
];

export function setupTouchControls(input, targetDocument = typeof document !== "undefined" ? document : null) {
  if (!targetDocument || !targetDocument.body) {
    return { destroy() {} };
  }

  if (!targetDocument.getElementById(STYLE_ID)) {
    const style = targetDocument.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    targetDocument.head.appendChild(style);
  }

  const root = targetDocument.createElement("div");
  root.className = "touch-controls";
  root.setAttribute("aria-hidden", "true");

  const disposers = [];

  const makeButton = (parent, { label, action, cls }) => {
    const btn = targetDocument.createElement("button");
    btn.type = "button";
    btn.className = "tc-btn" + (cls ? " " + cls : "");
    btn.textContent = label;
    btn.setAttribute("aria-label", action);

    const press = (e) => {
      e.preventDefault();
      try {
        btn.setPointerCapture(e.pointerId);
      } catch {
        // pointer capture is best-effort; ignore if unavailable
      }
      input.pressAction(action);
    };
    const release = (e) => {
      e.preventDefault();
      input.releaseAction(action);
    };
    const block = (e) => e.preventDefault();

    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);
    btn.addEventListener("contextmenu", block);

    disposers.push(() => {
      btn.removeEventListener("pointerdown", press);
      btn.removeEventListener("pointerup", release);
      btn.removeEventListener("pointercancel", release);
      btn.removeEventListener("contextmenu", block);
    });

    parent.appendChild(btn);
  };

  const dpad = targetDocument.createElement("div");
  dpad.className = "tc-cluster tc-dpad";
  DPAD_BUTTONS.forEach((b) => makeButton(dpad, b));

  const actions = targetDocument.createElement("div");
  actions.className = "tc-cluster tc-actions";
  ACTION_BUTTONS.forEach((b) => makeButton(actions, b));

  root.appendChild(dpad);
  root.appendChild(actions);
  targetDocument.body.appendChild(root);

  return {
    destroy() {
      disposers.forEach((fn) => fn());
      root.remove();
    }
  };
}
