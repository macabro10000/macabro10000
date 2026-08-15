// ======================================================
// ZERO - CITIES.JS
// Renderizado visual de ciudades y territorios
// ======================================================

let ctx = null;
let tileSize = 70;


// ======================================================
// INICIALIZAR
// ======================================================

export function initCities(
  context,
  size = 70
) {

  ctx = context;
  tileSize = size;

  console.log(
    "🏰 Sistema de ciudades inicializado."
  );

}


// ======================================================
// CAMBIAR TAMAÑO
// ======================================================

export function setTileSize(
  size
) {

  const value =
    Number(size);

  if (
    Number.isFinite(value) &&
    value > 0
  ) {

    tileSize = value;

  }

}


// ======================================================
// POSICIÓN DE CIUDAD
// ======================================================

function getCenter(
  territory
) {

  return {

    x:
      territory.x *
        tileSize +
      tileSize / 2,

    y:
      territory.y *
        tileSize +
      tileSize / 2

  };

}


// ======================================================
// COLOR DEL TERRITORIO
// ======================================================

function getOwnerColor(
  territory,
  player
) {

  if (
    player &&
    territory.ownerId ===
      player.id
  ) {

    return {
      main: "#2878e8",
      dark: "#124b9b",
      light: "#63a4ff"
    };

  }


  if (
    territory.ownerId
  ) {

    return {
      main: "#b63b42",
      dark: "#6e2026",
      light: "#ed686f"
    };

  }


  return {
    main: "#6b7478",
    dark: "#3e4548",
    light: "#aab1b4"
  };

}


// ======================================================
// SOMBRA
// ======================================================

function drawShadow(
  x,
  y,
  radius
) {

  ctx.beginPath();

  ctx.arc(
    x + 5,
    y + 7,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(0,0,0,0.38)";

  ctx.fill();

}


// ======================================================
// CÍRCULO DE TERRITORIO
// ======================================================

function drawTerritoryCircle(
  x,
  y,
  radius,
  colors,
  selected
) {

  const gradient =
    ctx.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.4,
      radius * 0.1,
      x,
      y,
      radius
    );

  gradient.addColorStop(
    0,
    colors.light
  );

  gradient.addColorStop(
    0.55,
    colors.main
  );

  gradient.addColorStop(
    1,
    colors.dark
  );


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    gradient;

  ctx.fill();


  ctx.strokeStyle =
    selected
      ? "#f5d77a"
      : "rgba(255,255,255,0.8)";

  ctx.lineWidth =
    selected
      ? 4
      : 2;

  ctx.stroke();

}


// ======================================================
// TORRE PRINCIPAL
// ======================================================

function drawTower(
  x,
  y
) {

  const width = 20;
  const height = 22;


  // Sombra

  ctx.fillStyle =
    "rgba(0,0,0,0.3)";

  ctx.fillRect(
    x - width / 2 + 3,
    y - height / 2 + 4,
    width,
    height
  );


  // Edificio

  const building =
    ctx.createLinearGradient(
      x,
      y - height / 2,
      x,
      y + height / 2
    );

  building.addColorStop(
    0,
    "#f2ead7"
  );

  building.addColorStop(
    1,
    "#9d927d"
  );


  ctx.fillStyle =
    building;

  ctx.fillRect(
    x - width / 2,
    y - height / 2,
    width,
    height
  );


  // Torre izquierda

  ctx.fillRect(
    x - width / 2 - 5,
    y - height / 2 - 5,
    7,
    10
  );


  // Torre derecha

  ctx.fillRect(
    x + width / 2 - 2,
    y - height / 2 - 5,
    7,
    10
  );


  // Techo

  ctx.beginPath();

  ctx.moveTo(
    x - 13,
    y - height / 2
  );

  ctx.lineTo(
    x,
    y - height / 2 - 10
  );

  ctx.lineTo(
    x + 13,
    y - height / 2
  );

  ctx.closePath();

  ctx.fillStyle =
    "#544b3e";

  ctx.fill();


  // Puerta

  ctx.fillStyle =
    "#493a2b";

  ctx.fillRect(
    x - 3,
    y + 3,
    6,
    9
  );

}


// ======================================================
// BANDERA
// ======================================================

function drawFlag(
  x,
  y,
  colors
) {

  const poleHeight =
    27;

  ctx.strokeStyle =
    "#d8c9a4";

  ctx.lineWidth =
    2;

  ctx.beginPath();

  ctx.moveTo(
    x + 13,
    y - 10
  );

  ctx.lineTo(
    x + 13,
    y - poleHeight
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    x + 13,
    y - poleHeight
  );

  ctx.lineTo(
    x + 26,
    y - poleHeight + 5
  );

  ctx.lineTo(
    x + 13,
    y - poleHeight + 10
  );

  ctx.closePath();

  ctx.fillStyle =
    colors.main;

  ctx.fill();

}


