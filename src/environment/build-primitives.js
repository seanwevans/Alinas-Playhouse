// Ownership: low-level reusable geometry/physics builders shared by zone builders.
import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { PARAMS } from "../config/game-config.js";
import { copyThreeVec3ToCannon } from "../core/math.js";
import { C_UpstairsElement } from "../ecs/components.js";

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
