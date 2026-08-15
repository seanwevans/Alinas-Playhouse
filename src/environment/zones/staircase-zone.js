// Ownership: staircase geometry + ramp collider zone builder (one per configured flight).
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { COLORS, PARAMS } from "../../config/game-config.js";
import { C_UpstairsElement } from "../../ecs/components.js";

function buildStaircase(ecs, scene, world, sData) {
  const baseY = sData.baseY ?? 0;
  const fadeLevel = sData.fadeLevel ?? 0;

  for (let i = 0; i < sData.count; i++) {
    const sx = sData.startX + i * sData.depth;
    const sy = baseY + sData.height / 2 + i * sData.height;
    const sz = sData.startZ;

    const material = new THREE.MeshStandardMaterial({ color: COLORS.stairs });
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sData.depth, sData.height, sData.width),
      material
    );

    mesh.position.set(sx, sy, sz);
    scene.add(mesh);

    if (fadeLevel > 0) {
      material.transparent = true;
      material.opacity = PARAMS.World.opacityHidden;
      ecs.add({ upstairsElement: new C_UpstairsElement(material, mesh, fadeLevel) });
    } else {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
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
    baseY + totalHeight / 2 + 0.15,
    sData.startZ
  );
  rampBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rampAngle);
  world.addBody(rampBody);
}

export function buildStaircaseZone(ecs, scene, world, config) {
  const { layout } = config;
  layout.staircases.forEach((sData) => buildStaircase(ecs, scene, world, sData));
  return {};
}
