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

let resizeHandler = null;
let wheelHandler = null;


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

  renderLoop:
    true

};


// ======================================================
// INICIALIZAR
// ======================================================

export function initMapRenderer(
  canvasElement
) {

  // ----------------------------------------------
  // EVITAR DOBLE INICIALIZACIÓN
  // ----------------------------------------------

  if (initialized) {

    console.warn(
      "⚠️ MapRenderer ya estaba inicializado."
    );

    return;

  }


  canvas =
    canvasElement;


  if (!canvas) {

    console.error(
      "❌ MapRenderer: canvas no encontrado."
    );

    return;

  }


  // ----------------------------------------------
  // CONTEXTO
  // ----------------------------------------------

  ctx =
    canvas.getContext(
      "2d",
      {
        alpha: false,
        desynchronized: true
      }
    );


  if (!ctx) {

    console.error(
      "❌ MapRenderer: no se pudo obtener el contexto 2D."
    );

    canvas = null;

    return;

  }


  // ----------------------------------------------
  // CONFIGURACIÓN DEL CANVAS
  // ----------------------------------------------

  canvas.style.display =
    "block";

  canvas.style.touchAction =
    "none";


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


  // ----------------------------------------------
  // EVENTOS
  // ----------------------------------------------

  resizeHandler =
    () => {

      resizeCanvas();

    };


  wheelHandler =
    event => {

      handleWheel(
        event
      );

    };


  window.addEventListener(
    "resize",
    resizeHandler
  );


  canvas.addEventListener(
    "wheel",
    wheelHandler,
    {
      passive: false
    }
  );


  // ----------------------------------------------
  // ESTADO
  // ----------------------------------------------

  initialized =
    true;


  // ----------------------------------------------
  // PRIMER REDIMENSIONAMIENTO
  // ----------------------------------------------

  resizeCanvas();


  // ----------------------------------------------
  // LOOP
  // ----------------------------------------------

  if (
    rendererConfig.renderLoop
  ) {

    startRenderLoop();

  }


  console.log(
    "🗺️ MapRenderer inicializado correctamente."
  );

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
// OBTENER TAMAÑO DEL CANVAS
// ======================================================

function getCanvasSize() {

  if (!canvas) {

    return {
      width: 0,
      height: 0
    };

  }


  const rect =
    canvas.getBoundingClientRect();


  let width =
    rect.width;


  let height =
    rect.height;


  // ----------------------------------------------
  // FALLBACK
  // ----------------------------------------------

  if (
    width <= 0
  ) {

    width =
      window.innerWidth;

  }


  if (
    height <= 0
  ) {

    height =
      Math.max(
        300,
        window.innerHeight - 120
      );

  }


  return {
    width,
    height
  };

}


// ======================================================
// REDIMENSIONAR CANVAS
// ======================================================

function resizeCanvas() {

  if (
    !canvas ||
    !ctx
  ) {

    return;

  }


  const size =
    getCanvasSize();


  const width =
    Math.max(
      1,
      Math.floor(
        size.width
      )
    );


  const height =
    Math.max(
      1,
      Math.floor(
        size.height
      )
    );


  const pixelRatio =
    getPixelRatio();


  // ----------------------------------------------
  // TAMAÑO REAL DEL BUFFER
  // ----------------------------------------------

  const realWidth =
    Math.floor(
      width *
      pixelRatio
    );


  const realHeight =
    Math.floor(
      height *
      pixelRatio
    );


  // ----------------------------------------------
  // EVITAR TRABAJO INNECESARIO
  // ----------------------------------------------

  if (
    canvas.width !==
      realWidth ||
    canvas.height !==
      realHeight
  ) {

    canvas.width =
      realWidth;

    canvas.height =
      realHeight;

  }


  // ----------------------------------------------
  // TAMAÑO VISUAL
  // ----------------------------------------------

  canvas.style.width =
    `${width}px`;

  canvas.style.height =
    `${height}px`;


  // ----------------------------------------------
  // DIMENSIONES LÓGICAS
  // ----------------------------------------------

  canvas.logicalWidth =
    width;

  canvas.logicalHeight =
    height;

  canvas.pixelRatio =
    pixelRatio;


  // ----------------------------------------------
  // SISTEMA DE COORDENADAS
  // ----------------------------------------------

  ctx.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );


  draw();

}


// ======================================================
// LOOP DE RENDERIZADO
// ======================================================

