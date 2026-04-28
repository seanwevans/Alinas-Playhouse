import * as THREE from "https://esm.sh/three";

export class CharacterSwitchSystem {
  constructor(ecs, camera, scene, input) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.controllables = ecs.with("controllable");
    this.input = input;
  }

  update() {
    if (!this.input.wasPressed("mousePrimary")) return;

    this.raycaster.setFromCamera(this.input.getMousePosition(), this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
      let object = intersects[i].object;

      while (object && object.userData.entity === undefined) {
        object = object.parent;
      }

      if (object && object.userData.entity !== undefined) {
        const clickedEntity = object.userData.entity;
        if (clickedEntity.controllable) {
          for (const e of this.controllables) {
            e.controllable.active = false;
          }
          clickedEntity.controllable.active = true;
          return;
        }
      }
    }
  }
}
