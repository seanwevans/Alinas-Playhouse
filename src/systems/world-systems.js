// Ownership: world interaction/camera/visibility/floating-text runtime systems.
import * as THREE from "https://esm.sh/three";
import { PARAMS } from "../config/game-config.js";
import { distanceCannonToThree } from "../core/math.js";

export class InteractionSystem {
  constructor(ecs, input) {
    this.players = ecs.with("controllable", "physicsBody");
    this.interactables = ecs.with("interactable");
    this.input = input;
  }

  update() {
    if (!this.input.wasPressed("interact")) return;

    let playerPos = null;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        playerPos = entity.physicsBody.body.position;
        break;
      }
    }

    if (!playerPos) return;

    for (const entity of this.interactables) {
      const interactData = entity.interactable;
      if (
        distanceCannonToThree(playerPos, interactData.position) <
        interactData.radius
      ) {
        interactData.onInteract();
      }
    }
  }
}

export class UpstairsVisibilitySystem {
  constructor(ecs) {
    this.upstairsOpacity = PARAMS.World.opacityHidden;
    this.shadowsEnabled = false;

    this.players = ecs.with("controllable", "physicsBody");
    this.upstairsElements = ecs.with("upstairsElement");
  }

  update() {
    let isUpstairs = false;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        if (entity.physicsBody.body.position.y > PARAMS.World.upstairsThresholdY) {
          isUpstairs = true;
        }
        break;
      }
    }

    const targetOpacity = isUpstairs
      ? PARAMS.World.opacityVisible
      : PARAMS.World.opacityHidden;

    this.upstairsOpacity = THREE.MathUtils.lerp(
      this.upstairsOpacity,
      targetOpacity,
      PARAMS.World.upstairsLerp
    );

    const isFullyOpaque = this.upstairsOpacity > PARAMS.World.opacityOpaqueReq;
    const enableShadows = this.upstairsOpacity > PARAMS.World.opacityShadowReq;

    const shadowStateChanged = this.shadowsEnabled !== enableShadows;
    this.shadowsEnabled = enableShadows;

    for (const entity of this.upstairsElements) {
      const el = entity.upstairsElement;
      el.material.opacity = this.upstairsOpacity;
      el.material.transparent = !isFullyOpaque;
      el.material.depthWrite = isFullyOpaque;

      if (shadowStateChanged) {
        el.mesh.castShadow = enableShadows;
        el.mesh.receiveShadow = enableShadows;
      }
    }
  }
}

export class EnvironmentInteractionSystem {
  constructor(handles, params) {
    this.handles = handles;
    this.params = params;
  }

  update() {
    if (!this.handles.fridgeDoorGrp) return;

    this.handles.fridgeDoorGrp.rotation.y = THREE.MathUtils.lerp(
      this.handles.fridgeDoorGrp.rotation.y,
      this.handles.kitchenState.isFridgeOpen
        ? this.params.World.fridgeOpenAngle
        : 0,
      this.params.World.fridgeLerp
    );
  }
}

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

export class FloatingTextSystem {
  constructor(ecs, scene) {
    this.query = ecs.with("floatingText");
    this.ecs = ecs;
    this.scene = scene;
  }

  update(dt) {
    for (const entity of this.query) {
      const ft = entity.floatingText;
      ft.time += dt;
      const progress = ft.time / ft.duration;

      if (progress >= 1.0) {
        this.scene.remove(ft.sprite);
        ft.sprite.material.map.dispose();
        ft.sprite.material.dispose();
        this.ecs.remove(entity);
      } else {
        ft.sprite.position.y = ft.startY + progress * 2.0;
        ft.sprite.material.opacity = 1.0 - Math.pow(progress, 2);
      }
    }
  }
}
