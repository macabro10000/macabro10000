const socket = io(); // Conecta automáticamente al mismo host/puerto del servidor
let playerData = null;
let mapData = [];
let selectedTerritoryId = null;

// Función para alternar el menú en dispositivos móviles (Integrada con clase collapsed y active)
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

function renderMap() {
  const map = document.getElementById('map');
  const size = 50; // Tamaño del mapa configurado en servidor
  map.style.gridTemplateColumns = `repeat(${size}, 32px)`;
  
  map.innerHTML = '';
  mapData.forEach(territory => {
    const div = document.createElement('div');
    div.className = 'territory';
    
    if (territory.ownerId === playerData?.id) {
      div.classList.add('owned');
      div.textContent = '★';
    } else if (territory.ownerId) {
      div.classList.add('enemy');
    } else {
      div.classList.add('neutral');
    }
    
    div.title = `ID: ${territory.id} | Tropas: ${territory.troops}`;
    div.onclick = () => selectTerritory(territory);
    map.appendChild(div);
  });
}

function selectTerritory(territory) {
  selectedTerritoryId = territory.id;
  showTerritoryDetails(territory);
  document.getElementById('selected-territory').style.display = 'block';
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
  if (type === 'error') notif.style.background = '#c3073f';
  if (type === 'success') notif.style.background = '#66fcf1';
  if (type === 'success') notif.style.color = '#0b0c10';
  
  document.getElementById('notifications').appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}
