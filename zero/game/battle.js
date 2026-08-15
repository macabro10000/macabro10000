// ======================================================
// SISTEMA DE BATALLAS DE ZERO
// ======================================================

// Calcula la fuerza ofensiva del jugador
function calculateAttackerPower(player) {

  const troops =
    Math.floor(
      Number(player.troops) || 0
    );

  const level =
    Math.max(
      1,
      Number(player.level) || 1
    );

  return (
    troops *
    (1 + level * 0.10)
  );
}


// Calcula la fuerza defensiva de una ciudad
function calculateDefenderPower(
  territory
) {

  const troops =
    Math.floor(
      Number(territory.troops) || 0
    );

  const level =
    Math.max(
      1,
      Number(territory.level) || 1
    );

  return (
    troops *
    (1 + level * 0.08)
  );
}


// ======================================================
// RESOLVER BATALLA
// ======================================================

function resolveBattle(
  attacker,
  defender
) {

  const attackerTroops =
    Math.floor(
      Number(attacker.troops) || 0
    );

  const defenderTroops =
    Math.floor(
      Number(defender.troops) || 0
    );


  // ----------------------------------------------
  // SIN TROPAS
  // ----------------------------------------------

  if (
    attackerTroops <= 0
  ) {

    return {

      winner:
        "defender",

      attackerLosses:
        0,

      defenderLosses:
        0,

      attackerPower:
        0,

      defenderPower:
        calculateDefenderPower(
          defender
        )
    };
  }


  // ----------------------------------------------
  // CALCULAR FUERZAS
  // ----------------------------------------------

  const attackerPower =
    calculateAttackerPower(
      attacker
    );

  const defenderPower =
    calculateDefenderPower(
      defender
    );


  // =================================================
  // VICTORIA DEL ATACANTE
  // =================================================

  if (
    attackerPower >
    defenderPower
  ) {

    const survivingTroops =
      Math.max(
        1,
        Math.floor(
          attackerTroops * 0.65
        )
      );


    const attackerLosses =
      attackerTroops -
      survivingTroops;


    const defenderLosses =
      defenderTroops;


    // Actualizar tropas
    attacker.troops =
      survivingTroops;

    defender.troops =
      0;


    return {

      winner:
        "attacker",

      survivingTroops,

      attackerLosses,

      defenderLosses,

      attackerPower,

      defenderPower
    };
  }


  // =================================================
  // VICTORIA DEL DEFENSOR
  // =================================================

  const attackerLosses =
    Math.max(
      1,
      Math.floor(
        attackerTroops * 0.80
      )
    );


  const defenderKilled =
    Math.floor(
      attackerTroops * 0.25
    );


  const defenderSurvivors =
    Math.max(
      1,
      defenderTroops -
      defenderKilled
    );


  attacker.troops =
    Math.max(
      0,
      attackerTroops -
      attackerLosses
    );


  defender.troops =
    defenderSurvivors;


  return {

    winner:
      "defender",

    attackerLosses,

    defenderLosses:
      defenderKilled,

    defenderSurvivors,

    attackerPower,

    defenderPower
  };
}


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {

  calculateAttackerPower,

  calculateDefenderPower,

  resolveBattle

};
