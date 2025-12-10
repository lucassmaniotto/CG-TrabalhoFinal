import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { CONFIG } from "./config.js";

const textureLoader = new THREE.TextureLoader();
export const objects = {};

let onObjectLoadedCallback = null;

// Define callback para quando um objeto for carregado
export function setOnObjectLoadedCallback(callback) {
  onObjectLoadedCallback = callback;
}

// Helper para carrega um FBX e devolve uma Promise
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
    objects["player"] = character;

    if (onObjectLoadedCallback) {
      onObjectLoadedCallback("Player", character);
    }
  } catch (error) {
    console.error("Erro ao carregar o personagem com animações:", error);
  }
}

// Carrega todos os objetos da cena
export function loadAllObjects(scene) {
  loadCharacterWithAnimations(scene);
}

// Carrega textura do chão
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

// Cria um caminho de pedra na cena
export function createStonePath(scene, config = {}) {
  const {
    startX = 0,
    startZ = -15,
    endX = 0,
    endZ = 600,
    width = 30,
    segments = 15,
    texturePath = "./assets/Floor/textura_pedra.jpg", // Caminho da textura
  } = config;

  // Carrega a textura
  const stoneTexture = textureLoader.load(
    texturePath,
    (tex) => {
      try {
        tex.encoding = THREE.sRGBEncoding;
      } catch (e) {}
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(5, 5); // Ajuste conforme necessário
    },
    undefined,
    (err) => {
      console.warn("Não foi possível carregar a textura do caminho de pedra", err);
    }
  );

  // Material da pedra com textura
  const stoneMaterial = new THREE.MeshStandardMaterial({
    map: stoneTexture,
    roughness: 0.85,
    metalness: 0.0,
  });

  // Cria segmentos do caminho
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const nextT = (i + 1) / segments;

    // Interpolação linear
    const x1 = startX + (endX - startX) * t;
    const z1 = startZ + (endZ - startZ) * t;
    const x2 = startX + (endX - startX) * nextT;
    const z2 = startZ + (endZ - startZ) * nextT;

    // Calcula direção e comprimento do segmento
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);

    // Cria geometria do segmento
    const geometry = new THREE.BoxGeometry(width, 0.15, length);
    const mesh = new THREE.Mesh(geometry, stoneMaterial);

    // Posiciona no centro do segmento
    mesh.position.set((x1 + x2) / 2, -4.83, (z1 + z2) / 2);

    // Rotaciona para alinhar com a direção
    if (length > 0) {
      mesh.rotation.y = Math.atan2(dx, dz);
    }

    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
  }

  console.log("Caminho de pedra criado!");
}
