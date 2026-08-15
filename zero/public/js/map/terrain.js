// ======================================================
// ZERO - TERRAIN.JS
// Motor visual del terreno
//
// Responsabilidades:
// - Océano
// - Superficie de continentes
// - Bordes costeros
// - Caminos/conexiones
// - Detalles ambientales
//
// La definición de continentes vive en:
// ./continents.js
// ======================================================

import {
  getContinents,
  getContinentAt,
  getConnections
} from "./continents.js";


// ======================================================
// VARIABLES
// ======================================================

let canvas = null;
let ctx = null;

let mapSize = 100;
let tileSize = 70;


// ======================================================
// CONFIGURACIÓN VISUAL
// ======================================================

const terrainConfig = {

  ocean: {
    deep: "#061923",
    mid: "#0a3042",
    light: "#14556b",

    waveColor:
      "rgba(150, 220, 235, 0.10)"
  },

  coast: {
    shadow:
      "rgba(0, 0, 0, 0.38)",

    light:
      "rgba(255, 255, 255, 0.18)",

    width: 2
  },

  connection: {

    shadow:
      "rgba(0, 0, 0, 0.45)",

    color:
      "#8d744b",

    highlight:
      "#c8aa70",

    width:
      8,

    dash:
      [10, 8]

  },

  border: {

    color:
      "rgba(120, 220, 235, 0.40)",

    width:
      10

  }

};


// ======================================================
// INICIALIZAR
// ======================================================

export function initTerrain(
  canvasElement,
  context
) {

  canvas =
    canvasElement;

  ctx =
    context;

  if (!canvas || !ctx) {

    console.error(
      "❌ Terrain: canvas o contexto no disponible."
    );

    return;

  }

  console.log(
    "🌍 Terrain inicializado."
  );

}


// ======================================================
// CONFIGURAR TERRENO
// ======================================================

export function setTerrainConfig(
  size,
  tile
) {

  const newSize =
    Number(size);

  const newTile =
    Number(tile);


  if (
    Number.isFinite(newSize) &&
    newSize > 0
  ) {

    mapSize =
      Math.floor(newSize);

  }


  if (
    Number.isFinite(newTile) &&
    newTile > 0
  ) {

    tileSize =
      newTile;

  }

}


// ======================================================
// SEMILLA DETERMINISTA
// ======================================================

function seededRandom(
  x,
  y,
  seed = 0
) {

  const value =
    Math.sin(
      x * 12.9898 +
      y * 78.233 +
      seed * 37.719
    ) *
    43758.5453;


  return (
    value -
    Math.floor(value)
  );

}


// ======================================================
// DIBUJAR OCÉANO
// ======================================================

function drawOcean() {

  if (!ctx) {
    return;
  }


  const width =
    mapSize *
    tileSize;

  const height =
    mapSize *
    tileSize;


  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
    );


  gradient.addColorStop(
    0,
    terrainConfig.ocean.light
  );

  gradient.addColorStop(
    0.45,
    terrainConfig.ocean.mid
  );

  gradient.addColorStop(
    1,
    terrainConfig.ocean.deep
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );

}


// ======================================================
// DETALLES DEL OCÉANO
// ======================================================

function drawOceanDetails() {

  if (!ctx) {
    return;
  }


  const width =
    mapSize *
    tileSize;

  const height =
    mapSize *
    tileSize;


  ctx.save();


  ctx.strokeStyle =
    terrainConfig.ocean.waveColor;

  ctx.lineWidth =
    1;

  ctx.lineCap =
    "round";


  // Separación entre ondas
  const spacing =
    Math.max(
      tileSize * 1.8,
      90
    );


  for (
    let y = spacing;
    y < height;
    y += spacing
  ) {

    for (
      let x = spacing;
      x < width;
      x += spacing
    ) {

      const random =
        seededRandom(
          Math.floor(x),
          Math.floor(y),
          900
        );


      if (
        random < 0.72
      ) {
        continue;
      }


      const waveLength =
        tileSize *
        (
          0.25 +
          random * 0.35
        );


      ctx.beginPath();


      ctx.moveTo(
        x,
        y
      );


      ctx.quadraticCurveTo(
        x + waveLength * 0.5,
        y - 3,
        x + waveLength,
        y
      );


      ctx.stroke();

    }

  }


  ctx.restore();

}


// ======================================================
// OBTENER COLOR DEL CONTINENTE
// ======================================================

function getContinentColor(
  continent,
  x,
  y
) {

  if (
    !continent ||
    !Array.isArray(
      continent.colors
    )
  ) {

    return "#456b3b";

  }


  const seed =
    Number(
      continent.seed
    ) || 0;


  const random =
    seededRandom(
      x * 0.35,
      y * 0.35,
      seed
    );


  const colors =
    continent.colors;


  const index =
    Math.min(
      colors.length - 1,
      Math.floor(
        random *
        colors.length
      )
    );


  return (
    colors[index]
  );

}


// ======================================================
// PUNTO DENTRO DE CONTINENTE
// ======================================================

