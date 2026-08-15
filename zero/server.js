const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const config = require("./config/gameConfig");
const database = require("./database/mongodb");
const game = require("./game/map");
const setupSockets = require("./sockets");

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

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

const players = new Map();
const territories = new Map();

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    game: "ZERO",
    playersOnline: players.size,
    territories: territories.size,
    mapSize: config.MAP_SIZE
  });
});

async function start() {
  await database.connectDB();

  await game.initialize(
    territories
  );

  setupSockets(
    io,
    players,
    territories
  );

  server.listen(
    config.PORT,
    () => {
      console.log(
        `🔥 ZERO ONLINE - Puerto ${config.PORT}`
      );
    }
  );
}

start();
