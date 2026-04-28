import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { OrbitControls } from "https://esm.sh/three/addons/controls/OrbitControls.js";
import { World } from "https://esm.sh/miniplex";
import { InputManager } from "./src/core/input.js";

const PARAMS = {
  Player: {
    moveSpeed: 10,
    jumpForce: 8,
    groundedVelocityY: 0.2,
    turnLerp: 0.15,
    mass: 1,
    sitY: -0.4,
    layY: -0.65,
    layZ: 0.5,
    poseLerpSpeed: 0.2,
    idleLerpSpeed: 0.1,
    walkAnimSpeedMult: 15,
    armSwingAmp: 0.6,
    breathSpeed: 0.002,
    breathAmp: 0.03
  },
  Physics: {
    gravity: -20,
    killPlaneY: -50,
    screamPlaneY: -25,
    respawnPos: new THREE.Vector3(0, 1, 0),
    timeStep: 1 / 60,
    maxSubSteps: 3,
    friction: 0.1,
    restitution: 0.1
  },
  Camera: {
    fov: 45,
    near: 0.01,
    far: 10000,
    startPos: new THREE.Vector3(0, 5, 12),
    minDistance: 12,
    maxDistance: 12,
    dampingFactor: 0.05,
    followLerp: 0.1,
    targetOffsetY: 1
  },
  World: {
    ambientIntensity: 0.6,
    dirIntensity: 0.8,
    interactRadius: 4,
    upstairsThresholdY: 3.0,
    upstairsLerp: 0.05,
    opacityVisible: 1.0,
    opacityHidden: 0.1,
    opacityOpaqueReq: 0.95,
    opacityShadowReq: 0.5,
    lampIntensityOn: 1.5,
    lampEmissiveOn: 0.5,
    pcLightIntensityOn: 0.8,
    stoveLightIntensityOn: 1.0,
    stoveEmissiveOn: 0.8,
    fridgeOpenAngle: -Math.PI / 1.5,
    fridgeLerp: 0.1,
    waterOpacity: 0.6
  }
};

const COLORS = {
  bg: "#87CEEB",
  ambient: "#ffffff",
  directional: "#ffffff",

  skin: "#ffcc99",
  pants: "#00bfff",
  hair: "#8b4513",
  eye: "#000000",
  mainPlayerShirt: "#ff1493",
  studentShirts: [
    "#ff5733",
    "#33ff57",
    "#3357ff",
    "#f333ff",
    "#ff33a1",
    "#33fff5"
  ],

  floors: ["#ffe4e1", "#e0f7fa", "#faf0e6", "#123456", "#fedcba", "#beeeef"],
  wallMain: "#b2fba5",
  wallAlt: "#fffdd0",
  wallAccent: "#e6e6fa",
  classFloor: "#2f4f4f",

  bedBase: "#ffb6c1",
  bedWood: "#8b4513",
  bedSheet: "#ffffff",
  bedTrim: "#deb887",
  rug: "#dda0dd",
  chairBlue: "#4682b4",
  lampBase: "#555555",
  lampShade: "#fffacd",
  lampLight: "#fffaa3",
  pcDesk: "#8b4513",
  pcCase: "#e3dac9",
  pcScreenOff: "#2b2b2b",
  pcScreenOn: "#ffffff",
  pcScreenEmissive: "#00ffff",

  deskPlatform: "#d2b48c",
  deskBase: "#8b4513",
  deskTop: "#deb887",
  deskWood: "#a0522d",
  deskLeg: "#708090",
  chairRed: "#cd5c5c",

  kitchenFloor: "#e0e0e0",
  fridge: "#f5f5f5",
  fridgeHandle: "#a9a9a9",
  counterBase: "#8b4513",
  counterTop: "#dcdcdc",
  sink: "#87cefa",
  faucet: "#c0c0c0",
  water: "#00ffff",
  stoveWhite: "#f5f5f5",
  stoveBlack: "#000000",
  burnerOff: "#4f4f4f",
  burnerOn: "#ff4500",
  stoveLight: "#ffaa00",
  stoolSeat: "#cd853f",
  stoolLeg: "#a9a9a9",

  stairs: "#a0522d",
  upstairsFloor: "#f5deb3",
  upstairsWall: "#dda0dd",
  upstairsTrimLight: "#8b4513",
  upstairsTrimDark: "#333333",
  upstairsTrimBlack: "#111111",
  upstairsAccentRed: "#dc143c",
  upstairsAccentWood: "#d2b48c"
};

