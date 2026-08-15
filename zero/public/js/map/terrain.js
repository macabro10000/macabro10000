// ======================================================
// ZERO - TERRAIN.JS
// Motor visual profesional del terreno
//
// Responsabilidades:
// - Océano
// - Masas continentales irregulares
// - Costas
// - Variación visual por bioma
// - Pequeñas uniones territoriales
// - Detalles ambientales
// - Borde del mundo
//
// Los datos de los continentes viven en:
// ./continents.js
// ======================================================

import {
  getContinents,
  getConnections
} from "./continents.js";


// ======================================================
// ESTADO
// ======================================================

let canvas = null;
let ctx = null;

let mapSize = 100;
let tileSize = 70;


// ======================================================
// CONFIGURACIÓN
// ======================================================

const terrainConfig = {

  ocean: {
    deep: "#061722",
    mid: "#0a3041",
    light: "#14556b",

    wave:
      "rgba(170, 225, 235, 0.09)",

    waveSecondary:
      "rgba(110, 190, 210, 0.06)"
  },


  coast: {

    shadow:
      "rgba(0, 0, 0, 0.42)",

    foam:
      "rgba(235, 250, 247, 0.28)",

    highlight:
      "rgba(255, 255, 255, 0.10)",

    width:
      3

  },


  connection: {

    shadow:
      "rgba(0, 0, 0, 0.42)",

    ground:
      "#806b48",

    highlight:
      "#b99a64",

    width:
      12

  },


  border: {

    color:
      "rgba(120, 220, 235, 0.38)",

    width:
      10

  }

};


// ======================================================
// PALETAS DE BIOMAS
// ======================================================

const BIOME_PALETTES = {

  nature: {

    base: [
      "#244c2b",
      "#2f6136",
      "#3c7340",
      "#4e8247",
      "#65934f"
    ],

    light:
      "rgba(180, 220, 135, 0.13)",

    shadow:
      "rgba(10, 35, 15, 0.20)"

  },


  ice: {

    base: [
      "#a9cbd3",
      "#c7e0e5",
      "#dcecef",
      "#edf7f8",
      "#ffffff"
    ],

    light:
      "rgba(255, 255, 255, 0.30)",

    shadow:
      "rgba(55, 105, 120, 0.18)"

  },


  fire: {

    base: [
      "#351716",
      "#522019",
      "#70291b",
      "#94341b",
      "#bd481c"
    ],

    light:
      "rgba(255, 115, 35, 0.18)",

    shadow:
      "rgba(20, 5, 5, 0.28)"

  },


  desert: {

    base: [
      "#8b6639",
      "#a4773d",
      "#bb8945",
      "#d09e55",
      "#e0b96d"
    ],

    light:
      "rgba(255, 225, 155, 0.18)",

    shadow:
      "rgba(70, 45, 20, 0.18)"

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
      "❌ ZERO Terrain: canvas/context inválido."
    );

    return false;

  }

  console.log(
    "🌍 ZERO Terrain inicializado."
  );

  return true;

}


// ======================================================
// CONFIGURACIÓN DEL MAPA
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
// RANDOM DETERMINISTA
// ======================================================

function seededRandom(
  x,
  y,
  seed = 0
) {

  const value =
    Math.sin(
      x * 127.1 +
      y * 311.7 +
      seed * 74.7
    ) *
    43758.5453123;


  return (
    value -
    Math.floor(value)
  );

}


// ======================================================
// HASH SIMPLE
// ======================================================

function hash(
  value
) {

  const string =
    String(value);

  let result =
    2166136261;


  for (
    let i = 0;
    i < string.length;
    i++
  ) {

    result ^=
      string.charCodeAt(i);

    result =
      Math.imul(
        result,
        16777619
      );

  }


  return (
    result >>> 0
  );

}


// ======================================================
// RUIDO SUAVE
// ======================================================

