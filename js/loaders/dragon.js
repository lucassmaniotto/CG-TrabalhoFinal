import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

import { CONFIG } from "../config.js";
import { addExternalMixer } from "../animation.js";

// Carrega uma textura via Promise (para podermos usar async/await e tratar falhas)
function loadTextureAsync(url) {
  const textureLoader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    textureLoader.load(url, resolve, undefined, reject);
  });
}

// Garante que texturas de cor (albedo/diffuse) sejam interpretadas como sRGB
function setSRGB(tex) {
  if (!tex) return;
  try {
    tex.colorSpace = THREE.SRGBColorSpace;
  } catch (e) {
    try {
      tex.encoding = THREE.sRGBEncoding;
    } catch (e2) {}
  }
}

// Força o material a ser renderizável mesmo se o FBX vier com flags “estranhas”
function forceMaterialRenderable(material) {
  if (!material) return;

  material.transparent = false;
  material.opacity = 1;
  material.alphaTest = 0;
  material.depthWrite = true;
  material.colorWrite = true;
  material.side = THREE.DoubleSide;
  if ("transmission" in material) material.transmission = 0;
  material.needsUpdate = true;
}

// Escolhe um clip de animação idle, preferindo por índice (se passado) ou por nome
function pickIdleClip(clips, preferredIndex = null) {
  if (!clips || !clips.length) return null;
  if (typeof preferredIndex === "number" && clips[preferredIndex]) {
    return clips[preferredIndex];
  }
  return clips.find((c) => /idle/i.test(c.name)) || clips[0];
}

// Centro do cercado onde o dragão deve ficar posicionado
function getCorralCenter() {
  const c = CONFIG.corral;
  return {
    x: (c.xMin + c.xMax) / 2,
    z: (c.zMin + c.zMax) / 2,
  };
}

// Loader do dragão:
// 1) carrega o FBX
// 2) aplica posição/escala/rotação
// 3) tenta carregar texturas fornecidas (corrige FBX sem referências corretas)
// 4) substitui materiais por MeshStandardMaterial
// 5) inicia animação idle (se existir)
export function loadDragon(scene, objects, onObjectLoadedCallback) {
  const { modelPath, texturesDir, scale, rotationY, yOffset, idleIndex } =
    CONFIG.dragon;

  const loader = new FBXLoader();
  loader.setResourcePath(texturesDir);

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (dragon) => {
        // Encapsula o pós-processamento em async para usar await nas texturas
        const applyAndResolve = async () => {
          const { x, z } = getCorralCenter();
          const groundY = CONFIG.corral.groundY;

          // Transformações base do modelo
          dragon.visible = true;
          dragon.position.set(x, groundY + yOffset, z);
          dragon.scale.set(scale, scale, scale);
          dragon.rotation.y = rotationY;

          // Texturas fornecidas (evita dragão preto quando o FBX não referencia corretamente)
          // Obs: usamos allSettled para não falhar o carregamento do dragão se uma textura faltar.
          const base = texturesDir;
          const [diffuseRes, bumpRes, norRes, norMirrorRes] =
            await Promise.allSettled([
              loadTextureAsync(base + "Dragon_ground_color.jpg"),
              loadTextureAsync(base + "Dragon_Bump_Col2.jpg"),
              loadTextureAsync(base + "Dragon_Nor.jpg"),
              loadTextureAsync(base + "Dragon_Nor_mirror2.jpg"),
            ]);

          const diffuseTex =
            diffuseRes.status === "fulfilled" ? diffuseRes.value : null;
          const bumpTex = bumpRes.status === "fulfilled" ? bumpRes.value : null;
          const normalTex =
            norRes.status === "fulfilled"
              ? norRes.value
              : norMirrorRes.status === "fulfilled"
              ? norMirrorRes.value
              : null;

          setSRGB(diffuseTex);

          // Substitui materiais do FBX por um material PBR consistente
          dragon.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.visible = true;
            // Evita o modelo "sumir" por frustum culling quando bounding box vem ruim do FBX
            child.frustumCulled = false;
            child.castShadow = true;
            child.receiveShadow = false;

            const mat = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              map: diffuseTex || null,
              normalMap: normalTex || null,
              bumpMap: bumpTex || null,
              roughness: 1.0,
              metalness: 0.0,
              side: THREE.DoubleSide,
            });
            mat.bumpScale = 0.2;
            child.material = mat;
            forceMaterialRenderable(child.material);
          });

          // Atualiza matrizes após mudar materiais/transformações
          dragon.updateMatrixWorld(true);

          // Animação: tenta tocar um idle; se não existir, o dragão fica estático
          const clips = dragon.animations || [];
          const idleClip = pickIdleClip(clips, idleIndex);
          if (idleClip) {
            const mixer = new THREE.AnimationMixer(dragon);
            // Registra o mixer no sistema global de animação para ser atualizado no loop
            addExternalMixer(mixer);
            mixer.clipAction(idleClip).reset().play();
          } else {
            console.warn("Dragão carregado sem AnimationClips.");
          }

          // Adiciona na cena e registra no dicionário global de objetos
          scene.add(dragon);
          if (objects) objects["dragon"] = dragon;
          if (onObjectLoadedCallback) onObjectLoadedCallback("Dragon", dragon);
          resolve(dragon);
        };

        applyAndResolve().catch(reject);
      },
      undefined,
      (err) => reject(err)
    );
  });
}
