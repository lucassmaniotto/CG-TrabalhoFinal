import * as THREE from "three";
import { loadFBX } from "./fbx.js";
import { CONFIG } from "../config.js";

const textureLoader = new THREE.TextureLoader();

// tenta carregar uma textura e retorna null em caso de erro
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

// tenta uma lista de candidatos e devolve a primeira textura carregada (ou null)
// (removed: previously tried multiple candidate names) kept loader simple

// Cria uma fileira/linha de bancos ao longo de um caminho definido por start/end
export async function createBenchesAlongPath(scene, options = {}, objects, onObjectLoadedCallback) {
  const {
    modelPath = "./assets/models/Bench/Bench.fbx",
    count = 8,
    startX = 0,
    startZ = -15,
    endX = 0,
    endZ = 600,
    offset = 20, // distância perpendicular do caminho
    side = "right", // 'left' or 'right'
    scale = 1.0,
    yOffset = 0,
    modelRotation = { x: 0, y: 0, z: 0 },
  } = options;

  try {
    const object = await loadFBX(modelPath);
    object.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = false; } });

    // carregar texturas exatas fornecidas pelo usuário (nome fixo)
    const baseTexDir = modelPath.substring(0, modelPath.lastIndexOf("/") + 1) + "textures/";
    const baseColorPromise = loadOptionalTexture(baseTexDir + "Bench_Base_Color_4K.png");
    const metalnessPromise = loadOptionalTexture(baseTexDir + "Bench_Metallic_4K.png");
    const normalPromise = loadOptionalTexture(baseTexDir + "Bench_Normal_4K.png");
    const roughnessPromise = loadOptionalTexture(baseTexDir + "Bench_Roughness_4K.png");

    const [baseColorTex, metalnessTex, normalTex, roughnessTex] = await Promise.all([
      baseColorPromise,
      metalnessPromise,
      normalPromise,
      roughnessPromise,
    ]);

    // se existir baseColor, definir encoding correto
    if (baseColorTex) {
      try { baseColorTex.encoding = THREE.sRGBEncoding; } catch (e) {}
    }

    // cria material base apenas se alguma textura foi encontrada
    let materialTemplate = null;
    if (baseColorTex || roughnessTex || metalnessTex || normalTex) {
      materialTemplate = new THREE.MeshStandardMaterial({
        map: baseColorTex || undefined,
        roughnessMap: roughnessTex || undefined,
        metalnessMap: metalnessTex || undefined,
        normalMap: normalTex || undefined,
      });
      // Ajustes sensíveis aos mapas
      if (metalnessTex) materialTemplate.metalness = 1.0;
      if (roughnessTex) materialTemplate.roughness = 1.0;
      if (normalTex) materialTemplate.normalScale = new THREE.Vector2(1, 1);
    }

    const dx = endX - startX;
    const dz = endZ - startZ;
    // vetor perpendicular: à esquerda = (-dz, dx), à direita = (dz, -dx)
    let perpX = -dz;
    let perpZ = dx;
    if (side === 'right') { perpX = -perpX; perpZ = -perpZ; }
    const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
    const nx = perpX / perpLen;
    const nz = perpZ / perpLen;

    const instances = [];
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      const xOnPath = startX + dx * t;
      const zOnPath = startZ + dz * t;

      const x = xOnPath + nx * offset;
      const z = zOnPath + nz * offset;

      const clone = object.clone(true);
      clone.scale.set(scale, scale, scale);

      // aplicar material com texturas apenas aos meshes do clone (não modifica outros objetos)
      if (materialTemplate) {
        clone.traverse((m) => {
          if (m.isMesh) {
            // substitui material por uma cópia do template para permitir ajustes individuais
            m.material = materialTemplate.clone();
          }
        });
      }

      // aplica rotação base do modelo (se necessário)
      if (modelRotation) {
        clone.rotation.x = modelRotation.x || 0;
        clone.rotation.y = modelRotation.y || 0;
        clone.rotation.z = modelRotation.z || 0;
      }

      // orienta para olhar em direção ao caminho
      const pathYaw = Math.atan2(dx, dz);
      clone.rotation.y += pathYaw + Math.PI; // virar para olhar para o centro do caminho

      clone.position.set(x, (CONFIG.scene && CONFIG.scene.groundPosition ? CONFIG.scene.groundPosition.y : 0) + yOffset, z);
      scene.add(clone);
      instances.push(clone);

      if (onObjectLoadedCallback) onObjectLoadedCallback('Bench', clone);
    }

    if (objects) objects['benches'] = objects['benches'] ? objects['benches'].concat(instances) : instances;
    console.log(`Instanciados ${instances.length} bancos a partir de ${modelPath}`);
  } catch (err) {
    console.error('Erro carregando Bench FBX:', err);
  }
}
