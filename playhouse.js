import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { OrbitControls } from "https://esm.sh/three/addons/controls/OrbitControls.js";
import { World } from "https://esm.sh/miniplex";
import { InputManager } from "./src/core/input.js";
import { playBonk, playScream } from "./src/audio/effects.js";
import { COLORS, LAYOUT, PARAMS } from "./src/config/game-config.js";
import { buildEnvironment } from "./src/world/build-environment.js";
import {
  copyCannonVec3ToThree,
  copyThreeVec3ToCannon,
  distanceCannonToThree,
  normalize2D,
  shortestAngleDelta
} from "./src/core/math.js";

class C_Renderable {
  constructor(mesh) {
    this.mesh = mesh;
  }
}

class C_PhysicsBody {
  constructor(body) {
    this.body = body;
  }
}

class C_Player {
  constructor(
    visualGroup,
    limbs,
    moveSpeed = PARAMS.Player.moveSpeed,
    initialRotation = 0
  ) {
    this.visualGroup = visualGroup;
    this.limbs = limbs;
    this.moveSpeed = moveSpeed;
    this.isSitting = false;
    this.isLaying = false;
    this.walkTime = 0;
    this.targetRotation = initialRotation;
    this.hasScreamed = false;
  }
}

class C_Controllable {
  constructor(active = false) {
    this.active = active;
  }
}

class C_Interactable {
  constructor(position, radius, onInteract) {
    this.position = position;
    this.radius = radius;
    this.onInteract = onInteract;
  }
}

class C_UpstairsElement {
  constructor(material, mesh) {
    this.material = material;
    this.mesh = mesh;
  }
}

class C_StudentAnimator {
  constructor(offsetIndex) {
    this.offsetIndex = offsetIndex;
  }
}

class PlayerInputSystem {
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

