import * as THREE from "https://esm.sh/three";
import { COLORS } from "../../config/game-config.js";

export function buildPlayerMesh(shirtColor) {
  const rootMesh = new THREE.Group();
  const visualGroup = new THREE.Group();
  visualGroup.position.y = 0;
  rootMesh.add(visualGroup);

  const limbs = {};
  const skinMat = new THREE.MeshStandardMaterial({ color: COLORS.skin });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor });
  const pantsMat = new THREE.MeshStandardMaterial({ color: COLORS.pants });
  const hairMat = new THREE.MeshStandardMaterial({ color: COLORS.hair });
  const eyeMat = new THREE.MeshStandardMaterial({ color: COLORS.eye });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skinMat);
  head.position.y = 0.5;
  head.castShadow = true;
  visualGroup.add(head);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
  leftEye.position.set(-0.12, 0.55, 0.32);
  visualGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
  rightEye.position.set(0.12, 0.55, 0.32);
  visualGroup.add(rightEye);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI),
    eyeMat
  );
  smile.position.set(0, 0.46, 0.33);
  smile.rotation.z = Math.PI;
  visualGroup.add(smile);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5),
    hairMat
  );
  hair.position.y = 0.52;
  hair.castShadow = true;
  visualGroup.add(hair);

  const bunGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const leftBun = new THREE.Mesh(bunGeo, hairMat);
  leftBun.position.set(-0.32, 0.65, -0.1);
  visualGroup.add(leftBun);

  const rightBun = new THREE.Mesh(bunGeo, hairMat);
  rightBun.position.set(0.32, 0.65, -0.1);
  visualGroup.add(rightBun);

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.4, 4, 16),
    shirtMat
  );
  torso.position.y = -0.05;
  torso.castShadow = true;
  visualGroup.add(torso);

  const armGeo = new THREE.CapsuleGeometry(0.08, 0.35, 4, 8);
  armGeo.translate(0, -0.2, 0);

  limbs.leftArm = new THREE.Mesh(armGeo, skinMat);
  limbs.leftArm.position.set(-0.35, 0.15, 0);
  limbs.leftArm.rotation.z = -Math.PI / 12;
  limbs.leftArm.castShadow = true;
  visualGroup.add(limbs.leftArm);

  limbs.rightArm = new THREE.Mesh(armGeo, skinMat);
  limbs.rightArm.position.set(0.35, 0.15, 0);
  limbs.rightArm.rotation.z = Math.PI / 12;
  limbs.rightArm.castShadow = true;
  visualGroup.add(limbs.rightArm);

  const legGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
  legGeo.translate(0, -0.25, 0);

  limbs.leftLeg = new THREE.Mesh(legGeo, pantsMat);
  limbs.leftLeg.position.set(-0.12, -0.35, 0);
  limbs.leftLeg.castShadow = true;
  visualGroup.add(limbs.leftLeg);

  limbs.rightLeg = new THREE.Mesh(legGeo, pantsMat);
  limbs.rightLeg.position.set(0.12, -0.35, 0);
  limbs.rightLeg.castShadow = true;
  visualGroup.add(limbs.rightLeg);

  return { rootMesh, visualGroup, limbs };
}
