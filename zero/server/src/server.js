const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('redis');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// ============================================
// CONFIGURACIÓN DE MONGODB Y REDIS
// ============================================

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zero_db';
let db, playersCollection, territoriesCollection;

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db('zero_db');
    playersCollection = db.collection('players');
    territoriesCollection = db.collection('territories');
    console.log('✅ Conectado a MongoDB exitosamente');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err);
  }
}

connectDB();

// Configuración de Redis con manejo de errores robusto (No rompe si falla)
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.on('error', (err) => console.error('⚠️ Aviso de Redis:', err.message));

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Conectado al caché de Redis exitosamente');
  } catch (e) {
    console.log('⚠️ Funcionando sin Redis (memoria local activa)');
  }
})();

// Middlewares
app.use(cors());
app.use(express.json());

// ============================================
// MODELOS DE DATOS
// ============================================

class Player {
  constructor(id, username, x, y) {
    this.id = id;
    this.username = username;
    this.x = x;
    this.y = y;
    this.troops = 100;
    this.gold = 500;
    this.territories = [];
    this.level = 1;
  }
}

class Territory {
  constructor(id, x, y, ownerId = null) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.ownerId = ownerId;
    this.troops = Math.floor(Math.random() * 40) + 10;
    this.level = 1;
    this.buildings = {
      barracks: 0,
      mine: 0,
      wall: 0
    };
  }
}

// ============================================
// ESTADO DEL JUEGO EN MEMORIA
// ============================================

const players = new Map();
const territories = new Map();
const MAP_SIZE = 50; 

function generateMap() {
  let id = 0;
  for (let x = 0; x < MAP_SIZE; x++) {
    for (let y = 0; y < MAP_SIZE; y++) {
      territories.set(id, new Territory(id, x, y));
      id++;
    }
  }
  console.log(`✅ Mapa generado: ${MAP_SIZE}x${MAP_SIZE} = ${territories.size} territorios`);
}

generateMap();

// ============================================
// SISTEMA DE BATALLAS
// ============================================

function resolveBattle(attacker, defenderTerritory) {
  const attackerTroops = attacker.troops;
  const defenderTroops = defenderTerritory.troops;
  
  const attackerPower = attackerTroops * (1 + attacker.level * 0.1);
  const wallBonus = (defenderTerritory.buildings.wall || 0) * 0.15;
  const defenderPower = defenderTroops * (1 + (defenderTerritory.level * 0.05) + wallBonus);
  
  if (attackerPower > defenderPower) {
    const survivingTroops = Math.max(1, Math.floor(attackerTroops * 0.75));
    attacker.troops = survivingTroops;
    defenderTerritory.ownerId = attacker.id;
    defenderTerritory.troops = survivingTroops;
    
    if (!attacker.territories.includes(defenderTerritory.id)) {
      attacker.territories.push(defenderTerritory.id);
    }
    
    return { winner: 'attacker', survivingTroops };
  } else {
    const defenderLosses = Math.floor(defenderTroops * 0.25);
    defenderTerritory.troops = Math.max(5, defenderTerritory.troops - defenderLosses);
    attacker.troops = 0;
    
    return { winner: 'defender', defenderLosses };
  }
}

// ============================================
// SISTEMA DE ECONOMÍA
// ============================================

function calculateIncome(player) {
  let goldPerSecond = 0;
  player.territories.forEach(territoryId => {
    const t = territories.get(territoryId);
    if (t) {
      goldPerSecond += 2 + ((t.buildings.mine || 0) * 4);
    }
  });
  return goldPerSecond;
}

setInterval(() => {
  players.forEach(player => {
    const income = calculateIncome(player);
    player.gold += income * 5;
    
    if (player.socketId) {
      const socket = io.sockets.sockets.get(player.socketId);
      if (socket) {
        socket.emit('resources:update', {
          gold: player.gold,
          incomePerSecond: income
        });
      }
    }
  });
}, 5000);

// ============================================
// WEBSOCKET HANDLERS (Socket.IO)
// ============================================

