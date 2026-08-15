const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ======================================================
// ARCHIVOS DEL JUEGO
// ======================================================
app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


// ======================================================
// MONGODB
// ======================================================

const MONGO_URI = process.env.MONGO_URI;

let mongoClient;
let db;
let playersCollection;
let territoriesCollection;

async function connectDB() {
  try {
    if (!MONGO_URI) {
      console.log("⚠️ MONGO_URI no está configurado.");
      return;
    }

    mongoClient = new MongoClient(MONGO_URI);

    await mongoClient.connect();

    db = mongoClient.db("forja_imperial");

    playersCollection = db.collection("players");
    territoriesCollection = db.collection("territories");

    await playersCollection.createIndex(
      { username: 1 },
      { unique: true }
    );

    await territoriesCollection.createIndex(
      { id: 1 },
      { unique: true }
    );

    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error MongoDB:", error);
  }
}

// ======================================================
// CONFIGURACIÓN DEL JUEGO
// ======================================================

const MAP_SIZE = 100;

const INITIAL_GOLD = 500;
const INITIAL_TROOPS = 100;

const GOLD_PER_SECOND_BASE = 2;
const TROOPS_PER_SECOND_BASE = 0.2;

const XP_PER_CONQUEST = 100;

// ======================================================
// ESTADO EN MEMORIA
// ======================================================

const players = new Map();
const territories = new Map();

// ======================================================
// JUGADOR
// ======================================================

class Player {
  constructor(id, username) {
    this.id = id;
    this.username = username;

    this.gold = INITIAL_GOLD;
    this.troops = INITIAL_TROOPS;

    this.level = 1;
    this.xp = 0;

    this.territories = [];

    this.x = 0;
    this.y = 0;

    this.socketId = id;

    this.lastProduction = Date.now();
  }
}

// ======================================================
// TERRITORIO
// ======================================================

class Territory {
  constructor(id, x, y) {
    this.id = id;

    this.x = x;
    this.y = y;

    this.ownerId = null;

    this.level = 1;

    this.troops = 20;

    this.cityName = `Ciudad ${id}`;
  }
}

// ======================================================
// GENERAR MAPA
// ======================================================

function generateMap() {
  let id = 0;

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const territory = new Territory(
        id,
        x,
        y
      );

      territories.set(id, territory);

      id++;
    }
  }

  console.log(
    `🗺️ Mapa generado: ${MAP_SIZE}x${MAP_SIZE}`
  );
}

// ======================================================
// CARGAR MAPA DESDE MONGODB
// ======================================================

async function loadMap() {
  if (!territoriesCollection) {
    generateMap();
    return;
  }

  try {
    const savedTerritories =
      await territoriesCollection
        .find({})
        .toArray();

    if (savedTerritories.length === 0) {
      generateMap();

      await territoriesCollection.insertMany(
        Array.from(territories.values())
      );

      console.log("✅ Mapa guardado en MongoDB");

      return;
    }

    territories.clear();

    for (const territory of savedTerritories) {
      territories.set(
        territory.id,
        territory
      );
    }

    console.log(
      `✅ Mapa cargado: ${territories.size} ciudades`
    );
  } catch (error) {
    console.error(
      "❌ Error cargando mapa:",
      error
    );

    generateMap();
  }
}

// ======================================================
// BUSCAR CIUDAD LIBRE
// ======================================================

function findFreeStartingTerritory() {
  const free = Array.from(
    territories.values()
  ).filter(
    territory =>
      territory.ownerId === null
  );

  if (free.length === 0) {
    return null;
  }

  return free[
    Math.floor(
      Math.random() * free.length
    )
  ];
}

// ======================================================
// PRODUCCIÓN
// ======================================================

function calculateProduction(player) {
  const cityCount =
    player.territories.length;

  const levelMultiplier =
    Math.max(1, player.level);

  const goldPerSecond =
    cityCount *
    GOLD_PER_SECOND_BASE *
    levelMultiplier;

  const troopsPerSecond =
    cityCount *
    TROOPS_PER_SECOND_BASE *
    levelMultiplier;

  return {
    goldPerSecond,
    troopsPerSecond
  };
}

// ======================================================
// ACTUALIZAR PRODUCCIÓN
// ======================================================

