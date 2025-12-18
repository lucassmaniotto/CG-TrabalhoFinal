import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

import { CONFIG } from "../config.js";
import { addExternalMixer } from "../animation.js";

function loadTextureAsync(url) {
  const textureLoader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    textureLoader.load(url, resolve, undefined, reject);
  });
}

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

function pickIdleClip(clips, preferredIndex = null) {
  if (!clips || !clips.length) return null;
  if (typeof preferredIndex === "number" && clips[preferredIndex]) {
    return clips[preferredIndex];
  }
  return clips.find((c) => /idle/i.test(c.name)) || clips[0];
}

function getCorralCenter() {
  const c = CONFIG.corral;
  if (!c) return { x: 0, z: 0 };
  return {
    x: (c.xMin + c.xMax) / 2,
    z: (c.zMin + c.zMax) / 2,
  };
}

export function loadDragon(scene, objects, onObjectLoadedCallback) {
  const { modelPath, texturesDir, scale, rotationY, yOffset, idleIndex } =
    CONFIG.dragon;

  const loader = new FBXLoader();
  if (texturesDir) loader.setResourcePath(texturesDir);

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (dragon) => {
        const applyAndResolve = async () => {
          const { x, z } = getCorralCenter();
          const groundY = CONFIG.corral?.groundY ?? CONFIG.character.basePosition.y;

          dragon.visible = true;
          dragon.position.set(x, groundY + (yOffset || 0), z);
          const safeScale = typeof scale === "number" && scale > 0 ? scale : 0.01;
          dragon.scale.set(safeScale, safeScale, safeScale);
          dragon.rotation.y = rotationY || 0;

          // Texturas fornecidas (evita dragão preto quando FBX não referencia corretamente)
          const base = texturesDir || "";
          const [diffuseRes, bumpRes, norRes, norMirrorRes] =
            await Promise.allSettled([
              loadTextureAsync(base + "Dragon_ground_color.jpg"),
              loadTextureAsync(base + "Dragon_Bump_Col2.jpg"),
              loadTextureAsync(base + "Dragon_Nor.jpg"),
              loadTextureAsync(base + "Dragon_Nor_mirror2.jpg"),
            ]);

          const diffuseTex = diffuseRes.status === "fulfilled" ? diffuseRes.value : null;
          const bumpTex = bumpRes.status === "fulfilled" ? bumpRes.value : null;
          const normalTex =
            norRes.status === "fulfilled"
              ? norRes.value
              : norMirrorRes.status === "fulfilled"
                ? norMirrorRes.value
                : null;

          setSRGB(diffuseTex);

          dragon.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.visible = true;
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

          dragon.updateMatrixWorld(true);

          const clips = dragon.animations || [];
          const idleClip = pickIdleClip(clips, idleIndex);
          if (idleClip) {
            const mixer = new THREE.AnimationMixer(dragon);
            addExternalMixer(mixer);
            mixer.clipAction(idleClip).reset().play();
          } else {
            console.warn("Dragão carregado sem AnimationClips.");
          }

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