const LAYOUT = {
  walls: { height: 5, thickness: 0.5 },
  stairs: {
    count: 20,
    depth: 0.5,
    height: 0.25,
    width: 3,
    startX: 35,
    startZ: 4
  },
  upstairs: {
    floorY: 5.0,
    wallYOffset: 2.5
  }
};

function copyCannonVec3ToThree(target, source) {
  target.set(source.x, source.y, source.z);
}

function copyThreeVec3ToCannon(target, source) {
  target.set(source.x, source.y, source.z);
}

function distanceCannonToThree(cannonVec, threeVec) {
  const dx = cannonVec.x - threeVec.x;
  const dy = cannonVec.y - threeVec.y;
  const dz = cannonVec.z - threeVec.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

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

      let inputX = 0;
      let inputZ = 0;

      if (this.input.isDown("moveForward")) inputZ -= 1;
      if (this.input.isDown("moveBackward")) inputZ += 1;
      if (this.input.isDown("moveLeft")) inputX -= 1;
      if (this.input.isDown("moveRight")) inputX += 1;

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
        let velocityX = inputX * player.moveSpeed;
        let velocityZ = inputZ * player.moveSpeed;

        if (inputX !== 0 && inputZ !== 0) {
          const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
          velocityX = (inputX / length) * player.moveSpeed;
          velocityZ = (inputZ / length) * player.moveSpeed;
        }

        phys.body.velocity.x = velocityX;
        phys.body.velocity.z = velocityZ;
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
            Scream(this.gameRef.audioCtx);
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
        let diff = entity.player.targetRotation - render.mesh.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        render.mesh.rotation.y += diff * PARAMS.Player.turnLerp;
      }
    }
  }
}

class PlayerAnimationSystem {
  constructor(ecs) {
    this.query = ecs.with("player", "physicsBody");
  }

