export { loadFBX } from "./loaders/fbx.js";
import { loadCharacterWithAnimations as _loadCharacterWithAnimations } from "./loaders/fbx.js";

export { loadTDS } from "./loaders/tds.js";
import {
  createTreesFrom3DS as _createTreesFrom3DS,
  createTreeRowFrom3DS as _createTreeRowFrom3DS,
} from "./loaders/tds.js";

export { loadGroundTexture, createStonePath } from "./loaders/ground.js";
import { createBenchesAlongPath as _createBenchesAlongPath } from "./loaders/bench.js";

export const objects = {};

let onObjectLoadedCallback = null;

// Define callback para quando um objeto for carregado
export function setOnObjectLoadedCallback(callback) {
  onObjectLoadedCallback = callback;
}

// Wrappers para funções que precisam do `objects`/callback compartilhados
export function loadCharacterWithAnimations(scene) {
  return _loadCharacterWithAnimations(scene, objects, onObjectLoadedCallback);
}

// Carrega todos os objetos da cena
export function loadAllObjects(scene) {
  loadCharacterWithAnimations(scene);
}

export function createTreesFrom3DS(scene, options = {}) {
  return _createTreesFrom3DS(scene, options, objects, onObjectLoadedCallback);
}

export function createTreeRowFrom3DS(scene, options = {}) {
  return _createTreeRowFrom3DS(scene, options, objects, onObjectLoadedCallback);
}

export function createBenchesAlongPath(scene, options = {}) {
  return _createBenchesAlongPath(
    scene,
    options,
    objects,
    onObjectLoadedCallback
  );
}
