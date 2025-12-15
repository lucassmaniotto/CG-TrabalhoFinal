import * as THREE from "three";
import { CONFIG } from "./config.js";

let dirLight;
let dirHelper;

let orbitRadiusXY = 0;
let orbitPhase0 = 0;
let orbitZ = 0;

// tempo acumulado do ciclo dia/noite (segundos)
let dayTimeSeconds = 0;

// Duração do ciclo completo em segundos
const DAY_NIGHT_DURATION_SECONDS = 120;

// Inicializa iluminação (sem GUI) + ciclo de dia/noite
export function initLighting(scene) {
  const cfg = CONFIG.lighting && CONFIG.lighting.directional;

  const color = cfg.color;
  const intensity = cfg.intensity;

  const x = cfg.x;
  const y = cfg.y;
  const z = cfg.z;

  dirLight = new THREE.DirectionalLight(color, intensity);
  dirLight.position.set(x, y, z);
  dirLight.castShadow = true;

  // "Sol": aponta para o centro do mundo
  if (!dirLight.target.parent) scene.add(dirLight.target);
  dirLight.target.position.set(0, 0, 0);

  const cameraShadow = dirLight.shadow.camera;
  const SIZE = (CONFIG.shadows && CONFIG.shadows.shadowCameraSize)
  cameraShadow.left = -SIZE;
  cameraShadow.right = SIZE;
  cameraShadow.top = SIZE;
  cameraShadow.bottom = -SIZE;
  cameraShadow.near = 0.5;
  cameraShadow.far = 500;
  cameraShadow.updateProjectionMatrix();

  const mapSize = (CONFIG.shadows && CONFIG.shadows.mapSize) || 2048;
  dirLight.shadow.mapSize.set(mapSize, mapSize);

  scene.add(dirLight);

  // Helper sempre ligado conforme pedido
  if (cfg.helper !== false) {
    dirHelper = new THREE.DirectionalLightHelper(dirLight, 10, 0xff0000);
    dirHelper.visible = true;
    scene.add(dirHelper);
  }

  // começa o ciclo usando o y inicial como ponto de partida
  dayTimeSeconds = 0;

  // Órbita circular no plano X-Y (como sol nascendo e se pondo)
  // Garante que inicia exatamente em (x, y) e circula o mundo.
  orbitRadiusXY = Math.sqrt(x * x + y * y) || 1;
  orbitPhase0 = Math.atan2(y, x);
  orbitZ = z;
}

// Atualiza o ciclo (chamar a cada frame)
export function updateLightHelpers(deltaSeconds = 0) {
  if (!dirLight) return;

  dayTimeSeconds += deltaSeconds;
  const phase =
    orbitPhase0 +
    ((dayTimeSeconds % DAY_NIGHT_DURATION_SECONDS) /
      DAY_NIGHT_DURATION_SECONDS) *
      Math.PI *
      2;

  const x = orbitRadiusXY * Math.cos(phase);
  const y = orbitRadiusXY * Math.sin(phase);
  dirLight.position.set(x, y, orbitZ);

  if (dirHelper && dirHelper.update) dirHelper.update();
}

export { dirLight, dirHelper };
