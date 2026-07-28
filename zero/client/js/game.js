const socket = io(); // Conecta automáticamente al mismo host/puerto del servidor
let playerData = null;
let mapData = [];
let selectedTerritoryId = null;

// Función para alternar el menú en dispositivos móviles
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  sidebar.classList.toggle('active');
}

function login() {
  const username = document.getElementById('username-input').value.trim();
  if (!username) {
    showNotification('❌ Ingresa un nombre válido', 'error');
    return;
  }
  
  // Salto temporal de pantalla de login para permitir visualizar el mapa y testear el diseño
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  
  // Datos simulados para probar la interfaz visual de inmediato
  playerData = {
    id: "temp_user_1",
    username: username,
    troops: 500,
    gold: 1000,
    territories: ["1", "2"],
    level: 1,
    incomePerSecond: 5
  };
  
  updatePlayerUI();
  
  // Generación temporal de prueba de 100 celdas para ver el mapa estilizado
  mapData = [];
  for (let i = 0; i < 100; i++) {
    mapData.push({
      id: String(i),
      x: i % 10,
      y: Math.floor(i / 10),
      ownerId: i === 0 ? "temp_user_1" : (i % 3 === 0 ? "enemy_user" : null),
      troops: Math.floor(Math.random() * 300) + 50
    });
  }
  renderMap();
  
  showNotification(`🎉 ¡Bienvenido al mundo de ZERO, Lord ${username}!`);
  
  // Intento de conexión real con el servidor en segundo plano
  socket.emit('player:register', { username });
}

socket.on('player:init', (data) => {
  playerData = data.player;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  updatePlayerUI();
  showNotification(`🎉 ¡Bienvenido al mundo de ZERO, Lord ${playerData.username}!`);
});

socket.on('map:visible', (territories) => {
  mapData = territories;
  renderMap();
});

socket.on('resources:update', (data) => {
  if (playerData) {
    playerData.gold = data.gold;
    document.getElementById('player-gold').textContent = Math.floor(data.gold);
    document.getElementById('player-income').textContent = data.incomePerSecond.toFixed(1);
  }
});

socket.on('player:update', (data) => {
  Object.assign(playerData, data);
  updatePlayerUI();
});

socket.on('battle:result', (data) => {
  const isWin = data.result === 'attacker';
  const msg = isWin ? `🎉 ¡Victoria! Territorio conquistado.` : `💀 Derrota. Tropas aniquiladas en el intento.`;
  showNotification(msg, isWin ? 'success' : 'error');
  
  if (data.playerState) {
    Object.assign(playerData, data.playerState);
    updatePlayerUI();
  }
  renderMap();
});

socket.on('territory:updated', (territory) => {
  const idx = mapData.findIndex(t => t.id === territory.id);
  if (idx !== -1) mapData[idx] = territory;
  renderMap();
  if (selectedTerritoryId === territory.id) {
    showTerritoryDetails(territory);
  }
});

socket.on('error', (data) => {
  showNotification('⚠️ ' + data.message, 'error');
});

socket.on('building:completed', (data) => {
  showNotification(`🏗️ ¡Edificio mejorado con éxito!`);
  Object.assign(playerData, data.playerState);
  updatePlayerUI();
});

socket.on('leaderboard:data', (data) => {
  let html = '🏆 TOP 20 LORDS 🏆\n\n';
  data.forEach((p, i) => {
    html += `${i+1}. ${p.username} — 🏰 ${p.territories} | ⚔️ ${p.troops}\n`;
  });
  alert(html);
});

function updatePlayerUI() {
  document.getElementById('player-name').textContent = playerData.username;
  document.getElementById('player-troops').textContent = playerData.troops;
  document.getElementById('player-gold').textContent = Math.floor(playerData.gold);
  document.getElementById('player-territories').textContent = playerData.territories.length;
  document.getElementById('player-level').textContent = playerData.level;
}

// Renderizado de mapa mejorado con diseño táctico de nodos
function renderMap() {
  const map = document.getElementById('map');
  const size = 50; // Tamaño de la cuadrícula
  map.style.gridTemplateColumns = `repeat(${size}, 38px)`;
  map.style.gridTemplateRows = `repeat(${size}, 38px)`;
  
  map.innerHTML = '';
  mapData.forEach(territory => {
    const div = document.createElement('div');
    div.className = 'territory'; // Clase base unificada con el nuevo CSS
    
    // Evaluar propietario para asignar diseño visual y elementos gráficos
    if (territory.ownerId === playerData?.id) {
      div.classList.add('owned');
      div.innerHTML = `<span class="node-icon">🏰</span><span class="node-troops">${territory.troops}</span>`;
    } else if (territory.ownerId) {
      div.classList.add('enemy');
      div.innerHTML = `<span class="node-icon">🗼</span><span class="node-troops">${territory.troops}</span>`;
    } else {
      div.classList.add('neutral');
      div.innerHTML = `<span class="node-icon">🏛️</span><span class="node-troops">${territory.troops}</span>`;
    }
    
    // Marcar territorio seleccionado si coincide
    if (selectedTerritoryId === territory.id) {
      div.classList.add('selected-node');
    }
    
    div.title = `ID: ${territory.id} | Tropas: ${territory.troops} | Coordenadas: (${territory.x}, ${territory.y})`;
    div.onclick = () => selectTerritory(territory);
    map.appendChild(div);
  });
}

function selectTerritory(territory) {
  selectedTerritoryId = territory.id;
  showTerritoryDetails(territory);
  document.getElementById('selected-territory').style.display = 'block';
  renderMap(); // Refresca para aplicar el borde de selección
}

function showTerritoryDetails(t) {
  document.getElementById('sel-id').textContent = t.id;
  document.getElementById('sel-pos').textContent = `(${t.x}, ${t.y})`;
  document.getElementById('sel-owner').textContent = t.ownerId === playerData?.id ? 'Tuyo' : (t.ownerId ? 'Enemigo' : 'Neutral');
  document.getElementById('sel-troops').textContent = t.troops;
  
  const btnAttack = document.getElementById('btn-attack');
  btnAttack.disabled = t.ownerId === playerData?.id;
}

function attackSelected() {
  if (selectedTerritoryId !== null) {
    socket.emit('territory:attack', { territoryId: selectedTerritoryId });
  }
}

function recruitTroops() {
  socket.emit('troops:recruit', { amount: 10 });
}

function buildBarracks() {
  if (selectedTerritoryId !== null) socket.emit('building:build', { territoryId: selectedTerritoryId, buildingType: 'barracks' });
}

function buildMine() {
  if (selectedTerritoryId !== null) socket.emit('building:build', { territoryId: selectedTerritoryId, buildingType: 'mine' });
}

function buildWall() {
  if (selectedTerritoryId !== null) socket.emit('building:build', { territoryId: selectedTerritoryId, buildingType: 'wall' });
}

function showLeaderboard() {
  socket.emit('leaderboard:get');
}

function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = message;
  
  document.getElementById('notifications').appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}
