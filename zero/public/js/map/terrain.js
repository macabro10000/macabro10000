// ======================================================
// ZERO - TERRAIN.JS
// Motor visual profesional del terreno
//
// Responsabilidades:
// - Océano procedural
// - Continentes orgánicos
// - Costas y profundidad
// - Biomas visuales
// - Conexiones entre continentes
// - Preparación para expansión dinámica
// - Borde del mapa
//
// La definición lógica de continentes vive en:
// ./continents.js
//
// Este archivo NO administra:
// - Castillos
// - Soldados
// - Economía
// - Niveles
// - Conquista
//
// Este archivo solamente dibuja el mundo.
// ======================================================

import {
  getContinents,
  getResolvedConnections
} from "./continents.js";


// ======================================================
// ESTADO DEL MOTOR
// ======================================================

let canvas = null;
let ctx = null;

let mapSize = 100;
let tileSize = 70;


// ======================================================
// CONFIGURACIÓN VISUAL
// ======================================================

const terrainConfig = {

  // ----------------------------------------------------
  // OCÉANO
  // ----------------------------------------------------

  ocean: {

    deep:
      "#04141d",

    mid:
      "#082b3b",

    light:
      "#14566c",

    surface:
      "rgba(120, 210, 225, 0.08)",

    wave:
      "rgba(170, 225, 235, 0.10)"

  },


  // ----------------------------------------------------
  // COSTA
  // ----------------------------------------------------

  coast: {

    shadow:
      "rgba(0, 0, 0, 0.45)",

    outer:
      "rgba(7, 20, 24, 0.75)",

    light:
      "rgba(255, 255, 255, 0.20)",

    foam:
      "rgba(210, 245, 245, 0.18)",

    width:
      2

  },


  // ----------------------------------------------------
  // CONEXIONES
  // ----------------------------------------------------

  connection: {

    shadow:
      "rgba(0, 0, 0, 0.55)",

    color:
      "#765b36",

    highlight:
      "#c7a96b",

    width:
      7,

    borderWidth:
      2,

    dash:
      [10, 8]

  },


  // ----------------------------------------------------
  // BORDE
  // ----------------------------------------------------

  border: {

    color:
      "rgba(120, 220, 235, 0.38)",

    glow:
      "rgba(120, 220, 235, 0.08)",

    width:
      8

  },


  // ----------------------------------------------------
  // BIOMAS
  // ----------------------------------------------------

  biomes: {

    nature: {

      colors: [
        "#21452a",
        "#2d5d35",
        "#3d7040",
        "#4e8145",
        "#67964d"
      ],

      accent:
        "#8fb85d",

      shadow:
        "#17351f"

    },


    ice: {

      colors: [
        "#a8cbd4",
        "#c5e0e5",
        "#dcecef",
        "#f1f8f9",
        "#ffffff"
      ],

      accent:
        "#ffffff",

      shadow:
        "#779ba5"

    },


    fire: {

      colors: [
        "#351613",
        "#501b15",
        "#702318",
        "#96301a",
        "#c34a1c"
      ],

      accent:
        "#e67828",

      shadow:
        "#24100f"

    },


    desert: {

      colors: [
        "#806036",
        "#9a713c",
        "#b88847",
        "#cea35c",
        "#e1c276"
      ],

      accent:
        "#efd18b",

      shadow:
        "#654923"

    }

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


  if (
    !canvas ||
    !ctx
  ) {

    console.error(
      "❌ ZERO Terrain: canvas o contexto no disponible."
    );

    return false;

  }


  ctx.imageSmoothingEnabled =
    true;


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
      Math.floor(
        newSize
      );

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
// RUIDO MULTICAPA
// Genera variación más natural.
// ======================================================

function terrainNoise(
  x,
  y,
  seed
) {

  const large =
    seededRandom(
      Math.floor(x * 0.45),
      Math.floor(y * 0.45),
      seed
    );


  const medium =
    seededRandom(
      Math.floor(x * 0.18),
      Math.floor(y * 0.18),
      seed + 91
    );


  const small =
    seededRandom(
      Math.floor(x * 0.07),
      Math.floor(y * 0.07),
      seed + 173
    );


  return (
    large * 0.50 +
    medium * 0.30 +
    small * 0.20
  );

}


// ======================================================
// OBTENER PALETA DEL BIOMA
// ======================================================

function getBiomeConfig(
  continent
) {

  if (
    !continent
  ) {

    return (
      terrainConfig.biomes.nature
    );

  }


  return (
    terrainConfig.biomes[
      continent.type
    ] ||
    terrainConfig.biomes.nature
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
    0.42,
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


  const spacing =
    Math.max(
      tileSize * 1.7,
      100
    );


  ctx.save();


  ctx.strokeStyle =
    terrainConfig.ocean.wave;

  ctx.lineWidth =
    1;

  ctx.lineCap =
    "round";


  for (
    let y = spacing * 0.5;
    y < height;
    y += spacing
  ) {

    for (
      let x = spacing * 0.5;
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
        random < 0.70
      ) {

        continue;

      }


      const length =
        tileSize *
        (
          0.25 +
          random * 0.40
        );


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
// FORMA DEL CONTINENTE
// ======================================================

function getContinentShape(
  continent,
  x,
  y
) {

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


  /*
   * Ruido principal.
   */

  const noise =
    terrainNoise(
      x,
      y,
      Number(
        continent.seed
      ) || 0
    );


  /*
   * Deformación suave.
   *
   * El resultado deja de ser
   * una elipse perfecta.
   */

  const deformation =
    0.84 +
    noise * 0.30;


  return (
    distance <=
    deformation
  );

}


// ======================================================
// OBTENER COLOR DEL TERRENO
// ======================================================

function getTerrainColor(
  continent,
  x,
  y
) {

  const biome =
    getBiomeConfig(
      continent
    );


  const noise =
    terrainNoise(
      x,
      y,
      Number(
        continent.seed
      ) || 0
    );


  const colors =
    biome.colors;


  const index =
    Math.max(
      0,
      Math.min(
        colors.length - 1,
        Math.floor(
          noise *
          colors.length
        )
      )
    );


  return colors[index];

}


// ======================================================
// DIBUJAR CONTINENTE
// ======================================================

function drawContinent(
  continent
) {

  if (
    !continent ||
    continent.active === false
  ) {

    return;

  }


  const padding =
    3;


  const minX =
    Math.max(
      0,
      Math.floor(
        continent.x -
        continent.radiusX -
        padding
      )
    );


  const maxX =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.x +
        continent.radiusX +
        padding
      )
    );


  const minY =
    Math.max(
      0,
      Math.floor(
        continent.y -
        continent.radiusY -
        padding
      )
    );


  const maxY =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.y +
        continent.radiusY +
        padding
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
        !getContinentShape(
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

    }

  }


  drawBiomeDetails(
    continent,
    minX,
    minY,
    maxX,
    maxY
  );

}


// ======================================================
// DETALLES VISUALES DEL BIOMA
// ======================================================

function drawBiomeDetails(
  continent,
  minX,
  minY,
  maxX,
  maxY
) {

  const biome =
    getBiomeConfig(
      continent
    );


  ctx.save();


  for (
    let y = minY;
    y <= maxY;
    y += 2
  ) {

    for (
      let x = minX;
      x <= maxX;
      x += 2
    ) {

      if (
        !getContinentShape(
          continent,
          x,
          y
        )
      ) {

        continue;

      }


      const random =
        seededRandom(
          x,
          y,
          (
            Number(
              continent.seed
            ) || 0
          ) + 700
        );


      if (
        random < 0.72
      ) {

        continue;

      }


      const px =
        x *
        tileSize +
        tileSize * 0.5;

      const py =
        y *
        tileSize +
        tileSize * 0.5;


      ctx.fillStyle =
        biome.accent;


      ctx.globalAlpha =
        0.12;


      const size =
        Math.max(
          2,
          tileSize * 0.035
        );


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

  }


  ctx.restore();

}


// ======================================================
// DIBUJAR COSTA
// ======================================================

function drawCoast(
  continent
) {

  if (
    !continent ||
    continent.active === false
  ) {

    return;

  }


  const padding =
    3;


  const minX =
    Math.max(
      0,
      Math.floor(
        continent.x -
        continent.radiusX -
        padding
      )
    );


  const maxX =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.x +
        continent.radiusX +
        padding
      )
    );


  const minY =
    Math.max(
      0,
      Math.floor(
        continent.y -
        continent.radiusY -
        padding
      )
    );


  const maxY =
    Math.min(
      mapSize - 1,
      Math.ceil(
        continent.y +
        continent.radiusY +
        padding
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
        !getContinentShape(
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


      // --------------------------------------------
      // BORDE DERECHO
      // --------------------------------------------

      if (
        !getContinentShape(
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


      // --------------------------------------------
      // BORDE INFERIOR
      // --------------------------------------------

      if (
        !getContinentShape(
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


      // --------------------------------------------
      // BORDE IZQUIERDO
      // --------------------------------------------

      if (
        !getContinentShape(
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


      // --------------------------------------------
      // BORDE SUPERIOR
      // --------------------------------------------

      if (
        !getContinentShape(
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

  // Sombra exterior
  ctx.strokeStyle =
    terrainConfig
      .coast
      .outer;

  ctx.lineWidth =
    terrainConfig
      .coast
      .width +
    4;


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


  // Luz
  ctx.strokeStyle =
    terrainConfig
      .coast
      .light;

  ctx.lineWidth =
    terrainConfig
      .coast
      .width;


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
// OBTENER PUNTO DE BORDE
// ======================================================

function getConnectionPoint(
  continent,
  targetX,
  targetY
) {

  const dx =
    targetX -
    continent.x;

  const dy =
    targetY -
    continent.y;


  const distance =
    Math.hypot(
      dx,
      dy
    );


  if (
    distance <= 0
  ) {

    return {

      x:
        continent.x *
        tileSize,

      y:
        continent.y *
        tileSize

    };

  }


  const nx =
    dx /
    distance;

  const ny =
    dy /
    distance;


  const radiusX =
    Number(
      continent.radiusX
    ) || 1;

  const radiusY =
    Number(
      continent.radiusY
    ) || 1;


  /*
   * Intersección aproximada
   * con la elipse del continente.
   */

  const denominator =
    Math.sqrt(
      (
        nx * nx
      ) /
      (
        radiusX *
        radiusX
      ) +
      (
        ny * ny
      ) /
      (
        radiusY *
        radiusY
      )
    );


  const distanceToEdge =
    denominator > 0
      ? 1 / denominator
      : 0;


  const margin =
    0.75;


  return {

    x:
      (
        continent.x +
        nx *
        (
          distanceToEdge -
          margin
        )
      ) *
      tileSize,

    y:
      (
        continent.y +
        ny *
        (
          distanceToEdge -
          margin
        )
      ) *
      tileSize

  };

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


  const centerAX =
    from.x *
    tileSize;

  const centerAY =
    from.y *
    tileSize;


  const centerBX =
    to.x *
    tileSize;

  const centerBY =
    to.y *
    tileSize;


  const start =
    getConnectionPoint(
      from,
      to.x,
      to.y
    );


  const end =
    getConnectionPoint(
      to,
      from.x,
      from.y
    );


  const dx =
    end.x -
    start.x;

  const dy =
    end.y -
    start.y;


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
   * El camino solamente conecta
   * los bordes.
   *
   * No atraviesa todo el continente.
   */

  const midX =
    (
      start.x +
      end.x
    ) / 2;

  const midY =
    (
      start.y +
      end.y
    ) / 2;


  const nx =
    -dy /
    distance;

  const ny =
    dx /
    distance;


  const curve =
    Math.min(
      distance * 0.10,
      tileSize * 4
    );


  const controlX =
    midX +
    nx *
    curve;

  const controlY =
    midY +
    ny *
    curve;


  ctx.save();


  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";


  // --------------------------------------------
  // SOMBRA
  // --------------------------------------------

  ctx.strokeStyle =
    terrainConfig
      .connection
      .shadow;

  ctx.lineWidth =
    terrainConfig
      .connection
      .width +
    7;


  drawCurvedPath(
    start,
    {
      x:
        controlX,

      y:
        controlY
    },
    end
  );


  // --------------------------------------------
  // CAMINO
  // --------------------------------------------

  ctx.strokeStyle =
    terrainConfig
      .connection
      .color;

  ctx.lineWidth =
    terrainConfig
      .connection
      .width;


  drawCurvedPath(
    start,
    {
      x:
        controlX,

      y:
        controlY
    },
    end
  );


  // --------------------------------------------
  // DETALLE CENTRAL
  // --------------------------------------------

  ctx.strokeStyle =
    terrainConfig
      .connection
      .highlight;

  ctx.lineWidth =
    terrainConfig
      .connection
      .borderWidth;


  ctx.setLineDash(
    terrainConfig
      .connection
      .dash
  );


  drawCurvedPath(
    start,
    {
      x:
        controlX,

      y:
        controlY
    },
    end
  );


  ctx.setLineDash([]);


  ctx.restore();

}


// ======================================================
// CAMINO CURVO
// ======================================================

function drawCurvedPath(
  start,
  control,
  end
) {

  ctx.beginPath();


  ctx.moveTo(
    start.x,
    start.y
  );


  ctx.quadraticCurveTo(
    control.x,
    control.y,
    end.x,
    end.y
  );


  ctx.stroke();

}


// ======================================================
// DIBUJAR CONEXIONES
// ======================================================

function drawConnections() {

  const connections =
    getResolvedConnections();


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

    if (
      connection.active === false
    ) {

      continue;

    }


    drawConnection(
      connection
    );

  }

}


// ======================================================
// DIBUJAR TERRENO COMPLETO
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


  // ----------------------------------------------------
  // 1. OCÉANO
  // ----------------------------------------------------

  drawOcean();


  // ----------------------------------------------------
  // 2. DETALLES DEL AGUA
  // ----------------------------------------------------

  drawOceanDetails();


  // ----------------------------------------------------
  // 3. CONTINENTES
  // ----------------------------------------------------

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


  // ----------------------------------------------------
  // 4. COSTAS
  // ----------------------------------------------------

  for (
    const continent
    of continents
  ) {

    drawCoast(
      continent
    );

  }


  // ----------------------------------------------------
  // 5. CONEXIONES
  // ----------------------------------------------------

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


  // Resplandor
  ctx.strokeStyle =
    terrainConfig
      .border
      .glow;

  ctx.lineWidth =
    terrainConfig
      .border
      .width +
    8;


  ctx.strokeRect(
    0,
    0,
    size,
    size
  );


  // Borde principal
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

    return false;

  }


  tileSize =
    value;


  return true;

}


// ======================================================
// TAMAÑO DEL MAPA
// ======================================================

export function getMapSize() {

  return mapSize;

}


// ======================================================
// CONTINENTES DEL TERRENO
// ======================================================

export function getTerrainContinents() {

  return getContinents();

}


// ======================================================
// CONTINENTE EN POSICIÓN
// ======================================================

export function getTerrainContinentAt(
  x,
  y
) {

  const continents =
    getContinents();


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


    if (
      Math.hypot(
        dx,
        dy
      ) <= 1
    ) {

      return continent;

    }

  }


  return null;

}


// ======================================================
// EXPORTACIÓN DEFAULT
// ======================================================

export default {

  initTerrain,

  setTerrainConfig,

  drawTerrain,

  drawMapBorder,

  getTileSize,

  setTileSize,

  getMapSize,

  getTerrainContinents,

  getTerrainContinentAt

};
