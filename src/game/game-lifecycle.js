export function setupAudioUnlock(game) {
  const startAudio = () => {
    if (!game.audioCtx) {
      game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    window.removeEventListener("mousedown", startAudio);
    window.removeEventListener("keydown", startAudio);
  };

  game.boundStartAudioHandler = startAudio;
  window.addEventListener("mousedown", startAudio);
  window.addEventListener("keydown", startAudio);
}

export function setupWindowLifecycle(game) {
  game.boundResizeHandler = () => game.onWindowResize();
  game.boundBeforeUnloadHandler = () => teardownWindowLifecycle(game);

  window.addEventListener("resize", game.boundResizeHandler);
  window.addEventListener("beforeunload", game.boundBeforeUnloadHandler);
}

export function teardownWindowLifecycle(game) {
  window.removeEventListener("resize", game.boundResizeHandler);
  window.removeEventListener("beforeunload", game.boundBeforeUnloadHandler);

  if (game.boundStartAudioHandler) {
    window.removeEventListener("mousedown", game.boundStartAudioHandler);
    window.removeEventListener("keydown", game.boundStartAudioHandler);
  }
}
