// ======================================================
// ZERO - TERRAIN.JS
// Motor visual del terreno
// ======================================================

let ctx = null;
let canvas = null;

let mapSize = 100;
let tileSize = 70;


// ======================================================
// CONFIGURACIÓN
// ======================================================

const terrainConfig = {

  grass: [
    "#385b36",
    "#3f6539",
    "#476d3d",
    "#345332",
    "#4b7340",
    "#3b6037"
  ],

  darkGrass:
    "rgba(20,45,25,0.20)",

  lightGrass:
    "rgba(170,200,120,0.08)",

  water:
    "#244f63",

  waterLight:
    "rgba(100,170,190,0.18)",

  dirt:
    "#765f3d",

  dirtLight:
    "rgba(190,160,105,0.18)",

  road:
    "rgba(183,153,94,0.55)",

  roadShadow:
    "rgba(30,25,15,0.22)",

  border:
    "rgba(255,255,255,0.025)",

  mapBorder:
    "rgba(220,190,120,0.55)"

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

  if (!ctx || !canvas) {

    console.error(
      "❌ Terrain: canvas no encontrado."
    );

    return;

  }

  console.log(
    "🌿 Motor de terreno inicializado."
  );

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
// RANDOM DETERMINISTA
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
// HASH DEL TERRENO
// ======================================================

function terrainNoise(
  x,
  y
) {

  const a =
    seededRandom(
      x,
      y,
      1
    );

  const b =
    seededRandom(
      Math.floor(x / 3),
      Math.floor(y / 3),
      2
    );

  const c =
    seededRandom(
      Math.floor(x / 8),
      Math.floor(y / 8),
      3
    );

  return (
    a * 0.55 +
    b * 0.30 +
    c * 0.15
  );

}


// ======================================================
// COLOR DEL TERRENO
// ======================================================

function getTerrainColor(
  x,
  y
) {

  const noise =
    terrainNoise(
      x,
      y
    );


  const index =
    Math.floor(
      noise *
      terrainConfig.grass.length
    );


  return (
    terrainConfig.grass[
      Math.min(
        index,
        terrainConfig.grass.length - 1
      )
    ]
  );

}


// ======================================================
// TIPO DE TERRENO
// ======================================================

function getTerrainType(
  x,
  y
) {

  const noise =
    terrainNoise(
      x + 500,
      y + 800
    );


  // Pequeñas zonas de agua

  if (
    noise < 0.055
  ) {

    return "water";

  }


  // Zonas de tierra

  if (
    noise > 0.91
  ) {

    return "dirt";

  }


  return "grass";

}


// ======================================================
// DIBUJAR AGUA
// ======================================================

function drawWater(
  px,
  py
) {

  ctx.fillStyle =
    terrainConfig.water;

  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  const gradient =
    ctx.createLinearGradient(
      px,
      py,
      px + tileSize,
      py + tileSize
    );


  gradient.addColorStop(
    0,
    terrainConfig.waterLight
  );

  gradient.addColorStop(
    1,
    "rgba(0,0,0,0.12)"
  );


  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  // Ondas

  ctx.strokeStyle =
    "rgba(150,210,220,0.13)";

  ctx.lineWidth =
    1;


  const waveY =
    py +
    tileSize * 0.35;


  ctx.beginPath();

  ctx.moveTo(
    px + 8,
    waveY
  );

  ctx.quadraticCurveTo(
    px + tileSize / 2,
    waveY - 3,
    px + tileSize - 8,
    waveY
  );

  ctx.stroke();


  const waveY2 =
    py +
    tileSize * 0.68;


  ctx.beginPath();

  ctx.moveTo(
    px + 15,
    waveY2
  );

  ctx.quadraticCurveTo(
    px + tileSize / 2,
    waveY2 + 3,
    px + tileSize - 10,
    waveY2
  );

  ctx.stroke();

}


// ======================================================
// DIBUJAR CELDA
// ======================================================

function drawTile(
  x,
  y
) {

  const px =
    x * tileSize;

  const py =
    y * tileSize;


  const type =
    getTerrainType(
      x,
      y
    );


  // ==================================================
  // AGUA
  // ==================================================

  if (
    type === "water"
  ) {

    drawWater(
      px,
      py
    );

    return;

  }


  // ==================================================
  // TERRENO BASE
  // ==================================================

  const baseColor =
    type === "dirt"
      ? terrainConfig.dirt
      : getTerrainColor(
          x,
          y
        );


  ctx.fillStyle =
    baseColor;

  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  // ==================================================
  // SOMBRA / LUZ
  // ==================================================

  const gradient =
    ctx.createLinearGradient(
      px,
      py,
      px,
      py + tileSize
    );


  gradient.addColorStop(
    0,
    terrainConfig.lightGrass
  );

  gradient.addColorStop(
    1,
    terrainConfig.darkGrass
  );


  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  // ==================================================
  // TIERRA
  // ==================================================

  if (
    type === "dirt"
  ) {

    ctx.fillStyle =
      terrainConfig.dirtLight;

    ctx.fillRect(
      px,
      py,
      tileSize,
      tileSize
    );

  }


  // ==================================================
  // VEGETACIÓN
  // ==================================================

  drawVegetation(
    x,
    y,
    px,
    py,
    type
  );


  // ==================================================
  // PIEDRAS
  // ==================================================

  drawRocks(
    x,
    y,
    px,
    py
  );


  // ==================================================
  // BORDE SUTIL
  // ==================================================

  ctx.strokeStyle =
    terrainConfig.border;

  ctx.lineWidth =
    1;

  ctx.strokeRect(
    px,
    py,
    tileSize,
    tileSize
  );

}


// ======================================================
// VEGETACIÓN
// ======================================================

function drawVegetation(
  x,
  y,
  px,
  py,
  type
) {

  if (
    type !== "grass"
  ) {

    return;

  }


  const random =
    seededRandom(
      x + 1000,
      y + 500,
      4
    );


  if (
    random < 0.42
  ) {

    return;

  }


  const count =
    random > 0.82
      ? 3
      : random > 0.65
        ? 2
        : 1;


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const rx =
      seededRandom(
        x + i * 11,
        y + i * 17,
        5
      );

    const ry =
      seededRandom(
        x + i * 19,
        y + i * 7,
        6
      );


    const treeX =
      px +
      8 +
      rx *
      (tileSize - 16);


    const treeY =
      py +
      10 +
      ry *
      (tileSize - 20);


    drawTree(
      treeX,
      treeY,
      0.65 +
      seededRandom(
        x,
        y,
        i
      ) *
      0.45
    );

  }

}


