// ======================================================
// ZERO - INPUT.JS
// Controles del mapa
// ======================================================

import {
  screenToWorld
} from "./camera.js";

import {
  findCityAt
} from "./cities.js";


// ======================================================
// ESTADO
// ======================================================

let canvas = null;

let territories = [];

let selectedTerritory = null;

let dragging = false;

let movedDuringClick = false;

let lastX = 0;
let lastY = 0;

let socket = null;

let getPlayer = null;

let onSelect = null;

let onAttackRequest = null;

let onRender = null;


// ======================================================
// CONFIGURACIÓN
// ======================================================

const config = {

  dragThreshold: 5,

  wheelStep: 1

};


// ======================================================
// INICIALIZAR
// ======================================================

export function initInput(options = {}) {

  canvas =
    options.canvas || null;

  socket =
    options.socket || null;

  getPlayer =
    options.getPlayer ||
    (() => null);

  onSelect =
    options.onSelect ||
    (() => {});

  onAttackRequest =
    options.onAttackRequest ||
    (() => {});

  onRender =
    options.onRender ||
    (() => {});


  if (!canvas) {

    console.error(
      "❌ Input: canvas no encontrado."
    );

    return;

  }


  canvas.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  canvas.addEventListener(
    "pointermove",
    handlePointerMove
  );

  canvas.addEventListener(
    "pointerup",
    handlePointerUp
  );

  canvas.addEventListener(
    "pointercancel",
    handlePointerCancel
  );

  canvas.addEventListener(
    "wheel",
    handleWheel,
    {
      passive: false
    }
  );


  console.log(
    "🎮 Controles del mapa inicializados."
  );

}


// ======================================================
// ACTUALIZAR TERRITORIOS
// ======================================================

export function setTerritories(
  data
) {

  territories =
    Array.isArray(data)
      ? data
      : [];

}


// ======================================================
// OBTENER SELECCIÓN
// ======================================================

export function getSelectedTerritory() {

  return selectedTerritory;

}


// ======================================================
// SELECCIONAR
// ======================================================

export function selectTerritory(
  territory
) {

  selectedTerritory =
    territory || null;


  onSelect(
    selectedTerritory
  );


  onRender();

}


// ======================================================
// DESELECCIONAR
// ======================================================

export function clearSelection() {

  selectedTerritory =
    null;


  onSelect(
    null
  );


  onRender();

}


// ======================================================
// POINTER DOWN
// ======================================================

function handlePointerDown(
  event
) {

  if (!canvas) {
    return;
  }


  dragging = true;

  movedDuringClick =
    false;


  lastX =
    event.clientX;

  lastY =
    event.clientY;


  try {

    canvas.setPointerCapture(
      event.pointerId
    );

  } catch (error) {

    // Algunos navegadores
    // pueden no soportarlo.

  }

}


// ======================================================
// POINTER MOVE
// ======================================================

function handlePointerMove(
  event
) {

  if (!dragging) {
    return;
  }


  const dx =
    event.clientX -
    lastX;

  const dy =
    event.clientY -
    lastY;


  if (
    Math.abs(dx) >
      config.dragThreshold ||
    Math.abs(dy) >
      config.dragThreshold
  ) {

    movedDuringClick =
      true;

  }


  lastX =
    event.clientX;

  lastY =
    event.clientY;


  // La cámara se mueve
  // desde game.js mediante
  // el callback.

  onRender({
    type: "drag",

    dx,

    dy

  });

}


// ======================================================
// POINTER UP
// ======================================================

function handlePointerUp(
  event
) {

  if (!dragging) {
    return;
  }


  dragging = false;


  try {

    canvas.releasePointerCapture(
      event.pointerId
    );

  } catch (error) {

    // Ignorar.

  }


  // Si arrastró el mapa,
  // no contamos esto como click.

  if (
    movedDuringClick
  ) {

    return;

  }


  handleClick(
    event
  );

}


// ======================================================
// POINTER CANCEL
// ======================================================

function handlePointerCancel(
  event
) {

  dragging = false;

  movedDuringClick =
    false;


  try {

    canvas.releasePointerCapture(
      event.pointerId
    );

  } catch (error) {

    // Ignorar.

  }

}


// ======================================================
// CLICK
// ======================================================

function handleClick(
  event
) {

  const rect =
    canvas.getBoundingClientRect();


  const screenX =
    event.clientX -
    rect.left;


  const screenY =
    event.clientY -
    rect.top;


  const world =
    screenToWorld(
      screenX,
      screenY
    );


  const territory =
    findCityAt(
      world.x,
      world.y,
      territories
    );


  // --------------------------------------------
  // CLICK EN VACÍO
  // --------------------------------------------

  if (!territory) {

    clearSelection();

    return;

  }


  // --------------------------------------------
  // SELECCIONAR
  // --------------------------------------------

  selectTerritory(
    territory
  );


  const player =
    getPlayer();


  if (!player) {
    return;
  }


  // --------------------------------------------
  // PROPIA CIUDAD
  // --------------------------------------------

  if (
    territory.ownerId ===
    player.id
  ) {

    return;

  }


  // --------------------------------------------
  // ATAQUE
  // --------------------------------------------

  onAttackRequest(
    territory
  );

}


// ======================================================
// WHEEL / ZOOM
// ======================================================

function handleWheel(
  event
) {

  event.preventDefault();


  const rect =
    canvas.getBoundingClientRect();


  const screenX =
    event.clientX -
    rect.left;


  const screenY =
    event.clientY -
    rect.top;


  const direction =
    event.deltaY < 0
      ? 1
      : -1;


  onRender({

    type: "zoom",

    screenX,

    screenY,

    direction

  });

}


// ======================================================
// ACTUALIZAR MAPA
// ======================================================

export function updateTerritories(
  data
) {

  setTerritories(
    data
  );

}


// ======================================================
// DESTRUIR EVENTOS
// ======================================================

export function destroyInput() {

  if (!canvas) {
    return;
  }


  canvas.removeEventListener(
    "pointerdown",
    handlePointerDown
  );

  canvas.removeEventListener(
    "pointermove",
    handlePointerMove
  );

  canvas.removeEventListener(
    "pointerup",
    handlePointerUp
  );

  canvas.removeEventListener(
    "pointercancel",
    handlePointerCancel
  );

  canvas.removeEventListener(
    "wheel",
    handleWheel
  );


  canvas = null;

  territories = [];

  selectedTerritory =
    null;

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initInput,

  setTerritories,

  updateTerritories,

  getSelectedTerritory,

  selectTerritory,

  clearSelection,

  destroyInput

};
