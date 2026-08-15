// ======================================================
// ZERO - TERRAIN.JS
// Motor visual del terreno
// ======================================================

let ctx = null;
let canvas = null;

let mapSize = 100;
let tileSize = 70;


// ======================================================
// CONFIGURACIÓN VISUAL
// ======================================================

const terrainConfig = {

  // Colores base
  grassTop: "#496f3d",
  grassBottom: "#263d25",

  // Variaciones del terreno
  variation: [
    "#456b3b",
    "#4b7340",
    "#3f6437",
    "#527946",
    "#3a5d34"
  ],

  // Caminos
  roadColor:
    "rgba(181, 155, 103, 0.35)",

  roadWidth: 8,

  // Líneas del mapa
  borderColor:
    "rgba(255,255,255,0.035)",

  borderWidth: 1

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

  console.log(
    "🌿 Terreno inicializado."
  );

}


// ======================================================
// CONFIGURAR MAPA
// ======================================================

export function setTerrainConfig(
  size,
  tile
) {

  if (
    Number.isFinite(
      Number(size)
    )
  ) {

    mapSize =
      Number(size);

  }

  if (
    Number.isFinite(
      Number(tile)
    )
  ) {

    tileSize =
      Number(tile);

  }

}


// ======================================================
// SEMILLA DETERMINISTA
// ======================================================

function seededRandom(
  x,
  y
) {

  const value =
    Math.sin(
      x * 12.9898 +
      y * 78.233
    ) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );

}


// ======================================================
// OBTENER VARIACIÓN DEL TERRENO
// ======================================================

function getTerrainVariation(
  x,
  y
) {

  const random =
    seededRandom(
      x,
      y
    );

  const index =
    Math.floor(
      random *
      terrainConfig.variation.length
    );

  return (
    terrainConfig
      .variation[index]
  );

}


// ======================================================
// DIBUJAR UNA CELDA
// ======================================================

function drawTile(
  x,
  y
) {

  const px =
    x * tileSize;

  const py =
    y * tileSize;


  // --------------------------------------------
  // COLOR BASE
  // --------------------------------------------

  const gradient =
    ctx.createLinearGradient(
      px,
      py,
      px,
      py + tileSize
    );


  gradient.addColorStop(
    0,
    terrainConfig.grassTop
  );

  gradient.addColorStop(
    1,
    terrainConfig.grassBottom
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  // --------------------------------------------
  // VARIACIÓN
  // --------------------------------------------

  ctx.fillStyle =
    getTerrainVariation(
      x,
      y
    );


  ctx.globalAlpha =
    0.12;


  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  ctx.globalAlpha =
    1;


  // --------------------------------------------
  // PEQUEÑOS DETALLES
  // --------------------------------------------

  drawGroundDetails(
    x,
    y,
    px,
    py
  );


  // --------------------------------------------
  // BORDE DE CELDA
  // --------------------------------------------

  ctx.strokeStyle =
    terrainConfig.borderColor;

  ctx.lineWidth =
    terrainConfig.borderWidth;

  ctx.strokeRect(
    px,
    py,
    tileSize,
    tileSize
  );

}


// ======================================================
// DETALLES DEL SUELO
// ======================================================

function drawGroundDetails(
  x,
  y,
  px,
  py
) {

  const random =
    seededRandom(
      x + 1000,
      y + 500
    );


  // No llenar todo de detalles
  if (
    random < 0.55
  ) {
    return;
  }


  const count =
    random > 0.8
      ? 3
      : 1;


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const rx =
      seededRandom(
        x + i * 7,
        y + i * 13
      );

    const ry =
      seededRandom(
        x + i * 17,
        y + i * 5
      );


    const detailX =
      px +
      rx *
      tileSize;


    const detailY =
      py +
      ry *
      tileSize;


    ctx.beginPath();

    ctx.arc(
      detailX,
      detailY,
      1.5,
      0,
      Math.PI * 2
    );


    ctx.fillStyle =
      "rgba(210,230,170,0.25)";

    ctx.fill();

  }

}


// ======================================================
// DIBUJAR CAMINOS
// ======================================================

function drawRoads(
  visibleTerritories
) {

  if (
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
          territory.id
      )
    );


  ctx.strokeStyle =
    terrainConfig.roadColor;

  ctx.lineWidth =
    terrainConfig.roadWidth;

  ctx.lineCap =
    "round";


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


    // Camino hacia la derecha

    const rightId =
      territory.id + 1;


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


    // Camino hacia abajo

    const bottomId =
      territory.id +
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
// DIBUJAR TERRENO VISIBLE
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
  // ZONA VISIBLE
  // --------------------------------------------

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


  // --------------------------------------------
  // TERRENO
  // --------------------------------------------

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


  // --------------------------------------------
  // CAMINOS
  // --------------------------------------------

  drawRoads(
    visibleTerritories
  );

}


// ======================================================
// DIBUJAR BORDE DEL MAPA
// ======================================================

export function drawMapBorder() {

  if (!ctx) {
    return;
  }


  const size =
    mapSize *
    tileSize;


  ctx.strokeStyle =
    "rgba(220,190,120,0.45)";

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
// OBTENER TAMAÑO DEL TERRENO
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
// EXPORTACIÓN
// ======================================================

export default {

  initTerrain,

  setTerrainConfig,

  drawTerrain,

  drawMapBorder,

  getTileSize,

  setTileSize

};
