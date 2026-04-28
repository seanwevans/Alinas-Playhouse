// Ownership: bedroom zone builder + local interactable controllers.
import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { COLORS, LAYOUT, PARAMS } from "../../config/game-config.js";
import { C_Interactable } from "../../ecs/components.js";
import { buildChair, buildStaticBox } from "../build-primitives.js";

export function buildBedroomZone(ecs, scene, world, config) {
  const { params } = config;

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
  void h;
  void th;

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
    buildStaticBox(scene, world, 0.2, 1.5, 0.2, pos[0], 0.75, pos[1], COLORS.bedTrim)
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

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16), baseMat);
  base.position.y = 0.1;
  lampGrp.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 8), baseMat);
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

  const lampLight = new THREE.PointLight(COLORS.lampLight, PARAMS.World.lampIntensityOn, 15);
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
      params.World.interactRadius,
      () => {
        isLampOn = !isLampOn;
        lampLight.intensity = isLampOn ? params.World.lampIntensityOn : 0;
        shade.material.emissiveIntensity = isLampOn ? params.World.lampEmissiveOn : 0;
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

  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.1), screenMat);
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
    interactable: new C_Interactable(new THREE.Vector3(6, 0, -8), params.World.interactRadius, () => {
      isPcOn = !isPcOn;
      screen.material.color.set(isPcOn ? COLORS.pcScreenOn : COLORS.pcScreenOff);
      screen.material.emissiveIntensity = isPcOn ? 1 : 0;
      pcLight.intensity = isPcOn ? params.World.pcLightIntensityOn : 0;
    })
  });

  return {};
}
