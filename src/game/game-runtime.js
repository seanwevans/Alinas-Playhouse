export function runFrame(game) {
  game.input.beginFrame();

  const deltaTime = game.clock.getDelta();

  game.physicsWorld.step(
    game.params.Physics.timeStep,
    deltaTime,
    game.params.Physics.maxSubSteps
  );

  for (const sys of game.systems) {
    sys.update(deltaTime);
  }

  game.renderer.render(game.scene, game.camera);
  game.input.endFrame();
}

export function startGameRuntime(game) {
  const animate = () => {
    if (game.destroyed) return;

    requestAnimationFrame(animate);
    game.animate();
  };

  animate();

  return { animate };
}
