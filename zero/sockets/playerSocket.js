const Player = require("../game/Player");
const production = require("../game/production");
const map = require("../game/map");

const playersDB = require("../database/players");
const database = require("../database/mongodb");

module.exports = function playerSocket(
  socket,
  io,
  players,
  territories
) {

  // ============================================
  // ENTRAR / REGISTRAR JUGADOR
  // ============================================

  socket.on("player:register", async (data) => {

    try {

      const username =
        String(
          data?.username ||
          `Lord_${Math.floor(Math.random() * 99999)}`
        )
          .trim()
          .slice(0, 30);

      if (!username) {
        socket.emit("error", {
          message: "Nombre inválido."
        });

        return;
      }

      let savedPlayer = null;

      if (database.isConnected()) {
        savedPlayer =
          await playersDB.loadPlayer(username);
      }

      let player;


      // ==========================================
      // RECUPERAR JUGADOR
      // ==========================================

      if (savedPlayer) {

        player =
          Player.fromDatabase(
            socket.id,
            savedPlayer
          );

        console.log(
          `♻️ Jugador recuperado: ${username}`
        );

      }


      // ==========================================
      // NUEVO JUGADOR
      // ==========================================

      else {

        player =
          new Player(
            socket.id,
            username
          );

        const start =
          map.findFreeStartingTerritory(
            territories
          );

        if (!start) {

          socket.emit("error", {
            message:
              "No quedan ciudades libres."
          });

          return;
        }

        player.x =
          start.x;

        player.y =
          start.y;

        start.ownerId =
          player.id;

        start.troops =
          player.troops;

        player.territories.push(
          start.id
        );


        if (database.isConnected()) {

          const territoriesDB =
            require(
              "../database/territories"
            );

          await territoriesDB.saveTerritory(
            start
          );
        }

        console.log(
          `🏰 Nueva ciudad para ${username}`
        );
      }


      // ==========================================
      // GUARDAR EN MEMORIA
      // ==========================================

      player.socketId =
        socket.id;

      players.set(
        socket.id,
        player
      );


      // ==========================================
      // ACTUALIZAR PRODUCCIÓN
      // ==========================================

      production.updateProduction(
        player
      );


      // ==========================================
      // GUARDAR JUGADOR
      // ==========================================

      if (database.isConnected()) {

        await playersDB.savePlayer(
          player
        );
      }


      // ==========================================
      // ENVIAR INFORMACIÓN AL CLIENTE
      // ==========================================

      socket.emit(
        "player:init",
        {
          player:
            player.toJSON(),

          mapSize:
            require(
              "../config/gameConfig"
            ).MAP_SIZE
        }
      );


      // ==========================================
      // ENVIAR MAPA
      // ==========================================

      map.sendVisibleMap(
        socket,
        player,
        territories
      );


      console.log(
        `🎮 ${username} entró al juego`
      );

    } catch (error) {

      console.error(
        "❌ Error registrando jugador:",
        error
      );

      socket.emit(
        "error",
        {
          message:
            "No se pudo entrar al juego."
        }
      );
    }
  });


  // ============================================
  // CONSULTAR ESTADO DEL JUGADOR
  // ============================================

  socket.on(
    "player:state",
    () => {

      const player =
        players.get(
          socket.id
        );

      if (!player) {
        return;
      }


      production.updateProduction(
        player
      );


      const stats =
        production.calculateProduction(
          player
        );


      socket.emit(
        "player:update",
        {
          gold:
            player.gold,

          troops:
            player.troops,

          level:
            player.level,

          xp:
            player.xp,

          territories:
            player.territories,

          goldPerSecond:
            stats.goldPerSecond,

          troopsPerSecond:
            stats.troopsPerSecond
        }
      );
    }
  );


  // ============================================
  // DESCONEXIÓN
  // ============================================

  socket.on(
    "disconnect",
    async () => {

      const player =
        players.get(
          socket.id
        );

      if (!player) {
        return;
      }


      try {

        production.updateProduction(
          player
        );


        if (database.isConnected()) {

          await playersDB.savePlayer(
            player
          );
        }

        players.delete(
          socket.id
        );


        console.log(
          `💾 ${player.username} guardado al salir`
        );

      } catch (error) {

        console.error(
          "❌ Error guardando jugador:",
          error
        );
      }
    }
  );

};
