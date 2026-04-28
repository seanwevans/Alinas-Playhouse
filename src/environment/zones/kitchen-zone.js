// Ownership: kitchen zone builder and appliance state controllers (fridge/sink/stove).
import * as THREE from "https://esm.sh/three";
import { COLORS, PARAMS } from "../../config/game-config.js";
import { C_Interactable } from "../../ecs/components.js";
import { buildStaticBox } from "../build-primitives.js";

export function buildKitchenZone(ecs, scene, world, config) {
  const { params } = config;
  buildStaticBox(scene, world, 2.2, 3.5, 2.0, 32.5, 1.75, -8.6, COLORS.kitchenFloor);

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

  const kitchenState = { isFridgeOpen: false };
  ecs.add({
    interactable: new C_Interactable(new THREE.Vector3(32.5, 0, -8.5), params.World.interactRadius, () => {
      kitchenState.isFridgeOpen = !kitchenState.isFridgeOpen;
    })
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
    interactable: new C_Interactable(new THREE.Vector3(38, 0, -8.5), params.World.interactRadius, () => {
      isSinkOn = !isSinkOn;
      water.visible = isSinkOn;
    })
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
    interactable: new C_Interactable(new THREE.Vector3(45, 0, -8.5), params.World.interactRadius, () => {
      isStoveOn = !isStoveOn;
      burners.forEach((burner, idx) => {
        if (idx === 0 || idx === 3) {
          burner.material.color.set(isStoveOn ? COLORS.burnerOn : COLORS.burnerOff);
          burner.material.emissive.set(isStoveOn ? COLORS.burnerOn : COLORS.stoveBlack);
          burner.material.emissiveIntensity = isStoveOn ? params.World.stoveEmissiveOn : 0;
        }
      });
      stoveLight.intensity = isStoveOn ? params.World.stoveLightIntensityOn : 0;
    })
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
      buildStaticBox(scene, world, 0.1, 1.0, 0.1, sx + pos[0], 0.5, 1.8 + pos[1], COLORS.stoolLeg);
    });
  });

  return { fridgeDoorGrp, kitchenState };
}
