// Ownership: player motion/physics sync/pose systems for character entities.
import * as THREE from "https://esm.sh/three";
import { PARAMS } from "../config/game-config.js";
import { playDogBark, playScream } from "../audio/effects.js";
import {
  copyCannonVec3ToThree,
  copyThreeVec3ToCannon,
  normalize2D,
  shortestAngleDelta
} from "../core/math.js";

export class PlayerInputSystem {
  constructor(ecs, input) {
    this.query = ecs.with("player", "physicsBody", "controllable");
    this.input = input;
  }

  getMovementInput() {
    let inputX = 0;
    let inputZ = 0;

    if (this.input.isDown("moveForward")) inputZ -= 1;
    if (this.input.isDown("moveBackward")) inputZ += 1;
    if (this.input.isDown("moveLeft")) inputX -= 1;
    if (this.input.isDown("moveRight")) inputX += 1;

    return { inputX, inputZ };
  }

  update() {
    for (const entity of this.query) {
      if (!entity.controllable.active) continue;

      const player = entity.player;
      const phys = entity.physicsBody;

      if (this.input.wasPressed("sit")) {
        player.isSitting = !player.isSitting;
        player.isLaying = false;
      }

      if (this.input.wasPressed("lay")) {
        player.isLaying = !player.isLaying;
        player.isSitting = false;
      }

      if (this.input.wasPressed("jump")) {
        player.isSitting = false;
        player.isLaying = false;
      }

      const { inputX, inputZ } = this.getMovementInput();

      if (inputX !== 0 || inputZ !== 0) {
        player.targetRotation = Math.atan2(inputX, inputZ);
      }

      if (
        this.input.wasPressed("jump") &&
        Math.abs(phys.body.velocity.y) < PARAMS.Player.groundedVelocityY &&
        !player.isSitting &&
        !player.isLaying
      ) {
        phys.body.velocity.y = PARAMS.Player.jumpForce;
      }

      if (player.isSitting || player.isLaying) {
        phys.body.velocity.x = 0;
        phys.body.velocity.z = 0;
      } else {
        const normalized = normalize2D(inputX, inputZ);
        phys.body.velocity.x = normalized.x * player.moveSpeed;
        phys.body.velocity.z = normalized.z * player.moveSpeed;
      }
    }
  }
}

export class PhysicsSyncSystem {
  constructor(ecs, gameRef) {
    this.query = ecs.with("renderable", "physicsBody");
    this.gameRef = gameRef;
  }

  update() {
    for (const entity of this.query) {
      const render = entity.renderable;
      const phys = entity.physicsBody;

      if (
        entity.player &&
        phys.body.position.y < PARAMS.Physics.screamPlaneY &&
        !entity.player.hasScreamed
      ) {
        entity.player.hasScreamed = true;
        if (this.gameRef && this.gameRef.audioCtx) {
          playScream(this.gameRef.audioCtx);
        }
      }

      if (phys.body.position.y < PARAMS.Physics.killPlaneY) {
        copyThreeVec3ToCannon(phys.body.position, PARAMS.Physics.respawnPos);
        phys.body.velocity.set(0, 0, 0);
        phys.body.angularVelocity.set(0, 0, 0);

        if (entity.player) {
          entity.player.hasScreamed = false;
        }
      }

      copyCannonVec3ToThree(render.mesh.position, phys.body.position);

      if (entity.player) {
        const diff = shortestAngleDelta(
          render.mesh.rotation.y,
          entity.player.targetRotation
        );
        render.mesh.rotation.y += diff * PARAMS.Player.turnLerp;
      }
    }
  }
}

export class PlayerAnimationSystem {
  constructor(ecs) {
    this.query = ecs.with("player", "physicsBody");
  }

