import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { TDSLoader } from "three/addons/loaders/TDSLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

import { loadCharacterWithAnimations as _loadCharacterWithAnimations } from "./loaders/player.js";
import { loadNPC1Walking as _loadNPC1Walking } from "./loaders/NPCs/npc1.js";
import { loadNPC2Walking as _loadNPC2Walking } from "./loaders/NPCs/npc2.js";
import { loadDragon as _loadDragon } from "./loaders/dragon.js";
import { loadMonkeys as _loadMonkeys } from "./loaders/monkey.js";
import { loadHorses as _loadHorses } from "./loaders/horse.js";

import {
  createTreesFrom3DS as _createTreesFrom3DS,
  createTreeRowFrom3DS as _createTreeRowFrom3DS,
} from "./loaders/trees3ds.js";

export { loadGroundTexture, createStonePath } from "./loaders/stonePath.js";
import { createBenchesAlongPath as _createBenchesAlongPath } from "./loaders/bench.js";
import { createStreetLampsAlongPath as _createStreetLampsAlongPath } from "./loaders/streetLamp.js";
import { createFence as _createFence } from "./loaders/fence.js";
import { createFence2 as _createFence2 } from "./loaders/fence.js";
import { createFence3 as _createFence3 } from "./loaders/fence.js";
import { createFence4 as _createFence4 } from "./loaders/fence.js";
import { createFence5 as _createFence5 } from "./loaders/fence.js";
import { createFence6 as _createFence6 } from "./loaders/fence.js";

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

// Helper para carregar um OBJ com seu MTL e devolver uma Promise
// `resourcePath` deve apontar para a pasta onde estão as texturas referenciadas pelo .mtl
export function loadOBJWithMTL({ objPath, mtlPath, resourcePath = null }) {
  const mtlLoader = new MTLLoader();
  if (resourcePath) {
    mtlLoader.setResourcePath(resourcePath);
  } else {
    const basePath = mtlPath.substring(0, mtlPath.lastIndexOf("/") + 1);
    mtlLoader.setResourcePath(basePath);
  }

  return new Promise((resolve, reject) => {
    mtlLoader.load(
      mtlPath,
      (materials) => {
        try {
          materials.preload();
        } catch (e) {}

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
          objPath,
          (object) => resolve(object),
          undefined,
          (error) => reject(error)
        );
      },
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

export function loadNPC1Walking(scene) {
  return _loadNPC1Walking(scene, objects, onObjectLoadedCallback);
}

export function loadNPC2Walking(scene) {
  return _loadNPC2Walking(scene, objects, onObjectLoadedCallback);
}

export function loadDragon(scene) {
  return _loadDragon(scene, objects, onObjectLoadedCallback);
}

export function loadMonkeys(scene) {
  return _loadMonkeys(scene, objects, onObjectLoadedCallback);
}

export function loadHorses(scene) {
  return _loadHorses(scene, objects, onObjectLoadedCallback);
}

// Carrega todos os objetos da cena
export function loadAllObjects(scene) {
  loadCharacterWithAnimations(scene);
  loadNPC1Walking(scene);
  loadNPC2Walking(scene);
  loadDragon(scene);
  loadMonkeys(scene);
  loadHorses(scene);
  loadFence(scene); // Adiciona carregamento da cerca
  loadFence2(scene); // Adiciona carregamento da cerca
  loadFence3(scene); // Adiciona carregamento da cerca
  loadFence4(scene); // Adiciona carregamento da cerca
  loadFence5(scene); // Adiciona carregamento da cerca
  loadFence6(scene); // Adiciona carregamento da cerca
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

export function createStreetLampsAlongPath(scene, options = {}) {
  return _createStreetLampsAlongPath(
    scene,
    options,
    objects,
    onObjectLoadedCallback
  );
}

export function loadFence(scene, options = {}) {
  return _createFence(scene, options).then((fences) => {
    // Adiciona ao objects e chama callback
    fences.forEach((fence, index) => {
      objects[`fence${index + 1}`] = fence;
      if (onObjectLoadedCallback) {
        onObjectLoadedCallback(`fence${index + 1}`, fence);
      }
    });
    return fences;
  });
}

export function loadFence2(scene, options = {}) {
  return _createFence2(scene, options).then((fences) => {
    // Adiciona ao objects e chama callback
    fences.forEach((fence, index) => {
      objects[`fence${index + 1}`] = fence;
      if (onObjectLoadedCallback) {
        onObjectLoadedCallback(`fence${index + 1}`, fence);
      }
    });
    return fences;
  });
}

export function loadFence3(scene, options = {}) {
  return _createFence3(scene, options).then((fences) => {
    // Adiciona ao objects e chama callback
    fences.forEach((fence, index) => {
      objects[`fence${index + 1}`] = fence;
      if (onObjectLoadedCallback) {
        onObjectLoadedCallback(`fence${index + 1}`, fence);
      }
    });
    return fences;
  });
}

export function loadFence4(scene, options = {}) {
  return _createFence4(scene, options).then((fences) => {
    // Adiciona ao objects e chama callback
    fences.forEach((fence, index) => {
      objects[`fence${index + 1}`] = fence;
      if (onObjectLoadedCallback) {
        onObjectLoadedCallback(`fence${index + 1}`, fence);
      }
    });
    return fences;
  });
}

export function loadFence5(scene, options = {}) {
  return _createFence5(scene, options).then((fences) => {
    // Adiciona ao objects e chama callback
    fences.forEach((fence, index) => {
      objects[`fence${index + 1}`] = fence;
      if (onObjectLoadedCallback) {
        onObjectLoadedCallback(`fence${index + 1}`, fence);
      }
    });
    return fences;
  });
}

export function loadFence6(scene, options = {}) {
  return _createFence6(scene, options).then((fences) => {
    // Adiciona ao objects e chama callback
    fences.forEach((fence, index) => {
      objects[`fence${index + 1}`] = fence;
      if (onObjectLoadedCallback) {
        onObjectLoadedCallback(`fence${index + 1}`, fence);
      }
    });
    return fences;
  });
}