function isInsideContinent(
  continent,
  x,
  y
) {

  if (!continent) {
    return false;
  }


  const radiusX =
    Number(
      continent.radiusX
    );

  const radiusY =
    Number(
      continent.radiusY
    );


  if (
    radiusX <= 0 ||
    radiusY <= 0
  ) {

    return false;

  }


  const dx =
    (
      x -
      continent.x
    ) /
    radiusX;


  const dy =
    (
      y -
      continent.y
    ) /
    radiusY;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  const seed =
    Number(
      continent.seed
    ) || 0;


  const noise =
    seededRandom(
      x * 0.35,
      y * 0.35,
      seed
    );


  /*
   * Deformación moderada.
   *
   * Evita que los continentes
   * parezcan simples círculos.
   */

  const deformation =
    0.78 +
    noise * 0.42;


  return (
    distance <=
    deformation
  );

}


// ======================================================
// DIBUJAR CONTINENTE
// ======================================================

function drawContinent(
  continent
) {

  if (!continent) {
    return;
  }


  const minX =
    Math.max(
      0,
      Math.floor(
        continent.x -
        continent.radiusX -
        2
      )
    );


  const maxX =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.x +
        continent.radiusX +
        2
      )
    );


  const minY =
    Math.max(
      0,
      Math.floor(
        continent.y -
        continent.radiusY -
        2
      )
    );


  const maxY =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.y +
        continent.radiusY +
        2
      )
    );


  for (
    let y = minY;
    y <= maxY;
    y++
  ) {

    for (
      let x = minX;
      x <= maxX;
      x++
    ) {

      if (
        !isInsideContinent(
          continent,
          x,
          y
        )
      ) {

        continue;

      }


      const px =
        x *
        tileSize;

      const py =
        y *
        tileSize;


      ctx.fillStyle =
        getContinentColor(
          continent,
          x,
          y
        );


      ctx.fillRect(
        px,
        py,
        tileSize + 1,
        tileSize + 1
      );

    }

  }

}


// ======================================================
// DIBUJAR COSTA
// ======================================================

function drawCoast(
  continent
) {

  if (!continent) {
    return;
  }


  const minX =
    Math.max(
      0,
      Math.floor(
        continent.x -
        continent.radiusX -
        2
      )
    );


  const maxX =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.x +
        continent.radiusX +
        2
      )
    );


  const minY =
    Math.max(
      0,
      Math.floor(
        continent.y -
        continent.radiusY -
        2
      )
    );


  const maxY =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.y +
        continent.radiusY +
        2
      )
    );


  ctx.save();


  ctx.lineWidth =
    terrainConfig.coast.width;

  ctx.lineCap =
    "round";


  for (
    let y = minY;
    y <= maxY;
    y++
  ) {

    for (
      let x = minX;
      x <= maxX;
      x++
    ) {

      if (
        !isInsideContinent(
          continent,
          x,
          y
        )
      ) {

        continue;

      }


      const px =
        x *
        tileSize;

      const py =
        y *
        tileSize;


      // ------------------------------------------
      // BORDE DERECHO
      // ------------------------------------------

      if (
        !isInsideContinent(
          continent,
          x + 1,
          y
        )
      ) {

        drawCoastLine(
          px + tileSize,
          py,
          px + tileSize,
          py + tileSize
        );

      }


      // ------------------------------------------
      // BORDE INFERIOR
      // ------------------------------------------

      if (
        !isInsideContinent(
          continent,
          x,
          y + 1
        )
      ) {

        drawCoastLine(
          px,
          py + tileSize,
          px + tileSize,
          py + tileSize
        );

      }

    }

  }


  ctx.restore();

}


// ======================================================
// LÍNEA DE COSTA
// ======================================================

function drawCoastLine(
  x1,
  y1,
  x2,
  y2
) {

  // Sombra
  ctx.strokeStyle =
    terrainConfig.coast.shadow;


  ctx.beginPath();

  ctx.moveTo(
    x1 + 1,
    y1 + 1
  );

  ctx.lineTo(
    x2 + 1,
    y2 + 1
  );

  ctx.stroke();


  // Luz
  ctx.strokeStyle =
    terrainConfig.coast.light;


  ctx.beginPath();

  ctx.moveTo(
    x1,
    y1
  );

  ctx.lineTo(
    x2,
    y2
  );

  ctx.stroke();

}


// ======================================================
// DIBUJAR CONEXIÓN
// ======================================================

