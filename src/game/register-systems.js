export function registerSystems({
  ecs,
  input,
  scene,
  camera,
  controls,
  physicsWorld,
  gameRef,
  params,
  buildEnvironment,
  constructors
}) {
  const systems = [
    new constructors.PlayerInputSystem(ecs, input),
    new constructors.PhysicsSyncSystem(ecs, gameRef),
    new constructors.PlayerAnimationSystem(ecs),
    new constructors.StudentAnimationSystem(ecs),
    new constructors.DogFollowSystem(ecs, gameRef),
    new constructors.InteractionSystem(ecs, input),
    new constructors.UpstairsVisibilitySystem(ecs),
    new constructors.CharacterSwitchSystem(ecs, camera, scene, input),
    new constructors.CameraFollowSystem(ecs, controls),
    new constructors.FloatingTextSystem(ecs, scene)
  ];

  const environmentHandles = buildEnvironment(ecs, scene, physicsWorld, {
    gameRef
  });

  systems.push(
    new constructors.EnvironmentInteractionSystem(environmentHandles, params)
  );

  return { systems, environmentHandles };
}
