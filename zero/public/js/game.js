// ======================================================
// ZERO - GAME.JS
// Coordinador principal del cliente
// ======================================================

import {
  setPlayer,
  getPlayer,
  setMapSize,
  setTerritories,
  getTerritories,
  updateTerritory,
  updateResources
} from "./state.js";

import {
  socket,
  initSocket,
  attackTerritory,
  requestPlayerState
} from "./socket.js";

import {
  initUI,
  updateResources as updateUIResources,
  updateResourceData,
  showBattleResult,
  showError,
  showCityInfo
} from "./ui.js";

import {
  initCamera,
  centerOn,
  move,
  zoomAt,
  beginRender,
  endRender
} from "./map/camera.js";

import {
  initCities,
  drawCities
} from "./map/cities.js";

import {
  initInput,
  setTerritories as setInputTerritories,
  getSelectedTerritory
} from "./map/input.js";

import {
  drawTerrain
} from "./map/terrain.js";


// ======================================================
// CANVAS
// ======================================================

const canvas =
  document.getElementById("map");

if (!canvas) {

  console.error(
    "❌ ZERO: Canvas #map no encontrado."
  );

  throw new Error(
    "Canvas #map no encontrado"
  );

}


const ctx =
  canvas.getContext("2d");


// ======================================================
// CONFIGURACIÓN
// ======================================================

const TILE_SIZE = 70;

let initialized = false;


// ======================================================
// REDIMENSIONAR CANVAS
// ======================================================

function resizeCanvas() {

  canvas.width =
    window.innerWidth;

  canvas.height =
    Math.max(
      300,
      window.innerHeight - 120
    );


  render();

}


// ======================================================
// RENDER PRINCIPAL
// ======================================================

function render() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  const mapSize =
    getMapSizeSafe();


  beginRender();


  drawTerrain(
    ctx,
    mapSize,
    TILE_SIZE
  );


  drawCities(
    getTerritories(),
    getPlayer(),
    getSelectedId()
  );


  endRender();

}


// ======================================================
// MAP SIZE
// ======================================================

function getMapSizeSafe() {

  const element =
    document.documentElement;

  return (
    Number(
      element.dataset.mapSize
    ) || 100
  );

}


// ======================================================
// SELECCIÓN
// ======================================================

function getSelectedId() {

  const selected =
    getSelectedTerritory();

  return selected
    ? selected.id
    : null;

}


// ======================================================
// CENTRAR JUGADOR
// ======================================================

function centerPlayer() {

  const player =
    getPlayer();


  if (!player) {
    return;
  }


  centerOn(
    player.x,
    player.y,
    TILE_SIZE
  );


  render();

}


// ======================================================
// ATAQUE
// ======================================================

function handleAttack(
  territory
) {

  const player =
    getPlayer();


  if (
    !player ||
    !territory
  ) {

    return;

  }


  if (
    territory.ownerId ===
    player.id
  ) {

    return;

  }


  const cityName =
    territory.cityName ||
    `Ciudad ${territory.id}`;


  /*
   * Ya no usamos alert().
   *
   * Mostramos la confirmación
   * mediante la interfaz del juego.
   */

  const confirmed =
    window.confirm(
      `¿Atacar ${cityName}?`
    );


  if (!confirmed) {
    return;
  }


  attackTerritory(
    territory.id
  );

}


// ======================================================
// INICIALIZAR
// ======================================================

