import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { TDSLoader } from "three/addons/loaders/TDSLoader.js";
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
    width = 55,
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

// Carrega e instancia um modelo .3ds (usa TDSLoader e aplica texturas da pasta)
export async function createTreesFrom3DS(scene, options = {}) {
  const {
    modelPath = "./assets/models/Tree/Tree1.3ds",
    count = 10,
    areaWidth = 120,
    areaDepth = 120,
    groundY = CONFIG.scene.groundPosition.y,
    avoidArea = null,
    scaleMin = 0.8,
    scaleMax = 1.2,
    modelRotation = { x: 0, y: 0, z: 0 },
  } = options;

  return new Promise((resolve) => {
    const loader = new TDSLoader();
    // define pasta para recursos (texturas)
    const base = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);
    loader.setResourcePath(base);

    loader.load(
      modelPath,
      (object) => {
        // object é um Group / Object3D
        object.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = false;
          }
        });

        for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * areaWidth;
          const z = (Math.random() - 0.5) * areaDepth;

          if (avoidArea) {
            const dx = x - (avoidArea.x || 0);
            const dz = z - (avoidArea.z || 0);
            if (Math.sqrt(dx * dx + dz * dz) < (avoidArea.radius || 0)) {
              i--; continue;
            }
          }

          const clone = object.clone(true);
          const s = scaleMin + Math.random() * (scaleMax - scaleMin);
          clone.scale.set(s, s, s);
          // apply optional model rotation correction (useful if model axis differs)
          if (modelRotation) {
            clone.rotation.x += modelRotation.x || 0;
            clone.rotation.y += modelRotation.y || 0;
            clone.rotation.z += modelRotation.z || 0;
          }
          clone.position.set(x, groundY, z);
          clone.rotation.y += Math.random() * Math.PI * 2;
          scene.add(clone);
        }

        console.log(`Instanciadas ${count} árvores (.3ds) a partir de ${modelPath}`);
        resolve();
      },
      undefined,
      (err) => {
        console.error("Erro carregando .3ds:", err);
        resolve();
      }
    );
  });
}

// Cria uma fileira de árvores à esquerda do caminho definido por start/end
export async function createTreeRowFrom3DS(scene, options = {}) {
  // Merge options with defaults in CONFIG.treeRow (if present)
  const defaults = CONFIG.treeRow || {};
  const opts = Object.assign({}, defaults, options);

  // Resolve groundY: if not numeric, fall back to CONFIG.scene.groundPosition.y
  if (typeof opts.groundY !== "number") {
    opts.groundY = CONFIG.scene && CONFIG.scene.groundPosition
      ? CONFIG.scene.groundPosition.y
      : 0;
  }

  // side: 'left' or 'right' - decide o sinal do vetor perpendicular
  const side = opts.side || 'left';

  return new Promise((resolve) => {
    const loader = new TDSLoader();
    const base = opts.modelPath.substring(0, opts.modelPath.lastIndexOf('/') + 1);
    loader.setResourcePath(base);

    loader.load(
      opts.modelPath,
      (object) => {
        object.traverse((c) => {
          if (c.isMesh) { c.castShadow = true; c.receiveShadow = false; }
        });

        // direção do caminho
        const dx = opts.endX - opts.startX;
        const dz = opts.endZ - opts.startZ;
        // vetor perpendicular: à esquerda = (-dz, dx), à direita = (dz, -dx)
        let perpX = -dz;
        let perpZ = dx;
        if (side === 'right') {
          perpX = -perpX;
          perpZ = -perpZ;
        }
        const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
        const nx = perpX / perpLen;
        const nz = perpZ / perpLen;

        for (let i = 0; i < opts.count; i++) {
          const t = opts.count > 1 ? i / (opts.count - 1) : 0.5;
          const xOnPath = opts.startX + dx * t;
          const zOnPath = opts.startZ + dz * t;

          const x = xOnPath + nx * opts.offset;
          const z = zOnPath + nz * opts.offset;

          const clone = object.clone(true);
          const s = opts.scaleMin + Math.random() * (opts.scaleMax - opts.scaleMin);
          clone.scale.set(s, s, s);

          // apply optional model rotation correction (set, not add)
          if (opts.modelRotation) {
            clone.rotation.x = (opts.modelRotation.x || 0);
            clone.rotation.y = (opts.modelRotation.y || 0);
            clone.rotation.z = (opts.modelRotation.z || 0);
          }

          clone.position.set(x, opts.groundY + opts.yOffset, z);

          // Orienta levemente em direção do caminho com uma pequena variação (add to modelRotation.y)
          const pathYaw = Math.atan2(dx, dz);
          const variation = (Math.random() - 0.5) * opts.randomYaw;
          clone.rotation.y += pathYaw + Math.PI / 2 + variation;

          scene.add(clone);
        }

        console.log(`Fileira de ${opts.count} árvores criada (${opts.modelPath}) lado=${side}`);
        resolve();
      },
      undefined,
      (err) => { console.error("Erro carregando .3ds para fileira:", err); resolve(); }
    );
  });
}
