// Ownership: canonical game composition root (entry), assembling render/physics, ECS, entities, environment, and runtime loop.
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
import { createPhysicsWorld } from "./create-physics-world.js";
import { createRenderContext } from "./create-render-context.js";
import {
  setupAudioUnlock,
  setupWindowLifecycle,
  teardownWindowLifecycle
} from "./game-lifecycle.js";
import { runFrame } from "./game-runtime.js";
import { registerSystems } from "./register-systems.js";

export class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.params = PARAMS;
    this.destroyed = false;

    const { scene, camera, renderer, controls } = createRenderContext({
      colors: COLORS,
      params: PARAMS
    });
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;

    const { physicsWorld } = createPhysicsWorld(PARAMS);
    this.physicsWorld = physicsWorld;

    this.audioCtx = null;
    setupAudioUnlock(this);

    this.ecs = new World();
    this.input = new InputManager();
    this.input.registerListeners();

    const { systems } = registerSystems({
      ecs: this.ecs,
      input: this.input,
      scene: this.scene,
      camera: this.camera,
      controls: this.controls,
      physicsWorld: this.physicsWorld,
      gameRef: this,
      params: PARAMS,
      buildEnvironment,
      constructors: {
        PlayerInputSystem,
        PhysicsSyncSystem,
        PlayerAnimationSystem,
        StudentAnimationSystem,
        InteractionSystem,
        UpstairsVisibilitySystem,
        CharacterSwitchSystem,
        CameraFollowSystem,
        FloatingTextSystem,
        EnvironmentInteractionSystem
      }
    });
    this.systems = systems;

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
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    if (this.destroyed) return;

    requestAnimationFrame(() => this.animate());
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
