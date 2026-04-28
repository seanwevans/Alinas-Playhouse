import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { PARAMS, COLORS, LAYOUT } from "../config/params.js";
import { copyThreeVec3ToCannon } from "../core/math.js";
import { C_Renderable, C_PhysicsBody, C_Player, C_Controllable, C_UpstairsElement, C_Interactable, C_StudentAnimator, C_FloatingText } from "../ecs/components.js";

export function createPlayerEntity(
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

export function buildStaticBox(
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

export function buildUpstairsBox(
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

export function buildChair(scene, world, x, z, color, rotationY) {
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

export function buildEnvironment(ecs, scene, world, deps) {
  const { gameRef, Bonk, createBonkSprite, triggerScreenFlash } = deps;
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
        gameRef
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

