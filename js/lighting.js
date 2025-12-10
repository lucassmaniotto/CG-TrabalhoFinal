import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let gui = null;
let parametrosGUI = null;
let dirLight, dirHelper, pointLight, pointHelper, spotLight, spotHelper;

// Cria uma luz com controles GUI
function createLightWithGui({ type, label, state, guiParent, intensityRange = [0, 5, 0.1] }, scene) {
  const LIGHT_DEFS = {
    directional: {
      factory: () => new THREE.DirectionalLight(0xffffff, 0.6),
      helperFactory: (light) => new THREE.DirectionalLightHelper(light, 5, 0xff0000),
      afterCreate: (light) => {
        light.castShadow = true;
        const cameraShadow = light.shadow.camera;
        
        const SIZE = 400;
        cameraShadow.left = -SIZE;
        cameraShadow.right = SIZE;
        cameraShadow.top = SIZE;
        cameraShadow.bottom = -SIZE;
        cameraShadow.near = 0.5;
        cameraShadow.far = 500;
        cameraShadow.updateProjectionMatrix();
        light.shadow.mapSize.set(2048, 2048);
      },
    },
    point: {
      factory: () => new THREE.PointLight(0xffffff, 2, 0, 2),
      helperFactory: (light) => new THREE.PointLightHelper(light, 2, 0xffff00),
      afterCreate: (light) => { light.castShadow = true; },
    },
    spot: {
      factory: () => new THREE.SpotLight(0xffffff, 5, 0, 0.5, 0.2, 2),
      helperFactory: (light) => new THREE.SpotLightHelper(light, 0xff00ff),
      afterCreate: (light) => {
        light.castShadow = true;
        if (!light.target.parent) scene.add(light.target);
        light.target.position.set(0, 0, 0);
      },
    },
  };

  const def = LIGHT_DEFS[type];
  if (!def) throw new Error(`Tipo de luz desconhecido: ${type}`);

  const light = def.factory();
  light.visible = !!state.enabled;
  if (state.color) light.color.set(state.color);
  if (typeof state.intensity === "number") light.intensity = state.intensity;
  if (typeof state.x === "number" && typeof state.y === "number" && typeof state.z === "number")
    light.position.set(state.x, state.y, state.z);
  if (type === "spot" && typeof state.angle === "number") light.angle = state.angle;

  scene.add(light);
  def.afterCreate(light);

  let helper = null;
  try {
    helper = def.helperFactory(light);
    scene.add(helper);
    helper.visible = !!state.helper;
  } catch (e) {
    console.warn(`Não foi possível criar helper para ${label}:`, e);
  }

  const folder = guiParent.addFolder(label);
  state.enabled ? folder.open() : folder.close();
  let helperController;

  folder.add(state, "enabled").name("Ativar").onChange((visible) => {
    light.visible = visible;
    visible ? folder.open() : folder.close();
    if (!visible && state.helper) {
      if (helperController && typeof helperController.setValue === "function")
        helperController.setValue(false);
      else {
        state.helper = false;
        if (helper) helper.visible = false;
      }
    }
  });

  folder.addColor(state, "color").name("Cor").onChange((color) => { light.color.set(color); });

  const [iMin, iMax, iStep] = intensityRange;
  folder.add(state, "intensity", iMin, iMax, iStep).name("Intensidade").onChange((visible) => { light.intensity = visible; });

  helperController = folder.add(state, "helper").name("Helper").onChange((visible) => {
    if (helper) {
      helper.visible = visible;
      if (type === "spot" && helper.update) helper.update();
    }
  });

  const updateHelper = () => {
    if (helper && helper.update) helper.update();
  };

  folder.add(state, "x", -200, 200, 1).name("Pos X").onChange((x) => {
    light.position.x = x;
    updateHelper();
  });
  folder.add(state, "y", -200, 200, 1).name("Pos Y").onChange((y) => {
    light.position.y = y;
    updateHelper();
  });
  folder.add(state, "z", -200, 200, 1).name("Pos Z").onChange((z) => {
    light.position.z = z;
    updateHelper();
  });

  if (type === "spot") {
    const HALF_PI = Math.PI / 2;
    folder.add(state, "angle", 0.0, HALF_PI, 0.01).name("Ângulo").onChange((angle) => {
      light.angle = angle;
      updateHelper();
    });
  }

  return { light, helper, folder };
}

// Inicializa o sistema de iluminação e GUI
export function initLighting(scene) {
  gui = new GUI();
  gui.width = 300;

  parametrosGUI = {
    iluminacao: {
      directional: { enabled: true, color: "#ffffff", intensity: 0.5, helper: false, x: 10, y: 20, z: 10 },
      point: { enabled: false, color: "#ffffff", intensity: 50.0, helper: false, x: -10, y: 15, z: 10 },
      spot: { enabled: false, color: "#ffffff", intensity: 1000.0, helper: false, x: -10, y: 25, z: 10, angle: 0.5 },
    },
  };

  const lightsFolder = gui.addFolder("Iluminação");
  lightsFolder.open();

  const directionalResult = createLightWithGui(
    { type: "directional", label: "Directional", state: parametrosGUI.iluminacao.directional, guiParent: lightsFolder, intensityRange: [0, 5, 0.1] },
    scene
  );
  dirLight = directionalResult.light;
  dirHelper = directionalResult.helper;

  const pointResult = createLightWithGui(
    { type: "point", label: "Point", state: parametrosGUI.iluminacao.point, guiParent: lightsFolder, intensityRange: [0, 500, 0.1] },
    scene
  );
  pointLight = pointResult.light;
  pointHelper = pointResult.helper;

  const spotResult = createLightWithGui(
    { type: "spot", label: "Spot", state: parametrosGUI.iluminacao.spot, guiParent: lightsFolder, intensityRange: [0, 1000, 0.1] },
    scene
  );
  spotLight = spotResult.light;
  spotHelper = spotResult.helper;
}

// Atualiza helpers de luz (precisa ser chamado no animate)
export function updateLightHelpers() {
  if (spotHelper && spotHelper.update) spotHelper.update();
}

export { dirLight, dirHelper, pointLight, pointHelper, spotLight, spotHelper };
