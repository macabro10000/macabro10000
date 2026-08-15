// ======================================================
// ZERO - TERRAIN.JS
// Terreno visual procedural
// Océano + cuatro continentes + conexiones
// ======================================================

let ctx = null;
let canvas = null;

let mapSize = 100;
let tileSize = 70;


// ======================================================
// CONFIGURACIÓN
// ======================================================

const terrainConfig = {

  ocean: {
    deep: "#071d2b",
    mid: "#0b3447",
    light: "#12506a"
  },

  continents: {

    nature: {
      name: "nature",
      colors: [
        "#244d2b",
        "#316638",
        "#3f7a42",
        "#568b48",
        "#6d9b50"
      ]
    },

    ice: {
      name: "ice",
      colors: [
        "#b9d7df",
        "#d7e9ed",
        "#eef7f8",
        "#ffffff",
        "#a7cbd5"
      ]
    },

    fire: {
      name: "fire",
      colors: [
        "#3a1714",
        "#572019",
        "#7b2919",
        "#a53b18",
        "#d85b1c"
      ]
    },

    desert: {
      name: "desert",
      colors: [
        "#8b6738",
        "#a77b40",
        "#c2934b",
        "#d8ae63",
        "#e5c47d"
      ]
    }

  },

  connection: {
    color: "#8f7950",
    edge: "#c0a66c",
    width: 9
  }

};


// ======================================================
// CONTINENTES
// ======================================================

const continents = [

  {
    id: "nature",
    type: "nature",

    // Centro aproximado
    x: 25,
    y: 26,

    // Radio aproximado
    radiusX: 17,
    radiusY: 14,

    seed: 11
  },

  {
    id: "ice",
    type: "ice",

    x: 72,
    y: 23,

    radiusX: 16,
    radiusY: 13,

    seed: 27
  },

  {
    id: "fire",
    type: "fire",

    x: 25,
    y: 73,

    radiusX: 16,
    radiusY: 14,

    seed: 43
  },

  {
    id: "desert",
    type: "desert",

    x: 72,
    y: 72,

    radiusX: 17,
    radiusY: 14,

    seed: 61
  }

];


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

  console.log(
    "🌍 Terreno continental inicializado."
  );

}


// ======================================================
// CONFIGURAR MAPA
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
      newSize;

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
// SEMILLA
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
    (n10 - n00) *
    sx;

  const ix1 =
    n01 +
    (n11 - n01) *
    sx;


  return (
    ix0 +
    (ix1 - ix0) *
    sy
  );

}


// ======================================================
// CONTINENTE QUE CONTIENE UN PUNTO
// ======================================================

function getContinentAt(
  x,
  y
) {

  for (
    const continent
    of continents
  ) {

    const dx =
      (
        x -
        continent.x
      ) /
      continent.radiusX;

    const dy =
      (
        y -
        continent.y
      ) /
      continent.radiusY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    // ----------------------------------------------
    // FORMA IRREGULAR
    // ----------------------------------------------

    const noise =
      smoothNoise(
        x * 0.35,
        y * 0.35,
        continent.seed
      );


    const deformation =
      0.78 +
      noise * 0.42;


    if (
      distance <
      deformation
    ) {

      return continent;

    }

  }


  return null;

}


// ======================================================
// DIBUJAR OCÉANO
// ======================================================