function updateProduction(player) {
  const now = Date.now();

  const elapsed =
    (now - player.lastProduction) /
    1000;

  if (elapsed <= 0) {
    return;
  }

  const production =
    calculateProduction(player);

  player.gold +=
    production.goldPerSecond *
    elapsed;

  player.troops +=
    production.troopsPerSecond *
    elapsed;

  player.lastProduction = now;
}

// ======================================================
// EXPERIENCIA
// ======================================================

function xpNeededForLevel(level) {
  return level * 500;
}

function addXP(player, amount) {
  player.xp += amount;

  let levelUps = 0;

  while (
    player.xp >=
    xpNeededForLevel(player.level)
  ) {
    player.xp -=
      xpNeededForLevel(player.level);

    player.level++;

    levelUps++;
  }

  return levelUps;
}

// ======================================================
// GUARDAR JUGADOR
// ======================================================

async function savePlayer(player) {
  if (!playersCollection) {
    return;
  }

  try {
    await playersCollection.updateOne(
      {
        username: player.username
      },
      {
        $set: {
          username: player.username,

          gold: Math.floor(
            player.gold
          ),

          troops: Math.floor(
            player.troops
          ),

          level: player.level,

          xp: player.xp,

          territories:
            player.territories,

          x: player.x,

          y: player.y,

          lastLogin: new Date()
        }
      },
      {
        upsert: true
      }
    );
  } catch (error) {
    console.error(
      "❌ Error guardando jugador:",
      error
    );
  }
}

// ======================================================
// CARGAR JUGADOR
// ======================================================

async function loadPlayer(username) {
  if (!playersCollection) {
    return null;
  }

  try {
    return await playersCollection.findOne({
      username
    });
  } catch (error) {
    console.error(
      "❌ Error cargando jugador:",
      error
    );

    return null;
  }
}

// ======================================================
// GUARDAR TERRITORIO
// ======================================================

async function saveTerritory(territory) {
  if (!territoriesCollection) {
    return;
  }

  try {
    await territoriesCollection.updateOne(
      {
        id: territory.id
      },
      {
        $set: territory
      },
      {
        upsert: true
      }
    );
  } catch (error) {
    console.error(
      "❌ Error guardando territorio:",
      error
    );
  }
}

// ======================================================
// BATALLA
// ======================================================

function resolveBattle(
  attacker,
  defender
) {
  const attackerTroops =
    Math.floor(attacker.troops);

  const defenderTroops =
    Math.floor(defender.troops);

  if (attackerTroops <= 0) {
    return {
      winner: "defender",
      attackerLosses: 0,
      defenderLosses: 0
    };
  }

  const attackerPower =
    attackerTroops *
    (1 + attacker.level * 0.10);

  const defenderPower =
    defenderTroops *
    (1 + defender.level * 0.08);

  if (
    attackerPower >
    defenderPower
  ) {
    const surviving =
      Math.max(
        1,
        Math.floor(
          attackerTroops * 0.65
        )
      );

    const defenderLosses =
      defenderTroops;

    attacker.troops =
      surviving;

    defender.troops = 0;

    return {
      winner: "attacker",
      survivingTroops: surviving,
      defenderLosses
    };
  }

  const attackerLosses =
    Math.max(
      1,
      Math.floor(
        attackerTroops * 0.8
      )
    );

  const defenderSurvivors =
    Math.max(
      1,
      defenderTroops -
        Math.floor(
          attackerTroops * 0.25
        )
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
    winner: "defender",
    attackerLosses,
    defenderSurvivors
  };
}

// ======================================================
// SOCKET.IO
// ======================================================

