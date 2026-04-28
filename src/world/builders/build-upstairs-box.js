import * as THREE from "https://esm.sh/three";

export function buildUpstairsBox(ecs, scene, world, cannon, spec, options) {
  const {
    dimensions: { width, height, depth },
    position: { x, y, z },
    color
  } = spec;

  const { opacityHidden, createUpstairsElement } = options;

  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: opacityHidden
  });

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const body = new cannon.Body({
    mass: 0,
    shape: new cannon.Box(new cannon.Vec3(width / 2, height / 2, depth / 2))
  });

  body.position.set(x, y, z);
  world.addBody(body);

  ecs.add({ upstairsElement: createUpstairsElement(material, mesh) });
  return { mesh, body };
}
