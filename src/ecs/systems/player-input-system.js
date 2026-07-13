import * as THREE from "three";
import { PARAMS } from "../../config/game-config.js";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export class PlayerInputSystem {
  constructor(ecs, input, camera) {
    this.query = ecs.with("player", "physicsBody", "controllable");
    this.input = input;
    this.camera = camera;

    this.cameraForward = new THREE.Vector3();
    this.cameraRight = new THREE.Vector3();
    this.moveDir = new THREE.Vector3();
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

  // Build the desired horizontal move direction from input, relative to where
  // the camera is looking (projected onto the ground plane). Result is stored
  // in this.moveDir (unit length while moving, zero when idle). Returns whether
  // the player is trying to move.
  computeMoveDirection(inputX, inputZ) {
    this.moveDir.set(0, 0, 0);
    if (inputX === 0 && inputZ === 0) return false;

    this.camera.getWorldDirection(this.cameraForward);
    this.cameraForward.y = 0;
    if (this.cameraForward.lengthSq() < 1e-6) {
      // Camera looking straight up/down: fall back to a world-forward axis.
      this.cameraForward.set(0, 0, -1);
    }
    this.cameraForward.normalize();
    this.cameraRight.crossVectors(this.cameraForward, WORLD_UP).normalize();

    // moveForward (inputZ = -1) pushes along the camera's forward direction;
    // moveRight (inputX = +1) pushes along the camera's right direction.
    this.moveDir
      .addScaledVector(this.cameraForward, -inputZ)
      .addScaledVector(this.cameraRight, inputX);

    if (this.moveDir.lengthSq() < 1e-6) return false;
    this.moveDir.normalize();
    return true;
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
      const isMoving = this.computeMoveDirection(inputX, inputZ);

      if (isMoving) {
        player.targetRotation = Math.atan2(this.moveDir.x, this.moveDir.z);
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
        phys.body.velocity.x = this.moveDir.x * player.moveSpeed;
        phys.body.velocity.z = this.moveDir.z * player.moveSpeed;
      }
    }
  }
}
