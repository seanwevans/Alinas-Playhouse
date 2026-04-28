import * as THREE from "https://esm.sh/three";

export function buildInteractable(ecs, spec, options) {
  const {
    position: { x, y, z },
    radius,
    interactionKey
  } = spec;

  const { createInteractable, onInteractByKey } = options;
  const onInteract = onInteractByKey[interactionKey];
  if (!onInteract) return null;

  ecs.add({
    interactable: createInteractable(new THREE.Vector3(x, y, z), radius, onInteract)
  });

  return interactionKey;
}