  update(dt) {
    for (const entity of this.query) {
      const player = entity.player;
      const phys = entity.physicsBody;
      const velX = phys.body.velocity.x;
      const velZ = phys.body.velocity.z;

      if (player.isSitting) {
        player.walkTime = 0;
        player.visualGroup.position.y = THREE.MathUtils.lerp(
          player.visualGroup.position.y,
          PARAMS.Player.sitY,
          PARAMS.Player.poseLerpSpeed
        );
        player.visualGroup.rotation.x = THREE.MathUtils.lerp(
          player.visualGroup.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
        player.visualGroup.position.z = THREE.MathUtils.lerp(
          player.visualGroup.position.z,
          0,
          PARAMS.Player.poseLerpSpeed
        );

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
        player.limbs.leftArm.rotation.x = THREE.MathUtils.lerp(
          player.limbs.leftArm.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
        player.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
          player.limbs.rightArm.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
      } else if (player.isLaying) {
        player.walkTime = 0;
        player.visualGroup.position.y = THREE.MathUtils.lerp(
          player.visualGroup.position.y,
          PARAMS.Player.layY,
          PARAMS.Player.poseLerpSpeed
        );
        player.visualGroup.rotation.x = THREE.MathUtils.lerp(
          player.visualGroup.rotation.x,
          -Math.PI / 2,
          PARAMS.Player.poseLerpSpeed
        );
        player.visualGroup.position.z = THREE.MathUtils.lerp(
          player.visualGroup.position.z,
          PARAMS.Player.layZ,
          PARAMS.Player.poseLerpSpeed
        );

        player.limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(
          player.limbs.leftLeg.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
        player.limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(
          player.limbs.rightLeg.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
        player.limbs.leftArm.rotation.x = THREE.MathUtils.lerp(
          player.limbs.leftArm.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
        player.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
          player.limbs.rightArm.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
      } else {
        player.visualGroup.position.y = THREE.MathUtils.lerp(
          player.visualGroup.position.y,
          0,
          PARAMS.Player.poseLerpSpeed
        );
        player.visualGroup.rotation.x = THREE.MathUtils.lerp(
          player.visualGroup.rotation.x,
          0,
          PARAMS.Player.poseLerpSpeed
        );
        player.visualGroup.position.z = THREE.MathUtils.lerp(
          player.visualGroup.position.z,
          0,
          PARAMS.Player.poseLerpSpeed
        );

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
      const desiredTarget = new THREE.Vector3().copy(playerPos);
      desiredTarget.y += PARAMS.Camera.targetOffsetY;
      this.cameraTargetPos.lerp(desiredTarget, PARAMS.Camera.followLerp);
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
    body.addEventListener("collide", (e) => {
      const impactVelocity = Math.abs(e.contact.getImpactVelocityAlongNormal());
      if (impactVelocity > 1.5) {
        // 1. Play Sound
        Bonk(gameRef.audioCtx, impactVelocity);

        // 2. Flash Screen
        triggerScreenFlash();

        // 3. Spawn 3D "BONK" Text
        const sprite = createBonkSprite();
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

function buildStaticBox(
  scene,
  world,
  width,
  height,
  depth,
  x,
  y,
  z,
  color,
  castShadow = true
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color })
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
  });

  copyThreeVec3ToCannon(body.position, mesh.position);
  world.addBody(body);

  return { mesh, body };
}

function buildUpstairsBox(
  ecs,
  scene,
  world,
  width,
  height,
  depth,
  x,
  y,
  z,
  color
) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: PARAMS.World.opacityHidden
  });

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
  });

  copyThreeVec3ToCannon(body.position, mesh.position);
  world.addBody(body);

  ecs.add({ upstairsElement: new C_UpstairsElement(mat, mesh) });
}

function buildChair(scene, world, x, z, color, rotationY) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), mat);
  seat.position.y = 0.8;
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);

  [
    [-0.32, -0.32],
    [0.32, -0.32],
    [-0.32, 0.32],
    [0.32, 0.32]
  ].forEach((pos) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), mat);
    leg.position.set(pos[0], 0.4, pos[1]);
    leg.castShadow = true;
    group.add(leg);
  });

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.15), mat);
  back.position.set(0, 1.35, -0.325);
  back.castShadow = true;
  group.add(back);

  group.position.set(x, 0, z);
  group.rotation.y = rotationY;
  scene.add(group);

  const body = new CANNON.Body({ mass: 0 });
  body.position.set(x, 0, z);
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY);

  body.addShape(
    new CANNON.Box(new CANNON.Vec3(0.4, 0.1, 0.4)),
    new CANNON.Vec3(0, 0.8, 0)
  );

  body.addShape(
    new CANNON.Box(new CANNON.Vec3(0.4, 0.45, 0.075)),
    new CANNON.Vec3(0, 1.35, -0.325)
  );

  world.addBody(body);
}

