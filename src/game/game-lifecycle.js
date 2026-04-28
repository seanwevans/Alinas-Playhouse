export function registerGameLifecycle(game) {
  const startAudio = () => {
    if (!game.audioCtx) {
      game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    window.removeEventListener("mousedown", startAudio);
    window.removeEventListener("keydown", startAudio);
  };

  window.addEventListener("mousedown", startAudio);
  window.addEventListener("keydown", startAudio);

  game.boundResizeHandler = () => game.onWindowResize();
  game.boundBeforeUnloadHandler = () => destroyGame(game);
  game.boundStartAudioHandler = startAudio;

  window.addEventListener("resize", game.boundResizeHandler);
  window.addEventListener("beforeunload", game.boundBeforeUnloadHandler);
}

export function destroyGame(game) {
  if (game.destroyed) return;
  game.destroyed = true;

  game.input.unregisterListeners();
  window.removeEventListener("resize", game.boundResizeHandler);
  window.removeEventListener("beforeunload", game.boundBeforeUnloadHandler);

  if (game.boundStartAudioHandler) {
    window.removeEventListener("mousedown", game.boundStartAudioHandler);
    window.removeEventListener("keydown", game.boundStartAudioHandler);
  }

  if (game.renderer && game.renderer.domElement.parentNode) {
    game.renderer.domElement.parentNode.removeChild(game.renderer.domElement);
  }
}
