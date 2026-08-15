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

import {
  initTerritory,
  setTerritoryTileSize,
  drawTerritories,
  findTerritoryAt
} from "./territory.js";


// ======================================================
// VARIABLES
// ======================================================

let canvas = null;
let ctx = null;

let animationFrame = null;

let initialized = false;

let eventsInitialized = false;


// ======================================================
// CONFIGURACIÓN
// ======================================================

const rendererConfig = {

  background:
    "#17251a",

  clearColor:
    "#17251a",

  maxPixelRatio:
    2,

  minHeight:
    300,

  topOffset:
    120

};


// ======================================================
// INICIALIZAR RENDERER
// ======================================================

export function initMapRenderer(
  canvasElement
) {

  if (!canvasElement) {

    console.error(
      "❌ MapRenderer: canvas no encontrado."
    );

    return false;

  }


  canvas =
    canvasElement;


  ctx =
    canvas.getContext(
      "2d"
    );


  if (!ctx) {

    console.error(
      "❌ MapRenderer: no se pudo obtener el contexto 2D."
    );

    return false;

  }


  // ==================================================
  // CÁMARA
  // ==================================================

  initCamera(
    canvas,
    ctx
  );


  // ==================================================
  // TERRENO
  // ==================================================

  initTerrain(
    canvas,
    ctx
  );


  // ==================================================
  // CIUDADES
  // ==================================================

  initTerritory(
    ctx
  );


  // ==================================================
  // MARCAR COMO INICIALIZADO
  // ==================================================

  initialized =
    true;


  // ==================================================
  // CONFIGURAR EVENTOS
  // ==================================================

  if (
    !eventsInitialized
  ) {

    window.addEventListener(
      "resize",
      resizeCanvas
    );


    canvas.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false
      }
    );


    eventsInitialized =
      true;

  }


  // ==================================================
  // AJUSTAR CANVAS
  // ==================================================

  resizeCanvas();


  // ==================================================
  // RENDER INICIAL
  // ==================================================

  requestRedraw();


  console.log(
    "🗺️ MapRenderer inicializado correctamente."
  );


  return true;

}


// ======================================================
// OBTENER PIXEL RATIO
// ======================================================

function getPixelRatio() {

  return Math.min(

    window.devicePixelRatio || 1,

    rendererConfig.maxPixelRatio

  );

}


// ======================================================
// REDIMENSIONAR CANVAS
// ======================================================

function resizeCanvas() {

  if (!canvas || !ctx) {
    return;
  }


  const ratio =
    getPixelRatio();


  const width =
    window.innerWidth;


  const height =
    Math.max(
      rendererConfig.minHeight,
      window.innerHeight -
        rendererConfig.topOffset
    );


  // ==================================================
  // TAMAÑO REAL
  // ==================================================

  canvas.width =
    Math.floor(
      width * ratio
    );


  canvas.height =
    Math.floor(
      height * ratio
    );


  // ==================================================
  // TAMAÑO VISUAL
  // ==================================================

  canvas.style.width =
    `${width}px`;


  canvas.style.height =
    `${height}px`;


  // ==================================================
  // ESCALA DE ALTA RESOLUCIÓN
  // ==================================================

  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );


  // ==================================================
  // DIMENSIONES LÓGICAS
  // ==================================================

  canvas.logicalWidth =
    width;


  canvas.logicalHeight =
    height;


  requestRedraw();

}


// ======================================================
// SOLICITAR REDIBUJADO
// ======================================================

export function requestRedraw() {

  if (
    animationFrame !== null
  ) {

    return;

  }


  animationFrame =
    requestAnimationFrame(
      () => {

        animationFrame =
          null;

        draw();

      }
    );

}