io.on(
  "connection",
  socket => {
    console.log(
      `🟢 Conexión: ${socket.id}`
    );

    // ==================================================
    // REGISTRAR / ENTRAR
    // ==================================================

    socket.on(
      "player:register",
      async data => {
        try {
          const username =
            String(
              data?.username ||
              `Lord_${Math.floor(
                Math.random() * 99999
              )}`
            )
              .trim()
              .slice(0, 30);

          if (!username) {
            socket.emit(
              "error",
              {
                message:
                  "Nombre inválido"
              }
            );

            return;
          }

          // --------------------------------------------
          // BUSCAR JUGADOR EXISTENTE
          // --------------------------------------------

          let savedPlayer =
            await loadPlayer(
              username
            );

          let player;

          if (savedPlayer) {
            player =
              new Player(
                socket.id,
                savedPlayer.username
              );

            player.gold =
              savedPlayer.gold ??
              INITIAL_GOLD;

            player.troops =
              savedPlayer.troops ??
              INITIAL_TROOPS;

            player.level =
              savedPlayer.level ??
              1;

            player.xp =
              savedPlayer.xp ?? 0;

            player.territories =
              savedPlayer.territories ||
              [];

            player.x =
              savedPlayer.x ?? 0;

            player.y =
              savedPlayer.y ?? 0;

            player.socketId =
              socket.id;

            console.log(
              `♻️ Jugador recuperado: ${username}`
            );
          } else {
            // ------------------------------------------
            // NUEVO JUGADOR
            // ------------------------------------------

            player =
              new Player(
                socket.id,
                username
              );

            const start =
              findFreeStartingTerritory();

            if (!start) {
              socket.emit(
                "error",
                {
                  message:
                    "No quedan ciudades libres."
                }
              );

              return;
            }

            player.x =
              start.x;

            player.y =
              start.y;

            start.ownerId =
              socket.id;

            start.troops =
              INITIAL_TROOPS;

            player.territories.push(
              start.id
            );

            await saveTerritory(
              start
            );

            console.log(
              `🏰 Nueva ciudad para ${username}`
            );
          }

          players.set(
            socket.id,
            player
          );

          updateProduction(
            player
          );

          await savePlayer(
            player
          );

          // ------------------------------------------
          // INFORMACIÓN INICIAL
          // ------------------------------------------

          socket.emit(
            "player:init",
            {
              player: {
                id: player.id,
                username:
                  player.username,

                x: player.x,
                y: player.y,

                gold: player.gold,
                troops:
                  player.troops,

                level:
                  player.level,

                xp:
                  player.xp,

                territories:
                  player.territories
              },

              mapSize:
                MAP_SIZE
            }
          );

          // ------------------------------------------
          // MAPA VISIBLE
          // ------------------------------------------

          sendVisibleMap(
            socket,
            player
          );
        } catch (error) {
          console.error(
            "❌ Error registrando:",
            error
          );

          socket.emit(
            "error",
            {
              message:
                "Error entrando al juego."
            }
          );
        }
      }
    );

    // ==================================================
    // ATAQUE
    // ==================================================

    socket.on(
      "territory:attack",
      async data => {
        const territoryId =
          Number(
            data?.territoryId
          );

        const player =
          players.get(
            socket.id
          );

        const territory =
          territories.get(
            territoryId
          );

        if (
          !player ||
          !territory
        ) {
          socket.emit(
            "error",
            {
              message:
                "Ciudad no encontrada."
            }
          );

          return;
        }

        updateProduction(
          player
        );

        // ------------------------------------------
        // NO ATACAR PROPIA CIUDAD
        // ------------------------------------------

        if (
          territory.ownerId ===
          player.id
        ) {
          socket.emit(
            "error",
            {
              message:
                "Esta ciudad ya es tuya."
            }
          );

          return;
        }

        // ------------------------------------------
        // COMPROBAR ADYACENCIA
        // ------------------------------------------

        const adjacent =
          player.territories.some(
            ownedId => {
              const owned =
                territories.get(
                  ownedId
                );

              if (!owned) {
                return false;
              }

              const distance =
                Math.abs(
                  owned.x -
                    territory.x
                ) +
                Math.abs(
                  owned.y -
                    territory.y
                );

              return distance === 1;
            }
          );

        if (!adjacent) {
          socket.emit(
            "error",
            {
              message:
                "Debes conquistar una ciudad junto a tu territorio."
            }
          );

          return;
        }

        // ------------------------------------------
        // BATALLA
        // ------------------------------------------

        const previousOwnerId =
          territory.ownerId;

        const previousOwner =
          previousOwnerId
            ? players.get(
                previousOwnerId
              )
            : null;

        const result =
          resolveBattle(
            player,
            territory
          );

        // ------------------------------------------
        // VICTORIA
        // ------------------------------------------

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

          if (
            !player.territories.includes(
              territory.id
            )
          ) {
            player.territories.push(
              territory.id
            );
          }

          if (previousOwner) {
            previousOwner.territories =
              previousOwner.territories.filter(
                id =>
                  id !==
                  territory.id
              );

            await savePlayer(
              previousOwner
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
          }

          // ----------------------------------------
          // XP
          // ----------------------------------------

          const oldLevel =
            player.level;

          const levelUps =
            addXP(
              player,
              XP_PER_CONQUEST
            );

          // ----------------------------------------
          // GUARDAR
          // ----------------------------------------

          await saveTerritory(
            territory
          );

          await savePlayer(
            player
          );

          socket.emit(
            "battle:result",
            {
              winner:
                "attacker",

              territoryId:
                territory.id,

              survivingTroops:
                player.troops,

              xp:
                player.xp,

              level:
                player.level,

              levelUps,

              previousLevel:
                oldLevel,

              gold:
                player.gold,

              territories:
                player.territories
            }
          );
        } else {
          // ----------------------------------------
          // DERROTA
          // ----------------------------------------

          await savePlayer(
            player
          );

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
                player.gold
            }
          );
        }

        io.emit(
          "territory:updated",
          territory
        );
      }
    );

    // ==================================================
    // SOLICITAR MAPA
    // ==================================================

    socket.on(
      "map:get",
      () => {
        const player =
          players.get(
            socket.id
          );

        if (!player) {
          return;
        }

        sendVisibleMap(
          socket,
          player
        );
      }
    );

    // ==================================================
    // ESTADO DEL JUGADOR
    // ==================================================

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

        updateProduction(
          player
        );

        const production =
          calculateProduction(
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
              production.goldPerSecond,

            troopsPerSecond:
              production.troopsPerSecond
          }
        );
      }
    );

    // ==================================================
    // DESCONEXIÓN
    // ==================================================

    socket.on(
      "disconnect",
      async () => {
        console.log(
          `🔴 Desconectado: ${socket.id}`
        );

        const player =
          players.get(
            socket.id
          );

        if (player) {
          updateProduction(
            player
          );

          await savePlayer(
            player
          );

          players.delete(
            socket.id
          );
        }
      }
    );
  }
);