function buildEnvironment(ecs, scene, world) {
  const createFloor = (color, x) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color })
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0, 0);
    mesh.receiveShadow = true;
    scene.add(mesh);
  };

  COLORS.floors.forEach((col, i) => createFloor(col, i * 20));

  const floorBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(30, 0.5, 10))
  });

  floorBody.position.set(20, -0.5, 0);
  world.addBody(floorBody);

  const h = LAYOUT.walls.height;
  const th = LAYOUT.walls.thickness;

  /*
  buildStaticBox(scene, world, th, h, 20, -10, h / 2, 0, COLORS.wallMain);
  buildStaticBox(scene, world, 20, h, th, 0, h / 2, -10, COLORS.wallMain);
  buildStaticBox(scene, world, 20, h, th, 20, h / 2, -10, COLORS.wallAlt);
  buildStaticBox(scene, world, th, h, 20, 50, h / 2, 0, COLORS.wallAccent);
  buildStaticBox(scene, world, 20, h, th, 40, h / 2, -10, COLORS.wallAccent);
  buildStaticBox(scene, world, th, h, 8, 10, h / 2, -6, COLORS.wallMain);
  buildStaticBox(scene, world, th, h, 8, 10, h / 2, 6, COLORS.wallAlt);
  buildStaticBox(scene, world, th, 1.5, 4, 10, 3.25, 0, COLORS.wallMain);
  buildStaticBox(scene, world, th, h, 8, 30, h / 2, -6, COLORS.wallAlt);
  buildStaticBox(scene, world, th, h, 8, 30, h / 2, 6, COLORS.wallAccent);
  buildStaticBox(scene, world, th, 1.5, 4, 30, 3.25, 0, COLORS.wallAlt);
  */

  buildStaticBox(scene, world, 3, 0.5, 4, -6, 0.5, -6, COLORS.bedBase);
  buildStaticBox(scene, world, 3, 0.2, 4.2, -6, 0.1, -6, COLORS.bedWood);
  buildStaticBox(scene, world, 2, 0.15, 1, -6, 0.825, -7.2, COLORS.bedSheet);
  buildStaticBox(scene, world, 2, 0.2, 2, 4, 1.5, 0, COLORS.bedTrim);

  [
    [3.2, 0.8],
    [4.8, 0.8],
    [3.2, -0.8],
    [4.8, -0.8]
  ].forEach((pos) =>
    buildStaticBox(
      scene,
      world,
      0.2,
      1.5,
      0.2,
      pos[0],
      0.75,
      pos[1],
      COLORS.bedTrim
    )
  );

  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.04, 8),
    new THREE.MeshStandardMaterial({ color: COLORS.rug })
  );

  rug.position.set(0, 0.02, 0);
  rug.receiveShadow = true;
  scene.add(rug);

  buildChair(scene, world, 4, 1.5, COLORS.chairBlue, Math.PI);
  buildChair(scene, world, 4, -1.5, COLORS.chairBlue, 0);

  const lampGrp = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: COLORS.lampBase });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16),
    baseMat
  );
  base.position.y = 0.1;
  lampGrp.add(base);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3, 8),
    baseMat
  );
  pole.position.y = 1.6;
  lampGrp.add(pole);

  const shadeMat = new THREE.MeshStandardMaterial({
    color: COLORS.lampShade,
    side: THREE.DoubleSide,
    emissive: COLORS.lampShade,
    emissiveIntensity: PARAMS.World.lampEmissiveOn
  });

  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.8, 1, 16, 1, true),
    shadeMat
  );
  shade.position.y = 3.2;
  lampGrp.add(shade);

  const lampLight = new THREE.PointLight(
    COLORS.lampLight,
    PARAMS.World.lampIntensityOn,
    15
  );
  lampLight.position.y = 3.0;
  lampLight.castShadow = true;
  lampGrp.add(lampLight);

  lampGrp.position.set(-8, 0, -8);
  scene.add(lampGrp);

  const lampBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(0.6, 1.85, 0.6))
  });

  lampBody.position.set(-8, 1.85, -8);
  world.addBody(lampBody);

  let isLampOn = true;
  ecs.add({
    interactable: new C_Interactable(
      new THREE.Vector3(-8, 0, -8),
      PARAMS.World.interactRadius,
      () => {
        isLampOn = !isLampOn;
        lampLight.intensity = isLampOn ? PARAMS.World.lampIntensityOn : 0;
        shade.material.emissiveIntensity = isLampOn
          ? PARAMS.World.lampEmissiveOn
          : 0;
      }
    )
  });

  buildStaticBox(scene, world, 3.5, 0.2, 1.8, 6, 1.5, -8, COLORS.pcDesk);
  buildStaticBox(scene, world, 0.2, 1.5, 1.6, 4.5, 0.75, -8, COLORS.pcDesk);
  buildStaticBox(scene, world, 0.2, 1.5, 1.6, 7.5, 0.75, -8, COLORS.pcDesk);

  const pcMat = new THREE.MeshStandardMaterial({ color: COLORS.pcCase });
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.0), pcMat);
  monitor.position.set(6, 2.0, -8.2);
  monitor.castShadow = true;
  scene.add(monitor);

  const screenMat = new THREE.MeshStandardMaterial({
    color: COLORS.pcScreenOff,
    emissive: COLORS.pcScreenEmissive,
    emissiveIntensity: 0
  });

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.6, 0.1),
    screenMat
  );
  screen.position.set(6, 2.0, -7.74);
  scene.add(screen);

  const pcLight = new THREE.PointLight(COLORS.pcScreenEmissive, 0, 4);
  pcLight.position.set(0, 0, 0.2);
  screen.add(pcLight);

  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 1.4), pcMat);
  tower.position.set(7.1, 2.15, -8.1);
  tower.castShadow = true;
  scene.add(tower);

  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.35), pcMat);
  kb.position.set(6, 1.625, -7.5);
  scene.add(kb);

  const pcBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(1.75, 1.4, 0.9))
  });
  pcBody.position.set(6, 1.4, -8);
  world.addBody(pcBody);

  buildChair(scene, world, 6, -6.5, COLORS.chairBlue, Math.PI);

  let isPcOn = false;
  ecs.add({
    interactable: new C_Interactable(
      new THREE.Vector3(6, 0, -8),
      PARAMS.World.interactRadius,
      () => {
        isPcOn = !isPcOn;
        screen.material.color.set(
          isPcOn ? COLORS.pcScreenOn : COLORS.pcScreenOff
        );
        screen.material.emissiveIntensity = isPcOn ? 1 : 0;
        pcLight.intensity = isPcOn ? PARAMS.World.pcLightIntensityOn : 0;
      }
    )
  });

  buildStaticBox(scene, world, 12, 1.5, 0.1, 20, 2.0, -9.7, COLORS.classFloor);
  buildStaticBox(
    scene,
    world,
    12,
    0.05,
    0.2,
    20,
    1.2,
    -9.6,
    COLORS.deskPlatform
  );
  buildStaticBox(scene, world, 4, 0.2, 2, 20, 1.5, -7, COLORS.deskBase);
  buildStaticBox(scene, world, 0.2, 1.5, 1.8, 18.2, 0.75, -7, COLORS.deskBase);
  buildStaticBox(scene, world, 0.2, 1.5, 1.8, 21.8, 0.75, -7, COLORS.deskBase);
  buildChair(scene, world, 20, -5.5, COLORS.chairBlue, 0);

  let studentIdx = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 14.5 + col * 5.5;
      const z = -2 + row * 5;

      buildStaticBox(scene, world, 1.8, 0.1, 1.5, x, 1.2, z, COLORS.deskTop);
      buildStaticBox(scene, world, 1.8, 0.4, 1.3, x, 1.0, z, COLORS.deskWood);

      [
        [-0.9, -0.6],
        [0.9, -0.6],
        [-0.9, 0.6],
        [0.9, 0.6]
      ].forEach((pos) => {
        buildStaticBox(
          scene,
          world,
          0.1,
          1.2,
          0.1,
          x + pos[0],
          0.6,
          z + pos[1],
          COLORS.deskLeg
        );
      });

      buildChair(scene, world, x, z + 2, COLORS.chairRed, Math.PI);

      const studentEnt = createPlayerEntity(
        ecs,
        scene,
        world,
        x,
        z + 1,
        COLORS.studentShirts[studentIdx],
        Math.PI,
        false,
        true,
        this
      );

      studentEnt.player.isSitting = true;
      ecs.addComponent(
        studentEnt,
        "studentAnimator",
        new C_StudentAnimator(studentIdx)
      );

      studentIdx++;
    }
  }

  buildStaticBox(
    scene,
    world,
    2.2,
    3.5,
    2.0,
    32.5,
    1.75,
    -8.6,
    COLORS.kitchenFloor
  );

  const fridgeDoorGrp = new THREE.Group();
  fridgeDoorGrp.position.set(31.4, 1.75, -7.5);
  scene.add(fridgeDoorGrp);

  const fDoor = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 3.5, 0.2),
    new THREE.MeshStandardMaterial({ color: COLORS.fridge })
  );
  fDoor.position.set(1.1, 0, 0);
  fDoor.castShadow = true;
  fridgeDoorGrp.add(fDoor);

  const fHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 1.2, 0.15),
    new THREE.MeshStandardMaterial({ color: COLORS.fridgeHandle })
  );
  fHandle.position.set(2.0, 0.05, 0.15);
  fridgeDoorGrp.add(fHandle);

  let isFridgeOpen = false;
  ecs.add({
    interactable: new C_Interactable(
      new THREE.Vector3(32.5, 0, -8.5),
      PARAMS.World.interactRadius,
      () => {
        isFridgeOpen = !isFridgeOpen;
      }
    )
  });

  ecs.add({
    update: () => {
      fridgeDoorGrp.rotation.y = THREE.MathUtils.lerp(
        fridgeDoorGrp.rotation.y,
        isFridgeOpen ? PARAMS.World.fridgeOpenAngle : 0,
        PARAMS.World.fridgeLerp
      );
    }
  });

  buildStaticBox(scene, world, 8, 1.5, 2, 39, 0.75, -8.5, COLORS.counterBase);
  buildStaticBox(scene, world, 8.2, 0.2, 2.2, 39, 1.6, -8.5, COLORS.counterTop);
  buildStaticBox(scene, world, 1.5, 0.25, 1, 38, 1.65, -8.2, COLORS.sink);
  buildStaticBox(scene, world, 0.1, 0.4, 0.1, 38, 1.9, -8.6, COLORS.faucet);
  buildStaticBox(scene, world, 0.1, 0.1, 0.3, 38, 2.05, -8.4, COLORS.faucet);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.4),
    new THREE.MeshStandardMaterial({
      color: COLORS.water,
      transparent: true,
      opacity: PARAMS.World.waterOpacity
    })
  );

  water.position.set(38, 1.85, -8.3);
  water.visible = false;
  scene.add(water);

  let isSinkOn = false;
  ecs.add({
    interactable: new C_Interactable(
      new THREE.Vector3(38, 0, -8.5),
      PARAMS.World.interactRadius,
      () => {
        isSinkOn = !isSinkOn;
        water.visible = isSinkOn;
      }
    )
  });

  buildStaticBox(scene, world, 2, 1.5, 2, 45, 0.75, -8.5, COLORS.stoveWhite);
  buildStaticBox(scene, world, 2, 0.2, 2, 45, 1.6, -8.5, COLORS.stoveBlack);

  const burners = [];
  [
    [44.5, -8.0],
    [45.5, -8.0],
    [44.5, -9.0],
    [45.5, -9.0]
  ].forEach((pos) => {
    const burner = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: COLORS.burnerOff })
    );
    burner.position.set(pos[0], 1.72, pos[1]);
    scene.add(burner);
    burners.push(burner);
  });

  const stoveLight = new THREE.PointLight(COLORS.stoveLight, 0, 4);
  stoveLight.position.set(45, 2.5, -8.5);
  scene.add(stoveLight);

  let isStoveOn = false;
  ecs.add({
    interactable: new C_Interactable(
      new THREE.Vector3(45, 0, -8.5),
      PARAMS.World.interactRadius,
      () => {
        isStoveOn = !isStoveOn;
        burners.forEach((burner, idx) => {
          if (idx === 0 || idx === 3) {
            burner.material.color.set(
              isStoveOn ? COLORS.burnerOn : COLORS.burnerOff
            );
            burner.material.emissive.set(
              isStoveOn ? COLORS.burnerOn : COLORS.stoveBlack
            );
            burner.material.emissiveIntensity = isStoveOn
              ? PARAMS.World.stoveEmissiveOn
              : 0;
          }
        });
        stoveLight.intensity = isStoveOn
          ? PARAMS.World.stoveLightIntensityOn
          : 0;
      }
    )
  });

  buildStaticBox(scene, world, 4, 1.4, 2, 41, 0.7, 0, COLORS.counterBase);
  buildStaticBox(scene, world, 4.4, 0.2, 2.4, 41, 1.5, 0, COLORS.counterTop);

  [39.5, 42.5].forEach((sx) => {
    buildStaticBox(scene, world, 0.8, 0.1, 0.8, sx, 1.0, 1.8, COLORS.stoolSeat);

    [
      [-0.35, -0.35],
      [0.35, -0.35],
      [-0.35, 0.35],
      [0.35, 0.35]
    ].forEach((pos) => {
      buildStaticBox(
        scene,
        world,
        0.1,
        1.0,
        0.1,
        sx + pos[0],
        0.5,
        1.8 + pos[1],
        COLORS.stoolLeg
      );
    });
  });

  const sData = LAYOUT.stairs;
  for (let i = 0; i < sData.count; i++) {
    const sx = sData.startX + i * sData.depth;
    const sy = sData.height / 2 + i * sData.height;
    const sz = sData.startZ;

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sData.depth, sData.height, sData.width),
      new THREE.MeshStandardMaterial({ color: COLORS.stairs })
    );

    mesh.position.set(sx, sy, sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  const totalDepth = sData.count * sData.depth;
  const totalHeight = sData.count * sData.height;
  const rampLength = Math.hypot(totalDepth, totalHeight);
  const rampAngle = Math.atan2(totalHeight, totalDepth);

  const rampBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(rampLength / 2, 0.1, sData.width / 2))
  });

  rampBody.position.set(
    sData.startX - sData.depth / 2 + totalDepth / 2,
    totalHeight / 2 + 0.15,
    sData.startZ
  );
  rampBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rampAngle);
  world.addBody(rampBody);

  const fy = LAYOUT.upstairs.floorY;
  const wy = fy + LAYOUT.upstairs.wallYOffset;

  buildUpstairsBox(
    ecs,
    scene,
    world,
    45,
    0.2,
    20,
    12.5,
    fy,
    0,
    COLORS.upstairsFloor
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    5,
    0.2,
    20,
    47.5,
    fy,
    0,
    COLORS.upstairsFloor
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    10,
    0.2,
    12.5,
    40,
    fy,
    -3.75,
    COLORS.upstairsFloor
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    10,
    0.2,
    4.5,
    40,
    fy,
    7.75,
    COLORS.upstairsFloor
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    0.5,
    5,
    20,
    -10,
    wy,
    0,
    COLORS.upstairsWall
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    0.5,
    5,
    20,
    50,
    wy,
    0,
    COLORS.upstairsWall
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    60,
    5,
    0.5,
    20,
    wy,
    -10,
    COLORS.upstairsWall
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    10.4,
    1,
    0.2,
    40,
    fy + 0.6,
    2.4,
    COLORS.upstairsTrimLight
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    10.4,
    1,
    0.2,
    40,
    fy + 0.6,
    5.6,
    COLORS.upstairsTrimLight
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    0.2,
    1,
    3.4,
    34.9,
    fy + 0.6,
    4,
    COLORS.upstairsTrimLight
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    4,
    0.5,
    1.5,
    5,
    fy + 0.25,
    -8,
    COLORS.upstairsAccentRed
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    4,
    1,
    0.5,
    5,
    fy + 0.5,
    -9,
    COLORS.upstairsAccentRed
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    2.5,
    0.2,
    1,
    5,
    fy + 0.1,
    -3,
    COLORS.upstairsTrimDark
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    3,
    1.8,
    0.1,
    5,
    fy + 1.0,
    -3,
    COLORS.upstairsTrimBlack
  );

  buildUpstairsBox(
    ecs,
    scene,
    world,
    1.5,
    0.4,
    1.5,
    5,
    fy + 0.2,
    -6,
    COLORS.upstairsAccentWood
  );
}

