import * as THREE from "https://esm.sh/three";

export function buildChair(scene, world, cannon, spec) {
  const {
    position: { x, z },
    color,
    rotationY
  } = spec;

  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), material);
  seat.position.y = 0.8;
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);

  [
    [-0.32, -0.32],
    [0.32, -0.32],
    [-0.32, 0.32],
    [0.32, 0.32]
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), material);
    leg.position.set(lx, 0.4, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.15), material);
  back.position.set(0, 1.35, -0.325);
  back.castShadow = true;
  group.add(back);

  group.position.set(x, 0, z);
  group.rotation.y = rotationY;
  scene.add(group);

  const body = new cannon.Body({ mass: 0 });
  body.position.set(x, 0, z);
  body.quaternion.setFromAxisAngle(new cannon.Vec3(0, 1, 0), rotationY);
  body.addShape(new cannon.Box(new cannon.Vec3(0.4, 0.1, 0.4)), new cannon.Vec3(0, 0.8, 0));
  body.addShape(
    new cannon.Box(new cannon.Vec3(0.4, 0.45, 0.075)),
    new cannon.Vec3(0, 1.35, -0.325)
  );
  world.addBody(body);

  return { group, body };
}
