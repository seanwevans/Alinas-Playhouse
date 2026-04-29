import * as THREE from "https://esm.sh/three";

export class CharacterSwitchSystem {
  constructor(ecs, camera, scene, input) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.controllables = ecs.with("controllable");
    this.input = input;
    this.selectableMeshes = new Set();
  }

  /**
   * Register a mesh (or Object3D root) as selectable for character switching.
   *
   * Entities should call this when their controllable visual is created/spawned,
   * and should set `mesh.userData.entity = entity` on that mesh or one of its
   * parents so this system can resolve the clicked entity.
   */
  registerSelectableMesh(mesh) {
    if (!mesh) return;
    this.selectableMeshes.add(mesh);
  }

  /**
   * Unregister a previously selectable mesh (or Object3D root).
   *
   * Entities should call this during teardown/despawn to avoid raycasting stale
   * meshes that no longer represent live controllable entities.
   */
  unregisterSelectableMesh(mesh) {
    if (!mesh) return;
    this.selectableMeshes.delete(mesh);
  }

  update() {
    if (!this.input.wasPressed("mousePrimary")) return;
    if (this.selectableMeshes.size === 0) return;

    this.raycaster.setFromCamera(this.input.getMousePosition(), this.camera);
    const intersects = this.raycaster.intersectObjects(
      Array.from(this.selectableMeshes),
      true,
    );

    for (let i = 0; i < intersects.length; i++) {
      let object = intersects[i].object;

      // Nested meshes may be hit first, so walk up the parent chain until an
      // entity marker is found.
      while (object && object.userData.entity === undefined) {
        object = object.parent;
      }

      if (object && object.userData.entity !== undefined) {
        const clickedEntity = object.userData.entity;
        if (!clickedEntity.controllable) continue;
        if (clickedEntity.controllable.active) return;

        for (const e of this.controllables) {
          e.controllable.active = false;
        }
        clickedEntity.controllable.active = true;
        return;
      }
    }
  }
}
