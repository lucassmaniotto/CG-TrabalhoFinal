import * as THREE from "three";
import { CONFIG } from "../config.js";
import { loadFBX } from "../loaders.js";

const textureLoader = new THREE.TextureLoader();

function setColorTextureEncoding(tex) {
  if (!tex) return;
  // three r152+: colorSpace; versões antigas: encoding
  if ("colorSpace" in tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
  } else {
    try {
      tex.encoding = THREE.sRGBEncoding;
    } catch (e) {}
  }
}

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

export async function createStreetLampsAlongPath(
  scene,
  options = {},
  objects,
  onObjectLoadedCallback
) {
  const defaults = Object.assign({}, CONFIG.streetLamps || {});
  const {
    modelPath = defaults.modelPath,
    texturesDir = defaults.texturesDir,
    count = defaults.count,
    startX = defaults.startX,
    startZ = defaults.startZ,
    endX = defaults.endX,
    endZ = defaults.endZ,
    offset = defaults.offset,
    side = defaults.side,
    scale = defaults.scale,
    yOffset = defaults.yOffset,
    modelRotation = defaults.modelRotation,
  } = Object.assign({}, defaults, options);

  try {
    const object = await loadFBX(modelPath);
    object.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    const baseTexDir =
      texturesDir ||
      modelPath.substring(0, modelPath.lastIndexOf("/") + 1) + "textures/";

    const albedoPromise = loadOptionalTexture(
      baseTexDir + "street_light_albedo.png"
    );
    const normalPromise = loadOptionalTexture(
      baseTexDir + "street_light_normal.png"
    );
    const metallicPromise = loadOptionalTexture(
      baseTexDir + "street_light_metallic.png"
    );
    const aoPromise = loadOptionalTexture(baseTexDir + "street_light_ao.png");

    const [albedoTex, normalTex, metallicTex, aoTex] = await Promise.all([
      albedoPromise,
      normalPromise,
      metallicPromise,
      aoPromise,
    ]);

    setColorTextureEncoding(albedoTex);

    let materialTemplate = null;
    if (albedoTex || normalTex || metallicTex || aoTex) {
      materialTemplate = new THREE.MeshStandardMaterial({
        map: albedoTex || undefined,
        normalMap: normalTex || undefined,
        metalnessMap: metallicTex || undefined,
        aoMap: aoTex || undefined,
      });

      if (metallicTex) materialTemplate.metalness = 1.0;
    }

    const dx = endX - startX;
    const dz = endZ - startZ;

    // vetor perpendicular: à esquerda = (-dz, dx), à direita = (dz, -dx)
    let perpX = -dz;
    let perpZ = dx;
    if (side === "left") {
      perpX = -perpX;
      perpZ = -perpZ;
    }

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

      if (materialTemplate) {
        clone.traverse((m) => {
          if (m.isMesh) {
            m.material = materialTemplate.clone();

            // aoMap precisa de uv2; se não houver, duplica uv -> uv2
            if (m.geometry && m.geometry.attributes && m.geometry.attributes.uv) {
              if (!m.geometry.attributes.uv2) {
                m.geometry.setAttribute(
                  "uv2",
                  new THREE.BufferAttribute(m.geometry.attributes.uv.array, 2)
                );
              }
            }
          }
        });
      }

      if (modelRotation) {
        clone.rotation.x = modelRotation.x || 0;
        clone.rotation.y = modelRotation.y || 0;
        clone.rotation.z = modelRotation.z || 0;
      }

      // orienta para olhar para o centro do caminho
      const pathYaw = Math.atan2(dx, dz);
      clone.rotation.y += pathYaw + Math.PI;

      clone.position.set(
        x,
        (CONFIG.scene && CONFIG.scene.groundPosition
          ? CONFIG.scene.groundPosition.y
          : 0) + yOffset,
        z
      );

      // Luz no topo do poste + helper
      // Calcula o topo do modelo no mundo e converte para coordenadas locais do clone
      clone.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(clone);
      const bboxCenter = bbox.getCenter(new THREE.Vector3());
      const topWorld = new THREE.Vector3(bboxCenter.x + 2, bbox.max.y - 19, bboxCenter.z);
      const topLocal = clone.worldToLocal(topWorld.clone());

      const lampLight = new THREE.PointLight(0xffffff, 1000);
      lampLight.castShadow = true;
      // Limita o alcance para não matar contraste das sombras na cena inteira
      lampLight.distance = 250;
      lampLight.decay = 2;
      lampLight.shadow.mapSize.set(1024, 1024);
      lampLight.shadow.camera.near = 0.5;
      lampLight.shadow.camera.far = lampLight.distance;
      lampLight.shadow.bias = -0.0002;
      lampLight.shadow.normalBias = 0.02;
      lampLight.position.copy(topLocal);
      clone.add(lampLight);

      const lampHelper = new THREE.PointLightHelper(lampLight);
      scene.add(lampHelper);

      scene.add(clone);
      instances.push(clone);

      if (onObjectLoadedCallback) onObjectLoadedCallback("StreetLamp", clone);
    }

    if (objects)
      objects["streetLamps"] = objects["streetLamps"]
        ? objects["streetLamps"].concat(instances)
        : instances;

    console.log(
      `Instanciados ${instances.length} postes (StreetLamp) a partir de ${modelPath}`
    );
  } catch (err) {
    console.error("Erro carregando StreetLamp FBX:", err);
  }
}