function smoothNoise(
  x,
  y,
  seed
) {

  const x0 =
    Math.floor(x);

  const y0 =
    Math.floor(y);


  const x1 =
    x0 + 1;

  const y1 =
    y0 + 1;


  const sx =
    x - x0;

  const sy =
    y - y0;


  const n00 =
    seededRandom(
      x0,
      y0,
      seed
    );

  const n10 =
    seededRandom(
      x1,
      y0,
      seed
    );

  const n01 =
    seededRandom(
      x0,
      y1,
      seed
    );

  const n11 =
    seededRandom(
      x1,
      y1,
      seed
    );


  const ix0 =
    n00 +
    (n10 - n00) * sx;

  const ix1 =
    n01 +
    (n11 - n01) * sx;


  const smoothX =
    sx * sx *
    (3 - 2 * sx);

  const smoothY =
    sy * sy *
    (3 - 2 * sy);


  const top =
    n00 +
    (n10 - n00) *
    smoothX;

  const bottom =
    n01 +
    (n11 - n01) *
    smoothX;


  return (
    top +
    (bottom - top) *
    smoothY
  );

}


// ======================================================
// RUIDO MULTICAPA
// ======================================================

function fractalNoise(
  x,
  y,
  seed
) {

  let value = 0;

  let amplitude = 0.5;

  let frequency = 1;

  let totalAmplitude = 0;


  for (
    let octave = 0;
    octave < 4;
    octave++
  ) {

    value +=
      smoothNoise(
        x * frequency,
        y * frequency,
        seed + octave * 101
      ) *
      amplitude;


    totalAmplitude +=
      amplitude;


    amplitude *=
      0.5;

    frequency *=
      2;

  }


  return (
    value /
    totalAmplitude
  );

}


// ======================================================
// OBTENER PALETA
// ======================================================

function getPalette(
  continent
) {

  const palette =
    BIOME_PALETTES[
      continent?.type
    ];


  return (
    palette ||
    BIOME_PALETTES.nature
  );

}


// ======================================================
// RADIO EFECTIVO
// ======================================================

function getEffectiveRadius(
  continent,
  angle,
  seed
) {

  const base =
    1;


  const largeNoise =
    smoothNoise(
      Math.cos(angle) * 1.4,
      Math.sin(angle) * 1.4,
      seed
    );


  const mediumNoise =
    smoothNoise(
      Math.cos(angle) * 3.5,
      Math.sin(angle) * 3.5,
      seed + 50
    );


  const smallNoise =
    smoothNoise(
      Math.cos(angle) * 8,
      Math.sin(angle) * 8,
      seed + 100
    );


  return (
    base +
    (largeNoise - 0.5) * 0.28 +
    (mediumNoise - 0.5) * 0.18 +
    (smallNoise - 0.5) * 0.08
  );

}


// ======================================================
// PUNTO DENTRO DEL CONTINENTE
//
// Aquí está el cambio importante.
// Ya no usamos una simple elipse deformada.
// La costa cambia según el ángulo.
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
    Math.hypot(
      dx,
      dy
    );


  if (
    distance > 1.35
  ) {

    return false;

  }


  const angle =
    Math.atan2(
      dy,
      dx
    );


  const seed =
    Number(
      continent.seed
    ) || 0;


  const deformation =
    getEffectiveRadius(
      continent,
      angle,
      seed
    );


  return (
    distance <=
    deformation
  );

}


// ======================================================
// DISTANCIA A LA COSTA
// ======================================================

function getCoastFactor(
  continent,
  x,
  y
) {

  if (
    !isInsideContinent(
      continent,
      x,
      y
    )
  ) {

    return 0;

  }


  const steps =
    4;

  let nearest =
    1;


  const dx =
    x -
    continent.x;

  const dy =
    y -
    continent.y;


  const angle =
    Math.atan2(
      dy,
      dx
    );


  for (
    let i = 1;
    i <= steps;
    i++
  ) {

    const distance =
      i * 0.08;


    const testX =
      x +
      Math.cos(angle) *
      distance *
      continent.radiusX;


    const testY =
      y +
      Math.sin(angle) *
      distance *
      continent.radiusY;


    if (
      !isInsideContinent(
        continent,
        testX,
        testY
      )
    ) {

      nearest =
        1 -
        i / (steps + 1);

      break;

    }

  }


  return nearest;

}