function startRenderLoop() {

  stopRenderLoop();


  function render() {

    if (
      !initialized
    ) {

      animationFrame =
        null;

      return;

    }


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
// DETENER LOOP
// ======================================================

function stopRenderLoop() {

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
// LIMPIAR CANVAS
// ======================================================

function clearCanvas(
  width,
  height
) {

  if (!ctx) {
    return;
  }


  // ----------------------------------------------
  // RESET TRANSFORM
  // ----------------------------------------------

  const ratio =
    canvas?.pixelRatio || 1;


  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );


  // ----------------------------------------------
  // FONDO
  // ----------------------------------------------

  ctx.fillStyle =
    rendererConfig.clearColor;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );

}


// ======================================================
// DIBUJAR MAPA
// ======================================================

export function draw() {

  if (
    !initialized ||
    !canvas ||
    !ctx
  ) {

    return;

  }


  const width =
    canvas.logicalWidth ||
    canvas.clientWidth ||
    window.innerWidth;


  const height =
    canvas.logicalHeight ||
    canvas.clientHeight ||
    Math.max(
      300,
      window.innerHeight - 120
    );


  // ----------------------------------------------
  // LIMPIAR
  // ----------------------------------------------

  clearCanvas(
    width,
    height
  );


  // ----------------------------------------------
  // DATOS DEL JUEGO
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
  // GUARDAR ESTADO DEL CANVAS
  // ----------------------------------------------

  ctx.save();


  // ----------------------------------------------
  // APLICAR CÁMARA
  // ----------------------------------------------

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


  // ----------------------------------------------
  // RESTAURAR
  // ----------------------------------------------

  ctx.restore();

}


// ======================================================
// CENTRAR EN JUGADOR
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


  const x =
    Number(
      player.x
    );


  const y =
    Number(
      player.y
    );


  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {

    return;

  }


  centerOn(
    x,
    y,
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


  const x =
    Number(
      territory.x
    );


  const y =
    Number(
      territory.y
    );


  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {

    return;

  }


  centerOn(
    x,
    y,
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

  if (
    !canvas
  ) {

    return;

  }


  event.preventDefault();


  const rect =
    canvas.getBoundingClientRect();


  if (
    !rect.width ||
    !rect.height
  ) {

    return;

  }


  // ----------------------------------------------
  // POSICIÓN REAL DEL CURSOR
  // ----------------------------------------------

  const screenX =
    event.clientX -
    rect.left;


  const screenY =
    event.clientY -
    rect.top;


  // ----------------------------------------------
  // DIRECCIÓN
  // ----------------------------------------------

  const direction =
    event.deltaY < 0
      ? 1
      : -1;


  // ----------------------------------------------
  // ZOOM
  // ----------------------------------------------

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

  const territories =
    getTerritories();


  if (
    !Array.isArray(
      territories
    ) ||
    territories.length === 0
  ) {

    return null;

  }


  const world =
    screenToWorld(
      Number(screenX) || 0,
      Number(screenY) || 0
    );


  const tile =
    getTileSize();


  if (
    !Number.isFinite(
      tile
    ) ||
    tile <= 0
  ) {

    return null;

  }


  // ----------------------------------------------
  // CALCULAR CELDA DIRECTAMENTE
  // ----------------------------------------------

  const gridX =
    Math.floor(
      world.x /
      tile
    );


  const gridY =
    Math.floor(
      world.y /
      tile
    );


  // ----------------------------------------------
  // BUSCAR TERRITORIO
  // ----------------------------------------------

  const mapSize =
    getMapSize();


  if (
    gridX < 0 ||
    gridY < 0 ||
    gridX >= mapSize ||
    gridY >= mapSize
  ) {

    return null;

  }


  const territoryId =
    gridY *
    mapSize +
    gridX;


  const territory =
    territories.find(
      item =>
        Number(item.id) ===
        territoryId
    );


  return territory || null;

}


// ======================================================
// POSICIÓN DE PANTALLA → MUNDO
// ======================================================

export function screenPositionToWorld(
  screenX,
  screenY
) {

  return screenToWorld(
    Number(screenX) || 0,
    Number(screenY) || 0
  );

}


// ======================================================
// POSICIÓN DEL MUNDO → PANTALLA
// ======================================================

export function worldPositionToScreen(
  worldX,
  worldY
) {

  const camera =
    getCamera();


  const zoom =
    Number(camera.zoom) || 1;


  return {

    x:
      (
        Number(worldX) -
        camera.x
      ) *
      zoom,

    y:
      (
        Number(worldY) -
        camera.y
      ) *
      zoom

  };

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
// OBTENER DIMENSIONES
// ======================================================

export function getCanvasSizeInfo() {

  if (!canvas) {

    return {

      width: 0,

      height: 0,

      pixelRatio: 1

    };

  }


  return {

    width:
      canvas.logicalWidth ||
      canvas.clientWidth ||
      0,

    height:
      canvas.logicalHeight ||
      canvas.clientHeight ||
      0,

    pixelRatio:
      canvas.pixelRatio ||
      1

  };

}


// ======================================================
// FORZAR REDIBUJADO
// ======================================================

export function refreshMap() {

  draw();

}


// ======================================================
// DETENER RENDERER
// ======================================================

export function stopRenderer() {

  stopRenderLoop();

}


// ======================================================
// DESTRUIR RENDERER
// ======================================================

export function destroyMapRenderer() {

  stopRenderLoop();


  if (
    canvas &&
    wheelHandler
  ) {

    canvas.removeEventListener(
      "wheel",
      wheelHandler
    );

  }


  if (
    resizeHandler
  ) {

    window.removeEventListener(
      "resize",
      resizeHandler
    );

  }


  canvas = null;
  ctx = null;

  resizeHandler = null;
  wheelHandler = null;

  initialized =
    false;

}


// ======================================================
// ESTADO DEL RENDERER
// ======================================================

export function isRendererInitialized() {

  return initialized;

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

  worldPositionToScreen,

  getCanvas,

  getContext,

  getCanvasSizeInfo,

  refreshMap,

  stopRenderer,

  destroyMapRenderer,

  isRendererInitialized

};
