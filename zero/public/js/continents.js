// ======================================================
// ZERO - CONTINENTS.JS
// Sistema de continentes del mapa
// ======================================================


// ======================================================
// CONFIGURACIÓN
// ======================================================

const CONTINENT_TYPES = {

  NATURE: "nature",

  ICE: "ice",

  FIRE: "fire",

  DESERT: "desert"

};


// ======================================================
// CONTINENTES INICIALES
// ======================================================

const continents = [

  // ====================================================
  // CONTINENTE VERDE
  // ====================================================

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

    unlocked: true

  },


  // ====================================================
  // CONTINENTE DE HIELO
  // ====================================================

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

    unlocked: true

  },


  // ====================================================
  // CONTINENTE DE FUEGO
  // ====================================================

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

    unlocked: true

  },


  // ====================================================
  // CONTINENTE DESÉRTICO
  // ====================================================

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

    unlocked: true

  }

];


// ======================================================
// CONEXIONES ENTRE CONTINENTES
// ======================================================

const connections = [

  {
    id: "nature-ice",

    from:
      "nature",

    to:
      "ice",

    type:
      "road",

    active: true

  },

  {
    id: "nature-fire",

    from:
      "nature",

    to:
      "fire",

    type:
      "road",

    active: true

  },

  {
    id: "ice-desert",

    from:
      "ice",

    to:
      "desert",

    type:
      "road",

    active: true

  },

  {
    id: "fire-desert",

    from:
      "fire",

    to:
      "desert",

    type:
      "road",

    active: true

  }

];


// ======================================================
// ID DE NUEVO CONTINENTE
// ======================================================

let generatedContinentId = 5;


// ======================================================
// COPIAR CONTINENTE
// Evita exponer directamente el objeto interno.
// ======================================================

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


// ======================================================
// COPIAR CONEXIÓN
// ======================================================

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
// OBTENER TODOS
// Incluye continentes inactivos.
// ======================================================

export function getAllContinents() {

  return continents.map(
    cloneContinent
  );

}


// ======================================================
// BUSCAR CONTINENTE POR ID
// ======================================================

export function getContinentById(
  id
) {

  if (
    id === undefined ||
    id === null
  ) {

    return null;

  }

  const continent =
    continents.find(
      item =>
        item.id ===
        String(id)
    );


  return cloneContinent(
    continent
  );

}


// ======================================================
// BUSCAR CONTINENTE POR TIPO
// ======================================================

export function getContinentsByType(
  type
) {

  return continents
    .filter(
      continent =>
        continent.type === type &&
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


    const dx =
      (
        posX -
        continent.x
      ) /
      continent.radiusX;


    const dy =
      (
        posY -
        continent.y
      ) /
      continent.radiusY;


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
// OBTENER CONEXIONES RESUELTAS
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
// COMPROBAR SI EXISTE
// ======================================================

export function hasContinent(
  id
) {

  return continents.some(
    continent =>
      continent.id ===
      String(id)
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
// CONTAR CONTINENTES DESBLOQUEADOS
// ======================================================

export function getUnlockedContinentCount() {

  return continents.filter(
    continent =>
      continent.unlocked !== false &&
      continent.active !== false
  ).length;

}


// ======================================================
// AGREGAR CONTINENTE
// Preparado para expansión dinámica.
// ======================================================

export function addContinent(
  data
) {

  if (
    !data
  ) {

    return null;

  }


  const id =
    data.id ||
    `continent-${generatedContinentId++}`;


  if (
    hasContinent(
      id
    )
  ) {

    console.warn(
      "⚠️ El continente ya existe:",
      id
    );

    return null;

  }


  const continent = {

    id:
      String(id),

    type:
      data.type ||
      CONTINENT_TYPES.NATURE,

    name:
      data.name ||
      "Nuevo Continente",

    x:
      Number.isFinite(
        Number(data.x)
      )
        ? Number(data.x)
        : 50,

    y:
      Number.isFinite(
        Number(data.y)
      )
        ? Number(data.y)
        : 50,

    radiusX:
      Number.isFinite(
        Number(data.radiusX)
      )
        ? Number(data.radiusX)
        : 16,

    radiusY:
      Number.isFinite(
        Number(data.radiusY)
      )
        ? Number(data.radiusY)
        : 14,

    seed:
      Number.isFinite(
        Number(data.seed)
      )
        ? Number(data.seed)
        : Math.floor(
            Math.random() *
            999999
          ),

    active:
      data.active !== false,

    unlocked:
      data.unlocked !== false

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
// ACTIVAR CONTINENTE
// ======================================================

export function activateContinent(
  id
) {

  const continent =
    continents.find(
      item =>
        item.id ===
        String(id)
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

  const continent =
    continents.find(
      item =>
        item.id ===
        String(id)
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

  const continent =
    continents.find(
      item =>
        item.id ===
        String(id)
    );


  if (!continent) {

    return false;

  }


  continent.unlocked =
    true;


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
    String(fromId);

  const to =
    String(toId);


  if (
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


  const exists =
    connections.some(
      connection =>
        (
          connection.from === from &&
          connection.to === to
        ) ||
        (
          connection.from === to &&
          connection.to === from
        )
    );


  if (
    exists
  ) {

    return false;

  }


  connections.push({

    id:
      `${from}-${to}`,

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
// ACTIVAR CONEXIÓN
// ======================================================

export function activateConnection(
  connectionId
) {

  const connection =
    connections.find(
      item =>
        item.id ===
        connectionId
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

  const connection =
    connections.find(
      item =>
        item.id ===
        connectionId
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

  getContinentById,

  getContinentsByType,

  getContinentAt,

  getContinentPosition,

  getConnections,

  getResolvedConnections,

  hasContinent,

  getContinentCount,

  getUnlockedContinentCount,

  addContinent,

  activateContinent,

  deactivateContinent,

  unlockContinent,

  addConnection,

  activateConnection,

  deactivateConnection,

  getContinentTypes

};
