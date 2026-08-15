const playerSocket = require("./playerSocket");
const territorySocket = require("./territorySocket");
const mapSocket = require("./mapSocket");

module.exports = function setupSockets(
  io,
  players,
  territories
) {

  io.on("connection", (socket) => {

    console.log(
      `🟢 Jugador conectado: ${socket.id}`
    );

    playerSocket(
      socket,
      io,
      players,
      territories
    );

    territorySocket(
      socket,
      io,
      players,
      territories
    );

    mapSocket(
      socket,
      io,
      players,
      territories
    );

    socket.on("disconnect", () => {

      console.log(
        `🔴 Jugador desconectado: ${socket.id}`
      );

    });

  });

};
