import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { CONFIG } from "../config.js";

// Helper para carrega um FBX e devolve uma Promise
export function loadFBX(path) {
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

// Implementação do carregamento do personagem (não fecha sobre `objects`/callback)
export async function loadCharacterWithAnimations(scene, objects, onObjectLoadedCallback) {
  const basePath = "./assets/models/Player/";

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
    if (objects) objects["player"] = character;

    if (onObjectLoadedCallback) {
      onObjectLoadedCallback("Player", character);
    }
  } catch (error) {
    console.error("Erro ao carregar o personagem com animações:", error);
  }
}
