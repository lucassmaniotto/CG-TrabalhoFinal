// ============================================
// Input - Gerenciamento de controles e entrada
// ============================================

export const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
};

let onCameraToggleCallback = null;

/**
 * Define callback para toggle de câmera (tecla V)
 */
export function setOnCameraToggleCallback(callback) {
  onCameraToggleCallback = callback;
}

/**
 * Handler de tecla pressionada
 */
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

/**
 * Handler de tecla liberada
 */
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
