// ============================================
// Loaders - Carregamento de objetos e texturas
// ============================================

import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { CONFIG } from "./config.js";

const textureLoader = new THREE.TextureLoader();
export const objects = {};

let onObjectLoadedCallback = null;

/**
 * Define callback para quando um objeto for carregado
 */
export function setOnObjectLoadedCallback(callback) {
  onObjectLoadedCallback = callback;
}

/**
 * Helper: carrega um FBX e devolve uma Promise
 */
function loadFBX(path) {
  const fbxLoader = new FBXLoader();
  return new Promise((resolve, reject) => {
    fbxLoader.load(
      path,
      (object) => resolve(object),
      undefined,
      (error) => reject(error)
    );
  });
}

/**
 * Carrega o personagem a partir de dois FBX (Idle e Walking)
 * e combina suas animações em um único objeto
 */
export async function loadCharacterWithAnimations(scene) {
  const basePath = "./assets/models/Man/";

  try {
    const [idleObj, walkObj] = await Promise.all([
      loadFBX(basePath + CONFIG.assets.characterIdleModel),
      loadFBX(basePath + CONFIG.assets.characterWalkModel),
    ]);

    console.log("FBXs carregados");

    const character = idleObj;

    const scale = CONFIG.character.baseScale;
    const position = CONFIG.character.basePosition;
    const rotation = CONFIG.character.baseRotation;

    try {
      character.scale.set(scale, scale, scale);
      character.position.set(position.x, position.y, position.z);
      character.rotation.set(rotation.x, rotation.y, rotation.z);

      character.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = false;
        }
      });
    } catch (e) {
      console.warn("Erro aplicando transformações ao personagem FBX:", e);
    }

    const idleClips = idleObj.animations || [];
    const walkClips = walkObj.animations || [];

    // Combina as animações mantendo referência explícita aos clips principais
    character.animations = [...idleClips, ...walkClips];
    character.userData.clipMap = {
      idle: idleClips[0] || null,
      walk: walkClips[0] || null,
    };

    console.log(
      "Clips carregados:",
      {
        idleCount: idleClips.length,
        walkCount: walkClips.length,
        allNames: character.animations.map((c) => c.name),
      }
    );

    scene.add(character);
    objects["man"] = character;

    if (onObjectLoadedCallback) {
      onObjectLoadedCallback("Man", character);
    }
  } catch (error) {
    console.error("Erro ao carregar o personagem com animações:", error);
  }
}

/**
 * Carrega todos os objetos da cena
 */
export function loadAllObjects(scene) {
  loadCharacterWithAnimations(scene);
}

/**
 * Carrega textura do chão
 */
export function loadGroundTexture() {
  const texture = textureLoader.load(
    CONFIG.assets.groundTexture,
    (tex) => {
      try {
        tex.encoding = THREE.sRGBEncoding;
      } catch (e) {}
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(500, 500);
    },
    undefined,
    (err) => {
      console.warn("Não foi possível carregar a textura do chão", err);
    }
  );

  return new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 1.0,
    metalness: 0.0,
  });
}
