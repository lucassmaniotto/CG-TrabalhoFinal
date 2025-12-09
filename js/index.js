// ============================================
// Imports principais
// ============================================
import * as THREE from "three";

// Módulos customizados
import { CONFIG } from "./config.js";
import { initLighting, updateLightHelpers } from "./lighting.js";
import { loadGroundTexture, loadAllObjects, setOnObjectLoadedCallback, objects } from "./loaders.js";
import { input, onKeyDown, onKeyUp, setOnCameraToggleCallback } from "./input.js";
import * as CameraModule from "./camera.js";
import * as AnimationModule from "./animation.js";
import { updateCharacterMovement } from "./characterMovement.js";

// ============================================
// Variáveis globais
// ============================================
let scene, renderer;
const clock = new THREE.Clock();

// ============================================
// Inicialização
// ============================================
export function init() {
  // Inicializa câmera
  const camera = CameraModule.initCamera(window.innerWidth, window.innerHeight);

  // Inicializa cena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.scene.backgroundColor);
  scene.add(new THREE.AmbientLight(0xffffff, CONFIG.scene.ambientLightIntensity));

  // Carrega e configura o chão
  const groundMaterial = loadGroundTexture();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.scene.groundSize, CONFIG.scene.groundSize),
    groundMaterial
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(CONFIG.scene.groundPosition.x, CONFIG.scene.groundPosition.y, CONFIG.scene.groundPosition.z);
  ground.receiveShadow = true;
  scene.add(ground);

  // Inicializa renderer
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = CONFIG.shadows.enabled;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  try {
    renderer.outputEncoding = THREE.sRGBEncoding;
  } catch (e) {}

  // Inicializa iluminação
  initLighting(scene);

  // Setup de callbacks para loaders
  setOnObjectLoadedCallback((objName, object) => {
    if (objName.toLowerCase() === "man") {
      // Inicializa animações
      AnimationModule.initAnimationMixer(object);
      // Define câmera follow
      CameraModule.setFollowTarget(object);
    }
  });

  // Setup de callbacks para input
  setOnCameraToggleCallback(() => {
    CameraModule.toggleFirstPersonCamera();
  });

  // Carrega todos os objetos
  loadAllObjects(scene);

  // Adiciona renderer ao DOM
  document.body.appendChild(renderer.domElement);

  // Inicia loop de animação
  renderer.setAnimationLoop(animate);

  // Event listeners
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp, { passive: false });
}

// ============================================
// Loop de animação
// ============================================
function animate() {
  const delta = clock.getDelta();

  // Atualiza animações
  AnimationModule.updateAnimations(delta);

  // Atualiza movimento do personagem
  const character = objects["man"];
  updateCharacterMovement(character, delta);

  // Atualiza posição da câmera
  CameraModule.updateCameraPosition();

  // Atualiza helpers de luz
  updateLightHelpers();

  // Renderiza
  renderer.render(scene, CameraModule.getCamera());
}

// ============================================
// Event Handlers
// ============================================
function handleWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  CameraModule.onWindowResize(width, height);
}