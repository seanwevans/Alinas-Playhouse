// Ownership: browser lifecycle wiring (audio unlock + window listeners/teardown).

export function setupAudioUnlock(game) {
  const startAudio = () => {
    if (!game.audioCtx) {
      game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    window.removeEventListener("mousedown", startAudio);
    window.removeEventListener("keydown", startAudio);
  };

  window.addEventListener("mousedown", startAudio);
  window.addEventListener("keydown", startAudio);
}

export function setupWindowLifecycle(game) {
  game.boundResizeHandler = () => game.onWindowResize();
  game.boundBeforeUnloadHandler = () => game.destroy();
  window.addEventListener("resize", game.boundResizeHandler);
  window.addEventListener("beforeunload", game.boundBeforeUnloadHandler);
}

export function teardownWindowLifecycle(game) {
  window.removeEventListener("resize", game.boundResizeHandler);
  window.removeEventListener("beforeunload", game.boundBeforeUnloadHandler);
}