// ======================================================
// ÁRBOL
// ======================================================

function drawTree(
  x,
  y,
  scale
) {

  const trunkWidth =
    4 * scale;

  const trunkHeight =
    9 * scale;


  ctx.fillStyle =
    "#4d3726";


  ctx.fillRect(
    x -
      trunkWidth / 2,
    y,
    trunkWidth,
    trunkHeight
  );


  ctx.beginPath();

  ctx.arc(
    x,
    y - 5 * scale,
    9 * scale,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#244b2b";

  ctx.fill();


  ctx.beginPath();

  ctx.arc(
    x - 5 * scale,
    y - 2 * scale,
    6 * scale,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#315d34";

  ctx.fill();


  ctx.beginPath();

  ctx.arc(
    x + 5 * scale,
    y - 2 * scale,
    6 * scale,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#3b6b3a";

  ctx.fill();

}


// ======================================================
// PIEDRAS
// ======================================================

function drawRocks(
  x,
  y,
  px,
  py
) {

  const random =
    seededRandom(
      x + 300,
      y + 700,
      8
    );


  if (
    random < 0.72
  ) {

    return;

  }


  const rockX =
    px +
    seededRandom(
      x,
      y,
      9
    ) *
    tileSize;


  const rockY =
    py +
    seededRandom(
      x,
      y,
      10
    ) *
    tileSize;


  ctx.beginPath();

  ctx.ellipse(
    rockX,
    rockY,
    4,
    2.5,
    0,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(120,125,110,0.65)";

  ctx.fill();

}


// ======================================================
// CAMINOS
// ======================================================

export function drawRoads(
  visibleTerritories
) {

  if (
    !ctx ||
    !Array.isArray(
      visibleTerritories
    )
  ) {

    return;

  }


  const visible =
    new Set(
      visibleTerritories.map(
        territory =>
          Number(
            territory.id
          )
      )
    );


  // Sombra del camino

  ctx.strokeStyle =
    terrainConfig.roadShadow;

  ctx.lineWidth =
    13;

  ctx.lineCap =
    "round";


  drawRoadLines(
    visibleTerritories,
    visible
  );


  // Camino principal

  ctx.strokeStyle =
    terrainConfig.road;

  ctx.lineWidth =
    8;

  ctx.lineCap =
    "round";


  drawRoadLines(
    visibleTerritories,
    visible
  );

}


// ======================================================
// LÍNEAS DE CAMINOS
// ======================================================

function drawRoadLines(
  visibleTerritories,
  visible
) {

  for (
    const territory
    of visibleTerritories
  ) {

    const x =
      territory.x *
      tileSize +
      tileSize / 2;

    const y =
      territory.y *
      tileSize +
      tileSize / 2;


    // ----------------------------------------------
    // DERECHA
    // ----------------------------------------------

    const rightId =
      Number(
        territory.id
      ) + 1;


    if (
      territory.x <
        mapSize - 1 &&
      visible.has(
        rightId
      )
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x,
        y
      );

      ctx.lineTo(
        x + tileSize,
        y
      );

      ctx.stroke();

    }


    // ----------------------------------------------
    // ABAJO
    // ----------------------------------------------

    const bottomId =
      Number(
        territory.id
      ) +
      mapSize;


    if (
      territory.y <
        mapSize - 1 &&
      visible.has(
        bottomId
      )
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x,
        y
      );

      ctx.lineTo(
        x,
        y + tileSize
      );

      ctx.stroke();

    }

  }

}


// ======================================================
// TERRENO VISIBLE
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


  const startX =
    Math.max(
      0,
      Math.floor(
        camera.x /
        tileSize
      ) - 2
    );


  const startY =
    Math.max(
      0,
      Math.floor(
        camera.y /
        tileSize
      ) - 2
    );


  const visibleWidth =
    canvas.width /
    camera.zoom;


  const visibleHeight =
    canvas.height /
    camera.zoom;


  const endX =
    Math.min(
      mapSize - 1,
      Math.ceil(
        (
          camera.x +
          visibleWidth
        ) /
        tileSize
      ) + 2
    );


  const endY =
    Math.min(
      mapSize - 1,
      Math.ceil(
        (
          camera.y +
          visibleHeight
        ) /
        tileSize
      ) + 2
    );


  // ==================================================
  // TERRENO
  // ==================================================

  for (
    let y = startY;
    y <= endY;
    y++
  ) {

    for (
      let x = startX;
      x <= endX;
      x++
    ) {

      drawTile(
        x,
        y
      );

    }

  }


  // ==================================================
  // CAMINOS
  // ==================================================

  drawRoads(
    visibleTerritories
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


  ctx.strokeStyle =
    terrainConfig.mapBorder;

  ctx.lineWidth =
    8;


  ctx.strokeRect(
    0,
    0,
    size,
    size
  );

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
// TAMAÑO DEL MAPA
// ======================================================

export function getMapSize() {

  return mapSize;

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initTerrain,

  setTerrainConfig,

  drawTerrain,

  drawRoads,

  drawMapBorder,

  getTileSize,

  setTileSize,

  getMapSize

};