// ======================================================
// COLOR DEL TERRENO
// ======================================================

function getTerrainColor(
  continent,
  x,
  y
) {

  const palette =
    getPalette(
      continent
    );


  const seed =
    Number(
      continent.seed
    ) || 0;


  const noise =
    fractalNoise(
      x * 0.12,
      y * 0.12,
      seed
    );


  const index =
    Math.max(
      0,
      Math.min(
        palette.base.length - 1,
        Math.floor(
          noise *
          palette.base.length
        )
      )
    );


  return palette.base[
    index
  ];

}


// ======================================================
// DIBUJAR OCÉANO
// ======================================================

function drawOcean() {

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

  const width =
    mapSize *
    tileSize;

  const height =
    mapSize *
    tileSize;


  const spacing =
    Math.max(
      tileSize * 1.7,
      100
    );


  ctx.save();

  ctx.lineCap =
    "round";


  for (
    let y = spacing * 0.7;
    y < height;
    y += spacing
  ) {

    for (
      let x = spacing * 0.7;
      x < width;
      x += spacing
    ) {

      const random =
        seededRandom(
          Math.floor(x),
          Math.floor(y),
          901
        );


      if (
        random < 0.68
      ) {

        continue;

      }


      const length =
        tileSize *
        (
          0.25 +
          random * 0.45
        );


      ctx.strokeStyle =
        terrainConfig
          .ocean
          .waveColor;


      ctx.lineWidth =
        1;


      ctx.beginPath();

      ctx.moveTo(
        x,
        y
      );


      ctx.quadraticCurveTo(
        x + length * 0.5,
        y - 3,
        x + length,
        y
      );


      ctx.stroke();

    }

  }


  ctx.restore();

}


// ======================================================
// LÍMITES DE RENDERIZADO
// ======================================================

function getBounds(
  continent
) {

  return {

    minX:
      Math.max(
        0,
        Math.floor(
          continent.x -
          continent.radiusX -
          3
        )
      ),

    maxX:
      Math.min(
        mapSize - 1,
        Math.ceil(
          continent.x +
          continent.radiusX +
          3
        )
      ),

    minY:
      Math.max(
        0,
        Math.floor(
          continent.y -
          continent.radiusY -
          3
        )
      ),

    maxY:
      Math.min(
        mapSize - 1,
        Math.ceil(
          continent.y +
          continent.radiusY +
          3
        )
      )

  };

}


// ======================================================
// DIBUJAR MASA CONTINENTAL
// ======================================================

