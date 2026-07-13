// Handles global "meta" controls: mute (M) toggles audio, reset (R) returns the
// active character to the start position.
const START_POSITION = { x: 0, y: 0.95, z: 0 };
export class GameControlSystem {
  constructor(ecs, input, gameRef) {
    this.input = input;
    this.gameRef = gameRef;
    this.players = ecs.with("player", "physicsBody", "controllable");
  }

  update() {
    if (this.input.wasPressed("mute")) this.toggleMute();
    if (this.input.wasPressed("reset")) this.resetActivePlayer();
  }

  toggleMute() {
    // gameRef.muted gates new sounds at their call sites (so nothing is queued
    // while muted); suspend/resume silences anything already playing.
    this.gameRef.muted = !this.gameRef.muted;

    const ctx = this.gameRef.audioCtx;
    if (!ctx) return;
    if (this.gameRef.muted) {
      ctx.suspend();
    } else {
      ctx.resume();
    }
  }

  resetActivePlayer() {
    for (const entity of this.players) {
      if (!entity.controllable.active) continue;

      const body = entity.physicsBody.body;
      body.position.set(START_POSITION.x, START_POSITION.y, START_POSITION.z);
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);

      const player = entity.player;
      player.isSitting = false;
      player.isLaying = false;
      player.targetRotation = 0;
      player.hasScreamed = false;
      return;
    }
  }
}
