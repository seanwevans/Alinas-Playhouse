import * as THREE from "https://esm.sh/three";

export function createKitchenController({ scene, colors, params }) {
  const fridgeDoorGrp = new THREE.Group();
  fridgeDoorGrp.position.set(31.4, 1.75, -7.5);
  scene.add(fridgeDoorGrp);

  const fridgeDoor = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 3.5, 0.2),
    new THREE.MeshStandardMaterial({ color: colors.fridge })
  );
  fridgeDoor.position.set(1.1, 0, 0);
  fridgeDoor.castShadow = true;
  fridgeDoorGrp.add(fridgeDoor);

  const fridgeHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 1.2, 0.15),
    new THREE.MeshStandardMaterial({ color: colors.fridgeHandle })
  );
  fridgeHandle.position.set(2, 0.05, 0.15);
  fridgeDoorGrp.add(fridgeHandle);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.4),
    new THREE.MeshStandardMaterial({
      color: colors.water,
      transparent: true,
      opacity: params.World.waterOpacity
    })
  );
  water.position.set(38, 1.85, -8.3);
  water.visible = false;
  scene.add(water);

  const burnerPositions = [
    [44.5, -8.0],
    [45.5, -8.0],
    [44.5, -9.0],
    [45.5, -9.0]
  ];

  const burners = burnerPositions.map(([x, z]) => {
    const burner = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: colors.burnerOff })
    );
    burner.position.set(x, 1.72, z);
    scene.add(burner);
    return burner;
  });

  const stoveLight = new THREE.PointLight(colors.stoveLight, 0, 4);
  stoveLight.position.set(45, 2.5, -8.5);
  scene.add(stoveLight);

  const kitchenState = { isFridgeOpen: false };
  let isSinkOn = false;
  let isStoveOn = false;

  const hooks = {
    toggleFridge: () => {
      kitchenState.isFridgeOpen = !kitchenState.isFridgeOpen;
    },
    toggleSink: () => {
      isSinkOn = !isSinkOn;
      water.visible = isSinkOn;
    },
    toggleStove: () => {
      isStoveOn = !isStoveOn;
      burners.forEach((burner, idx) => {
        if (idx === 0 || idx === 3) {
          burner.material.color.set(isStoveOn ? colors.burnerOn : colors.burnerOff);
          burner.material.emissive.set(isStoveOn ? colors.burnerOn : colors.stoveBlack);
          burner.material.emissiveIntensity = isStoveOn ? params.World.stoveEmissiveOn : 0;
        }
      });
      stoveLight.intensity = isStoveOn ? params.World.stoveLightIntensityOn : 0;
    }
  };

  return { hooks, fridgeDoorGrp, kitchenState };
}
