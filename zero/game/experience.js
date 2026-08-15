const config = require("../config/gameConfig");

// ============================================
// XP NECESARIA PARA SUBIR DE NIVEL
// ============================================

function xpNeededForLevel(level) {
  const currentLevel =
    Math.max(1, Number(level) || 1);

  return (
    currentLevel *
    config.XP_BASE_LEVEL
  );
}


// ============================================
// AGREGAR EXPERIENCIA
// ============================================

function addXP(player, amount) {
  const value =
    Number(amount) || 0;

  if (value <= 0) {
    return {
      gainedXP: 0,
      levelUps: 0,
      previousLevel: player.level,
      level: player.level,
      xp: player.xp
    };
  }

  const previousLevel =
    player.level;

  player.xp += value;

  let levelUps = 0;

  // Permite subir varios niveles
  // si recibe una cantidad grande de XP.
  while (
    player.xp >=
    xpNeededForLevel(player.level)
  ) {
    player.xp -=
      xpNeededForLevel(player.level);

    player.level++;

    levelUps++;
  }

  return {
    gainedXP: value,

    levelUps,

    previousLevel,

    level:
      player.level,

    xp:
      player.xp,

    xpRequired:
      xpNeededForLevel(
        player.level
      )
  };
}


// ============================================
// PROGRESO DEL NIVEL
// ============================================

function getLevelProgress(player) {
  const required =
    xpNeededForLevel(
      player.level
    );

  const current =
    Math.max(
      0,
      Number(player.xp) || 0
    );

  const percentage =
    Math.min(
      100,
      (current / required) * 100
    );

  return {
    level:
      player.level,

    xp:
      current,

    xpRequired:
      required,

    percentage:
      Number(
        percentage.toFixed(2)
      )
  };
}


// ============================================
// RECOMPENSAS POR SUBIR DE NIVEL
// ============================================
//
// El nivel aumenta la producción automáticamente
// mediante production.js.
// Aquí dejamos las recompensas directas
// de la subida de nivel.
//

function calculateLevelReward(level) {
  const currentLevel =
    Math.max(
      1,
      Number(level) || 1
    );

  return {
    gold:
      currentLevel * 100,

    troops:
      currentLevel * 10
  };
}


// ============================================
// APLICAR RECOMPENSA DE NIVEL
// ============================================

function applyLevelReward(
  player,
  level
) {
  const reward =
    calculateLevelReward(
      level
    );

  player.gold +=
    reward.gold;

  player.troops +=
    reward.troops;

  return reward;
}


// ============================================
// EXPORTAR
// ============================================

module.exports = {

  xpNeededForLevel,

  addXP,

  getLevelProgress,

  calculateLevelReward,

  applyLevelReward

};
