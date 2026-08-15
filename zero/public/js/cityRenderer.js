// ======================================================
// ZERO - CITY RENDERER
// Renderizado visual de ciudades y territorios
// ======================================================

import {
  getPlayer
} from "./state.js";


// ======================================================
// VARIABLES
// ======================================================

let ctx = null;
let canvas = null;

let tileSize = 70;


// ======================================================
// CONFIGURACIÓN VISUAL
// ======================================================

const cityConfig = {

  // Tamaño general
  scale: 1,

  // Radio de selección
  hitRadius: 28,

  // Colores
  playerColor:
    "#2388ff",

  enemyColor:
    "#c93636",

  neutralColor:
    "#70777d",

  playerGlow:
    "rgba(35,136,255,0.28)",

  enemyGlow:
    "rgba(201,54,54,0.20)",

  neutralGlow:
    "rgba(180,180,180,0.12)",

  wallColor:
    "#bfc5c9",

  wallDark:
    "#737a7f",

  roofColor:
    "#4d5358",

  windowColor:
    "#e5bd58",

  levelBackground:
    "rgba(0,0,0,0.65)",

  levelText:
    "#ffffff"

};


// ======================================================
// INICIALIZAR
// ======================================================

export function initCityRenderer(
  canvasElement,
  context
) {

  canvas =
    canvasElement;

  ctx =
    context;


  if (
    !canvas ||
    !ctx
  ) {

    console.error(
      "❌ CityRenderer: canvas no encontrado."
    );

    return;

  }


  console.log(
    "🏰 CityRenderer inicializado."
  );

}


// ======================================================
// CONFIGURAR
// ======================================================

export function setCityTileSize(
  size
) {

  const value =
    Number(size);


  if (
    Number.isFinite(value) &&
    value > 0
  ) {

    tileSize =
      value;

  }

}


// ======================================================
// OBTENER COLOR DE CIUDAD
// ======================================================

function getCityColor(
  territory,
  player
) {

  if (
    player &&
    territory.ownerId ===
      player.id
  ) {

    return cityConfig.playerColor;

  }


  if (
    territory.ownerId
  ) {

    return cityConfig.enemyColor;

  }


  return cityConfig.neutralColor;

}


// ======================================================
// OBTENER BRILLO
// ======================================================

function getGlowColor(
  territory,
  player
) {

  if (
    player &&
    territory.ownerId ===
      player.id
  ) {

    return cityConfig.playerGlow;

  }


  if (
    territory.ownerId
  ) {

    return cityConfig.enemyGlow;

  }


  return cityConfig.neutralGlow;

}


// ======================================================
// DIBUJAR TODAS LAS CIUDADES
// ======================================================

export function drawCities(
  territories
) {

  if (
    !ctx ||
    !Array.isArray(
      territories
    )
  ) {

    return;

  }


  const player =
    getPlayer();


  for (
    const territory
    of territories
  ) {

    drawCity(
      territory,
      player
    );

  }

}


// ======================================================
// DIBUJAR UNA CIUDAD
// ======================================================

export function drawCity(
  territory,
  player = null
) {

  if (
    !ctx ||
    !territory
  ) {

    return;

  }


  const x =
    territory.x *
      tileSize +
    tileSize / 2;


  const y =
    territory.y *
      tileSize +
    tileSize / 2;


  const color =
    getCityColor(
      territory,
      player
    );


  const glow =
    getGlowColor(
      territory,
      player
    );


  const cityScale =
    cityConfig.scale;


  // ==================================================
  // BRILLO
  // ==================================================

  ctx.save();


  ctx.shadowBlur =
    18;

  ctx.shadowColor =
    glow;


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    27 *
      cityScale,
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    glow;

  ctx.fill();


  ctx.restore();


  // ==================================================
  // BASE DE LA CIUDAD
  // ==================================================

  drawCityBase(
    x,
    y,
    color,
    cityScale
  );


  // ==================================================
  // MURALLA
  // ==================================================

  drawWalls(
    x,
    y,
    color,
    cityScale
  );


  // ==================================================
  // TORRES
  // ==================================================

  drawTower(
    x - 18 * cityScale,
    y - 10 * cityScale,
    color,
    cityScale
  );


  drawTower(
    x + 18 * cityScale,
    y - 10 * cityScale,
    color,
    cityScale
  );


  // ==================================================
  // EDIFICIO CENTRAL
  // ==================================================

  drawMainBuilding(
    x,
    y,
    color,
    cityScale
  );


  // ==================================================
  // BANDERA
  // ==================================================

  drawFlag(
    x,
    y,
    color,
    cityScale
  );


  // ==================================================
  // NIVEL
  // ==================================================

  drawLevel(
    x,
    y,
    territory.level
  );


  // ==================================================
  // NOMBRE
  // ==================================================

  drawCityName(
    x,
    y,
    territory.cityName
  );

}


