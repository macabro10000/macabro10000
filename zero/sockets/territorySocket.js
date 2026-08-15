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

  // ==================================================
  // ATAQUE A TERRITORIO
  // ==================================================

  socket.on(
    "territory:attack",
    async (data) => {

      try {

        const player =
          players.get(socket.id);

        const territoryId =
          Number(data?.territoryId);

        const territory =
          territories.get(territoryId);


        // ==========================================
        // COMPROBAR JUGADOR Y TERRITORIO
        // ==========================================

        if (!player || !territory) {

          socket.emit("error", {
            message:
              "Ciudad no encontrada."
          });

          return;
        }


        // ==========================================
        // ACTUALIZAR PRODUCCIÓN
        // ==========================================

        production.updateProduction(
          player
        );


        // ==========================================
        // NO ATACAR PROPIA CIUDAD
        // ==========================================

        if (
          territory.ownerId ===
          player.id
        ) {

          socket.emit("error", {
            message:
              "Esta ciudad ya es tuya."
          });

          return;
        }


        // ==========================================
        // COMPROBAR ADYACENCIA
        // ==========================================

        const adjacent =
          map.isAdjacentToPlayer(
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


        // ==========================================
        // COMPROBAR TROPAS
        // ==========================================

        if (
          player.troops <= 0
        ) {

          socket.emit("error", {
            message:
              "No tienes tropas suficientes."
          });

          return;
        }


        // ==========================================
        // ANTIGUO DUEÑO
        // ==========================================

        const previousOwnerId =
          territory.ownerId;

        const previousOwner =
          previousOwnerId
            ? players.get(
                previousOwnerId
              )
            : null;


        // ==========================================
        // RESOLVER BATALLA
        // ==========================================

        const result =
          battle.resolveBattle(
            player,
            territory
          );


        // =================================================
        // VICTORIA
        // =================================================

        if (
          result.winner ===
          "attacker"
        ) {

          territory.ownerId =
            player.id;


          territory.level =
            Math.max(
              territory.level,
              player.level
            );


          // ========================================
          // AGREGAR TERRITORIO
          // ========================================

          if (
            !player.territories.includes(
              territory.id
            )
          ) {

            player.territories.push(
              territory.id
            );
          }


          // ========================================
          // QUITAR AL ANTIGUO DUEÑO
          // ========================================

          if (previousOwner) {

            previousOwner.territories =
              previousOwner.territories.filter(
                id =>
                  id !==
                  territory.id
              );


            const oldSocket =
              io.sockets.sockets.get(
                previousOwner.socketId
              );


            if (oldSocket) {

              oldSocket.emit(
                "territory:lost",
                {
                  territoryId:
                    territory.id
                }
              );
            }


            if (
              database.isConnected()
            ) {

              await playersDB.savePlayer(
                previousOwner
              );
            }
          }


          // ========================================
          // XP POR CONQUISTA
          // ========================================

          const previousLevel =
            player.level;


          const levelUps =
            experience.addXP(
              player,
              config.XP_PER_CONQUEST
            );


          // ========================================
          // GUARDAR TERRITORIO
          // ========================================

          if (
            database.isConnected()
          ) {

            await territoriesDB.saveTerritory(
              territory
            );
          }


          // ========================================
          // GUARDAR JUGADOR
          // ========================================

          if (
            database.isConnected()
          ) {

            await playersDB.savePlayer(
              player
            );
          }


          // ========================================
          // RESPUESTA DE BATALLA
          // ========================================

          socket.emit(
            "battle:result",
            {

              winner:
                "attacker",

              territoryId:
                territory.id,

              survivingTroops:
                player.troops,

              defenderLosses:
                result.defenderLosses,

              xp:
                player.xp,

              level:
                player.level,

              levelUps:

                levelUps,

              previousLevel:
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

          // =================================================
          // DERROTA
          // =================================================

          if (
            database.isConnected()
          ) {

            await playersDB.savePlayer(
              player
            );
          }


          socket.emit(
            "battle:result",
            {

              winner:
                "defender",

              territoryId:
                territory.id,

              troops:
                player.troops,

              gold:
                player.gold,

              attackerLosses:
                result.attackerLosses,

              defenderSurvivors:
                result.defenderSurvivors
            }
          );


          console.log(
            `🛡️ ${player.username} perdió el ataque`
          );
        }


        // ==========================================
        // ACTUALIZAR TERRITORIO PARA TODOS
        // ==========================================

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
    }
  );

};
