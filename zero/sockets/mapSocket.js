const map = require("../game/map");

module.exports = function mapSocket(
  socket,
  io,
  players,
  territories
) {

  // ============================================
  // SOLICITAR MAPA
  // ============================================

  socket.on("map:get", () => {

    const player =
      players.get(socket.id);

    if (!player) {
      socket.emit("error", {
        message:
          "Jugador no encontrado."
      });

      return;
    }

    map.sendVisibleMap(
      socket,
      player,
      territories
    );
  });


  // ============================================
  // ACTUALIZAR POSICIÓN / VISTA
  // ============================================

  socket.on(
    "map:view",
    (data) => {

      const player =
        players.get(socket.id);

      if (!player) {
        return;
      }

      const x =
        Number(data?.x);

      const y =
        Number(data?.y);

      if (
        Number.isFinite(x) &&
        Number.isFinite(y)
      ) {

        player.x = x;
        player.y = y;
      }

      map.sendVisibleMap(
        socket,
        player,
        territories
      );
    }
  );

};
