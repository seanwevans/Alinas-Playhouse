import * as THREE from "https://esm.sh/three";

export function createBedroomController({ scene, world, cannon, colors, params }) {
  const hooks = {};

  const lampGroup = new THREE.Group();
  const baseMaterial = new THREE.MeshStandardMaterial({ color: colors.lampBase });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16), baseMaterial);
  base.position.y = 0.1;
  lampGroup.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 8), baseMaterial);
  pole.position.y = 1.6;
  lampGroup.add(pole);

  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: colors.lampShade,
    side: THREE.DoubleSide,
    emissive: colors.lampShade,
    emissiveIntensity: params.World.lampEmissiveOn
  });

  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.8, 1, 16, 1, true),
    shadeMaterial
  );
  shade.position.y = 3.2;
  lampGroup.add(shade);

  const lampLight = new THREE.PointLight(colors.lampLight, params.World.lampIntensityOn, 15);
  lampLight.position.y = 3;
  lampLight.castShadow = true;
  lampGroup.add(lampLight);
  lampGroup.position.set(-8, 0, -8);
  scene.add(lampGroup);

  const lampBody = new cannon.Body({
    mass: 0,
    shape: new cannon.Box(new cannon.Vec3(0.6, 1.85, 0.6))
  });
  lampBody.position.set(-8, 1.85, -8);
  world.addBody(lampBody);

  let isLampOn = true;
  hooks.toggleLamp = () => {
    isLampOn = !isLampOn;
    lampLight.intensity = isLampOn ? params.World.lampIntensityOn : 0;
    shade.material.emissiveIntensity = isLampOn ? params.World.lampEmissiveOn : 0;
  };

  const pcMaterial = new THREE.MeshStandardMaterial({ color: colors.pcCase });
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1), pcMaterial);
  monitor.position.set(6, 2, -8.2);
  monitor.castShadow = true;
  scene.add(monitor);

  const screenMaterial = new THREE.MeshStandardMaterial({
    color: colors.pcScreenOff,
    emissive: colors.pcScreenEmissive,
    emissiveIntensity: 0
  });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.1), screenMaterial);
  screen.position.set(6, 2, -7.74);
  scene.add(screen);

  const pcLight = new THREE.PointLight(colors.pcScreenEmissive, 0, 4);
  pcLight.position.set(0, 0, 0.2);
  screen.add(pcLight);

  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 1.4), pcMaterial);
  tower.position.set(7.1, 2.15, -8.1);
  tower.castShadow = true;
  scene.add(tower);

  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.35), pcMaterial);
  keyboard.position.set(6, 1.625, -7.5);
  scene.add(keyboard);

  const pcBody = new cannon.Body({
    mass: 0,
    shape: new cannon.Box(new cannon.Vec3(1.75, 1.4, 0.9))
  });
  pcBody.position.set(6, 1.4, -8);
  world.addBody(pcBody);

  let isPcOn = false;
  hooks.togglePc = () => {
    isPcOn = !isPcOn;
    screen.material.color.set(isPcOn ? colors.pcScreenOn : colors.pcScreenOff);
    screen.material.emissiveIntensity = isPcOn ? 1 : 0;
    pcLight.intensity = isPcOn ? params.World.pcLightIntensityOn : 0;
  };

  return { hooks };
}
