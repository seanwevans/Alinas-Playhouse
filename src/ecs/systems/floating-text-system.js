export class FloatingTextSystem {
  constructor(ecs, scene) {
    this.query = ecs.with("floatingText");
    this.ecs = ecs;
    this.scene = scene;
  }

  update(dt) {
    for (const entity of this.query) {
      const ft = entity.floatingText;
      ft.time += dt;
      const progress = ft.time / ft.duration;

      if (progress >= 1.0) {
        this.scene.remove(ft.sprite);
        ft.sprite.material.map.dispose();
        ft.sprite.material.dispose();
        this.ecs.remove(entity);
      } else {
        ft.sprite.position.y = ft.startY + progress * 2.0;
        ft.sprite.material.opacity = 1.0 - Math.pow(progress, 2);
      }
    }
  }
}