// ======================================================
// BASE DE CIUDAD
// ======================================================

function drawCityBase(
  x,
  y,
  color,
  scale
) {

  ctx.save();


  ctx.beginPath();

  ctx.ellipse(
    x,
    y + 12 * scale,
    27 * scale,
    12 * scale,
    0,
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    "rgba(0,0,0,0.38)";

  ctx.fill();


  ctx.beginPath();

  ctx.arc(
    x,
    y + 4 * scale,
    25 * scale,
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    color;

  ctx.fill();


  ctx.strokeStyle =
    "#e2e5e7";

  ctx.lineWidth =
    2;

  ctx.stroke();


  ctx.restore();

}


// ======================================================
// MURALLAS
// ======================================================

function drawWalls(
  x,
  y,
  color,
  scale
) {

  ctx.save();


  const width =
    42 * scale;

  const height =
    25 * scale;


  // Parte principal

  ctx.fillStyle =
    cityConfig.wallColor;


  ctx.fillRect(
    x - width / 2,
    y - height / 2,
    width,
    height
  );


  // Sombra inferior

  ctx.fillStyle =
    cityConfig.wallDark;


  ctx.fillRect(
    x - width / 2,
    y + height / 2 - 5 * scale,
    width,
    5 * scale
  );


  // Línea superior

  ctx.fillStyle =
    color;


  ctx.fillRect(
    x - width / 2,
    y - height / 2,
    width,
    5 * scale
  );


  // Piedra divisoria

  ctx.strokeStyle =
    "rgba(50,55,60,0.30)";

  ctx.lineWidth =
    1;


  for (
    let i = 1;
    i < 5;
    i++
  ) {

    const brickX =
      x -
      width / 2 +
      i *
      (width / 5);


    ctx.beginPath();

    ctx.moveTo(
      brickX,
      y - height / 2
    );

    ctx.lineTo(
      brickX,
      y + height / 2
    );

    ctx.stroke();

  }


  ctx.restore();

}


// ======================================================
// TORRE
// ======================================================

function drawTower(
  x,
  y,
  color,
  scale
) {

  const width =
    13 * scale;

  const height =
    25 * scale;


  ctx.save();


  // Sombra

  ctx.fillStyle =
    "rgba(0,0,0,0.35)";

  ctx.fillRect(
    x - width / 2 + 2,
    y - height / 2 + 3,
    width,
    height
  );


  // Torre

  ctx.fillStyle =
    cityConfig.wallColor;

  ctx.fillRect(
    x - width / 2,
    y - height / 2,
    width,
    height
  );


  // Techo

  ctx.beginPath();

  ctx.moveTo(
    x - width / 2 - 2,
    y - height / 2
  );

  ctx.lineTo(
    x,
    y - height / 2 - 9 * scale
  );

  ctx.lineTo(
    x + width / 2 + 2,
    y - height / 2
  );

  ctx.closePath();


  ctx.fillStyle =
    cityConfig.roofColor;

  ctx.fill();


  // Ventana

  ctx.fillStyle =
    cityConfig.windowColor;

  ctx.fillRect(
    x - 2 * scale,
    y - 5 * scale,
    4 * scale,
    6 * scale
  );


  // Borde

  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    2;

  ctx.strokeRect(
    x - width / 2,
    y - height / 2,
    width,
    height
  );


  ctx.restore();

}


// ======================================================
// EDIFICIO PRINCIPAL
// ======================================================

function drawMainBuilding(
  x,
  y,
  color,
  scale
) {

  const width =
    21 * scale;

  const height =
    22 * scale;


  ctx.save();


  // Edificio

  ctx.fillStyle =
    "#d5d9dc";


  ctx.fillRect(
    x - width / 2,
    y - height / 2,
    width,
    height
  );


  // Techo

  ctx.beginPath();

  ctx.moveTo(
    x - width / 2 - 3,
    y - height / 2
  );

  ctx.lineTo(
    x,
    y - height / 2 - 13 * scale
  );

  ctx.lineTo(
    x + width / 2 + 3,
    y - height / 2
  );

  ctx.closePath();


  ctx.fillStyle =
    cityConfig.roofColor;

  ctx.fill();


  // Puerta

  ctx.fillStyle =
    "#4b3728";

  ctx.fillRect(
    x - 4 * scale,
    y + 3 * scale,
    8 * scale,
    10 * scale
  );


  // Ventanas

  ctx.fillStyle =
    cityConfig.windowColor;


  ctx.fillRect(
    x - 7 * scale,
    y - 4 * scale,
    4 * scale,
    5 * scale
  );


  ctx.fillRect(
    x + 3 * scale,
    y - 4 * scale,
    4 * scale,
    5 * scale
  );


  // Borde

  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    2;

  ctx.strokeRect(
    x - width / 2,
    y - height / 2,
    width,
    height
  );


  ctx.restore();

}


// ======================================================
// BANDERA
// ======================================================

function drawFlag(
  x,
  y,
  color,
  scale
) {

  const poleHeight =
    25 * scale;


  const poleX =
    x +
    9 * scale;


  const poleY =
    y -
    28 * scale;


  ctx.save();


  // Palo

  ctx.strokeStyle =
    "#47392b";

  ctx.lineWidth =
    2 * scale;


  ctx.beginPath();

  ctx.moveTo(
    poleX,
    poleY
  );

  ctx.lineTo(
    poleX,
    poleY +
      poleHeight
  );

  ctx.stroke();


  // Bandera

  ctx.beginPath();

  ctx.moveTo(
    poleX,
    poleY
  );

  ctx.lineTo(
    poleX +
      15 * scale,
    poleY +
      5 * scale
  );

  ctx.lineTo(
    poleX,
    poleY +
      10 * scale
  );

  ctx.closePath();


  ctx.fillStyle =
    color;

  ctx.fill();


  ctx.restore();

}


// ======================================================
// NIVEL
// ======================================================

function drawLevel(
  x,
  y,
  level
) {

  const value =
    Math.max(
      1,
      Number(level) || 1
    );


  const radius =
    10;


  const badgeY =
    y +
    28;


  ctx.save();


  ctx.beginPath();

  ctx.arc(
    x,
    badgeY,
    radius,
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    cityConfig.levelBackground;

  ctx.fill();


  ctx.strokeStyle =
    "rgba(255,255,255,0.55)";

  ctx.lineWidth =
    1;

  ctx.stroke();


  ctx.fillStyle =
    cityConfig.levelText;

  ctx.font =
    "bold 10px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";


  ctx.fillText(
    value,
    x,
    badgeY
  );


  ctx.restore();

}


// ======================================================
// NOMBRE DE CIUDAD
// ======================================================

function drawCityName(
  x,
  y,
  name
) {

  if (!name) {

    return;

  }


  ctx.save();


  ctx.font =
    "bold 11px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "top";


  // Sombra

  ctx.fillStyle =
    "rgba(0,0,0,0.75)";


  ctx.fillText(
    name,
    x + 1,
    y + 41
  );


  // Texto

  ctx.fillStyle =
    "#ffffff";


  ctx.fillText(
    name,
    x,
    y + 40
  );


  ctx.restore();

}


// ======================================================
// DETECTAR CIUDAD
// ======================================================

export function hitTest(
  screenX,
  screenY,
  territories,
  camera
) {

  if (
    !Array.isArray(
      territories
    ) ||
    !camera
  ) {

    return null;

  }


  const worldX =
    camera.x +
    screenX /
      camera.zoom;


  const worldY =
    camera.y +
    screenY /
      camera.zoom;


  let closest =
    null;


  let closestDistance =
    Infinity;


  for (
    const territory
    of territories
  ) {

    const cityX =
      territory.x *
      tileSize +
      tileSize / 2;


    const cityY =
      territory.y *
      tileSize +
      tileSize / 2;


    const dx =
      worldX -
      cityX;


    const dy =
      worldY -
      cityY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance <=
        cityConfig.hitRadius &&
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
// EXPORTACIÓN
// ======================================================

export default {

  initCityRenderer,

  setCityTileSize,

  drawCities,

  drawCity,

  hitTest

};
