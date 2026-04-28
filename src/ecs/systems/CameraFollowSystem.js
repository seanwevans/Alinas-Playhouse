import * as THREE from "https://esm.sh/three";
import { PARAMS } from "../../config/params.js";

export class CameraFollowSystem {
  constructor(ecs, controls) {
    this.controls = controls;
    this.cameraTargetPos = new THREE.Vector3();
    this.players = ecs.with("controllable", "renderable");
  }

  update() {
    let playerPos = null;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        playerPos = entity.renderable.mesh.position;
        break;
      }
    }

    if (playerPos) {
      const desiredTarget = new THREE.Vector3().copy(playerPos);
      desiredTarget.y += PARAMS.Camera.targetOffsetY;
      this.cameraTargetPos.lerp(desiredTarget, PARAMS.Camera.followLerp);
      this.controls.target.copy(this.cameraTargetPos);
      this.controls.update();
    }
  }
}
