const battle = require("../game/battle");
const experience = require("../game/experience");
const production = require("../game/production");
const map = require("../game/map");

const database = require("../database/mongodb");
const playersDB = require("../database/players");
const territoriesDB = require("../database/territories");

const config = require("../config/gameConfig");

module.exports = function territorySocket(
  socket,
  io,
  players,
  territories
) {
  socket.on("territory:attack", async (data) => {
    try {
      const player = players.get(socket.id);
      const territoryId = Number(data?.territoryId);
      const territory = territories.get(territoryId);

      if (!player || !territory) {
        socket.emit("error", {
          message: "Ciudad no encontrada."
        });
        return;
      }

      production.updateProduction(player);

      if (territory.ownerId === player.id) {
        socket.emit("error", {
          message: "Esta ciudad ya es tuya."
        });
        return;
      }

      // CORREGIDO:
      // map.js exporta canAttackTerritory(),
      // no isAdjacentToPlayer().
      const adjacent = map.canAttackTerritory(
        player,
        territory,
        territories
      );

      if (!adjacent) {
        socket.emit("error", {
          message:
            "Debes conquistar una ciudad junto a tu territorio."
        });
        return;
      }

      if (player.troops <= 0) {
        socket.emit("error", {
          message: "No tienes tropas suficientes."
        });
        return;
      }

      const previousOwnerId = territory.ownerId;

      const previousOwner = previousOwnerId
        ? players.get(previousOwnerId)
        : null;

      const result = battle.resolveBattle(
        player,
        territory
      );

      // ==================================================
      // VICTORIA
      // ==================================================

      if (result.winner === "attacker") {
        territory.ownerId = player.id;

        territory.level = Math.max(
          territory.level,
          player.level
        );

        if (
          !player.territories.includes(
            territory.id
          )
        ) {
          player.territories.push(
            territory.id
          );
        }

        // Quitar territorio al antiguo dueño
        if (previousOwner) {
          previousOwner.territories =
            previousOwner.territories.filter(
              (id) => id !== territory.id
            );

          const oldSocket =
            io.sockets.sockets.get(
              previousOwner.socketId
            );

          if (oldSocket) {
            oldSocket.emit(
              "territory:lost",
              {
                territoryId: territory.id
              }
            );
          }

          if (database.isConnected()) {
            await playersDB.savePlayer(
              previousOwner
            );
          }
        }

        // XP
        const previousLevel =
          player.level;

        const levelUps =
          experience.addXP(
            player,
            config.XP_PER_CONQUEST
          );

        // Guardar territorio
        if (database.isConnected()) {
          await territoriesDB.saveTerritory(
            territory
          );
        }

        // Guardar jugador
        if (database.isConnected()) {
          await playersDB.savePlayer(
            player
          );
        }

        // Resultado
        socket.emit(
          "battle:result",
          {
            winner: "attacker",

            territoryId:
              territory.id,

            survivingTroops:
              player.troops,

            attackerLosses:
              result.attackerLosses,

            defenderLosses:
              result.defenderLosses,

            xp:
              player.xp,

            level:
              player.level,

            levelUps,

            previousLevel,

            gold:
              player.gold,

            territories:
              player.territories
          }
        );

        console.log(
          `⚔️ ${player.username} conquistó ${territory.cityName}`
        );

      } else {
        // ==================================================
        // DERROTA
        // ==================================================

        if (database.isConnected()) {
          await playersDB.savePlayer(
            player
          );
        }

        socket.emit(
          "battle:result",
          {
            winner: "defender",

            territoryId:
              territory.id,

            troops:
              player.troops,

            gold:
              player.gold,

            attackerLosses:
              result.attackerLosses,

            defenderLosses:
              result.defenderLosses,

            defenderSurvivors:
              result.defenderSurvivors
          }
        );

        console.log(
          `🛡️ ${player.username} perdió el ataque`
        );
      }

      // Actualizar territorio para todos
      io.emit(
        "territory:updated",
        territory
      );

    } catch (error) {
      console.error(
        "❌ Error procesando ataque:",
        error
      );

      socket.emit(
        "error",
        {
          message:
            "Error procesando la batalla."
        }
      );
    }
  });
};
