export const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
};

export const mouse = {
  active: false,
  dx: 0,
  dy: 0,
};

let onCameraToggleCallback = null;

// Define callback para toggle de câmera (tecla V)
export function setOnCameraToggleCallback(callback) {
  onCameraToggleCallback = callback;
}

// Handler de tecla pressionada
export function onKeyDown(e) {
  if (
    e.code === "ArrowUp" ||
    e.code === "ArrowDown" ||
    e.code === "ArrowLeft" ||
    e.code === "ArrowRight"
  ) {
    e.preventDefault();
  }

  switch (e.code) {
    case "ArrowUp":
      input.forward = true;
      break;
    case "ArrowDown":
      input.back = true;
      break;
    case "ArrowLeft":
      input.left = true;
      break;
    case "ArrowRight":
      input.right = true;
      break;
    case "KeyV":
      if (onCameraToggleCallback) onCameraToggleCallback();
      break;
  }
}

// Mouse press (ativa look quando botão principal ou direito)
export function onMouseDown(e) {
  if (e.button === 0 || e.button === 2) {
    e.preventDefault();
    mouse.active = true;
  }
}

// Mouse solto
export function onMouseUp(e) {
  if (e.button === 0 || e.button === 2) {
    e.preventDefault();
    mouse.active = false;
  }
}

// Movimento do mouse (acumula delta enquanto ativo)
export function onMouseMove(e) {
  if (!mouse.active) return;
  mouse.dx += e.movementX || 0;
  mouse.dy += e.movementY || 0;
}

// Consome e zera o delta acumulado
export function consumeMouseDelta() {
  const { dx, dy } = mouse;
  mouse.dx = 0;
  mouse.dy = 0;
  return { dx, dy };
}

// Handler de tecla liberada
export function onKeyUp(e) {
  if (
    e.code === "ArrowUp" ||
    e.code === "ArrowDown" ||
    e.code === "ArrowLeft" ||
    e.code === "ArrowRight"
  ) {
    e.preventDefault();
  }

  switch (e.code) {
    case "ArrowUp":
      input.forward = false;
      break;
    case "ArrowDown":
      input.back = false;
      break;
    case "ArrowLeft":
      input.left = false;
      break;
    case "ArrowRight":
      input.right = false;
      break;
  }
}
