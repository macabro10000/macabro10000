// ======================================================
// ZERO - SOCKET.JS
// Conexión y comunicación con el servidor
// ======================================================

import {
  setPlayer,
  setMapSize,
  setTerritories,
  updateTerritory,
  updateResources,
  getPlayer
} from "./state.js";


// ======================================================
// CONEXIÓN
// ======================================================

export const socket = io();


// ======================================================
// INICIALIZAR SOCKET
// ======================================================

export function initSocket() {

  console.log("🔌 Inicializando conexión...");


  // --------------------------------------------------
  // CONECTADO
  // --------------------------------------------------

  socket.on("connect", () => {

    console.log(
      "🟢 Conectado a ZERO:",
      socket.id
    );


    const username =
      localStorage.getItem(
        "zero_username"
      ) ||
      "Lord_" +
        Math.floor(
          Math.random() * 99999
        );


    localStorage.setItem(
      "zero_username",
      username
    );


    socket.emit(
      "player:register",
      {
        username
      }
    );

  });


  // --------------------------------------------------
  // DESCONEXIÓN
  // --------------------------------------------------

  socket.on("disconnect", () => {

    console.log(
      "🔴 Desconectado del servidor"
    );

  });


  // ==================================================
  // JUGADOR INICIALIZADO
  // ==================================================

  socket.on(
    "player:init",
    data => {

      console.log(
        "🏰 Jugador inicializado:",
        data
      );


      if (!data) {
        return;
      }


      if (data.player) {

        setPlayer(
          data.player
        );

      }


      if (data.mapSize) {

        setMapSize(
          data.mapSize
        );

      }

    }
  );


  // ==================================================
  // MAPA VISIBLE
  // ==================================================

  socket.on(
    "map:visible",
    territories => {

      console.log(
        "🗺️ Mapa recibido:",
        territories.length,
        "territorios"
      );


      setTerritories(
        territories || []
      );

    }
  );


  // ==================================================
  // TERRITORIO ACTUALIZADO
  // ==================================================

  socket.on(
    "territory:updated",
    territory => {

      console.log(
        "🏰 Territorio actualizado:",
        territory.id
      );


      updateTerritory(
        territory
      );

    }
  );


  // ==================================================
  // RECURSOS
  // ==================================================

  socket.on(
    "resources:update",
    data => {

      if (!data) {
        return;
      }


      updateResources(
        data
      );

    }
  );


  // ==================================================
  // ACTUALIZACIÓN DEL JUGADOR
  // ==================================================

  socket.on(
    "player:update",
    data => {

      if (!data) {
        return;
      }


      updateResources(
        data
      );

    }
  );


  // ==================================================
  // RESULTADO DE BATALLA
  // ==================================================

  socket.on(
    "battle:result",
    result => {

      console.log(
        "⚔️ Resultado de batalla:",
        result
      );


      // El resto de la interfaz
      // podrá escuchar este evento
      // desde game.js o interaction.js.

      window.dispatchEvent(
        new CustomEvent(
          "zero:battle-result",
          {
            detail: result
          }
        )
      );

    }
  );


  // ==================================================
  // TERRITORIO PERDIDO
  // ==================================================

  socket.on(
    "territory:lost",
    data => {

      console.log(
        "❌ Territorio perdido:",
        data
      );


      window.dispatchEvent(
        new CustomEvent(
          "zero:territory-lost",
          {
            detail: data
          }
        )
      );

    }
  );


  // ==================================================
  // ERROR DEL SERVIDOR
  // ==================================================

  socket.on(
    "error",
    data => {

      console.error(
        "❌ Error del servidor:",
        data
      );


      window.dispatchEvent(
        new CustomEvent(
          "zero:server-error",
          {
            detail: data
          }
        )
      );

    }
  );


  console.log(
    "✅ Socket configurado"
  );

}


// ======================================================
// ATAQUE
// ======================================================

export function attackTerritory(
  territoryId
) {

  if (!socket.connected) {

    console.error(
      "❌ No hay conexión con el servidor"
    );

    return;

  }


  console.log(
    "⚔️ Atacando territorio:",
    territoryId
  );


  socket.emit(
    "territory:attack",
    {
      territoryId
    }
  );

}


// ======================================================
// SOLICITAR MAPA
// ======================================================

export function requestMap() {

  if (!socket.connected) {
    return;
  }


  socket.emit(
    "map:get"
  );

}


// ======================================================
// SOLICITAR ESTADO DEL JUGADOR
// ======================================================

export function requestPlayerState() {

  if (!socket.connected) {
    return;
  }


  socket.emit(
    "player:state"
  );

}