  update(dt) {
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

class PhysicsSyncSystem {
  constructor(ecs, gameRef) {
    this.query = ecs.with("renderable", "physicsBody");
    this.gameRef = gameRef;
  }

  update(dt) {
    for (const entity of this.query) {
      const render = entity.renderable;
      const phys = entity.physicsBody;

      // --- NEW SCREAM LOGIC ---
      if (entity.player) {
        if (
          phys.body.position.y < PARAMS.Physics.screamPlaneY &&
          !entity.player.hasScreamed
        ) {
          entity.player.hasScreamed = true;
          if (this.gameRef && this.gameRef.audioCtx) {
            playScream(this.gameRef.audioCtx);
          }
        }
      }

      // --- EXISTING RESPAWN LOGIC ---
      if (phys.body.position.y < PARAMS.Physics.killPlaneY) {
        copyThreeVec3ToCannon(phys.body.position, PARAMS.Physics.respawnPos);
        phys.body.velocity.set(0, 0, 0);
        phys.body.angularVelocity.set(0, 0, 0);

        // Reset the scream flag when they respawn!
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

class PlayerAnimationSystem {
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

class StudentAnimationSystem {
  constructor(ecs) {
    this.query = ecs.with("renderable", "physicsBody", "studentAnimator");
  }

  update(dt) {
    const time = Date.now() * PARAMS.Player.breathSpeed;
    for (const entity of this.query) {
      const baseY = entity.physicsBody.body.position.y;
      entity.renderable.mesh.position.y =
        baseY +
        Math.sin(time + entity.studentAnimator.offsetIndex) *
          PARAMS.Player.breathAmp;
    }
  }
}

class InteractionSystem {
  constructor(ecs, input) {
    this.players = ecs.with("controllable", "physicsBody");
    this.interactables = ecs.with("interactable");
    this.input = input;
  }

  update(dt) {
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

class UpstairsVisibilitySystem {
  constructor(ecs) {
    this.upstairsOpacity = PARAMS.World.opacityHidden;
    this.shadowsEnabled = false;

    this.players = ecs.with("controllable", "physicsBody");
    this.upstairsElements = ecs.with("upstairsElement");
  }

  update(dt) {
    let isUpstairs = false;
    for (const entity of this.players) {
      if (entity.controllable.active) {
        if (
          entity.physicsBody.body.position.y > PARAMS.World.upstairsThresholdY
        ) {
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

class EnvironmentInteractionSystem {
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

class CharacterSwitchSystem {
  constructor(ecs, camera, scene, input) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.controllables = ecs.with("controllable");
    this.input = input;
  }

  update(dt) {
    if (!this.input.wasPressed("mousePrimary")) return;

    this.raycaster.setFromCamera(this.input.getMousePosition(), this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

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

class CameraFollowSystem {
  constructor(ecs, controls) {
    this.controls = controls;
    this.cameraTargetPos = new THREE.Vector3();
    this.desiredTarget = new THREE.Vector3();
    this.players = ecs.with("controllable", "renderable");
  }

  update(dt) {
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

function createPlayerEntity(
  ecs,
  scene,
  world,
  x,
  z,
  shirtColor,
  rotationY,
  isActive = false,
  isDynamic = true,
  gameRef = null
) {
  const mesh = new THREE.Group();
  const visualGroup = new THREE.Group();
  visualGroup.position.y = 0;
  mesh.add(visualGroup);
  scene.add(mesh);

  const limbs = {};
  const skinMat = new THREE.MeshStandardMaterial({ color: COLORS.skin });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor });
  const pantsMat = new THREE.MeshStandardMaterial({ color: COLORS.pants });
  const hairMat = new THREE.MeshStandardMaterial({ color: COLORS.hair });
  const eyeMat = new THREE.MeshStandardMaterial({ color: COLORS.eye });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skinMat);
  head.position.y = 0.5;
  head.castShadow = true;
  visualGroup.add(head);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
  leftEye.position.set(-0.12, 0.55, 0.32);
  visualGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
  rightEye.position.set(0.12, 0.55, 0.32);
  visualGroup.add(rightEye);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI),
    eyeMat
  );
  smile.position.set(0, 0.46, 0.33);
  smile.rotation.z = Math.PI;
  visualGroup.add(smile);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5),
    hairMat
  );
  hair.position.y = 0.52;
  hair.castShadow = true;
  visualGroup.add(hair);

  const bunGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const leftBun = new THREE.Mesh(bunGeo, hairMat);
  leftBun.position.set(-0.32, 0.65, -0.1);
  visualGroup.add(leftBun);

  const rightBun = new THREE.Mesh(bunGeo, hairMat);
  rightBun.position.set(0.32, 0.65, -0.1);
  visualGroup.add(rightBun);

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.4, 4, 16),
    shirtMat
  );
  torso.position.y = -0.05;
  torso.castShadow = true;
  visualGroup.add(torso);

  const armGeo = new THREE.CapsuleGeometry(0.08, 0.35, 4, 8);
  armGeo.translate(0, -0.2, 0);

  limbs.leftArm = new THREE.Mesh(armGeo, skinMat);
  limbs.leftArm.position.set(-0.35, 0.15, 0);
  limbs.leftArm.rotation.z = -Math.PI / 12;
  limbs.leftArm.castShadow = true;
  visualGroup.add(limbs.leftArm);

  limbs.rightArm = new THREE.Mesh(armGeo, skinMat);
  limbs.rightArm.position.set(0.35, 0.15, 0);
  limbs.rightArm.rotation.z = Math.PI / 12;
  limbs.rightArm.castShadow = true;
  visualGroup.add(limbs.rightArm);

  const legGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
  legGeo.translate(0, -0.25, 0);

  limbs.leftLeg = new THREE.Mesh(legGeo, pantsMat);
  limbs.leftLeg.position.set(-0.12, -0.35, 0);
  limbs.leftLeg.castShadow = true;
  visualGroup.add(limbs.leftLeg);

  limbs.rightLeg = new THREE.Mesh(legGeo, pantsMat);
  limbs.rightLeg.position.set(0.12, -0.35, 0);
  limbs.rightLeg.castShadow = true;
  visualGroup.add(limbs.rightLeg);

  const shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.9, 0.3));
  const body = new CANNON.Body({
    mass: isDynamic ? PARAMS.Player.mass : 0,
    shape,
    fixedRotation: true
  });

  body.position.set(x, isDynamic ? 3 : 0.95, z);
  if (isDynamic && gameRef) {
    let lastBonkAt = 0;
    const bonkCooldownMs = 200;

    body.addEventListener("collide", (e) => {
      const impactVelocity = Math.abs(e.contact.getImpactVelocityAlongNormal());
      if (impactVelocity > 1.5) {
        const now = performance.now();
        if (now - lastBonkAt < bonkCooldownMs) return;
        lastBonkAt = now;

        const impactIntensity = THREE.MathUtils.clamp(impactVelocity / 8, 0.75, 1.6);

        // 1. Play Sound
        playBonk(gameRef.audioCtx, impactVelocity);

        // 2. Flash Screen
        triggerScreenFlash(impactIntensity);

        // 3. Spawn 3D "BONK" Text
        const sprite = createBonkSprite();
        sprite.scale.multiplyScalar(impactIntensity);
        sprite.position.set(
          body.position.x,
          body.position.y + 1.2,
          body.position.z
        );
        gameRef.scene.add(sprite);

        // Add to ECS so the new system animates and destroys it
        gameRef.ecs.add({
          floatingText: new C_FloatingText(sprite, 0.8) // 0.8 seconds duration
        });
      }
    });
  }
  world.addBody(body);

  mesh.rotation.y = rotationY;

  const entity = ecs.add({
    renderable: new C_Renderable(mesh),
    physicsBody: new C_PhysicsBody(body),
    player: new C_Player(
      visualGroup,
      limbs,
      PARAMS.Player.moveSpeed,
      rotationY
    ),
    controllable: new C_Controllable(isActive)
  });

  mesh.userData.entity = entity;
  visualGroup.userData.entity = entity;
  visualGroup.traverse((child) => {
    if (child.isMesh) child.userData.entity = entity;
  });

  return entity;
}

function createBonkSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  // Draw "BONK" text
  ctx.font = '900 72px "Arial Black", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ff0000"; // Red caps
  ctx.strokeStyle = "#ffffff"; // White outline
  ctx.lineWidth = 6;

  ctx.strokeText("BONK", 128, 64);
  ctx.fillText("BONK", 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.5, 0.75, 1);
  return sprite;
}

function triggerScreenFlash(intensity = 1) {
  const clampedIntensity = THREE.MathUtils.clamp(intensity, 0.75, 1.6);
  const alpha = THREE.MathUtils.lerp(0.25, 0.55, (clampedIntensity - 0.75) / 0.85);
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100vw";
  flash.style.height = "100vh";
  flash.style.backgroundColor = `rgba(255, 0, 0, ${alpha})`; // Red tint
  flash.style.pointerEvents = "none";
  flash.style.transition = "opacity 0.2s ease-out";
  flash.style.zIndex = "9999";
  document.body.appendChild(flash);

  // Force a browser reflow so the transition works instantly
  flash.getBoundingClientRect();

  requestAnimationFrame(() => {
    flash.style.opacity = "0";
    setTimeout(() => flash.remove(), 200);
  });
}

class C_FloatingText {
  constructor(sprite, duration) {
    this.sprite = sprite;
    this.duration = duration;
    this.time = 0;
    this.startY = sprite.position.y;
  }
}

class FloatingTextSystem {
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
        // Animation finished: clean up memory and remove entity
        this.scene.remove(ft.sprite);
        ft.sprite.material.map.dispose();
        ft.sprite.material.dispose();
        this.ecs.remove(entity);
      } else {
        // Float upwards and fade out
        ft.sprite.position.y = ft.startY + progress * 2.0;
        ft.sprite.material.opacity = 1.0 - Math.pow(progress, 2); // Ease-out fade
      }
    }
  }
}

class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.initThreeAndCannon();
    this.audioCtx = null;
    const startAudio = () => {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      window.removeEventListener("mousedown", startAudio);
      window.removeEventListener("keydown", startAudio);
    };
    window.addEventListener("mousedown", startAudio);
    window.addEventListener("keydown", startAudio);
    this.ecs = new World();
    this.input = new InputManager();
    this.input.registerListeners();

    this.systems = [
      new PlayerInputSystem(this.ecs, this.input),
      new PhysicsSyncSystem(this.ecs, this),
      new PlayerAnimationSystem(this.ecs),
      new StudentAnimationSystem(this.ecs),
      new InteractionSystem(this.ecs, this.input),
      new UpstairsVisibilitySystem(this.ecs),
      new CharacterSwitchSystem(this.ecs, this.camera, this.scene, this.input),
      new CameraFollowSystem(this.ecs, this.controls),
      new FloatingTextSystem(this.ecs, this.scene)
    ];

    const environmentHandles = buildEnvironment(
      this.ecs,
      this.scene,
      this.physicsWorld,
      {
        params: PARAMS,
        colors: COLORS,
        layout: LAYOUT,
        cannon: CANNON,
        gameRef: this,
        createPlayerEntity,
        createInteractable: (position, radius, onInteract) =>
          new C_Interactable(position, radius, onInteract),
        createUpstairsElement: (material, mesh) =>
          new C_UpstairsElement(material, mesh),
        createStudentAnimator: (offsetIndex) =>
          new C_StudentAnimator(offsetIndex)
      }
    );
    this.systems.push(new EnvironmentInteractionSystem(environmentHandles, PARAMS));

    createPlayerEntity(
      this.ecs,
      this.scene,
      this.physicsWorld,
      0,
      0,
      COLORS.mainPlayerShirt,
      0,
      true,
      true,
      this
    );

    this.boundResizeHandler = () => this.onWindowResize();
    this.boundBeforeUnloadHandler = () => this.destroy();
    window.addEventListener("resize", this.boundResizeHandler);
    window.addEventListener("beforeunload", this.boundBeforeUnloadHandler);

    this.destroyed = false;
    this.animate();
  }
  initThreeAndCannon() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.bg);

    this.camera = new THREE.PerspectiveCamera(
      PARAMS.Camera.fov,
      window.innerWidth / window.innerHeight,
      PARAMS.Camera.near,
      PARAMS.Camera.far
    );
    this.camera.position.copy(PARAMS.Camera.startPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = PARAMS.Camera.dampingFactor;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minDistance = PARAMS.Camera.minDistance;
    this.controls.maxDistance = PARAMS.Camera.maxDistance;

    this.scene.add(
      new THREE.AmbientLight(COLORS.ambient, PARAMS.World.ambientIntensity)
    );

    const dirLight = new THREE.DirectionalLight(
      COLORS.directional,
      PARAMS.World.dirIntensity
    );

    dirLight.position.set(20, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    this.scene.add(dirLight);

    this.physicsWorld = new CANNON.World();
    this.physicsWorld.gravity.set(0, PARAMS.Physics.gravity, 0);
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);

    const mat = new CANNON.Material("default");
    const contactMat = new CANNON.ContactMaterial(mat, mat, {
      friction: PARAMS.Physics.friction,
      restitution: PARAMS.Physics.restitution
    });

    this.physicsWorld.addContactMaterial(contactMat);
    this.physicsWorld.defaultContactMaterial = contactMat;
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  animate() {
    if (this.destroyed) return;

    requestAnimationFrame(() => this.animate());
    this.input.beginFrame();
    const deltaTime = this.clock.getDelta();

    this.physicsWorld.step(
      PARAMS.Physics.timeStep,
      deltaTime,
      PARAMS.Physics.maxSubSteps
    );

    for (const sys of this.systems) {
      sys.update(deltaTime);
    }

    this.renderer.render(this.scene, this.camera);
    this.input.endFrame();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.input.unregisterListeners();
    window.removeEventListener("resize", this.boundResizeHandler);
    window.removeEventListener("beforeunload", this.boundBeforeUnloadHandler);

    if (this.renderer && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

new Game();