function init() {

  if (initialized) {
    return;
  }


  initialized = true;


  console.log(
    "🎮 Inicializando ZERO..."
  );


  // -----------------------------------------------
  // CANVAS
  // -----------------------------------------------

  initCamera(
    canvas,
    ctx
  );


  // -----------------------------------------------
  // CIUDADES
  // -----------------------------------------------

  initCities(
    ctx,
    TILE_SIZE
  );


  // -----------------------------------------------
  // UI
  // -----------------------------------------------

  initUI();


  // -----------------------------------------------
  // INPUT
  // -----------------------------------------------

  initInput({

    canvas,

    socket,

    getPlayer,

    onSelect:
      territory => {

        if (
          territory
        ) {

          showCityInfo(
            territory
          );

        }

        render();

      },

    onAttackRequest:
      territory => {

        handleAttack(
          territory
        );

      },

    onRender:
      event => {

        if (!event) {
          render();
          return;
        }


        // ---------------------------------------
        // ARRASTRAR
        // ---------------------------------------

        if (
          event.type ===
          "drag"
        ) {

          move(
            event.dx /
              getCurrentZoom(),

            event.dy /
              getCurrentZoom()
          );

        }


        // ---------------------------------------
        // ZOOM
        // ---------------------------------------

        if (
          event.type ===
          "zoom"
        ) {

          zoomAt(
            event.screenX,
            event.screenY,
            event.direction
          );

        }


        render();

      }

  });


  // -----------------------------------------------
  // SOCKET
  // -----------------------------------------------

  initSocket();


  // -----------------------------------------------
  // EVENTOS DEL CLIENTE
  // -----------------------------------------------

  window.addEventListener(
    "zero:battle-result",
    handleBattleResult
  );


  window.addEventListener(
    "zero:server-error",
    handleServerError
  );


  window.addEventListener(
    "zero:territory-lost",
    handleTerritoryLost
  );


  // -----------------------------------------------
  // RESIZE
  // -----------------------------------------------

  window.addEventListener(
    "resize",
    resizeCanvas
  );


  // -----------------------------------------------
  // INICIO
  // -----------------------------------------------

  resizeCanvas();


  console.log(
    "✅ ZERO iniciado correctamente."
  );

}


// ======================================================
// ZOOM ACTUAL
// ======================================================

function getCurrentZoom() {

  const position =
    window.zeroCameraPosition
      ? window.zeroCameraPosition()
      : null;


  if (
    position &&
    position.zoom
  ) {

    return position.zoom;

  }


  return 1;

}


// ======================================================
// RESULTADO DE BATALLA
// ======================================================

function handleBattleResult(
  event
) {

  const result =
    event.detail;


  if (!result) {
    return;
  }


  showBattleResult(
    result
  );


  requestPlayerState();


  render();

}


// ======================================================
// ERROR
// ======================================================

function handleServerError(
  event
) {

  const data =
    event.detail;


  showError(
    data?.message ||
      "Error del servidor."
  );

}


// ======================================================
// TERRITORIO PERDIDO
// ======================================================

function handleTerritoryLost(
  event
) {

  const data =
    event.detail;


  console.log(
    "❌ Territorio perdido:",
    data
  );


  render();

}


// ======================================================
// ACTUALIZAR ESTADO DESDE SOCKET
// ======================================================

socket.on(
  "player:init",
  data => {

    if (!data) {
      return;
    }


    if (data.player) {

      setPlayer(
        data.player
      );

      updateUIResources(
        data.player
      );

    }


    if (data.mapSize) {

      setMapSize(
        data.mapSize
      );


      document.documentElement
        .dataset.mapSize =
          data.mapSize;

    }


    centerPlayer();

    render();

  }
);


// ======================================================
// MAPA
// ======================================================

socket.on(
  "map:visible",
  territories => {

    setTerritories(
      territories || []
    );


    setInputTerritories(
      territories || []
    );


    render();

  }
);


// ======================================================
// TERRITORIO ACTUALIZADO
// ======================================================

socket.on(
  "territory:updated",
  territory => {

    if (!territory) {
      return;
    }


    updateTerritory(
      territory
    );


    setInputTerritories(
      getTerritories()
    );


    render();

  }
);


// ======================================================
// RECURSOS
// ======================================================

socket.on(
  "resources:update",
  data => {

    if (!data) {
      return;
    }


    updateResources(
      data
    );


    updateResourceData(
      data
    );

});


// ======================================================
// ACTUALIZACIÓN DEL JUGADOR
// ======================================================

socket.on(
  "player:update",
  data => {

    if (!data) {
      return;
    }


    updateResources(
      data
    );


    updateResourceData(
      data
    );


    render();

  }
);


// ======================================================
// INICIAR
// ======================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

} else {

  init();

}
