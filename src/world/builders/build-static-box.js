import * as THREE from "https://esm.sh/three";

export function buildStaticBox(scene, world, cannon, spec) {
  const {
    dimensions: { width, height, depth },
    position: { x, y, z },
    color,
    castShadow = true,
    receiveShadow = true,
    mass = 0
  } = spec;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color })
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  scene.add(mesh);

  const body = new cannon.Body({
    mass,
    shape: new cannon.Box(new cannon.Vec3(width / 2, height / 2, depth / 2))
  });

  body.position.set(x, y, z);
  world.addBody(body);

  return { mesh, body };
}
