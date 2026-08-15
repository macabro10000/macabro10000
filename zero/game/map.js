const config = require("../config/gameConfig");
const Territory = require("./Territory");

// ======================================================
// GENERAR MAPA
// ======================================================

function generateMap(territories) {

  territories.clear();

  let id = 0;

  for (
    let y = 0;
    y < config.MAP_SIZE;
    y++
  ) {

    for (
      let x = 0;
      x < config.MAP_SIZE;
      x++
    ) {

      const territory =
        new Territory(
          id,
          x,
          y
        );

      territories.set(
        id,
        territory
      );

      id++;
    }
  }

  console.log(
    `🗺️ Mapa generado: ${config.MAP_SIZE}x${config.MAP_SIZE} = ${territories.size} ciudades`
  );

  return territories;
}


// ======================================================
// OBTENER TERRITORIO
// ======================================================

function getTerritory(
  territories,
  id
) {

  return territories.get(
    Number(id)
  ) || null;
}


// ======================================================
// BUSCAR CIUDAD LIBRE
// ======================================================

function findFreeStartingTerritory(
  territories
) {

  const free =
    Array.from(
      territories.values()
    ).filter(
      territory =>
        territory.ownerId === null
    );

  if (
    free.length === 0
  ) {
    return null;
  }

  return free[
    Math.floor(
      Math.random() *
      free.length
    )
  ];
}


// ======================================================
// COMPROBAR ADYACENCIA
// ======================================================

function areAdjacent(
  territoryA,
  territoryB
) {

  if (
    !territoryA ||
    !territoryB
  ) {
    return false;
  }

  const distance =
    Math.abs(
      territoryA.x -
      territoryB.x
    ) +
    Math.abs(
      territoryA.y -
      territoryB.y
    );

  return distance === 1;
}


// ======================================================
// COMPROBAR SI EL JUGADOR PUEDE ATACAR
// ======================================================

function canAttackTerritory(
  player,
  target,
  territories
) {

  if (
    !player ||
    !target
  ) {
    return false;
  }

  if (
    target.ownerId ===
    player.id
  ) {
    return false;
  }

  return player.territories.some(
    territoryId => {

      const owned =
        territories.get(
          territoryId
        );

      return areAdjacent(
        owned,
        target
      );
    }
  );
}


// ======================================================
// OBTENER MAPA VISIBLE
// ======================================================

function getVisibleTerritories(
  player,
  territories
) {

  if (!player) {
    return [];
  }

  const viewRange =
    config.VIEW_RANGE || 15;

  const visible = [];

  const startX =
    Math.floor(
      Number(player.x) || 0
    );

  const startY =
    Math.floor(
      Number(player.y) || 0
    );


  for (
    let dx = -viewRange;
    dx <= viewRange;
    dx++
  ) {

    for (
      let dy = -viewRange;
      dy <= viewRange;
      dy++
    ) {

      const x =
        startX + dx;

      const y =
        startY + dy;


      if (
        x < 0 ||
        x >= config.MAP_SIZE ||
        y < 0 ||
        y >= config.MAP_SIZE
      ) {
        continue;
      }


      const id =
        y *
        config.MAP_SIZE +
        x;


      const territory =
        territories.get(id);


      if (territory) {
        visible.push(
          territory
        );
      }
    }
  }

  return visible;
}


// ======================================================
// ENVIAR MAPA VISIBLE AL JUGADOR
// ======================================================

function sendVisibleMap(
  socket,
  player,
  territories
) {

  if (
    !socket ||
    !player
  ) {
    return;
  }

  const visible =
    getVisibleTerritories(
      player,
      territories
    );

  socket.emit(
    "map:visible",
    visible
  );
}


// ======================================================
// OBTENER POSICIÓN DE TERRITORIO
// ======================================================

function getTerritoryId(
  x,
  y
) {

  const posX =
    Number(x);

  const posY =
    Number(y);


  if (
    !Number.isInteger(posX) ||
    !Number.isInteger(posY)
  ) {
    return null;
  }


  if (
    posX < 0 ||
    posX >= config.MAP_SIZE ||
    posY < 0 ||
    posY >= config.MAP_SIZE
  ) {
    return null;
  }


  return (
    posY *
    config.MAP_SIZE +
    posX
  );
}


// ======================================================
// OBTENER COORDENADAS DESDE ID
// ======================================================

function getCoordinates(
  id
) {

  const territoryId =
    Number(id);


  if (
    !Number.isInteger(
      territoryId
    ) ||
    territoryId < 0 ||
    territoryId >=
      config.MAP_SIZE *
      config.MAP_SIZE
  ) {
    return null;
  }


  return {

    x:
      territoryId %
      config.MAP_SIZE,

    y:
      Math.floor(
        territoryId /
        config.MAP_SIZE
      )
  };
}


// ======================================================
// INICIALIZAR MAPA
// ======================================================

async function initialize(
  territories
) {

  if (
    territories.size > 0
  ) {
    return territories;
  }

  return generateMap(
    territories
  );
}


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {

  generateMap,

  initialize,

  getTerritory,

  findFreeStartingTerritory,

  areAdjacent,

  canAttackTerritory,

  getVisibleTerritories,

  sendVisibleMap,

  getTerritoryId,

  getCoordinates

};
