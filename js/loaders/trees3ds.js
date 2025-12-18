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

// Cria uma fileira de árvores ao longo de um caminho definido por início/fim
export async function createTreeRowFrom3DS(
  scene,
  options = {},
  objects,
  onObjectLoadedCallback
) {
  // Junta defaults do CONFIG com overrides recebidos em `options`.
  // Assim dá para chamar `createTreeRowFrom3DS(scene, { count: 20, side: 'right' })`
  // sem ter que repetir toda a configuração.
  const defaults = CONFIG.treeRow || {};
  const opts = Object.assign({}, defaults, options);

  // Se o chamador não passou `groundY`, usamos a altura do chão configurada na cena.
  // Isso garante que as árvores fiquem “assentadas” no solo.
  if (typeof opts.groundY !== "number") {
    opts.groundY =
      CONFIG.scene && CONFIG.scene.groundPosition
        ? CONFIG.scene.groundPosition.y
        : 0;
  }

  // Em qual lado do caminho a fileira vai ficar.
  const side = opts.side || "left";

  try {
    // 1) Carrega o modelo base (.3ds) e configura sombras.
    const object = await loadTDS(opts.modelPath);
    setMeshShadows(object);

    // 2) Carrega texturas (se existirem) e cria materiais.
    // OBS: dependendo de como o modelo foi exportado, esses materiais podem ser
    // usados dentro do clone (ex.: se o `loadTDS` já associa materiais/texturas).
    // Aqui eles ficam prontos para uso/ajustes, se necessário.
    const baseTexDir = CONFIG.trees.texturesDir;
    const textures = await loadTreeTextures(baseTexDir);
    const { trunkMaterial, leafMaterial } = createTreeMaterials(textures);

    // 3) Calcula o vetor do caminho (start -> end) e um vetor perpendicular.
    // Esse perpendicular serve para “empurrar” as árvores para a esquerda/direita do caminho.
    const dx = opts.endX - opts.startX;
    const dz = opts.endZ - opts.startZ;
    let perpX = -dz;
    let perpZ = dx;
    if (side === "right") {
      perpX = -perpX;
      perpZ = -perpZ;
    }

    // Normaliza o perpendicular para ter comprimento 1 e facilitar o deslocamento por `opts.offset`.
    const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
    const nx = perpX / perpLen;
    const nz = perpZ / perpLen;

    // Vamos guardar as instâncias criadas para também registrar no `objects`.
    const instances = [];
    for (let i = 0; i < opts.count; i++) {
      // `t` varia de 0..1 e define a interpolação ao longo do caminho.
      // Se só houver 1 árvore, colocamos no meio (t=0.5).
      const t = opts.count > 1 ? i / (opts.count - 1) : 0.5;
      const xOnPath = opts.startX + dx * t;
      const zOnPath = opts.startZ + dz * t;

      // Aplica o offset lateral (esquerda/direita) com base no vetor perpendicular normalizado.
      const x = xOnPath + nx * opts.offset;
      const z = zOnPath + nz * opts.offset;

      // 4) Cria uma cópia (clone) do modelo base para ser uma árvore independente.
      const clone = object.clone(true);

      // Escala aleatória entre [scaleMin, scaleMax] para dar variação visual.
      const s = opts.scaleMin + Math.random() * (opts.scaleMax - opts.scaleMin);
      clone.scale.set(s, s, s);

      // Rotação base do modelo (ex.: se o .3ds veio “de lado”).
      if (opts.modelRotation) {
        clone.rotation.x = opts.modelRotation.x || 0;
        clone.rotation.y = opts.modelRotation.y || 0;
        clone.rotation.z = opts.modelRotation.z || 0;
      }

      // Coloca a árvore no mundo: x/z pelo caminho+offset, y no chão + yOffset.
      clone.position.set(x, opts.groundY + opts.yOffset, z);

      // Alinha a árvore “virada” aproximadamente para acompanhar a direção do caminho,
      // com uma pequena variação aleatória de yaw para evitar repetição.
      const pathYaw = Math.atan2(dx, dz);
      const variation = (Math.random() - 0.5) * opts.randomYaw;
      clone.rotation.y += pathYaw + Math.PI / 2 + variation;

      // 5) Adiciona na cena e guarda a instância.
      scene.add(clone);
      instances.push(clone);

      // Se alguém registrou callback (via wrapper em `loaders.js`), notifica cada instância criada.
      if (onObjectLoadedCallback) {
        onObjectLoadedCallback("TreeRow", clone);
      }
    }

    // 6) Registra no dicionário compartilhado `objects` (mantido em `loaders.js`).
    // Esse registro permite que o resto do app acesse/gerencie depois (por exemplo, remover, animar, etc.).
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
