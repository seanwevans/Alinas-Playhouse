import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/addons/controls/OrbitControls.js";

export function createRenderContext({ colors, params }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);

  const camera = new THREE.PerspectiveCamera(
    params.Camera.fov,
    window.innerWidth / window.innerHeight,
    params.Camera.near,
    params.Camera.far
  );
  camera.position.copy(params.Camera.startPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = params.Camera.dampingFactor;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = params.Camera.minDistance;
  controls.maxDistance = params.Camera.maxDistance;

  scene.add(new THREE.AmbientLight(colors.ambient, params.World.ambientIntensity));

  const dirLight = new THREE.DirectionalLight(
    colors.directional,
    params.World.dirIntensity
  );
  dirLight.position.set(20, 20, 10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  scene.add(dirLight);

  return { scene, camera, renderer, controls, dirLight };
}
