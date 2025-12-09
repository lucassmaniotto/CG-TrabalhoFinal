// ============================================
// Camera - Gerenciamento de câmera
// ============================================

import * as THREE from "three";
import { CONFIG } from "./config.js";

let camera = null;
let cameraFollowTarget = null;
let isFirstPersonCamera = false;

/**
 * Inicializa a câmera
 */
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

/**
 * Define o alvo para a câmera seguir
 */
export function setFollowTarget(object) {
  cameraFollowTarget = object;
  if (object) {
    // Posiciona câmera inicial atrás do dragão
    try {
      const dir = new THREE.Vector3();
      object.getWorldDirection(dir);
      const thirdPersonConfig = CONFIG.thirdPersonCamera;
      const desiredPos = object.position.clone().addScaledVector(dir, -thirdPersonConfig.followDistance);
      desiredPos.y = object.position.y + thirdPersonConfig.followHeight;
      camera.position.copy(desiredPos);
      camera.lookAt(object.position);
    } catch (e) {
      console.warn("Erro ao posicionar a câmera atrás do alvo:", e);
    }
  }
}

/**
 * Toggle entre câmera primeira e terceira pessoa
 */
export function toggleFirstPersonCamera() {
  isFirstPersonCamera = !isFirstPersonCamera;
  console.log(isFirstPersonCamera ? "Câmera: Primeira Pessoa" : "Câmera: Terceira Pessoa");
}

/**
 * Atualiza a posição da câmera
 */
export function updateCameraPosition() {
  if (!cameraFollowTarget) return;

  try {
    const firstPersonConfig = CONFIG.firstPersonCamera;
    const thirdPersonConfig = CONFIG.thirdPersonCamera;

    if (isFirstPersonCamera) {
      // Câmera em primeira pessoa
      const dir = new THREE.Vector3();
      cameraFollowTarget.getWorldDirection(dir);
      const cameraPos = cameraFollowTarget.position.clone()
        .addScaledVector(dir, firstPersonConfig.distance)
        .add(new THREE.Vector3(0, firstPersonConfig.height, 0));
      camera.position.copy(cameraPos);
      // Olha para frente na direção do dragão
      const lookAtPoint = cameraPos.clone().addScaledVector(dir, 50);
      camera.lookAt(lookAtPoint);
    } else {
      // Câmera em terceira pessoa
      const dir = new THREE.Vector3();
      cameraFollowTarget.getWorldDirection(dir);
      const desiredPos = cameraFollowTarget.position.clone().addScaledVector(dir, -thirdPersonConfig.followDistance);
      desiredPos.y = cameraFollowTarget.position.y + thirdPersonConfig.followHeight;
      camera.position.lerp(desiredPos, thirdPersonConfig.smoothness);
      camera.lookAt(cameraFollowTarget.position);
    }
  } catch (e) {
    console.warn("Erro ao atualizar a posição da câmera:", e);
  }
}

/**
 * Handler de redimensionamento da janela
 */
export function onWindowResize(width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

/**
 * Retorna a câmera
 */
export function getCamera() {
  return camera;
}

/**
 * Retorna se está em primeira pessoa
 */
export function getIsFirstPersonCamera() {
  return isFirstPersonCamera;
}