  lerpLimbRotation(limbs, targetRotationX, lerpSpeed) {
    limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(
      limbs.leftLeg.rotation.x,
      targetRotationX,
      lerpSpeed
    );
    limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(
      limbs.rightLeg.rotation.x,
      targetRotationX,
      lerpSpeed
    );
    limbs.leftArm.rotation.x = THREE.MathUtils.lerp(
      limbs.leftArm.rotation.x,
      targetRotationX,
      lerpSpeed
    );
    limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
      limbs.rightArm.rotation.x,
      targetRotationX,
      lerpSpeed
    );
  }

  lerpPose(player, targetY, targetXRot, targetZ) {
    player.visualGroup.position.y = THREE.MathUtils.lerp(
      player.visualGroup.position.y,
      targetY,
      PARAMS.Player.poseLerpSpeed
    );
    player.visualGroup.rotation.x = THREE.MathUtils.lerp(
      player.visualGroup.rotation.x,
      targetXRot,
      PARAMS.Player.poseLerpSpeed
    );
    player.visualGroup.position.z = THREE.MathUtils.lerp(
      player.visualGroup.position.z,
      targetZ,
      PARAMS.Player.poseLerpSpeed
    );
  }

  update(dt) {
    for (const entity of this.query) {
      const player = entity.player;
      const phys = entity.physicsBody;
      const velX = phys.body.velocity.x;
      const velZ = phys.body.velocity.z;

      if (player.isSitting) {
        player.walkTime = 0;
        this.lerpPose(player, PARAMS.Player.sitY, 0, 0);
        this.lerpLimbRotation(player.limbs, 0, PARAMS.Player.poseLerpSpeed);
        player.limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(
          player.limbs.leftLeg.rotation.x,
          -Math.PI / 2,
          PARAMS.Player.poseLerpSpeed
        );
        player.limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(
          player.limbs.rightLeg.rotation.x,
          -Math.PI / 2,
          PARAMS.Player.poseLerpSpeed
        );
      } else if (player.isLaying) {
        player.walkTime = 0;
        this.lerpPose(player, PARAMS.Player.layY, -Math.PI / 2, PARAMS.Player.layZ);
        this.lerpLimbRotation(player.limbs, 0, PARAMS.Player.poseLerpSpeed);
      } else {
        this.lerpPose(player, 0, 0, 0);

        const isMoving = Math.abs(velX) > 0.1 || Math.abs(velZ) > 0.1;
        if (isMoving) {
          player.walkTime += dt * PARAMS.Player.walkAnimSpeedMult;
          const swing = Math.sin(player.walkTime) * PARAMS.Player.armSwingAmp;
          player.limbs.leftArm.rotation.x = swing;
          player.limbs.rightArm.rotation.x = -swing;
          player.limbs.leftLeg.rotation.x = -swing;
          player.limbs.rightLeg.rotation.x = swing;
        } else {
          player.walkTime = 0;
          player.limbs.leftArm.rotation.x = THREE.MathUtils.lerp(
            player.limbs.leftArm.rotation.x,
            0,
            PARAMS.Player.idleLerpSpeed
          );
          player.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
            player.limbs.rightArm.rotation.x,
            0,
            PARAMS.Player.idleLerpSpeed
          );
          player.limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(
            player.limbs.leftLeg.rotation.x,
            0,
            PARAMS.Player.idleLerpSpeed
          );
          player.limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(
            player.limbs.rightLeg.rotation.x,
            0,
            PARAMS.Player.idleLerpSpeed
          );
        }
      }
    }
  }
}

export class StudentAnimationSystem {
  constructor(ecs) {
    this.query = ecs.with("renderable", "physicsBody", "studentAnimator");
  }

  update() {
    const time = Date.now() * PARAMS.Player.breathSpeed;
    for (const entity of this.query) {
      const baseY = entity.physicsBody.body.position.y;
      entity.renderable.mesh.position.y =
        baseY +
        Math.sin(time + entity.studentAnimator.offsetIndex) * PARAMS.Player.breathAmp;
    }
  }
}

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
