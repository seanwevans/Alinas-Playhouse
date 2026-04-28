import * as THREE from "https://esm.sh/three";
import { C_Dog, C_Renderable } from "../ecs/components.js";

export function createCookieDogEntity(ecs, scene) {
  const root = new THREE.Group();
  scene.add(root);

  const blackMat = new THREE.MeshStandardMaterial({ color: "#1b1b1b" });
  const whiteMat = new THREE.MeshStandardMaterial({ color: "#f7f7f7" });
  const brownMat = new THREE.MeshStandardMaterial({ color: "#8b5a2b" });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.85, 8, 16), whiteMat);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  root.add(body);

  const saddlePatch = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI),
    blackMat
  );
  saddlePatch.rotation.z = Math.PI / 2;
  saddlePatch.position.set(0, 0.09, -0.02);
  body.add(saddlePatch);

  const buttTriangle = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.22, 3),
    whiteMat
  );
  buttTriangle.rotation.x = Math.PI / 2;
  buttTriangle.position.set(-0.54, 0.02, 0);
  body.add(buttTriangle);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 16), brownMat);
  head.position.set(0.58, 0.15, 0);
  head.castShadow = true;
  root.add(head);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), whiteMat);
  snout.scale.set(1.3, 0.8, 0.9);
  snout.position.set(0.24, -0.02, 0);
  head.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), blackMat);
  nose.position.set(0.39, -0.01, 0);
  head.add(nose);

  const earGeo = new THREE.CapsuleGeometry(0.06, 0.18, 4, 8);
  const leftEar = new THREE.Mesh(earGeo, blackMat);
  leftEar.position.set(0.03, 0.18, -0.14);
  leftEar.rotation.x = -0.2;
  head.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, blackMat);
  rightEar.position.set(0.03, 0.18, 0.14);
  rightEar.rotation.x = 0.2;
  head.add(rightEar);

  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.3, 4, 8), brownMat);
  tail.position.set(-0.62, 0.24, 0);
  tail.rotation.z = -Math.PI / 3;
  tail.castShadow = true;
  root.add(tail);

  const legGeo = new THREE.CapsuleGeometry(0.07, 0.35, 4, 8);
  const legOffsets = [
    [0.25, -0.32, -0.2],
    [0.25, -0.32, 0.2],
    [-0.25, -0.32, -0.2],
    [-0.25, -0.32, 0.2]
  ];

  for (const [x, y, z] of legOffsets) {
    const leg = new THREE.Mesh(legGeo, whiteMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    root.add(leg);
  }

  root.position.set(-1.4, 0.45, 1.1);

  return ecs.add({
    renderable: new C_Renderable(root),
    dog: new C_Dog("Cookie")
  });
}
