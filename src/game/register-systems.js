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
  const requiredConstructorKeys = [
    "PlayerInputSystem",
    "PhysicsSyncSystem",
    "PlayerAnimationSystem",
    "StudentAnimationSystem",
    "DogFollowSystem",
    "InteractionSystem",
    "UpstairsVisibilitySystem",
    "CharacterSwitchSystem",
    "CameraFollowSystem",
    "FloatingTextSystem",
    "EnvironmentInteractionSystem"
  ];
  const invalidConstructorKeys = requiredConstructorKeys.filter(
    (key) => typeof constructors?.[key] !== "function"
  );

  if (invalidConstructorKeys.length > 0) {
    throw new Error(
      `registerSystems: missing or invalid constructor(s): ${invalidConstructorKeys.join(", ")}. ` +
        "Wire these on the `constructors` object before calling registerSystems."
    );
  }

  const requiredDependencies = {
    ecs,
    input,
    scene,
    camera,
    controls,
    physicsWorld
  };
  const missingDependencies = Object.entries(requiredDependencies)
    .filter(([, value]) => value == null)
    .map(([key]) => key);

  if (missingDependencies.length > 0) {
    throw new Error(
      `registerSystems: missing required dependency value(s): ${missingDependencies.join(", ")}. ` +
        "Provide non-null values in the registerSystems call site."
    );
  }

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
