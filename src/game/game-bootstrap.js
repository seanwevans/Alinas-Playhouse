// Ownership: Game bootstrap/composition root that assembles ECS, systems, environment, and loop.
import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { OrbitControls } from "https://esm.sh/three/addons/controls/OrbitControls.js";
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
import { runFrame } from "./game-runtime.js";

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
    this.animate();
  }

  initThreeAndCannon() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.bg);

    this.camera = new THREE.PerspectiveCamera(
      this.params.Camera.fov,
      window.innerWidth / window.innerHeight,
      this.params.Camera.near,
      this.params.Camera.far
    );
    this.camera.position.copy(this.params.Camera.startPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = this.params.Camera.dampingFactor;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minDistance = this.params.Camera.minDistance;
    this.controls.maxDistance = this.params.Camera.maxDistance;

    this.scene.add(new THREE.AmbientLight(COLORS.ambient, this.params.World.ambientIntensity));

    const dirLight = new THREE.DirectionalLight(COLORS.directional, this.params.World.dirIntensity);

    dirLight.position.set(20, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    this.scene.add(dirLight);

    this.physicsWorld = new CANNON.World();
    this.physicsWorld.gravity.set(0, this.params.Physics.gravity, 0);
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);

    const mat = new CANNON.Material("default");
    const contactMat = new CANNON.ContactMaterial(mat, mat, {
      friction: this.params.Physics.friction,
      restitution: this.params.Physics.restitution
    });

    this.physicsWorld.addContactMaterial(contactMat);
    this.physicsWorld.defaultContactMaterial = contactMat;
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
