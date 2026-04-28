// Ownership: Game bootstrap/composition root that assembles ECS, systems, environment, and loop.
import * as THREE from "https://esm.sh/three";
import { World } from "https://esm.sh/miniplex";
import { InputManager } from "../core/input.js";
import { COLORS, PARAMS } from "../config/game-config.js";
import { createPlayerEntity } from "../entities/player-factory.js";
import { buildEnvironment } from "../environment/build-environment.js";
import {
  PlayerAnimationSystem,
  PlayerInputSystem,
  PhysicsSyncSystem,
  StudentAnimationSystem
} from "../systems/player-systems.js";
import {
  CameraFollowSystem,
  CharacterSwitchSystem,
  EnvironmentInteractionSystem,
  FloatingTextSystem,
  InteractionSystem,
  UpstairsVisibilitySystem
} from "../systems/world-systems.js";
import {
  setupAudioUnlock,
  setupWindowLifecycle,
  teardownWindowLifecycle
} from "./game-lifecycle.js";
import { runFrame, startGameRuntime } from "./game-runtime.js";
import { createRenderContext } from "./create-render-context.js";
import { createPhysicsWorld } from "./create-physics-world.js";

export class Game {
  constructor() {
    this.params = PARAMS;
    this.clock = new THREE.Clock();
    this.initThreeAndCannon();
    this.audioCtx = null;
    setupAudioUnlock(this);

    this.ecs = new World();
    this.input = new InputManager();
    this.input.registerListeners();

    this.systems = [
      new PlayerInputSystem(this.ecs, this.input),
      new PhysicsSyncSystem(this.ecs, this),
      new PlayerAnimationSystem(this.ecs),
      new StudentAnimationSystem(this.ecs),
      new InteractionSystem(this.ecs, this.input),
      new UpstairsVisibilitySystem(this.ecs),
      new CharacterSwitchSystem(this.ecs, this.camera, this.scene, this.input),
      new CameraFollowSystem(this.ecs, this.controls),
      new FloatingTextSystem(this.ecs, this.scene)
    ];

    const environmentHandles = buildEnvironment(this.ecs, this.scene, this.physicsWorld, {
      gameRef: this
    });
    this.systems.push(new EnvironmentInteractionSystem(environmentHandles, this.params));

    createPlayerEntity(
      this.ecs,
      this.scene,
      this.physicsWorld,
      0,
      0,
      COLORS.mainPlayerShirt,
      0,
      true,
      true,
      this
    );

    setupWindowLifecycle(this);

    this.destroyed = false;
    this.runtime = startGameRuntime(this);
  }

  initThreeAndCannon() {
    const { scene, camera, renderer, controls } = createRenderContext({
      colors: COLORS,
      params: this.params
    });
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;

    const { physicsWorld } = createPhysicsWorld(this.params);
    this.physicsWorld = physicsWorld;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    if (this.destroyed) return;
    runFrame(this);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.input.unregisterListeners();
    teardownWindowLifecycle(this);

    if (this.renderer && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