// ======================================================
// DIBUJAR MAPA COMPLETO
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
    Math.max(
      rendererConfig.minHeight,
      window.innerHeight -
        rendererConfig.topOffset
    );


  // ==================================================
  // LIMPIAR PANTALLA
  // ==================================================

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


  // ==================================================
  // OBTENER ESTADO
  // ==================================================

  const territories =
    getTerritories();


  const mapSize =
    getMapSize();


  const camera =
    getCamera();


  const tileSize =
    getTileSize();


  // ==================================================
  // CONFIGURAR TERRENO
  // ==================================================

  setTerrainConfig(
    mapSize,
    tileSize
  );


  // ==================================================
  // CONFIGURAR CIUDADES
  // ==================================================

  setTerritoryTileSize(
    tileSize
  );


  // ==================================================
  // ENTRAR AL MUNDO
  // ==================================================

  ctx.save();


  ctx.scale(
    camera.zoom,
    camera.zoom
  );


  ctx.translate(
    -camera.x,
    -camera.y
  );


  // ==================================================
  // TERRENO
  // ==================================================

  drawTerrain(
    territories,
    camera
  );


  // ==================================================
  // CIUDADES
  // ==================================================

  drawTerritories(
    territories
  );


  // ==================================================
  // BORDE DEL MAPA
  // ==================================================

  drawMapBorder();


  // ==================================================
  // SALIR DEL MUNDO
  // ==================================================

  ctx.restore();

}


// ======================================================
// CENTRAR EN EL JUGADOR
// ======================================================

export function centerOnPlayer() {

  const player =
    getPlayer();


  if (!player) {

    console.warn(
      "⚠️ No hay jugador para centrar la cámara."
    );

    return;

  }


  centerOn(
    player.x,
    player.y,
    getTileSize()
  );


  requestRedraw();

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


  requestRedraw();

}


// ======================================================
// ZOOM CON EL RATÓN
// ======================================================

function handleWheel(
  event
) {

  if (!canvas) {
    return;
  }


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


  requestRedraw();

}


// ======================================================
// OBTENER TERRITORIO BAJO EL CURSOR
// ======================================================

export function getTerritoryAt(
  screenX,
  screenY
) {

  if (!canvas) {
    return null;
  }


  const world =
    screenToWorld(
      screenX,
      screenY
    );


  const territories =
    getTerritories();


  return findTerritoryAt(
    world.x,
    world.y,
    territories
  );

}


// ======================================================
// OBTENER TERRITORIO DESDE EVENTO
// ======================================================

export function getTerritoryFromEvent(
  event
) {

  if (
    !canvas ||
    !event
  ) {

    return null;

  }


  const rect =
    canvas.getBoundingClientRect();


  const screenX =
    event.clientX -
    rect.left;


  const screenY =
    event.clientY -
    rect.top;


  return getTerritoryAt(
    screenX,
    screenY
  );

}


// ======================================================
// POSICIÓN DE PANTALLA → MUNDO
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
// OBTENER CÁMARA
// ======================================================

export function getRendererCamera() {

  return getCamera();

}


// ======================================================
// FORZAR REDIBUJADO
// ======================================================

export function refreshMap() {

  requestRedraw();

}


// ======================================================
// DETENER RENDER
// ======================================================

export function stopRenderer() {

  if (
    animationFrame !== null
  ) {

    cancelAnimationFrame(
      animationFrame
    );


    animationFrame =
      null;

  }

}


// ======================================================
// REINICIAR RENDER
// ======================================================

export function restartRenderer() {

  if (!initialized) {
    return;
  }


  requestRedraw();

}


// ======================================================
// ESTADO DEL RENDERER
// ======================================================

export function isInitialized() {

  return initialized;

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initMapRenderer,

  draw,

  requestRedraw,

  centerOnPlayer,

  centerOnTerritory,

  getTerritoryAt,

  getTerritoryFromEvent,

  screenPositionToWorld,

  getCanvas,

  getContext,

  getRendererCamera,

  refreshMap,

  stopRenderer,

  restartRenderer,

  isInitialized

};
