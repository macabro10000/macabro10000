const database = require("./mongodb");

// ======================================================
// COLECCIÓN DE JUGADORES
// ======================================================

function getPlayersCollection() {
  return database.getCollection("players");
}


// ======================================================
// BUSCAR JUGADOR POR NOMBRE
// ======================================================

async function findPlayer(username) {

  const collection =
    getPlayersCollection();

  if (!collection) {
    return null;
  }

  try {

    return await collection.findOne({
      username
    });

  } catch (error) {

    console.error(
      "❌ Error buscando jugador:",
      error.message
    );

    return null;
  }
}


// ======================================================
// CREAR O ACTUALIZAR JUGADOR
// ======================================================

async function savePlayer(player) {

  const collection =
    getPlayersCollection();

  if (!collection) {
    return false;
  }

  try {

    await collection.updateOne(

      {
        username:
          player.username
      },

      {
        $set: {

          username:
            player.username,

          gold:
            Math.floor(
              Number(player.gold) || 0
            ),

          troops:
            Math.floor(
              Number(player.troops) || 0
            ),

          level:
            Number(player.level) || 1,

          xp:
            Number(player.xp) || 0,

          territories:
            Array.isArray(
              player.territories
            )
              ? player.territories
              : [],

          x:
            Number(player.x) || 0,

          y:
            Number(player.y) || 0,

          lastLogin:
            new Date()
        }
      },

      {
        upsert: true
      }
    );

    return true;

  } catch (error) {

    console.error(
      "❌ Error guardando jugador:",
      error.message
    );

    return false;
  }
}


// ======================================================
// ELIMINAR JUGADOR
// ======================================================

async function deletePlayer(
  username
) {

  const collection =
    getPlayersCollection();

  if (!collection) {
    return false;
  }

  try {

    const result =
      await collection.deleteOne({
        username
      });

    return result.deletedCount > 0;

  } catch (error) {

    console.error(
      "❌ Error eliminando jugador:",
      error.message
    );

    return false;
  }
}


// ======================================================
// LISTAR JUGADORES
// ======================================================

async function getPlayers(
  limit = 100
) {

  const collection =
    getPlayersCollection();

  if (!collection) {
    return [];
  }

  try {

    return await collection
      .find({})
      .limit(limit)
      .toArray();

  } catch (error) {

    console.error(
      "❌ Error obteniendo jugadores:",
      error.message
    );

    return [];
  }
}


// ======================================================
// CLASIFICACIÓN
// ======================================================

async function getLeaderboard(
  limit = 20
) {

  const collection =
    getPlayersCollection();

  if (!collection) {
    return [];
  }

  try {

    return await collection
      .find({})
      .sort({
        territories: -1,
        level: -1,
        xp: -1
      })
      .limit(limit)
      .project({
        username: 1,
        territories: 1,
        troops: 1,
        gold: 1,
        level: 1,
        xp: 1
      })
      .toArray();

  } catch (error) {

    console.error(
      "❌ Error obteniendo ranking:",
      error.message
    );

    return [];
  }
}


// ======================================================
// ACTUALIZAR TERRITORIOS DEL JUGADOR
// ======================================================

async function updatePlayerTerritories(
  username,
  territories
) {

  const collection =
    getPlayersCollection();

  if (!collection) {
    return false;
  }

  try {

    await collection.updateOne(

      {
        username
      },

      {
        $set: {
          territories:
            Array.isArray(
              territories
            )
              ? territories
              : []
        }
      }
    );

    return true;

  } catch (error) {

    console.error(
      "❌ Error actualizando territorios:",
      error.message
    );

    return false;
  }
}


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {

  findPlayer,

  savePlayer,

  deletePlayer,

  getPlayers,

  getLeaderboard,

  updatePlayerTerritories

};
