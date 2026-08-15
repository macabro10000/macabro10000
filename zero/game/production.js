const config = require("../config/gameConfig");

// ======================================================
// CALCULAR PRODUCCIÓN
// ======================================================

function calculateProduction(player) {

  const cityCount =
    Array.isArray(player.territories)
      ? player.territories.length
      : 0;

  const level =
    Math.max(
      1,
      Number(player.level) || 1
    );


  // ----------------------------------------------
  // ORO
  // ----------------------------------------------

  const goldPerSecond =
    cityCount *
    config.GOLD_PER_SECOND_BASE *
    level;


  // ----------------------------------------------
  // TROPAS
  // ----------------------------------------------

  const troopsPerSecond =
    cityCount *
    config.TROOPS_PER_SECOND_BASE *
    level;


  return {
    goldPerSecond,
    troopsPerSecond
  };
}


// ======================================================
// ACTUALIZAR PRODUCCIÓN
// ======================================================

function updateProduction(player) {

  const now =
    Date.now();


  if (!player.lastProduction) {

    player.lastProduction =
      now;

    return;
  }


  const elapsed =
    (now - player.lastProduction) /
    1000;


  if (elapsed <= 0) {
    return;
  }


  const production =
    calculateProduction(
      player
    );


  // ----------------------------------------------
  // PRODUCIR ORO
  // ----------------------------------------------

  player.gold +=
    production.goldPerSecond *
    elapsed;


  // ----------------------------------------------
  // PRODUCIR TROPAS
  // ----------------------------------------------

  player.troops +=
    production.troopsPerSecond *
    elapsed;


  player.lastProduction =
    now;
}


// ======================================================
// PRODUCCIÓN EN UN PERÍODO ESPECÍFICO
// ======================================================

function calculateProductionForTime(
  player,
  seconds
) {

  const production =
    calculateProduction(
      player
    );


  return {

    gold:
      production.goldPerSecond *
      seconds,

    troops:
      production.troopsPerSecond *
      seconds
  };
}


// ======================================================
// OBTENER PRODUCCIÓN
// ======================================================

function getProductionStats(
  player
) {

  return calculateProduction(
    player
  );
}


module.exports = {

  calculateProduction,

  updateProduction,

  calculateProductionForTime,

  getProductionStats

};
