// ======================================================
// ZERO - CONTINENTS.JS
// Sistema de datos y gestión de continentes
//
// RESPONSABILIDAD:
// - Definir continentes
// - Gestionar conexiones
// - Consultar continentes
// - Crear nuevos continentes
// - Preparar expansión dinámica del mundo
//
// NO RESPONSABILIDAD:
// - Canvas
// - Renderizado
// - Cámara
// - CSS
// - Efectos visuales
// ======================================================


// ======================================================
// TIPOS DE CONTINENTE
// ======================================================

export const CONTINENT_TYPES = Object.freeze({

  NATURE: "nature",
  ICE: "ice",
  FIRE: "fire",
  DESERT: "desert"

});


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

const CONFIG = Object.freeze({

  defaultRadiusX: 16,

  defaultRadiusY: 14,

  minRadius: 6,

  maxRadius: 30,

  defaultPosition: {
    x: 50,
    y: 50
  },

  expansion: {

    minDistance: 28,

    maxAttempts: 80,

    radiusX: 16,

    radiusY: 14

  }

});


// ======================================================
// CONTINENTES INICIALES
// ======================================================
//
// IMPORTANTE:
// Estos son datos del mundo.
// La parte visual se maneja en terrain.js.
//
// ======================================================

const continents = [

  {
    id: "nature",

    type:
      CONTINENT_TYPES.NATURE,

    name:
      "Tierras Verdes",

    x: 25,

    y: 25,

    radiusX: 16,

    radiusY: 14,

    seed: 1101,

    active: true,

    unlocked: true,

    expansionLevel: 1

  },


  {
    id: "ice",

    type:
      CONTINENT_TYPES.ICE,

    name:
      "Tierras de Hielo",

    x: 75,

    y: 25,

    radiusX: 16,

    radiusY: 14,

    seed: 2202,

    active: true,

    unlocked: true,

    expansionLevel: 1

  },


  {
    id: "fire",

    type:
      CONTINENT_TYPES.FIRE,

    name:
      "Tierras de Fuego",

    x: 25,

    y: 75,

    radiusX: 16,

    radiusY: 14,

    seed: 3303,

    active: true,

    unlocked: true,

    expansionLevel: 1

  },


  {
    id: "desert",

    type:
      CONTINENT_TYPES.DESERT,

    name:
      "Tierras del Desierto",

    x: 75,

    y: 75,

    radiusX: 16,

    radiusY: 14,

    seed: 4404,

    active: true,

    unlocked: true,

    expansionLevel: 1

  }

];


// ======================================================
// CONEXIONES INICIALES
// ======================================================

const connections = [

  {
    id: "nature-ice",

    from: "nature",

    to: "ice",

    type: "road",

    active: true

  },

  {
    id: "nature-fire",

    from: "nature",

    to: "fire",

    type: "road",

    active: true

  },

  {
    id: "ice-desert",

    from: "ice",

    to: "desert",

    type: "road",

    active: true

  },

  {
    id: "fire-desert",

    from: "fire",

    to: "desert",

    type: "road",

    active: true

  }

];


// ======================================================
// CONTADORES INTERNOS
// ======================================================

let generatedContinentId = 5;

let generatedSeed = 5000;


// ======================================================
// UTILIDADES INTERNAS
// ======================================================

function toId(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return null;

  }

  const id =
    String(value)
      .trim();

  return id || null;

}


// ------------------------------------------------------
// NÚMERO SEGURO
// ------------------------------------------------------

function toFiniteNumber(
  value,
  fallback
) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;

}


// ------------------------------------------------------
// LIMITAR VALOR
// ------------------------------------------------------

function clamp(
  value,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );

}


// ------------------------------------------------------
// COPIA SEGURA
// ------------------------------------------------------

function cloneContinent(
  continent
) {

  if (!continent) {

    return null;

  }

  return {
    ...continent
  };

}


// ------------------------------------------------------
// COPIA DE CONEXIÓN
// ------------------------------------------------------