io.on('connection', (socket) => {
  console.log(`🔌 Jugador conectado: ${socket.id}`);
  
  socket.on('player:register', async (data) => {
    const username = data?.username || `Lord_${Math.floor(Math.random() * 1000)}`;
    const startX = Math.floor(Math.random() * MAP_SIZE);
    const startY = Math.floor(Math.random() * MAP_SIZE);
    
    const player = new Player(socket.id, username, startX, startY);
    player.socketId = socket.id;
    
    const startTerritoryId = startY * MAP_SIZE + startX;
    const startTerritory = territories.get(startTerritoryId);
    if (startTerritory) {
      startTerritory.ownerId = socket.id;
      startTerritory.troops = 100;
      if (!player.territories.includes(startTerritoryId)) {
        player.territories.push(startTerritoryId);
      }
    }
    
    players.set(socket.id, player);

    if (playersCollection) {
      try {
        await playersCollection.updateOne(
          { username },
          { $set: { lastLogin: new Date(), gold: player.gold, troops: player.troops } },
          { upsert: true }
        );
      } catch (dbErr) {
        console.error('⚠️ Error guardando jugador en MongoDB:', dbErr);
      }
    }
    
    socket.emit('player:init', {
      player: {
        id: player.id,
        username: player.username,
        x: player.x,
        y: player.y,
        troops: player.troops,
        gold: player.gold,
        territories: player.territories,
        level: player.level
      },
      mapSize: MAP_SIZE
    });
    
    const visibleTerritories = [];
    const viewRange = 12;
    for (let dx = -viewRange; dx <= viewRange; dx++) {
      for (let dy = -viewRange; dy <= viewRange; dy++) {
        const tx = startX + dx;
        const ty = startY + dy;
        if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
          const tid = ty * MAP_SIZE + tx;
          visibleTerritories.push(territories.get(tid));
        }
      }
    }
    
    socket.emit('map:visible', visibleTerritories);
  });

  socket.on('territory:attack', (data) => {
    const { territoryId } = data;
    const player = players.get(socket.id);
    const territory = territories.get(territoryId);
    
    if (!player || !territory) {
      socket.emit('error', { message: 'Jugador o territorio no encontrado' });
      return;
    }
    
    const isAdjacent = player.territories.some(ownedId => {
      const owned = territories.get(ownedId);
      if (!owned) return false;
      const dist = Math.abs(owned.x - territory.x) + Math.abs(owned.y - territory.y);
      return dist === 1;
    });
    
    if (!isAdjacent) {
      socket.emit('error', { message: 'El territorio no es adyacente a tus posesiones' });
      return;
    }
    
    if (player.troops <= 0) {
      socket.emit('error', { message: 'No tienes tropas suficientes' });
      return;
    }
    
    const result = resolveBattle(player, territory);
    
    socket.emit('battle:result', {
      territoryId,
      result: result.winner,
      details: result,
      playerState: {
        troops: player.troops,
        territories: player.territories,
        gold: player.gold
      }
    });
    
    if (territory.ownerId && territory.ownerId !== socket.id) {
      const previousOwner = players.get(territory.ownerId);
      if (previousOwner && previousOwner.socketId) {
        const prevSocket = io.sockets.sockets.get(previousOwner.socketId);
        if (prevSocket) {
          prevSocket.emit('territory:lost', {
            territoryId,
            newOwner: player.username
          });
        }
      }
    }
    
    io.emit('territory:updated', territory);
  });

  socket.on('troops:recruit', (data) => {
    const amount = parseInt(data?.amount) || 10;
    const player = players.get(socket.id);
    if (!player) return;
    
    const cost = amount * 10;
    if (player.gold >= cost) {
      player.gold -= cost;
      player.troops += amount;
      
      socket.emit('player:update', {
        troops: player.troops,
        gold: player.gold
      });
    } else {
      socket.emit('error', { message: 'Oro insuficiente' });
    }
  });

  socket.on('building:build', (data) => {
    const { territoryId, buildingType } = data;
    const player = players.get(socket.id);
    const territory = territories.get(territoryId);
    
    if (!player || !territory || territory.ownerId !== socket.id) {
      socket.emit('error', { message: 'No puedes construir aquí' });
      return;
    }
    
    const costs = {
      barracks: { gold: 200 },
      mine: { gold: 150 },
      wall: { gold: 300 }
    };
    
    const cost = costs[buildingType];
    if (!cost) {
      socket.emit('error', { message: 'Tipo de edificio inválido' });
      return;
    }
    
    if (player.gold >= cost.gold) {
      player.gold -= cost.gold;
      territory.buildings[buildingType] = (territory.buildings[buildingType] || 0) + 1;
      
      socket.emit('building:completed', {
        territoryId,
        buildingType,
        level: territory.buildings[buildingType],
        playerState: { gold: player.gold }
      });
      
      io.emit('territory:updated', territory);
    } else {
      socket.emit('error', { message: 'Oro insuficiente' });
    }
  });

  socket.on('leaderboard:get', () => {
    const leaderboard = Array.from(players.values())
      .map(p => ({
        username: p.username,
        territories: p.territories.length,
        troops: p.troops,
        level: p.level
      }))
      .sort((a, b) => b.territories - a.territories)
      .slice(0, 20);
    
    socket.emit('leaderboard:data', leaderboard);
  });
  
  socket.on('disconnect', () => {
    console.log(`❌ Jugador desconectado: ${socket.id}`);
    players.delete(socket.id);
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    game: 'ZERO',
    playersOnline: players.size,
    totalTerritories: territories.size,
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ZERO iniciado en puerto ${PORT}`);
});