// ======================================================
// NIVEL
// ======================================================

function drawLevel(
  x,
  y,
  level
) {

  const text =
    String(
      Math.max(
        1,
        Number(level) || 1
      )
    );


  ctx.beginPath();

  ctx.arc(
    x + 25,
    y + 23,
    10,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(20,20,20,0.85)";

  ctx.fill();


  ctx.strokeStyle =
    "rgba(255,215,120,0.8)";

  ctx.lineWidth =
    1.5;

  ctx.stroke();


  ctx.fillStyle =
    "#f6e3a2";

  ctx.font =
    "bold 10px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    text,
    x + 25,
    y + 23
  );

}


// ======================================================
// TROPAS
// ======================================================

function drawTroops(
  x,
  y,
  troops
) {

  const amount =
    Math.floor(
      Number(troops) || 0
    );


  ctx.fillStyle =
    "rgba(15,15,15,0.82)";

  ctx.fillRect(
    x - 27,
    y + 27,
    54,
    16
  );


  ctx.fillStyle =
    "#e8e1cf";

  ctx.font =
    "bold 10px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    "⚔ " + amount,
    x,
    y + 35
  );

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


  ctx.font =
    "bold 11px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "bottom";


  // Sombra del texto

  ctx.fillStyle =
    "rgba(0,0,0,0.7)";

  ctx.fillText(
    name,
    x + 1,
    y - 31
  );


  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    name,
    x,
    y - 32
  );

}


// ======================================================
// SELECCIÓN
// ======================================================

function drawSelection(
  x,
  y,
  radius
) {

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius + 7,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle =
    "rgba(246,215,112,0.95)";

  ctx.lineWidth =
    3;

  ctx.setLineDash([
    5,
    4
  ]);

  ctx.stroke();

  ctx.setLineDash([]);

}


// ======================================================
// DIBUJAR CIUDAD
// ======================================================

export function drawCity(
  territory,
  player,
  selectedId = null
) {

  if (
    !ctx ||
    !territory
  ) {

    return;

  }


  const position =
    getCenter(
      territory
    );


  const colors =
    getOwnerColor(
      territory,
      player
    );


  const radius =
    Math.min(
      27,
      tileSize * 0.38
    );


  const selected =
    selectedId !== null &&
    Number(selectedId) ===
      Number(territory.id);


  // Sombra

  drawShadow(
    position.x,
    position.y,
    radius
  );


  // Territorio

  drawTerritoryCircle(
    position.x,
    position.y,
    radius,
    colors,
    selected
  );


  // Fortaleza

  drawTower(
    position.x,
    position.y
  );


  // Bandera

  if (
    territory.ownerId
  ) {

    drawFlag(
      position.x,
      position.y,
      colors
    );

  }


  // Nivel

  drawLevel(
    position.x,
    position.y,
    territory.level
  );


  // Tropas

  drawTroops(
    position.x,
    position.y,
    territory.troops
  );


  // Nombre

  drawCityName(
    position.x,
    position.y,
    territory.cityName
  );


  // Selección

  if (selected) {

    drawSelection(
      position.x,
      position.y,
      radius
    );

  }

}


// ======================================================
// DIBUJAR TODAS LAS CIUDADES
// ======================================================

export function drawCities(
  territories,
  player,
  selectedId = null
) {

  if (
    !Array.isArray(
      territories
    )
  ) {

    return;

  }


  for (
    const territory
    of territories
  ) {

    drawCity(
      territory,
      player,
      selectedId
    );

  }

}


// ======================================================
// DETECTAR CIUDAD
// ======================================================

export function findCityAt(
  worldX,
  worldY,
  territories
) {

  if (
    !Array.isArray(
      territories
    )
  ) {

    return null;

  }


  const radius =
    Math.min(
      30,
      tileSize * 0.42
    );


  for (
    let i =
      territories.length - 1;
    i >= 0;
    i--
  ) {

    const territory =
      territories[i];


    const center =
      getCenter(
        territory
      );


    const dx =
      worldX -
      center.x;


    const dy =
      worldY -
      center.y;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance <=
      radius
    ) {

      return territory;

    }

  }


  return null;

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initCities,

  setTileSize,

  drawCity,

  drawCities,

  findCityAt

};
