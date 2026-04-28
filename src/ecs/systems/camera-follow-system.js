import * as THREE from "https://esm.sh/three";
import { PARAMS } from "../../config/game-config.js";

export class CameraFollowSystem {
  constructor(ecs, controls) {
    this.controls = controls;
    this.cameraTargetPos = new THREE.Vector3();
    this.desiredTarget = new THREE.Vector3();
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
      this.desiredTarget.copy(playerPos);
      this.desiredTarget.y += PARAMS.Camera.targetOffsetY;
      this.cameraTargetPos.lerp(this.desiredTarget, PARAMS.Camera.followLerp);
      this.controls.target.copy(this.cameraTargetPos);
      this.controls.update();
    }
  }
}
