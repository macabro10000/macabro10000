// ======================================================
// ZERO - MAP RENDERER
// Motor principal de renderizado del mapa
// ======================================================

import {
  getPlayer,
  getMapSize,
  getTerritories
} from "./state.js";

import {
  initCamera,
  getCamera,
  centerOn,
  zoomAt,
  screenToWorld
} from "./camera.js";

import {
  initTerrain,
  setTerrainConfig,
  drawTerrain,
  drawMapBorder,
  getTileSize
} from "./terrain.js";


// ======================================================
// VARIABLES
// ======================================================

let canvas = null;
let ctx = null;

let animationFrame = null;

let initialized = false;


// ======================================================
// CONFIGURACIÓN
// ======================================================

const rendererConfig = {

  background:
    "#17251a",

  pixelRatio:
    Math.min(
      window.devicePixelRatio || 1,
      2
    ),

  clearColor:
    "#17251a"

};


// ======================================================
// INICIALIZAR
// ======================================================

export function initMapRenderer(
  canvasElement
) {

  canvas =
    canvasElement;

  if (!canvas) {

    console.error(
      "❌ MapRenderer: canvas no encontrado."
    );

    return;

  }


  ctx =
    canvas.getContext(
      "2d"
    );


  if (!ctx) {

    console.error(
      "❌ MapRenderer: no se pudo obtener el contexto 2D."
    );

    return;

  }


  // ----------------------------------------------
  // CÁMARA
  // ----------------------------------------------

  initCamera(
    canvas,
    ctx
  );


  // ----------------------------------------------
  // TERRENO
  // ----------------------------------------------

  initTerrain(
    canvas,
    ctx
  );


  resizeCanvas();


  initialized =
    true;


  window.addEventListener(
    "resize",
    resizeCanvas
  );


  // ----------------------------------------------
  // ZOOM
  // ----------------------------------------------

  canvas.addEventListener(
    "wheel",
    handleWheel,
    {
      passive: false
    }
  );


  // ----------------------------------------------
  // INICIAR RENDER
  // ----------------------------------------------

  startRenderLoop();


  console.log(
    "🗺️ MapRenderer inicializado."
  );

}


// ======================================================
// REDIMENSIONAR CANVAS
// ======================================================

function resizeCanvas() {

  if (!canvas) {
    return;
  }


  const ratio =
    rendererConfig.pixelRatio;


  const width =
    window.innerWidth;


  const height =
    Math.max(
      300,
      window.innerHeight - 120
    );


  canvas.width =
    Math.floor(
      width * ratio
    );


  canvas.height =
    Math.floor(
      height * ratio
    );


  canvas.style.width =
    `${width}px`;


  canvas.style.height =
    `${height}px`;


  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );


  // El canvas lógico vuelve a
  // trabajar con las dimensiones CSS.

  canvas.logicalWidth =
    width;

  canvas.logicalHeight =
    height;


  draw();

}


// ======================================================
// LOOP DE RENDERIZADO
// ======================================================

function startRenderLoop() {

  if (
    animationFrame
  ) {

    cancelAnimationFrame(
      animationFrame
    );

  }


  function render() {

    draw();

    animationFrame =
      requestAnimationFrame(
        render
      );

  }


  animationFrame =
    requestAnimationFrame(
      render
    );

}


// ======================================================
// DIBUJAR MAPA
// ======================================================

export function draw() {

  if (
    !initialized ||
    !ctx ||
    !canvas
  ) {

    return;

  }


  const width =
    canvas.logicalWidth ||
    window.innerWidth;


  const height =
    canvas.logicalHeight ||
    window.innerHeight - 120;


  // ----------------------------------------------
  // LIMPIAR
  // ----------------------------------------------

  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  ctx.fillStyle =
    rendererConfig.clearColor;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  // ----------------------------------------------
  // DATOS
  // ----------------------------------------------

  const territories =
    getTerritories();


  const mapSize =
    getMapSize();


  const camera =
    getCamera();


  const tileSize =
    getTileSize();


  // ----------------------------------------------
  // CONFIGURAR TERRENO
  // ----------------------------------------------

  setTerrainConfig(
    mapSize,
    tileSize
  );


  // ----------------------------------------------
  // RENDERIZAR MUNDO
  // ----------------------------------------------

  ctx.save();


  ctx.scale(
    camera.zoom,
    camera.zoom
  );


  ctx.translate(
    -camera.x,
    -camera.y
  );


  // ----------------------------------------------
  // TERRENO
  // ----------------------------------------------

  drawTerrain(
    territories,
    camera
  );


  // ----------------------------------------------
  // BORDE DEL MAPA
  // ----------------------------------------------

  drawMapBorder();


  ctx.restore();

}


// ======================================================
// CENTRAR EN JUGADOR
// ======================================================

export function centerOnPlayer() {

  const player =
    getPlayer();


  if (!player) {

    return;

  }


  centerOn(
    player.x,
    player.y,
    getTileSize()
  );


  draw();

}


// ======================================================
// CENTRAR EN TERRITORIO
// ======================================================

export function centerOnTerritory(
  territory
) {

  if (!territory) {

    return;

  }


  centerOn(
    territory.x,
    territory.y,
    getTileSize()
  );


  draw();

}


// ======================================================
// ZOOM CON EL RATÓN
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


  zoomAt(
    screenX,
    screenY,
    direction
  );


  draw();

}


// ======================================================
// OBTENER TERRITORIO BAJO EL CURSOR
// ======================================================

export function getTerritoryAt(
  screenX,
  screenY
) {

  const world =
    screenToWorld(
      screenX,
      screenY
    );


  const territories =
    getTerritories();


  const tile =
    getTileSize();


  const radius =
    tile * 0.48;


  let closest =
    null;


  let closestDistance =
    Infinity;


  for (
    const territory
    of territories
  ) {

    const centerX =
      territory.x *
      tile +
      tile / 2;


    const centerY =
      territory.y *
      tile +
      tile / 2;


    const dx =
      world.x -
      centerX;


    const dy =
      world.y -
      centerY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance <
        radius &&
      distance <
        closestDistance
    ) {

      closest =
        territory;

      closestDistance =
        distance;

    }

  }


  return closest;

}


// ======================================================
// POSICIÓN DEL MOUSE EN EL MAPA
// ======================================================

export function screenPositionToWorld(
  screenX,
  screenY
) {

  return screenToWorld(
    screenX,
    screenY
  );

}


// ======================================================
// OBTENER CANVAS
// ======================================================

export function getCanvas() {

  return canvas;

}


// ======================================================
// OBTENER CONTEXTO
// ======================================================

export function getContext() {

  return ctx;

}


// ======================================================
// FORZAR REDIBUJADO
// ======================================================

export function refreshMap() {

  draw();

}


// ======================================================
// DETENER RENDERIZADO
// ======================================================

export function stopRenderer() {

  if (
    animationFrame
  ) {

    cancelAnimationFrame(
      animationFrame
    );

    animationFrame =
      null;

  }

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initMapRenderer,

  draw,

  centerOnPlayer,

  centerOnTerritory,

  getTerritoryAt,

  screenPositionToWorld,

  getCanvas,

  getContext,

  refreshMap,

  stopRenderer

};
