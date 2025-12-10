import * as THREE from "three";
import { CONFIG } from "./config.js";

let camera = null;
let cameraFollowTarget = null;
let isFirstPersonCamera = false;
let orbitHorizontalOffset = 0; // deslocamento de horizontal relativo ao alvo
let orbitVertical = 0; // rotação vertical (positivo olha para cima)

const DEFAULT_MOUSE_SENSITIVITY = 0.002;
const MAX_VERTICAL = Math.PI * 0.49; // ~88° para evitar flip
const MIN_VERTICAL = -Math.PI * 0.49;
const TMP_VEC3 = new THREE.Vector3();

// Inicializa a câmera
export function initCamera(width, height) {
  camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    width / height,
    CONFIG.camera.near,
    CONFIG.camera.far
  );

  const { x, y, z } = CONFIG.camera.defaultPosition;
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);

  return camera;
}

// Define o alvo para a câmera seguir
export function setFollowTarget(object) {
  cameraFollowTarget = object;
  if (object) {
    // Posiciona câmera inicial atrás do objeto
    try {
      const dir = new THREE.Vector3();
      object.getWorldDirection(dir);
      const thirdPersonConfig = CONFIG.thirdPersonCamera;
      const desiredPos = object.position
        .clone()
        .addScaledVector(dir, -thirdPersonConfig.followDistance);
      desiredPos.y = object.position.y + thirdPersonConfig.followHeight;
      camera.position.copy(desiredPos);
      camera.lookAt(object.position);

      // Define eixos iniciais com base na posição atual da câmera em relação ao alvo
      const offset = camera.position.clone().sub(object.position);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      const horizontalEffective = spherical.theta;
      orbitVertical = Math.PI / 2 - spherical.phi;

      // Define horizontalOffset em relação ao eixo do alvo para a câmera seguir a rotação do objeto
      const targetHorizontal = getTargetHorizontal(object);
      orbitHorizontalOffset = horizontalEffective - targetHorizontal;
    } catch (e) {
      console.warn("Erro ao posicionar a câmera atrás do alvo:", e);
    }
  }
}

// Toggle entre câmera primeira e terceira pessoa
export function toggleFirstPersonCamera() {
  isFirstPersonCamera = !isFirstPersonCamera;

  if (isFirstPersonCamera) {
    // Ao entrar em primeira pessoa, alinhar eixo horizontal da câmera com o alvo
    const targetHorizontal = cameraFollowTarget ? getTargetHorizontal(cameraFollowTarget) : 0;
    orbitHorizontalOffset = 0; // sem offset em FP: olhar na direção do personagem
    camera.lookAt(
      cameraFollowTarget ? cameraFollowTarget.position : new THREE.Vector3()
    );
  }
}

// Aplica delta de mouse acumulado (movementX/movementY) à órbita da câmera
export function applyMouseLook(delta) {
  if (!delta) return;
  const sensitivity =
    CONFIG.camera.mouseSensitivity || DEFAULT_MOUSE_SENSITIVITY;

  // Eixo horizontal efetivo atual = horizontal do alvo + offset armazenado
  const targetHorizontal = cameraFollowTarget ? getTargetHorizontal(cameraFollowTarget) : 0;
  let horizontalEffective = targetHorizontal + orbitHorizontalOffset;

  horizontalEffective -= (delta.dx || 0) * sensitivity;
  orbitVertical -= (delta.dy || 0) * sensitivity;

  orbitVertical = THREE.MathUtils.clamp(orbitVertical, MIN_VERTICAL, MAX_VERTICAL);

  // Atualiza offset relativo ao alvo para acompanhar rotação do personagem
  orbitHorizontalOffset = horizontalEffective - targetHorizontal;

  // Em primeira pessoa, rotaciona o próprio alvo para onde a câmera olha
  if (isFirstPersonCamera && cameraFollowTarget) {
    cameraFollowTarget.rotation.y = horizontalEffective;
    // Mantém câmera alinhada ao personagem em FP
    orbitHorizontalOffset = 0;
  }
}

// Atualiza a posição da câmera
export function updateCameraPosition() {
  if (!cameraFollowTarget) return;

  try {
    const firstPersonConfig = CONFIG.firstPersonCamera;
    const thirdPersonConfig = CONFIG.thirdPersonCamera;

    const targetHorizontal = getTargetHorizontal(cameraFollowTarget);
    const horizontalEffective = targetHorizontal + orbitHorizontalOffset;

    // Calcula ângulo polar (phi) a partir do eixo vertical
    const polar = THREE.MathUtils.clamp(
      Math.PI / 2 - orbitVertical,
      0.05,
      Math.PI - 0.05
    );
    const azimuth = horizontalEffective;

    if (isFirstPersonCamera) {
      // Câmera em primeira pessoa usando eixos do mouse
      const dir = TMP_VEC3.setFromSpherical(
        new THREE.Spherical(1, polar, azimuth)
      ).normalize();
      const cameraPos = cameraFollowTarget.position
        .clone()
        .add(new THREE.Vector3(0, firstPersonConfig.height, 0))
        .addScaledVector(dir, firstPersonConfig.distance);
      camera.position.copy(cameraPos);
      const lookAtPoint = cameraPos.clone().addScaledVector(dir, 50);
      camera.lookAt(lookAtPoint);
    } else {
      // Câmera em terceira pessoa orbitando com eixos
      const center = cameraFollowTarget.position.clone();
      center.y += thirdPersonConfig.followHeight;
      const offset = TMP_VEC3.setFromSpherical(
        new THREE.Spherical(thirdPersonConfig.followDistance, polar, azimuth)
      );
      const desiredPos = center.clone().add(offset);
      camera.position.lerp(desiredPos, thirdPersonConfig.smoothness);
      camera.lookAt(center);
    }
  } catch (e) {
    console.warn("Erro ao atualizar a posição da câmera:", e);
  }
}

// Handler de redimensionamento da janela

export function onWindowResize(width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Getters
export function getCamera() {
  return camera;
}

export function getIsFirstPersonCamera() {
  return isFirstPersonCamera;
}

// Utilitário: eixo horizontal do alvo a partir da direção forward
function getTargetHorizontal(target) {
  const dir = target.getWorldDirection(TMP_VEC3.clone());
  // atan2(x, z) para eixo horizontal em torno de Y
  return Math.atan2(dir.x, dir.z);
}