function drawContinent(
  continent
) {

  const bounds =
    getBounds(
      continent
    );


  const palette =
    getPalette(
      continent
    );


  for (
    let y = bounds.minY;
    y <= bounds.maxY;
    y++
  ) {

    for (
      let x = bounds.minX;
      x <= bounds.maxX;
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
        getTerrainColor(
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


      // ----------------------------------------
      // LUZ NATURAL
      // ----------------------------------------

      const localNoise =
        fractalNoise(
          x * 0.18,
          y * 0.18,
          continent.seed + 400
        );


      if (
        localNoise > 0.72
      ) {

        ctx.fillStyle =
          palette.light;


        ctx.fillRect(
          px,
          py,
          tileSize + 1,
          tileSize + 1
        );

      }


      // ----------------------------------------
      // SOMBRAS
      // ----------------------------------------

      if (
        localNoise < 0.25
      ) {

        ctx.fillStyle =
          palette.shadow;


        ctx.fillRect(
          px,
          py,
          tileSize + 1,
          tileSize + 1
        );

      }

    }

  }

}


// ======================================================
// COSTAS
// ======================================================

function drawCoast(
  continent
) {

  const bounds =
    getBounds(
      continent
    );


  ctx.save();

  ctx.lineCap =
    "round";

  ctx.lineWidth =
    terrainConfig
      .coast
      .width;


  for (
    let y = bounds.minY;
    y <= bounds.maxY;
    y++
  ) {

    for (
      let x = bounds.minX;
      x <= bounds.maxX;
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


      // DERECHA

      if (
        !isInsideContinent(
          continent,
          x + 1,
          y
        )
      ) {

        drawCoastSegment(
          px + tileSize,
          py,
          px + tileSize,
          py + tileSize
        );

      }


      // IZQUIERDA

      if (
        !isInsideContinent(
          continent,
          x - 1,
          y
        )
      ) {

        drawCoastSegment(
          px,
          py,
          px,
          py + tileSize
        );

      }


      // ABAJO

      if (
        !isInsideContinent(
          continent,
          x,
          y + 1
        )
      ) {

        drawCoastSegment(
          px,
          py + tileSize,
          px + tileSize,
          py + tileSize
        );

      }


      // ARRIBA

      if (
        !isInsideContinent(
          continent,
          x,
          y - 1
        )
      ) {

        drawCoastSegment(
          px,
          py,
          px + tileSize,
          py
        );

      }

    }

  }


  ctx.restore();

}


// ======================================================
// SEGMENTO DE COSTA
// ======================================================

function drawCoastSegment(
  x1,
  y1,
  x2,
  y2
) {

  // Sombra

  ctx.strokeStyle =
    terrainConfig
      .coast
      .shadow;


  ctx.beginPath();

  ctx.moveTo(
    x1 + 2,
    y1 + 2
  );

  ctx.lineTo(
    x2 + 2,
    y2 + 2
  );

  ctx.stroke();


  // Espuma / luz

  ctx.strokeStyle =
    terrainConfig
      .coast
      .foam;


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
// CALCULAR EXTENSIÓN DE CONEXIÓN
// ======================================================

function getConnectionPoint(
  continent,
  target
) {

  const dx =
    target.x -
    continent.x;

  const dy =
    target.y -
    continent.y;


  const angle =
    Math.atan2(
      dy,
      dx
    );


  const radius =
    Math.min(
      continent.radiusX,
      continent.radiusY
    );


  const factor =
    getEffectiveRadius(
      continent,
      angle,
      Number(continent.seed) || 0
    );


  return {

    x:
      continent.x +
      Math.cos(angle) *
      radius *
      factor *
      0.86,

    y:
      continent.y +
      Math.sin(angle) *
      radius *
      factor *
      0.86

  };

}


// ======================================================
// DIBUJAR CONEXIÓN
//
// No atraviesa todo el océano.
// Es una pequeña unión visual.
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


  const start =
    getConnectionPoint(
      from,
      to
    );


  const end =
    getConnectionPoint(
      to,
      from
    );


  const ax =
    start.x *
    tileSize;

  const ay =
    start.y *
    tileSize;

  const bx =
    end.x *
    tileSize;

  const by =
    end.y *
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


  /*
   * La conexión ahora se dibuja
   * únicamente como una pequeña
   * "lengua" territorial.
   */

  const maxConnection =
    tileSize * 5;


  const ratio =
    Math.min(
      1,
      maxConnection /
      distance
    );


  const endX =
    ax +
    dx * ratio;

  const endY =
    ay +
    dy * ratio;


  const midX =
    (
      ax +
      endX
    ) / 2;

  const midY =
    (
      ay +
      endY
    ) / 2;


  const normalX =
    -dy /
    distance;

  const normalY =
    dx /
    distance;


  const curve =
    Math.min(
      tileSize * 1.3,
      distance * 0.18
    );


  const controlX =
    midX +
    normalX *
    curve;

  const controlY =
    midY +
    normalY *
    curve;


  ctx.save();

  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";


  // Sombra

  ctx.strokeStyle =
    terrainConfig
      .connection
      .shadow;

  ctx.lineWidth =
    terrainConfig
      .connection
      .width +
    5;


  drawQuadraticPath(
    ax,
    ay,
    controlX,
    controlY,
    endX,
    endY
  );


  // Tierra

  ctx.strokeStyle =
    terrainConfig
      .connection
      .ground;

  ctx.lineWidth =
    terrainConfig
      .connection
      .width;


  drawQuadraticPath(
    ax,
    ay,
    controlX,
    controlY,
    endX,
    endY
  );


  // Luz central

  ctx.strokeStyle =
    terrainConfig
      .connection
      .highlight;

  ctx.lineWidth =
    2;


  drawQuadraticPath(
    ax,
    ay,
    controlX,
    controlY,
    endX,
    endY
  );


  ctx.restore();

}


// ======================================================
// CURVA
// ======================================================

function drawQuadraticPath(
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
// CONEXIONES
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

    /*
     * El continents.js actual devuelve
     * únicamente IDs en from/to.
     *
     * Por eso resolvemos aquí.
     */

    const from =
      getContinents()
        .find(
          continent =>
            continent.id ===
            connection.from
        );


    const to =
      getContinents()
        .find(
          continent =>
            continent.id ===
            connection.to
        );


    if (
      !from ||
      !to
    ) {

      continue;

    }


    drawConnection({

      ...connection,

      from,

      to

    });

  }

}


