export function startGameRuntime(game) {
  const animate = () => {
    if (game.destroyed) return;

    requestAnimationFrame(animate);
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
  };

  animate();

  return { animate };
}
