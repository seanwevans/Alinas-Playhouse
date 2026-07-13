import * as THREE from "three";
import { playDogBark } from "../../audio/effects.js";

export class DogFollowSystem {
  constructor(ecs, gameRef) {
    this.dogs = ecs.with("dog", "renderable");
    this.players = ecs.with("controllable", "renderable");
    this.gameRef = gameRef;
    this.desiredPos = new THREE.Vector3();
  }

  update(dt) {
    let activePlayer = null;
    for (const playerEntity of this.players) {
      if (playerEntity.controllable.active) {
        activePlayer = playerEntity;
        break;
      }
    }

    if (!activePlayer) return;

    const playerMesh = activePlayer.renderable.mesh;
    for (const dogEntity of this.dogs) {
      const dog = dogEntity.dog;
      const dogMesh = dogEntity.renderable.mesh;

      this.desiredPos.set(0, 0.45, dog.followDistance);
      this.desiredPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerMesh.rotation.y);
      this.desiredPos.add(playerMesh.position);

      dogMesh.position.lerp(this.desiredPos, dog.followLerp);

      const moveX = dogMesh.position.x - dog.lastX;
      const moveZ = dogMesh.position.z - dog.lastZ;
      const moveLenSq = moveX * moveX + moveZ * moveZ;
      if (moveLenSq > 0.0002) {
        dogMesh.rotation.y = Math.atan2(moveX, moveZ);
      }

      dog.lastX = dogMesh.position.x;
      dog.lastZ = dogMesh.position.z;

      dog.barkTimer += dt;
      if (dog.barkTimer >= dog.nextBarkAt) {
        const intensity = 0.85 + Math.random() * 0.35;
        playDogBark(this.gameRef.audioCtx, intensity);
        dog.barkTimer = 0;
        dog.nextBarkAt =
          dog.minBarkInterval +
          Math.random() * (dog.maxBarkInterval - dog.minBarkInterval);
      }
    }
  }
}
