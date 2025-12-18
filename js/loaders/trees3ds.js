import { CONFIG } from "../config.js";
import { loadTDS } from "../loaders.js";
import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

// Tenta carregar uma textura e retorna null em caso de erro
function loadOptionalTexture(path) {
  return new Promise((resolve) => {
    textureLoader.load(
      path,
      (tex) => resolve(tex),
      undefined,
      () => resolve(null)
    );
  });
}

// Configura sombras para malhas do objeto
function setMeshShadows(object) {
  object.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = false;
    }
  });
}

// Carrega as três texturas usadas pelas árvores (caso existam)
async function loadTreeTextures(baseTexDir) {
  const barkPromise = loadOptionalTexture(baseTexDir + "bark_loo.jpg");
  const leafColorPromise = loadOptionalTexture(baseTexDir + "blatt1.jpg");
  const leafAlphaPromise = loadOptionalTexture(baseTexDir + "blatt1_a.jpg");

  const [barkTex, leafColorTex, leafAlphaTex] = await Promise.all([
    barkPromise,
    leafColorPromise,
    leafAlphaPromise,
  ]);

  if (barkTex) {
    try {
      barkTex.encoding = THREE.sRGBEncoding;
    } catch (e) {}
  }
  if (leafColorTex) {
    try {
      leafColorTex.encoding = THREE.sRGBEncoding;
    } catch (e) {}
  }

  return { barkTex, leafColorTex, leafAlphaTex };
}

// Cria materiais a partir das texturas carregadas
function createTreeMaterials({ barkTex, leafColorTex, leafAlphaTex }) {
  let trunkMaterial = null;
  let leafMaterial = null;
  if (barkTex) {
    trunkMaterial = new THREE.MeshStandardMaterial({ map: barkTex });
  }
  if (leafColorTex || leafAlphaTex) {
    leafMaterial = new THREE.MeshStandardMaterial({
      map: leafColorTex || undefined,
      alphaMap: leafAlphaTex || undefined,
      transparent: !!leafAlphaTex,
      side: THREE.DoubleSide,
    });
    if (leafAlphaTex) leafMaterial.alphaTest = 0.5;
  }
  return { trunkMaterial, leafMaterial };
}

export async function createTreeRowFrom3DS(
  scene,
  options = {},
  objects,
  onObjectLoadedCallback
) {
  const defaults = CONFIG.treeRow || {};
  const opts = Object.assign({}, defaults, options);

  if (typeof opts.groundY !== "number") {
    opts.groundY =
      CONFIG.scene && CONFIG.scene.groundPosition
        ? CONFIG.scene.groundPosition.y
        : 0;
  }

  const side = opts.side || "left";

  try {
    const object = await loadTDS(opts.modelPath);
    setMeshShadows(object);
    const baseTexDir = CONFIG.trees.texturesDir;
    const textures = await loadTreeTextures(baseTexDir);
    const { trunkMaterial, leafMaterial } = createTreeMaterials(textures);

    const dx = opts.endX - opts.startX;
    const dz = opts.endZ - opts.startZ;
    let perpX = -dz;
    let perpZ = dx;
    if (side === "right") {
      perpX = -perpX;
      perpZ = -perpZ;
    }
    const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
    const nx = perpX / perpLen;
    const nz = perpZ / perpLen;

    const instances = [];
    for (let i = 0; i < opts.count; i++) {
      const t = opts.count > 1 ? i / (opts.count - 1) : 0.5;
      const xOnPath = opts.startX + dx * t;
      const zOnPath = opts.startZ + dz * t;

      const x = xOnPath + nx * opts.offset;
      const z = zOnPath + nz * opts.offset;

      const clone = object.clone(true);
      const s = opts.scaleMin + Math.random() * (opts.scaleMax - opts.scaleMin);
      clone.scale.set(s, s, s);

      if (opts.modelRotation) {
        clone.rotation.x = opts.modelRotation.x || 0;
        clone.rotation.y = opts.modelRotation.y || 0;
        clone.rotation.z = opts.modelRotation.z || 0;
      }

      clone.position.set(x, opts.groundY + opts.yOffset, z);

      const pathYaw = Math.atan2(dx, dz);
      const variation = (Math.random() - 0.5) * opts.randomYaw;
      clone.rotation.y += pathYaw + Math.PI / 2 + variation;

      scene.add(clone);
      instances.push(clone);

      if (onObjectLoadedCallback) {
        onObjectLoadedCallback("TreeRow", clone);
      }
    }

    if (objects)
      objects["treeRows"] = objects["treeRows"]
        ? objects["treeRows"].concat(instances)
        : instances;
    console.log(
      `Fileira de ${opts.count} árvores criada (${opts.modelPath}) lado=${side}`
    );
  } catch (err) {
    console.error("Erro carregando .3ds para fileira:", err);
  }
}
