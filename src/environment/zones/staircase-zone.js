// Ownership: staircase geometry + ramp collider zone builder.
import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { COLORS } from "../../config/game-config.js";

export function buildStaircaseZone(ecs, scene, world, config) {
  const { layout } = config;
  const sData = layout.stairs;
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
  return {};
}
