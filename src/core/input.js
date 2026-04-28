import * as THREE from "https://esm.sh/three";

export const Input = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sit: false,
  lay: false,
  interact: false,
  mouseClicked: false,
  mousePos: new THREE.Vector2()
};

export function attachInputListeners() {
  document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }

    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        Input.forward = true;
        break;
      case "ArrowDown":
      case "KeyS":
        Input.backward = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        Input.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        Input.right = true;
        break;
      case "Space":
        Input.jump = true;
        break;
      case "KeyE":
        Input.sit = true;
        break;
      case "KeyQ":
        Input.lay = true;
        break;
      case "KeyF":
        Input.interact = true;
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        Input.forward = false;
        break;
      case "ArrowDown":
      case "KeyS":
        Input.backward = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        Input.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        Input.right = false;
        break;
    }
  });

  window.addEventListener("mousedown", (e) => {
    Input.mouseClicked = true;
    Input.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    Input.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

export function resetTransientInput() {
  Input.jump = false;
  Input.sit = false;
  Input.lay = false;
  Input.interact = false;
  Input.mouseClicked = false;
}