// ======================================================
// MAPA VISIBLE
// ======================================================

function sendVisibleMap(
  socket,
  player
) {
  const viewRange = 15;

  const visible = [];

  for (
    let dx = -viewRange;
    dx <= viewRange;
    dx++
  ) {
    for (
      let dy = -viewRange;
      dy <= viewRange;
      dy++
    ) {
      const x =
        player.x + dx;

      const y =
        player.y + dy;

      if (
        x >= 0 &&
        x < MAP_SIZE &&
        y >= 0 &&
        y < MAP_SIZE
      ) {
        const id =
          y * MAP_SIZE + x;

        const territory =
          territories.get(id);

        if (territory) {
          visible.push(
            territory
          );
        }
      }
    }
  }

  socket.emit(
    "map:visible",
    visible
  );
}

// ======================================================
// PRODUCCIÓN GLOBAL
// ======================================================

setInterval(
  async () => {
    for (
      const player of
      players.values()
    ) {
      updateProduction(
        player
      );

      const production =
        calculateProduction(
          player
        );

      const socket =
        io.sockets.sockets.get(
          player.socketId
        );

      if (socket) {
        socket.emit(
          "resources:update",
          {
            gold:
              player.gold,

            troops:
              player.troops,

            level:
              player.level,

            xp:
              player.xp,

            goldPerSecond:
              production.goldPerSecond,

            troopsPerSecond:
              production.troopsPerSecond
          }
        );
      }

      await savePlayer(
        player
      );
    }
  },
  5000
);

// ======================================================
// ESTADO DEL SERVIDOR
// ======================================================

app.get(
  "/api/status",
  (req, res) => {
    res.json({
      status: "online",

      game:
        "Forja Imperial",

      playersOnline:
        players.size,

      totalTerritories:
        territories.size,

      mapSize:
        MAP_SIZE,

      uptime:
        process.uptime()
    });
  }
);

// ======================================================
// INICIAR SERVIDOR
// ======================================================

async function startServer() {
  await connectDB();

  await loadMap();

  const PORT =
    process.env.PORT || 3000;

  server.listen(
    PORT,
    () => {
      console.log(
        `🔥 FORJA IMPERIAL funcionando en puerto ${PORT}`
      );
    }
  );
}

startServer();
