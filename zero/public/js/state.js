// ======================================================
// ZERO - STATE.JS
// Estado central del juego
// ======================================================

// ======================================================
// ESTADO
// ======================================================

let player = null;

let mapSize = 100;

let territories = [];


// ======================================================
// JUGADOR
// ======================================================

export function setPlayer(data) {

  if (!data) {
    return;
  }

  player = {
    ...data
  };

  console.log(
    "👑 Estado del jugador actualizado:",
    player
  );

}


// ======================================================
// OBTENER JUGADOR
// ======================================================

export function getPlayer() {

  return player;

}


// ======================================================
// TAMAÑO DEL MAPA
// ======================================================

export function setMapSize(size) {

  const value =
    Number(size);

  if (
    Number.isFinite(value) &&
    value > 0
  ) {

    mapSize = value;

  }

}


// ======================================================
// OBTENER TAMAÑO DEL MAPA
// ======================================================

export function getMapSize() {

  return mapSize;

}


// ======================================================
// TERRITORIOS
// ======================================================

export function setTerritories(data) {

  if (!Array.isArray(data)) {

    territories = [];

    return;

  }

  territories = data;

  console.log(
    "🗺️ Territorios cargados:",
    territories.length
  );

}


// ======================================================
// OBTENER TERRITORIOS
// ======================================================

export function getTerritories() {

  return territories;

}


// ======================================================
// ACTUALIZAR UN TERRITORIO
// ======================================================

export function updateTerritory(
  territory
) {

  if (!territory) {
    return;
  }


  const index =
    territories.findIndex(
      item =>
        item.id ===
        territory.id
    );


  if (index === -1) {

    territories.push(
      territory
    );

  } else {

    territories[index] = {
      ...territories[index],
      ...territory
    };

  }

}


// ======================================================
// ACTUALIZAR RECURSOS
// ======================================================

export function updateResources(
  data
) {

  if (!player || !data) {
    return;
  }


  if (
    data.gold !== undefined
  ) {

    player.gold =
      data.gold;

  }


  if (
    data.troops !== undefined
  ) {

    player.troops =
      data.troops;

  }


  if (
    data.level !== undefined
  ) {

    player.level =
      data.level;

  }


  if (
    data.xp !== undefined
  ) {

    player.xp =
      data.xp;

  }


  if (
    data.territories !==
    undefined
  ) {

    player.territories =
      data.territories;

  }


  if (
    data.goldPerSecond !==
    undefined
  ) {

    player.goldPerSecond =
      data.goldPerSecond;

  }


  if (
    data.troopsPerSecond !==
    undefined
  ) {

    player.troopsPerSecond =
      data.troopsPerSecond;

  }

}


// ======================================================
// ACTUALIZAR POSICIÓN
// ======================================================

export function updatePlayerPosition(
  x,
  y
) {

  if (!player) {
    return;
  }


  player.x =
    Number(x) || 0;

  player.y =
    Number(y) || 0;

}


// ======================================================
// OBTENER TERRITORIO POR ID
// ======================================================

export function getTerritoryById(
  id
) {

  return territories.find(
    territory =>
      territory.id ===
      Number(id)
  ) || null;

}


// ======================================================
// COMPROBAR SI ES NUESTRO
// ======================================================

export function isOwnTerritory(
  territory
) {

  if (
    !player ||
    !territory
  ) {

    return false;

  }


  return (
    territory.ownerId ===
    player.id
  );

}


// ======================================================
// REINICIAR ESTADO
// ======================================================

export function resetState() {

  player = null;

  mapSize = 100;

  territories = [];

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  setPlayer,

  getPlayer,

  setMapSize,

  getMapSize,

  setTerritories,

  getTerritories,

  updateTerritory,

  updateResources,

  updatePlayerPosition,

  getTerritoryById,

  isOwnTerritory,

  resetState

};
