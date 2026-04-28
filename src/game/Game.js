import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { OrbitControls } from "https://esm.sh/three/addons/controls/OrbitControls.js";
import { World } from "https://esm.sh/miniplex";
import { PARAMS, COLORS } from "../config/params.js";
import { Input, attachInputListeners, resetTransientInput } from "../core/input.js";
import { buildEnvironment, createPlayerEntity } from "../world/builders.js";
import { Bonk, Scream, createBonkSprite, triggerScreenFlash } from "../audio/effects.js";
import { PlayerInputSystem } from "../ecs/systems/PlayerInputSystem.js";
import { PhysicsSyncSystem } from "../ecs/systems/PhysicsSyncSystem.js";
import { PlayerAnimationSystem } from "../ecs/systems/PlayerAnimationSystem.js";
import { StudentAnimationSystem } from "../ecs/systems/StudentAnimationSystem.js";
import { InteractionSystem } from "../ecs/systems/InteractionSystem.js";
import { UpstairsVisibilitySystem } from "../ecs/systems/UpstairsVisibilitySystem.js";
import { CharacterSwitchSystem } from "../ecs/systems/CharacterSwitchSystem.js";
import { CameraFollowSystem } from "../ecs/systems/CameraFollowSystem.js";
import { FloatingTextSystem } from "../ecs/systems/FloatingTextSystem.js";
import { InputCleanupSystem } from "../ecs/systems/InputCleanupSystem.js";

export class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.initThreeAndCannon();
    attachInputListeners();

    this.audioCtx = null;
    const startAudio = () => {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      window.removeEventListener("mousedown", startAudio);
      window.removeEventListener("keydown", startAudio);
    };

    window.addEventListener("mousedown", startAudio);
    window.addEventListener("keydown", startAudio);

    this.ecs = new World();
    this.systems = [
      new PlayerInputSystem(this.ecs, Input),
      new PhysicsSyncSystem(this.ecs, () => Scream(this.audioCtx)),
      new PlayerAnimationSystem(this.ecs),
      new StudentAnimationSystem(this.ecs),
      new InteractionSystem(this.ecs, Input),
      new UpstairsVisibilitySystem(this.ecs),
      new CharacterSwitchSystem(this.ecs, this.camera, this.scene, Input),
      new CameraFollowSystem(this.ecs, this.controls),
      new FloatingTextSystem(this.ecs, this.scene),
      new InputCleanupSystem(resetTransientInput)
    ];

    this.anonSystems = this.ecs.with("update");

    buildEnvironment(this.ecs, this.scene, this.physicsWorld, {
      gameRef: this,
      Bonk,
      createBonkSprite,
      triggerScreenFlash
    });

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

    window.addEventListener("resize", () => this.onWindowResize());
    this.animate();
  }

  initThreeAndCannon() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.bg);

    this.camera = new THREE.PerspectiveCamera(
      PARAMS.Camera.fov,
      window.innerWidth / window.innerHeight,
      PARAMS.Camera.near,
      PARAMS.Camera.far
    );
    this.camera.position.copy(PARAMS.Camera.startPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = PARAMS.Camera.dampingFactor;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minDistance = PARAMS.Camera.minDistance;
    this.controls.maxDistance = PARAMS.Camera.maxDistance;

    this.scene.add(new THREE.AmbientLight(COLORS.ambient, PARAMS.World.ambientIntensity));

    const dirLight = new THREE.DirectionalLight(COLORS.directional, PARAMS.World.dirIntensity);
    dirLight.position.set(20, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    this.scene.add(dirLight);

    this.physicsWorld = new CANNON.World();
    this.physicsWorld.gravity.set(0, PARAMS.Physics.gravity, 0);
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);

    const mat = new CANNON.Material("default");
    const contactMat = new CANNON.ContactMaterial(mat, mat, {
      friction: PARAMS.Physics.friction,
      restitution: PARAMS.Physics.restitution
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
    requestAnimationFrame(() => this.animate());
    const deltaTime = this.clock.getDelta();

    this.physicsWorld.step(PARAMS.Physics.timeStep, deltaTime, PARAMS.Physics.maxSubSteps);

    for (const sys of this.systems) {
      sys.update(deltaTime);
    }

    for (const anon of this.anonSystems) {
      anon.update(deltaTime);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