function Bonk(audioCtx, impactVelocity) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  const duration = 0.15;

  osc.type = "sine";
  osc.frequency.setValueAtTime(550, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + duration);

  const volume = Math.min(impactVelocity / 15, 0.5);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  osc.start(now);
  osc.stop(now + duration);
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

function triggerScreenFlash() {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100vw";
  flash.style.height = "100vh";
  flash.style.backgroundColor = "rgba(255, 0, 0, 0.4)"; // Red tint
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

function Scream(audioCtx) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator(); // Creates the "voice wobble"
  const lfoGain = audioCtx.createGain();
  const mainGain = audioCtx.createGain();

  // A sawtooth wave is buzzy and harsh, good for a scream
  osc.type = "sawtooth";
  lfo.type = "sine";

  // Wire the LFO to modulate the main oscillator's pitch
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  // Wire the main oscillator to the speakers
  osc.connect(mainGain);
  mainGain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  const duration = 1.5; // Lasts 1.5 seconds

  // 1. Pitch Envelope: Start high (panic) and drop as they fall
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + duration);

  // 2. Vibrato (Wobble): 30 wobbles per second, shifting pitch by 50hz
  lfo.frequency.setValueAtTime(30, now);
  lfoGain.gain.setValueAtTime(50, now);

  // 3. Volume Envelope: Ramp up fast, hold, then fade out
  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  mainGain.gain.setValueAtTime(0.2, now + duration - 0.2);
  mainGain.gain.linearRampToValueAtTime(0.01, now + duration);

  osc.start(now);
  lfo.start(now);
  osc.stop(now + duration);
  lfo.stop(now + duration);
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

    this.anonSystems = this.ecs.with("update");

    buildEnvironment(this.ecs, this.scene, this.physicsWorld);

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
  initAudio() {
    this.audioListener = new THREE.AudioListener();
    this.camera.add(this.audioListener);
    this.bonkSound = new THREE.Audio(this.audioListener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("path/to/your/bonk.mp3", (buffer) => {
      this.bonkSound.setBuffer(buffer);
      this.bonkSound.setVolume(0.5);
    });
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

    for (const anon of this.anonSystems) {
      anon.update(deltaTime);
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
