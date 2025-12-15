import * as THREE from "three";
import { CONFIG } from "./config.js";

let dirLight;
let dirHelper;

let baseDirectionalIntensity = 0;

let orbitRadiusXY = 0;
let orbitPhase0 = 0;
let orbitZ = 0;

// tempo acumulado do ciclo dia/noite (segundos)
let dayTimeSeconds = 0;

// Duração do ciclo completo em segundos
const DAY_NIGHT_DURATION_SECONDS = 240;

let sceneRef;
const skyColor = new THREE.Color();

const SKY_PALETTE = [
  // Escala de cores ao longo do ciclo dia/noite.
  { timeProgression: 0.0, colorValue: new THREE.Color(0x93d5ff) }, // manhã
  { timeProgression: 0.25, colorValue: new THREE.Color(0x47b5ff) }, // dia
  { timeProgression: 0.5, colorValue: new THREE.Color(0x1363df) }, // tarde
  { timeProgression: 0.6, colorValue: new THREE.Color(0x06283d) }, // noite
  { timeProgression: 0.92, colorValue: new THREE.Color(0x06283d) }, // madrugada
  { timeProgression: 1.0, colorValue: new THREE.Color(0x93d5ff) }, // volta para manhã
];

// Função de suaviazação no intervalo [0,1]
// - Valores fora do intervalo são limitados
// - Retorna uma curva com aceleração/desaceleração para evitar transições bruscas.
function smoothstep01(x) {
  const valorLimitado = Math.min(1, Math.max(0, x));
  return valorLimitado * valorLimitado * (3 - 2 * valorLimitado);
}

// Atualiza a cor do céu conforme o tempo do ciclo.
// 1) Converte o tempo acumulado em "tempo normalizado" (0..1)
// 2) Encontra os dois stops vizinhos no SKY_PALETTE
// 3) Interpola entre as duas cores usando smoothstep
function updateSkyBackground() {
  if (!sceneRef) return;

  // Tempo normalizado do ciclo, repetindo a cada DAY_NIGHT_DURATION_SECONDS.
  const normalizedCycleTime =
    (dayTimeSeconds % DAY_NIGHT_DURATION_SECONDS) / DAY_NIGHT_DURATION_SECONDS;

  // Procura o stop atual (o último cujo timeProgression <= normalizedCycleTime).
  let paletteIndex = 0;
  while (
    paletteIndex < SKY_PALETTE.length - 1 &&
    normalizedCycleTime > SKY_PALETTE[paletteIndex + 1].timeProgression
  ) {
    paletteIndex++;
  }

  // Stops vizinhos (origem -> destino) para interpolar o segmento atual.
  const fromStop = SKY_PALETTE[paletteIndex];
  const toStop =
    SKY_PALETTE[Math.min(paletteIndex + 1, SKY_PALETTE.length - 1)];

  // Normaliza o progresso dentro do segmento atual e aplica suavização.
  const segmentDuration =
    toStop.timeProgression - fromStop.timeProgression || 1;
  const segmentT = smoothstep01(
    (normalizedCycleTime - fromStop.timeProgression) / segmentDuration
  );

  // Atualiza o objeto Color reutilizado (evita alocar objetos por frame).
  skyColor.lerpColors(fromStop.colorValue, toStop.colorValue, segmentT);
}

// Inicializa iluminação (sem GUI) + ciclo de dia/noite
export function initLighting(scene) {
  const cfg = CONFIG.lighting && CONFIG.lighting.directional;

  sceneRef = scene;
  // fixa um objeto Color no background para permitir atualização por referência
  sceneRef.background = skyColor;

  const color = cfg.color;
  const intensity = cfg.intensity;

  baseDirectionalIntensity = intensity;

  const initialLightX = cfg.x;
  const initialLightY = cfg.y;
  const initialLightZ = cfg.z;

  dirLight = new THREE.DirectionalLight(color, intensity);
  dirLight.position.set(initialLightX, initialLightY, initialLightZ);
  dirLight.castShadow = true;

  // "Sol": aponta para o centro do mundo
  if (!dirLight.target.parent) scene.add(dirLight.target);
  dirLight.target.position.set(0, 0, 0);

  const cameraShadow = dirLight.shadow.camera;
  const SIZE = CONFIG.shadows && CONFIG.shadows.shadowCameraSize;
  cameraShadow.left = -SIZE;
  cameraShadow.right = SIZE;
  cameraShadow.top = SIZE;
  cameraShadow.bottom = -SIZE;
  cameraShadow.near = 0.5;
  cameraShadow.far = 1000;
  cameraShadow.updateProjectionMatrix();

  const mapSize = CONFIG.shadows && CONFIG.shadows.mapSize;
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
  orbitRadiusXY =
    Math.sqrt(initialLightX * initialLightX + initialLightY * initialLightY) ||
    1;
  orbitPhase0 = Math.atan2(initialLightY, initialLightX);
  orbitZ = initialLightZ;

  // aplica a cor inicial do céu de acordo com o tempo atual
  updateSkyBackground();

  // Garante que, se o sol iniciar abaixo do horizonte, ele não ilumina “por baixo”.
  const isSunAboveHorizon = dirLight.position.y > 0;
  dirLight.intensity = isSunAboveHorizon ? baseDirectionalIntensity : 0;
  dirLight.castShadow = isSunAboveHorizon;
  if (dirLight.shadow) {
    dirLight.shadow.autoUpdate = isSunAboveHorizon;
    if (isSunAboveHorizon) dirLight.shadow.needsUpdate = true;
  }
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

  const lightX = orbitRadiusXY * Math.cos(phase);
  const lightY = orbitRadiusXY * Math.sin(phase);
  dirLight.position.set(lightX, lightY, orbitZ);

  // Sol abaixo do horizonte (y <= 0) não deve iluminar por baixo do mundo.
  const isSunAboveHorizon = lightY > 0;
  dirLight.intensity = isSunAboveHorizon ? baseDirectionalIntensity : 0;
  dirLight.castShadow = isSunAboveHorizon;
  if (dirLight.shadow) {
    dirLight.shadow.autoUpdate = isSunAboveHorizon;
    if (isSunAboveHorizon) dirLight.shadow.needsUpdate = true;
  }

  updateSkyBackground();

  if (dirHelper && dirHelper.update) dirHelper.update();
}

export { dirLight, dirHelper };