function cloneConnection(
  connection
) {

  if (!connection) {

    return null;

  }

  return {
    ...connection
  };

}


// ======================================================
// GENERAR SEMILLA DETERMINISTA
// ======================================================

function generateSeed() {

  generatedSeed += 7919;

  return generatedSeed;

}


// ======================================================
// GENERAR ID DE CONTINENTE
// ======================================================

function generateContinentId() {

  let id;

  do {

    id =
      `continent-${generatedContinentId++}`;

  } while (
    hasContinent(id)
  );

  return id;

}


// ======================================================
// CREAR ID DE CONEXIÓN
// ======================================================
//
// Las conexiones son bidireccionales.
//
// nature-ice
// ice-nature
//
// representan la misma conexión.
//
// ======================================================

function createConnectionId(
  from,
  to
) {

  const ids = [

    String(from),

    String(to)

  ].sort();

  return `${ids[0]}-${ids[1]}`;

}


// ======================================================
// OBTENER TODOS LOS CONTINENTES
// ======================================================

export function getContinents() {

  return continents

    .filter(
      continent =>
        continent.active !== false
    )

    .map(
      cloneContinent
    );

}


// ======================================================
// OBTENER TODOS LOS CONTINENTES
// INCLUYE INACTIVOS
// ======================================================

export function getAllContinents() {

  return continents.map(
    cloneContinent
  );

}


// ======================================================
// OBTENER CONTINENTES DESBLOQUEADOS
// ======================================================

export function getUnlockedContinents() {

  return continents

    .filter(
      continent =>
        continent.active !== false &&
        continent.unlocked === true
    )

    .map(
      cloneContinent
    );

}


// ======================================================
// BUSCAR POR ID
// ======================================================

export function getContinentById(
  id
) {

  const normalizedId =
    toId(id);

  if (!normalizedId) {

    return null;

  }

  const continent =
    continents.find(
      item =>
        item.id ===
        normalizedId
    );

  return cloneContinent(
    continent
  );

}


// ======================================================
// BUSCAR POR TIPO
// ======================================================

export function getContinentsByType(
  type
) {

  const normalizedType =
    toId(type);

  if (!normalizedType) {

    return [];

  }

  return continents

    .filter(
      continent =>
        continent.type ===
          normalizedType &&
        continent.active !== false
    )

    .map(
      cloneContinent
    );

}


// ======================================================
// BUSCAR CONTINENTE POR POSICIÓN
// ======================================================

export function getContinentAt(
  x,
  y
) {

  const posX =
    Number(x);

  const posY =
    Number(y);

  if (
    !Number.isFinite(posX) ||
    !Number.isFinite(posY)
  ) {

    return null;

  }


  for (
    const continent
    of continents
  ) {

    if (
      continent.active === false
    ) {

      continue;

    }


    const radiusX =
      Math.max(
        CONFIG.minRadius,
        continent.radiusX
      );


    const radiusY =
      Math.max(
        CONFIG.minRadius,
        continent.radiusY
      );


    const dx =
      (
        posX -
        continent.x
      ) /
      radiusX;


    const dy =
      (
        posY -
        continent.y
      ) /
      radiusY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance <= 1
    ) {

      return cloneContinent(
        continent
      );

    }

  }


  return null;

}


// ======================================================
// OBTENER POSICIÓN
// ======================================================

export function getContinentPosition(
  id
) {

  const continent =
    getContinentById(
      id
    );


  if (!continent) {

    return null;

  }


  return {

    x:
      continent.x,

    y:
      continent.y,

    radiusX:
      continent.radiusX,

    radiusY:
      continent.radiusY

  };

}


// ======================================================
// OBTENER CONEXIONES
// ======================================================

export function getConnections() {

  return connections

    .filter(
      connection =>
        connection.active !== false
    )

    .map(
      cloneConnection
    );

}


// ======================================================
// OBTENER TODAS LAS CONEXIONES
// ======================================================

