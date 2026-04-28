import * as THREE from "https://esm.sh/three";
import { buildStaticBox } from "./builders/build-static-box.js";
import { buildUpstairsBox } from "./builders/build-upstairs-box.js";
import { buildChair } from "./builders/build-chair.js";
import { buildInteractable } from "./builders/build-interactable.js";
import {
  bedroomBoxPlacements,
  bedroomChairPlacements,
  bedroomInteractables
} from "./specs/bedroom-spec.js";
import {
  classroomFrontPlacements,
  classroomChairPlacements,
  classroomDeskGrid
} from "./specs/classroom-spec.js";
import {
  kitchenBoxPlacements,
  kitchenStoolPlacements,
  kitchenInteractables
} from "./specs/kitchen-spec.js";
import { staircaseSpec } from "./specs/staircase-spec.js";
import { upstairsPlacements } from "./specs/upstairs-spec.js";
import { createBedroomController } from "./controllers/bedroom-controller.js";
import { createKitchenController } from "./controllers/kitchen-controller.js";

export function buildEnvironment(ecs, scene, world, config = {}) {
  const {
    params,
    colors,
    layout,
    cannon,
    gameRef,
    createPlayerEntity,
    createInteractable,
    createUpstairsElement,
    createStudentAnimator
  } = config;

  const withColor = (spec) => ({ ...spec, color: colors[spec.colorKey] });

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

  colors.floors.forEach((color, i) => createFloor(color, i * 20));

  const floorBody = new cannon.Body({
    mass: 0,
    shape: new cannon.Box(new cannon.Vec3(30, 0.5, 10))
  });
  floorBody.position.set(20, -0.5, 0);
  world.addBody(floorBody);

  bedroomBoxPlacements.forEach((spec) => buildStaticBox(scene, world, cannon, withColor(spec)));

  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.04, 8),
    new THREE.MeshStandardMaterial({ color: colors.rug })
  );
  rug.position.set(0, 0.02, 0);
  rug.receiveShadow = true;
  scene.add(rug);

  bedroomChairPlacements.forEach((spec) =>
    buildChair(scene, world, cannon, { ...spec, color: colors[spec.colorKey] })
  );

  const bedroomController = createBedroomController({
    scene,
    world,
    cannon,
    colors,
    params
  });

  bedroomInteractables.forEach((spec) =>
    buildInteractable(
      ecs,
      { ...spec, radius: params.World.interactRadius },
      { createInteractable, onInteractByKey: bedroomController.hooks }
    )
  );

  classroomFrontPlacements.forEach((spec) =>
    buildStaticBox(scene, world, cannon, withColor(spec))
  );

  classroomChairPlacements.forEach((spec) =>
    buildChair(scene, world, cannon, { ...spec, color: colors[spec.colorKey] })
  );

  let studentIdx = 0;
  for (let row = 0; row < classroomDeskGrid.rows; row++) {
    for (let col = 0; col < classroomDeskGrid.cols; col++) {
      const x = classroomDeskGrid.startX + col * classroomDeskGrid.spacingX;
      const z = classroomDeskGrid.startZ + row * classroomDeskGrid.spacingZ;

      buildStaticBox(scene, world, cannon, {
        dimensions: { width: 1.8, height: 0.1, depth: 1.5 },
        position: { x, y: 1.2, z },
        color: colors.deskTop
      });
      buildStaticBox(scene, world, cannon, {
        dimensions: { width: 1.8, height: 0.4, depth: 1.3 },
        position: { x, y: 1.0, z },
        color: colors.deskWood
      });

      [
        [-0.9, -0.6],
        [0.9, -0.6],
        [-0.9, 0.6],
        [0.9, 0.6]
      ].forEach(([lx, lz]) => {
        buildStaticBox(scene, world, cannon, {
          dimensions: { width: 0.1, height: 1.2, depth: 0.1 },
          position: { x: x + lx, y: 0.6, z: z + lz },
          color: colors.deskLeg
        });
      });

      buildChair(scene, world, cannon, {
        position: { x, z: z + 2 },
        color: colors.chairRed,
        rotationY: Math.PI
      });

      const studentEntity = createPlayerEntity(
        ecs,
        scene,
        world,
        x,
        z + 1,
        colors.studentShirts[studentIdx],
        Math.PI,
        false,
        true,
        gameRef
      );

      studentEntity.player.isSitting = true;
      ecs.addComponent(studentEntity, "studentAnimator", createStudentAnimator(studentIdx));
      studentIdx++;
    }
  }

  kitchenBoxPlacements.forEach((spec) => buildStaticBox(scene, world, cannon, withColor(spec)));
  kitchenStoolPlacements.forEach((spec) =>
    buildStaticBox(scene, world, cannon, withColor(spec))
  );

  const kitchenController = createKitchenController({ scene, colors, params });

  kitchenInteractables.forEach((spec) =>
    buildInteractable(
      ecs,
      { ...spec, radius: params.World.interactRadius },
      { createInteractable, onInteractByKey: kitchenController.hooks }
    )
  );

  const sData = layout.stairs;
  for (let i = 0; i < sData.count; i++) {
    const sx = sData.startX + i * sData.depth;
    const sy = sData.height / 2 + i * sData.height;

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sData.depth, sData.height, sData.width),
      new THREE.MeshStandardMaterial({ color: colors[staircaseSpec.colorKey] })
    );
    mesh.position.set(sx, sy, sData.startZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  const totalDepth = sData.count * sData.depth;
  const totalHeight = sData.count * sData.height;
  const rampLength = Math.hypot(totalDepth, totalHeight);
  const rampAngle = Math.atan2(totalHeight, totalDepth);
  const rampBody = new cannon.Body({
    mass: 0,
    shape: new cannon.Box(new cannon.Vec3(rampLength / 2, 0.1, sData.width / 2))
  });
  rampBody.position.set(
    sData.startX - sData.depth / 2 + totalDepth / 2,
    totalHeight / 2 + 0.15,
    sData.startZ
  );
  rampBody.quaternion.setFromAxisAngle(new cannon.Vec3(0, 0, 1), rampAngle);
  world.addBody(rampBody);

  const fy = layout.upstairs.floorY;
  const wy = fy + layout.upstairs.wallYOffset;
  const yMap = {
    floorY: fy,
    wallY: wy,
    trimY: fy + 0.6,
    accentLowY: fy + 0.25,
    accentMidY: fy + 0.5,
    trimDarkY: fy + 0.1,
    accentTallY: fy + 1.0,
    accentWoodY: fy + 0.2
  };

  upstairsPlacements.forEach((spec) => {
    const y = typeof spec.position.y === "string" ? yMap[spec.position.y] : spec.position.y;
    buildUpstairsBox(
      ecs,
      scene,
      world,
      cannon,
      {
        ...withColor(spec),
        position: { ...spec.position, y }
      },
      {
        opacityHidden: params.World.opacityHidden,
        createUpstairsElement
      }
    );
  });

  return {
    fridgeDoorGrp: kitchenController.fridgeDoorGrp,
    kitchenState: kitchenController.kitchenState
  };
}