// ======================================================
// DETALLES DE BIOMA
// ======================================================

function drawBiomeDetails(
  continent
) {

  if (!continent) {
    return;
  }


  const seed =
    Number(
      continent.seed
    ) || 0;


  const palette =
    getPalette(
      continent
    );


  const bounds =
    getBounds(
      continent
    );


  ctx.save();


  for (
    let i = 0;
    i < 45;
    i++
  ) {

    const rx =
      seededRandom(
        i,
        11,
        seed
      );

    const ry =
      seededRandom(
        i,
        27,
        seed
      );


    const x =
      bounds.minX +
      rx *
      (
        bounds.maxX -
        bounds.minX
      );


    const y =
      bounds.minY +
      ry *
      (
        bounds.maxY -
        bounds.minY
      );


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


    const size =
      tileSize *
      (
        0.04 +
        seededRandom(
          i,
          71,
          seed
        ) *
        0.09
      );


    // Detalle sutil, no edificios.

    ctx.fillStyle =
      palette.light;


    ctx.globalAlpha =
      0.45;


    ctx.beginPath();

    ctx.arc(
      px,
      py,
      size,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  ctx.restore();

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
    !canvas
  ) {

    return;

  }


  // --------------------------------------------------
  // OCÉANO
  // --------------------------------------------------

  drawOcean();


  // --------------------------------------------------
  // ONDAS
  // --------------------------------------------------

  drawOceanDetails();


  // --------------------------------------------------
  // CONTINENTES
  // --------------------------------------------------

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


  // --------------------------------------------------
  // DETALLES
  // --------------------------------------------------

  for (
    const continent
    of continents
  ) {

    drawBiomeDetails(
      continent
    );

  }


  // --------------------------------------------------
  // COSTAS
  // --------------------------------------------------

  for (
    const continent
    of continents
  ) {

    drawCoast(
      continent
    );

  }


  // --------------------------------------------------
  // UNIONES
  // --------------------------------------------------

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
// TILE SIZE
// ======================================================

export function getTileSize() {

  return tileSize;

}


// ======================================================
// CAMBIAR TILE SIZE
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

    return false;

  }


  tileSize =
    value;

  return true;

}


// ======================================================
// OBTENER CONTINENTES
// ======================================================

export function getTerrainContinents() {

  return getContinents();

}


// ======================================================
// OBTENER TAMAÑO DEL MAPA
// ======================================================

export function getTerrainSize() {

  return {

    width:
      mapSize *
      tileSize,

    height:
      mapSize *
      tileSize,

    mapSize,

    tileSize

  };

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

  getTerrainContinents,

  getTerrainSize

};
