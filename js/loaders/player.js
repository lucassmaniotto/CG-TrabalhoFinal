import * as THREE from "three";
import { CONFIG } from "../config.js";
import { loadFBX } from "../loaders.js";

// Carrega o personagem com animações:
// - carrega dois FBXs (idle e walk)
// - usa o modelo do idle como "corpo" principal
// - junta os clips de animação dos dois arquivos em `character.animations`
// - cria `userData.clipMap` para o sistema de animação/movimento
export async function loadCharacterWithAnimations(scene, objects, onObjectLoadedCallback) {
  const basePath = "./assets/models/Player/";

  try {
    // Carrega em paralelo os FBXs de idle e walk
    const [idleObj, walkObj] = await Promise.all([
      loadFBX(basePath + CONFIG.assets.characterIdleModel),
      loadFBX(basePath + CONFIG.assets.characterWalkModel),
    ]);

    console.log("FBXs do Player carregados");

    // Modelo base que será inserido na cena
    const character = idleObj;

    const scale = CONFIG.character.baseScale;
    const position = CONFIG.character.basePosition;
    const rotation = CONFIG.character.baseRotation;

    try {
      // Transformações base do personagem
      character.scale.set(scale, scale, scale);
      character.position.set(position.x, position.y, position.z);
      character.rotation.set(rotation.x, rotation.y, rotation.z);

      // Configura sombras nas malhas
      character.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = false;
        }
      });
    } catch (e) {
      console.warn("Erro aplicando transformações ao personagem FBX:", e);
    }

    // Extrai clips de cada FBX e combina em uma lista única
    const idleClips = idleObj.animations;
    const walkClips = walkObj.animations;

    character.animations = [...idleClips, ...walkClips];
    // Mapa de animações usado por outros módulos (ex: characterMovement/animation)
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

    // Adiciona à cena e registra no dicionário global
    scene.add(character);
    if (objects) objects["player"] = character;

    // Callback opcional (ex: setFollowTarget / initAnimationMixer)
    if (onObjectLoadedCallback) {
      onObjectLoadedCallback("Player", character);
    }
  } catch (error) {
    console.error("Erro ao carregar o personagem com animações:", error);
  }
}