export function getAllConnections() {

  return connections.map(
    cloneConnection
  );

}


// ======================================================
// OBTENER CONEXIONES DE UN CONTINENTE
// ======================================================

export function getConnectionsFor(
  continentId
) {

  const id =
    toId(continentId);

  if (!id) {

    return [];

  }


  return connections

    .filter(
      connection =>
        connection.active !== false &&
        (
          connection.from === id ||
          connection.to === id
        )
    )

    .map(
      cloneConnection
    );

}


// ======================================================
// CONEXIONES RESUELTAS
// ======================================================
//
// Devuelve:
//
// {
//   id,
//   type,
//   from: continent,
//   to: continent
// }
//
// Esto resulta muy útil para terrain.js.
// ======================================================

export function getResolvedConnections() {

  return connections

    .filter(
      connection =>
        connection.active !== false
    )

    .map(
      connection => {

        const from =
          continents.find(
            continent =>
              continent.id ===
              connection.from
          );


        const to =
          continents.find(
            continent =>
              continent.id ===
              connection.to
          );


        if (
          !from ||
          !to
        ) {

          return null;

        }


        if (
          from.active === false ||
          to.active === false
        ) {

          return null;

        }


        return {

          ...cloneConnection(
            connection
          ),

          from:
            cloneContinent(
              from
            ),

          to:
            cloneContinent(
              to
            )

        };

      }
    )

    .filter(
      Boolean
    );

}


// ======================================================
// COMPROBAR SI EXISTE CONTINENTE
// ======================================================

export function hasContinent(
  id
) {

  const normalizedId =
    toId(id);

  if (!normalizedId) {

    return false;

  }

  return continents.some(
    continent =>
      continent.id ===
      normalizedId
  );

}


// ======================================================
// CONTAR CONTINENTES
// ======================================================

export function getContinentCount() {

  return continents.filter(
    continent =>
      continent.active !== false
  ).length;

}


// ======================================================
// CONTAR DESBLOQUEADOS
// ======================================================

export function getUnlockedContinentCount() {

  return continents.filter(
    continent =>
      continent.active !== false &&
      continent.unlocked === true
  ).length;

}


// ======================================================
// VALIDAR POSICIÓN
// ======================================================

function isValidPosition(
  x,
  y,
  radiusX,
  radiusY
) {

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {

    return false;

  }


  if (
    x < 0 ||
    y < 0
  ) {

    return false;

  }


  return (
    radiusX > 0 &&
    radiusY > 0
  );

}


// ======================================================
// COMPROBAR SUPERPOSICIÓN
// ======================================================

export function isPositionAvailable(
  x,
  y,
  radiusX =
    CONFIG.defaultRadiusX,
  radiusY =
    CONFIG.defaultRadiusY,
  minimumDistance =
    CONFIG.expansion.minDistance
) {

  const posX =
    Number(x);

  const posY =
    Number(y);

  const rx =
    Number(radiusX);

  const ry =
    Number(radiusY);

  const minDistance =
    Number(minimumDistance);


  if (
    !isValidPosition(
      posX,
      posY,
      rx,
      ry
    )
  ) {

    return false;

  }


  for (
    const continent
    of continents
  ) {

    if (
      continent.active === false
    ) {

      continue;

    }


    const dx =
      posX -
      continent.x;

    const dy =
      posY -
      continent.y;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    const requiredDistance =
      Math.max(
        minDistance,
        rx +
        ry
      );


    if (
      distance <
      requiredDistance
    ) {

      return false;

    }

  }


  return true;

}


// ======================================================
// AGREGAR CONTINENTE
// ======================================================