function drawOcean(
  width,
  height
) {

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

function drawOceanDetails(
  startX,
  startY,
  endX,
  endY
) {

  ctx.save();


  for (
    let y = startY;
    y <= endY;
    y += 5
  ) {

    for (
      let x = startX;
      x <= endX;
      x += 7
    ) {

      const random =
        seededRandom(
          x,
          y,
          900
        );


      if (
        random < 0.72
      ) {

        continue;

      }


      const px =
        x *
        tileSize;

      const py =
        y *
        tileSize;


      ctx.strokeStyle =
        "rgba(130,210,225,0.09)";

      ctx.lineWidth =
        1;


      ctx.beginPath();

      ctx.moveTo(
        px,
        py
      );

      ctx.lineTo(
        px + tileSize * 0.45,
        py
      );

      ctx.stroke();

    }

  }


  ctx.restore();

}


// ======================================================
// COLOR DEL CONTINENTE
// ======================================================

function getContinentColor(
  continent,
  x,
  y
) {

  const biome =
    terrainConfig
      .continents[
        continent.type
      ];


  const noise =
    smoothNoise(
      x * 0.22,
      y * 0.22,
      continent.seed
    );


  const index =
    Math.min(
      biome.colors.length - 1,
      Math.floor(
        noise *
        biome.colors.length
      )
    );


  return biome.colors[index];

}


// ======================================================
// DIBUJAR CONTINENTE
// ======================================================

function drawContinent(
  continent
) {

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

      const dx =
        (
          x -
          continent.x
        ) /
        continent.radiusX;

      const dy =
        (
          y -
          continent.y
        ) /
        continent.radiusY;


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      const noise =
        smoothNoise(
          x * 0.35,
          y * 0.35,
          continent.seed
        );


      const deformation =
        0.78 +
        noise * 0.42;


      if (
        distance >
        deformation
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
// BORDE DEL CONTINENTE
// ======================================================

function drawContinentEdges(
  continent
) {

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

  ctx.strokeStyle =
    "rgba(255,255,255,0.10)";

  ctx.lineWidth =
    2;


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

      const current =
        getContinentAt(
          x,
          y
        );


      if (
        !current ||
        current.id !==
        continent.id
      ) {

        continue;

      }


      const px =
        x *
        tileSize;

      const py =
        y *
        tileSize;


      const right =
        getContinentAt(
          x + 1,
          y
        );


      const bottom =
        getContinentAt(
          x,
          y + 1
        );


      if (
        !right ||
        right.id !==
        continent.id
      ) {

        ctx.beginPath();

        ctx.moveTo(
          px + tileSize,
          py
        );

        ctx.lineTo(
          px + tileSize,
          py + tileSize
        );

        ctx.stroke();

      }


      if (
        !bottom ||
        bottom.id !==
        continent.id
      ) {

        ctx.beginPath();

        ctx.moveTo(
          px,
          py + tileSize
        );

        ctx.lineTo(
          px + tileSize,
          py + tileSize
        );

        ctx.stroke();

      }

    }

  }


  ctx.restore();

}


// ======================================================
// CONEXIONES ENTRE CONTINENTES
// ======================================================

function drawConnection(
  continentA,
  continentB
) {

  const ax =
    continentA.x *
    tileSize;

  const ay =
    continentA.y *
    tileSize;


  const bx =
    continentB.x *
    tileSize;

  const by =
    continentB.y *
    tileSize;


  const dx =
    bx - ax;

  const dy =
    by - ay;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
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


  const startDistance =
    Math.min(
      continentA.radiusX,
      continentA.radiusY
    ) *
    tileSize *
    0.75;


  const endDistance =
    Math.min(
      continentB.radiusX,
      continentB.radiusY
    ) *
    tileSize *
    0.75;


  const startX =
    ax +
    nx *
    startDistance;

  const startY =
    ay +
    ny *
    startDistance;


  const endX =
    bx -
    nx *
    endDistance;

  const endY =
    by -
    ny *
    endDistance;


  ctx.save();


  // Sombra del camino

  ctx.strokeStyle =
    "rgba(0,0,0,0.35)";

  ctx.lineWidth =
    terrainConfig
      .connection.width +
    5;

  ctx.lineCap =
    "round";


  ctx.beginPath();

  ctx.moveTo(
    startX,
    startY
  );

  ctx.lineTo(
    endX,
    endY
  );

  ctx.stroke();


  // Camino

  ctx.strokeStyle =
    terrainConfig
      .connection.color;

  ctx.lineWidth =
    terrainConfig
      .connection.width;

  ctx.beginPath();

  ctx.moveTo(
    startX,
    startY
  );

  ctx.lineTo(
    endX,
    endY
  );

  ctx.stroke();


  // Borde

  ctx.strokeStyle =
    terrainConfig
      .connection.edge;

  ctx.lineWidth =
    2;

  ctx.setLineDash([
    8,
    8
  ]);

  ctx.beginPath();

  ctx.moveTo(
    startX,
    startY
  );

  ctx.lineTo(
    endX,
    endY
  );

  ctx.stroke();


  ctx.restore();

}


// ======================================================
// DIBUJAR TODAS LAS CONEXIONES
// ======================================================

function drawConnections() {

  drawConnection(
    continents[0],
    continents[1]
  );


  drawConnection(
    continents[0],
    continents[2]
  );


  drawConnection(
    continents[1],
    continents[3]
  );


  drawConnection(
    continents[2],
    continents[3]
  );

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


  const width =
    mapSize *
    tileSize;

  const height =
    mapSize *
    tileSize;


  // ----------------------------------------------
  // OCÉANO
  // ----------------------------------------------

  drawOcean(
    width,
    height
  );


  // ----------------------------------------------
  // CONTINENTES
  // ----------------------------------------------

  for (
    const continent
    of continents
  ) {

    drawContinent(
      continent
    );

  }


  // ----------------------------------------------
  // BORDES
  // ----------------------------------------------

  for (
    const continent
    of continents
  ) {

    drawContinentEdges(
      continent
    );

  }


  // ----------------------------------------------
  // CONEXIONES
  // ----------------------------------------------

  drawConnections();


  // ----------------------------------------------
  // DETALLES DEL OCÉANO
  // ----------------------------------------------

  drawOceanDetails(
    0,
    0,
    mapSize,
    mapSize
  );

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
    "rgba(125,220,235,0.35)";

  ctx.lineWidth =
    10;


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

export function getContinents() {

  return continents.map(
    continent => ({
      ...continent
    })
  );

}


// ======================================================
// OBTENER CONTINENTE POR ID
// ======================================================

export function getContinentById(
  id
) {

  return (
    continents.find(
      continent =>
        continent.id === id
    ) ||
    null
  );

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

  getContinents,

  getContinentById

};
