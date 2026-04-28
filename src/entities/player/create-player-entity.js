import { buildPlayerMesh } from "./build-player-mesh.js";
import { buildPlayerBody } from "./build-player-body.js";
import { attachPlayerCollisionEffects } from "./attach-player-collision-effects.js";

export function createPlayerEntity({
  ecs,
  scene,
  world,
  x,
  z,
  shirtColor,
  rotationY,
  isActive = false,
  isDynamic = true,
  gameRef = null,
  components,
  collisionHelpers
}) {
  const { rootMesh, visualGroup, limbs } = buildPlayerMesh(shirtColor);
  scene.add(rootMesh);

  const body = buildPlayerBody({ x, z, isDynamic });

  if (isDynamic && gameRef) {
    attachPlayerCollisionEffects(body, gameRef, collisionHelpers);
  }

  world.addBody(body);
  rootMesh.rotation.y = rotationY;

  const entity = ecs.add({
    renderable: new components.RenderableComponent(rootMesh),
    physicsBody: new components.PhysicsBodyComponent(body),
    player: new components.PlayerComponent(
      visualGroup,
      limbs,
      components.playerMoveSpeed,
      rotationY
    ),
    controllable: new components.ControllableComponent(isActive)
  });

  rootMesh.userData.entity = entity;
  visualGroup.userData.entity = entity;
  visualGroup.traverse((child) => {
    if (child.isMesh) child.userData.entity = entity;
  });

  return entity;
}
