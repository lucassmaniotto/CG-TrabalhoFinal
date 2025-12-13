import { loadCharacterWithAnimations as _loadCharacterWithAnimations } from "./loaders/player.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { TDSLoader } from "three/addons/loaders/TDSLoader.js";

import {
  createTreesFrom3DS as _createTreesFrom3DS,
  createTreeRowFrom3DS as _createTreeRowFrom3DS,
} from "./loaders/trees3ds.js";

export { loadGroundTexture, createStonePath } from "./loaders/stonePath.js";
import { createBenchesAlongPath as _createBenchesAlongPath } from "./loaders/bench.js";

export const objects = {};

let onObjectLoadedCallback = null;

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

// Helper para carregar um .3ds e devolver uma Promise
export function loadTDS(path) {
  const loader = new TDSLoader();
  const base = path.substring(0, path.lastIndexOf("/") + 1);
  const texturesBase = base + "textures/";
  loader.setResourcePath(texturesBase);

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (object) => resolve(object),
      undefined,
      (error) => reject(error)
    );
  });
}

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