function drawConnection(
  connection
) {

  if (
    !connection ||
    !connection.from ||
    !connection.to
  ) {

    return;

  }


  const from =
    connection.from;

  const to =
    connection.to;


  const ax =
    from.x *
    tileSize;

  const ay =
    from.y *
    tileSize;


  const bx =
    to.x *
    tileSize;

  const by =
    to.y *
    tileSize;


  const dx =
    bx - ax;

  const dy =
    by - ay;


  const distance =
    Math.hypot(
      dx,
      dy
    );


  if (
    distance <= 0
  ) {

    return;

  }


  const nx =
    dx /
    distance;

  const ny =
    dy /
    distance;


  const startOffset =
    Math.min(
      from.radiusX,
      from.radiusY
    ) *
    tileSize *
    0.72;


  const endOffset =
    Math.min(
      to.radiusX,
      to.radiusY
    ) *
    tileSize *
    0.72;


  const startX =
    ax +
    nx *
    startOffset;

  const startY =
    ay +
    ny *
    startOffset;


  const endX =
    bx -
    nx *
    endOffset;

  const endY =
    by -
    ny *
    endOffset;


  /*
   * Punto de control.
   *
   * Esto hace que el camino tenga
   * una pequeña curva en lugar de
   * parecer una línea dibujada
   * con regla.
   */

  const midX =
    (
      startX +
      endX
    ) / 2;

  const midY =
    (
      startY +
      endY
    ) / 2;


  const curve =
    Math.min(
      distance * 0.10,
      tileSize * 4
    );


  const controlX =
    midX -
    ny *
    curve;

  const controlY =
    midY +
    nx *
    curve;


  ctx.save();


  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";


  // ------------------------------------------
  // SOMBRA
  // ------------------------------------------

  ctx.strokeStyle =
    terrainConfig
      .connection
      .shadow;

  ctx.lineWidth =
    terrainConfig
      .connection
      .width +
    6;


  drawCurvedConnection(
    startX,
    startY,
    controlX,
    controlY,
    endX,
    endY
  );


  // ------------------------------------------
  // CAMINO
  // ------------------------------------------

  ctx.strokeStyle =
    terrainConfig
      .connection
      .color;

  ctx.lineWidth =
    terrainConfig
      .connection
      .width;


  drawCurvedConnection(
    startX,
    startY,
    controlX,
    controlY,
    endX,
    endY
  );


  // ------------------------------------------
  // CENTRO ILUMINADO
  // ------------------------------------------

  ctx.strokeStyle =
    terrainConfig
      .connection
      .highlight;

  ctx.lineWidth =
    2;

  ctx.setLineDash(
    terrainConfig
      .connection
      .dash
  );


  drawCurvedConnection(
    startX,
    startY,
    controlX,
    controlY,
    endX,
    endY
  );


  ctx.setLineDash([]);


  ctx.restore();

}


// ======================================================
// CURVA DE CONEXIÓN
// ======================================================

function drawCurvedConnection(
  startX,
  startY,
  controlX,
  controlY,
  endX,
  endY
) {

  ctx.beginPath();


  ctx.moveTo(
    startX,
    startY
  );


  ctx.quadraticCurveTo(
    controlX,
    controlY,
    endX,
    endY
  );


  ctx.stroke();

}


// ======================================================
// DIBUJAR CONEXIONES
// ======================================================

function drawConnections() {

  const connections =
    getConnections();


  if (
    !Array.isArray(
      connections
    )
  ) {

    return;

  }


  for (
    const connection
    of connections
  ) {

    drawConnection(
      connection
    );

  }

}


// ======================================================
// DIBUJAR TERRENO
// ======================================================

export function drawTerrain(
  visibleTerritories,
  camera
) {

  if (
    !ctx ||
    !canvas ||
    !camera
  ) {

    return;

  }


  // --------------------------------------------
  // OCÉANO
  // --------------------------------------------

  drawOcean();


  // --------------------------------------------
  // DETALLES DEL OCÉANO
  // --------------------------------------------

  drawOceanDetails();


  // --------------------------------------------
  // CONTINENTES
  // --------------------------------------------

  const continents =
    getContinents();


  for (
    const continent
    of continents
  ) {

    drawContinent(
      continent
    );

  }


  // --------------------------------------------
  // COSTAS
  // --------------------------------------------

  for (
    const continent
    of continents
  ) {

    drawCoast(
      continent
    );

  }


  // --------------------------------------------
  // CONEXIONES
  // --------------------------------------------

  drawConnections();

}


// ======================================================
// BORDE DEL MAPA
// ======================================================

export function drawMapBorder() {

  if (!ctx) {
    return;
  }


  const size =
    mapSize *
    tileSize;


  ctx.save();


  ctx.strokeStyle =
    terrainConfig
      .border
      .color;

  ctx.lineWidth =
    terrainConfig
      .border
      .width;


  ctx.strokeRect(
    0,
    0,
    size,
    size
  );


  ctx.restore();

}


// ======================================================
// TAMAÑO DE CELDA
// ======================================================

export function getTileSize() {

  return tileSize;

}


// ======================================================
// CAMBIAR TAMAÑO DE CELDA
// ======================================================

export function setTileSize(
  size
) {

  const value =
    Number(size);


  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    return;

  }


  tileSize =
    value;

}


// ======================================================
// OBTENER CONTINENTES
// ======================================================

export function getTerrainContinents() {

  return getContinents();

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initTerrain,

  setTerrainConfig,

  drawTerrain,

  drawMapBorder,

  getTileSize,

  setTileSize,

  getTerrainContinents

};