export function addContinent(
  data = {}
) {

  const requestedId =
    toId(data.id);

  const id =
    requestedId ||
    generateContinentId();


  if (
    hasContinent(id)
  ) {

    console.warn(
      "⚠️ El continente ya existe:",
      id
    );

    return null;

  }


  const x =
    toFiniteNumber(
      data.x,
      CONFIG.defaultPosition.x
    );


  const y =
    toFiniteNumber(
      data.y,
      CONFIG.defaultPosition.y
    );


  const radiusX =
    clamp(
      toFiniteNumber(
        data.radiusX,
        CONFIG.defaultRadiusX
      ),
      CONFIG.minRadius,
      CONFIG.maxRadius
    );


  const radiusY =
    clamp(
      toFiniteNumber(
        data.radiusY,
        CONFIG.defaultRadiusY
      ),
      CONFIG.minRadius,
      CONFIG.maxRadius
    );


  if (
    !isValidPosition(
      x,
      y,
      radiusX,
      radiusY
    )
  ) {

    console.warn(
      "⚠️ Posición inválida para continente:",
      id
    );

    return null;

  }


  const continent = {

    id,

    type:
      data.type ||
      CONTINENT_TYPES.NATURE,

    name:
      data.name ||
      "Nuevo Continente",

    x,

    y,

    radiusX,

    radiusY,

    seed:
      Number.isFinite(
        Number(data.seed)
      )
        ? Number(data.seed)
        : generateSeed(),

    active:
      data.active !== false,

    unlocked:
      data.unlocked === true,

    expansionLevel:
      Math.max(
        1,
        Math.floor(
          toFiniteNumber(
            data.expansionLevel,
            1
          )
        )
      )

  };


  continents.push(
    continent
  );


  console.log(
    "🌍 Continente creado:",
    continent.id
  );


  return cloneContinent(
    continent
  );

}


// ======================================================
// CREAR CONTINENTE EN UNA POSICIÓN LIBRE
// ======================================================
//
// Esta función será importante más adelante.
//
// Cuando el mundo se quede sin espacio,
// podremos solicitar:
//
// generateExpansionContinent()
//
// y este módulo buscará automáticamente
// una posición disponible.
// ======================================================

export function generateExpansionContinent(
  options = {}
) {

  const radiusX =
    clamp(
      toFiniteNumber(
        options.radiusX,
        CONFIG.expansion.radiusX
      ),
      CONFIG.minRadius,
      CONFIG.maxRadius
    );


  const radiusY =
    clamp(
      toFiniteNumber(
        options.radiusY,
        CONFIG.expansion.radiusY
      ),
      CONFIG.minRadius,
      CONFIG.maxRadius
    );


  const minX =
    toFiniteNumber(
      options.minX,
      8
    );


  const maxX =
    toFiniteNumber(
      options.maxX,
      92
    );


  const minY =
    toFiniteNumber(
      options.minY,
      8
    );


  const maxY =
    toFiniteNumber(
      options.maxY,
      92
    );


  const attempts =
    Math.max(
      1,
      Math.floor(
        toFiniteNumber(
          options.maxAttempts,
          CONFIG.expansion.maxAttempts
        )
      )
    );


  const type =
    options.type ||
    CONTINENT_TYPES.NATURE;


  for (
    let attempt = 0;
    attempt < attempts;
    attempt++
  ) {

    const x =
      minX +
      Math.random() *
      (
        maxX -
        minX
      );


    const y =
      minY +
      Math.random() *
      (
        maxY -
        minY
      );


    if (
      !isPositionAvailable(
        x,
        y,
        radiusX,
        radiusY,
        CONFIG.expansion.minDistance
      )
    ) {

      continue;

    }


    return addContinent({

      type,

      name:
        options.name ||
        "Nuevo Continente",

      x,

      y,

      radiusX,

      radiusY,

      unlocked:
        options.unlocked === true,

      expansionLevel:
        options.expansionLevel ||
        1

    });

  }


  console.warn(
    "⚠️ No se encontró espacio para generar un nuevo continente."
  );


  return null;

}


// ======================================================
// ACTIVAR CONTINENTE
// ======================================================

