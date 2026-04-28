export class InputCleanupSystem {
  constructor(resetFn) {
    this.resetFn = resetFn;
  }

  update() {
    this.resetFn();
  }
}
