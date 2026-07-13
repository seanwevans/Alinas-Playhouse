// Ownership: Game bootstrap/composition root that assembles ECS, systems, environment, and loop.
import * as THREE from "three";
import { World } from "miniplex";
import { InputManager } from "../core/input.js";
import { COLORS, PARAMS } from "../config/game-config.js";
import { createPlayerEntity } from "../entities/player-factory.js";
import { createCookieDogEntity } from "../entities/dog-factory.js";
import { buildEnvironment } from "../environment/build-environment.js";
import { PlayerInputSystem } from "../ecs/systems/player-input-system.js";
import { PhysicsSyncSystem } from "../ecs/systems/physics-sync-system.js";
import { PlayerAnimationSystem } from "../ecs/systems/player-animation-system.js";
import { StudentAnimationSystem } from "../ecs/systems/student-animation-system.js";
import { DogFollowSystem } from "../ecs/systems/dog-follow-system.js";
import { InteractionSystem } from "../ecs/systems/interaction-system.js";
import { UpstairsVisibilitySystem } from "../ecs/systems/upstairs-visibility-system.js";
import { CharacterSwitchSystem } from "../ecs/systems/character-switch-system.js";
import { CameraFollowSystem } from "../ecs/systems/camera-follow-system.js";
import { FloatingTextSystem } from "../ecs/systems/floating-text-system.js";
import { EnvironmentInteractionSystem } from "../ecs/systems/environment-interaction-system.js";
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

    this.characterSwitch = new CharacterSwitchSystem(
      this.ecs,
      this.camera,
      this.scene,
      this.input
    );

    this.systems = [
      new PlayerInputSystem(this.ecs, this.input),
      new PhysicsSyncSystem(this.ecs, this),
      new PlayerAnimationSystem(this.ecs),
      new StudentAnimationSystem(this.ecs),
      new DogFollowSystem(this.ecs, this),
      new InteractionSystem(this.ecs, this.input),
      new UpstairsVisibilitySystem(this.ecs),
      this.characterSwitch,
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
    createCookieDogEntity(this.ecs, this.scene);

    this.registerSelectableCharacters();

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

  registerSelectableCharacters() {
    for (const entity of this.ecs.with("controllable", "renderable")) {
      this.characterSwitch.registerSelectableMesh(entity.renderable.mesh);
    }
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