export function activateContinent(
  id
) {

  const normalizedId =
    toId(id);


  const continent =
    continents.find(
      item =>
        item.id ===
        normalizedId
    );


  if (!continent) {

    return false;

  }


  continent.active =
    true;


  return true;

}


// ======================================================
// DESACTIVAR CONTINENTE
// ======================================================

export function deactivateContinent(
  id
) {

  const normalizedId =
    toId(id);


  const continent =
    continents.find(
      item =>
        item.id ===
        normalizedId
    );


  if (!continent) {

    return false;

  }


  continent.active =
    false;


  return true;

}


// ======================================================
// DESBLOQUEAR CONTINENTE
// ======================================================

export function unlockContinent(
  id
) {

  const normalizedId =
    toId(id);


  const continent =
    continents.find(
      item =>
        item.id ===
        normalizedId
    );


  if (!continent) {

    return false;

  }


  continent.unlocked =
    true;


  return true;

}


// ======================================================
// BLOQUEAR CONTINENTE
// ======================================================

export function lockContinent(
  id
) {

  const normalizedId =
    toId(id);


  const continent =
    continents.find(
      item =>
        item.id ===
        normalizedId
    );


  if (!continent) {

    return false;

  }


  continent.unlocked =
    false;


  return true;

}


// ======================================================
// AGREGAR CONEXIÓN
// ======================================================

export function addConnection(
  fromId,
  toId,
  options = {}
) {

  const from =
    toIdValue(fromId);

  const to =
    toIdValue(toId);


  if (
    !from ||
    !to ||
    from === to
  ) {

    return false;

  }


  if (
    !hasContinent(from) ||
    !hasContinent(to)
  ) {

    return false;

  }


  const connectionId =
    createConnectionId(
      from,
      to
    );


  const exists =
    connections.some(
      connection =>
        connection.id ===
        connectionId
    );


  if (
    exists
  ) {

    return false;

  }


  connections.push({

    id:
      connectionId,

    from,

    to,

    type:
      options.type ||
      "road",

    active:
      options.active !== false

  });


  return true;

}


// ======================================================
// UTILIDAD PARA NORMALIZAR IDs
// ======================================================

function toIdValue(
  value
) {

  return toId(value);

}


// ======================================================
// ACTIVAR CONEXIÓN
// ======================================================

export function activateConnection(
  connectionId
) {

  const id =
    toId(connectionId);


  if (!id) {

    return false;

  }


  const connection =
    connections.find(
      item =>
        item.id === id
    );


  if (!connection) {

    return false;

  }


  connection.active =
    true;


  return true;

}


// ======================================================
// DESACTIVAR CONEXIÓN
// ======================================================

export function deactivateConnection(
  connectionId
) {

  const id =
    toId(connectionId);


  if (!id) {

    return false;

  }


  const connection =
    connections.find(
      item =>
        item.id === id
    );


  if (!connection) {

    return false;

  }


  connection.active =
    false;


  return true;

}


// ======================================================
// OBTENER TIPOS DISPONIBLES
// ======================================================

export function getContinentTypes() {

  return {

    nature:
      CONTINENT_TYPES.NATURE,

    ice:
      CONTINENT_TYPES.ICE,

    fire:
      CONTINENT_TYPES.FIRE,

    desert:
      CONTINENT_TYPES.DESERT

  };

}


// ======================================================
// EXPORTACIÓN DEFAULT
// ======================================================

export default {

  getContinents,

  getAllContinents,

  getUnlockedContinents,

  getContinentById,

  getContinentsByType,

  getContinentAt,

  getContinentPosition,

  getConnections,

  getAllConnections,

  getConnectionsFor,

  getResolvedConnections,

  hasContinent,

  getContinentCount,

  getUnlockedContinentCount,

  isPositionAvailable,

  addContinent,

  generateExpansionContinent,

  activateContinent,

  deactivateContinent,

  unlockContinent,

  lockContinent,

  addConnection,

  activateConnection,

  deactivateConnection,

  getContinentTypes

};
