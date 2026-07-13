import * as THREE from "three";
import { playDogBark } from "../../audio/effects.js";

const UP = new THREE.Vector3(0, 1, 0);

// Follow tuning.
const FOLLOW_GAIN = 4; // how hard the dog accelerates toward its target
const MAX_SPEED = 16; // cap (a bit above the player's speed so it can catch up)
const STOP_DIST = 0.3; // deadzone so it settles instead of jittering into the player
const MAX_LAG = 10; // if it falls this far behind (e.g. stuck), snap back
const FLOOR_SNAP = 2.5; // if the player is this much higher/lower, snap to their floor

export class DogFollowSystem {
  constructor(ecs, gameRef) {
    this.dogs = ecs.with("dog", "renderable", "physicsBody");
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
      const body = dogEntity.physicsBody.body;

      // Target: a spot behind the player on the ground plane.
      this.desiredPos.set(0, 0, -dog.followDistance);
      this.desiredPos.applyAxisAngle(UP, playerMesh.rotation.y);
      this.desiredPos.add(playerMesh.position);

      const toX = this.desiredPos.x - body.position.x;
      const toZ = this.desiredPos.z - body.position.z;
      const planarDist = Math.hypot(toX, toZ);
      const floorGap = Math.abs(playerMesh.position.y - body.position.y);

      if (planarDist > MAX_LAG || floorGap > FLOOR_SNAP) {
        // Stuck behind an obstacle, or the player switched floors: recover by
        // snapping to the target and letting the dog drop onto that floor.
        body.position.set(this.desiredPos.x, playerMesh.position.y + 0.5, this.desiredPos.z);
        body.velocity.set(0, 0, 0);
      } else if (planarDist > STOP_DIST) {
        // Drive horizontal velocity toward the target; the physics solver keeps
        // the dog out of walls and furniture. Vertical motion is left to gravity
        // so it rests on whatever floor it is standing on.
        const speed = Math.min(planarDist * FOLLOW_GAIN, MAX_SPEED);
        body.velocity.x = (toX / planarDist) * speed;
        body.velocity.z = (toZ / planarDist) * speed;
      } else {
        body.velocity.x = 0;
        body.velocity.z = 0;
      }

      // Face the direction it is actually moving (mesh position is synced from
      // the body by PhysicsSyncSystem earlier in the frame).
      const moveX = dogMesh.position.x - dog.lastX;
      const moveZ = dogMesh.position.z - dog.lastZ;
      if (moveX * moveX + moveZ * moveZ > 0.0002) {
        dogMesh.rotation.y = Math.atan2(moveX, moveZ);
      }

      dog.lastX = dogMesh.position.x;
      dog.lastZ = dogMesh.position.z;

      dog.barkTimer += dt;
      if (dog.barkTimer >= dog.nextBarkAt) {
        const intensity = 0.85 + Math.random() * 0.35;
        if (!this.gameRef.muted) playDogBark(this.gameRef.audioCtx, intensity);
        dog.barkTimer = 0;
        dog.nextBarkAt =
          dog.minBarkInterval +
          Math.random() * (dog.maxBarkInterval - dog.minBarkInterval);
      }
    }
  }
}
