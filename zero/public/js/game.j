const socket = io();

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

let player = null;
let mapSize = 100;
let territories = [];

let camera = {
  x: 0,
  y: 0,
  zoom: 1
};

let dragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

const TILE_SIZE = 70;

// ============================================
// AJUSTAR CANVAS
// ============================================

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 120;

  drawMap();
}

window.addEventListener("resize", resizeCanvas);

// ============================================
// CONEXIÓN
// ============================================

socket.on("connect", () => {
  console.log("🟢 Conectado al servidor");

  const username =
    localStorage.getItem("zero_username") ||
    "Lord_" + Math.floor(Math.random() * 99999);

  localStorage.setItem(
    "zero_username",
    username
  );

  socket.emit("player:register", {
    username
  });
});

// ============================================
// JUGADOR INICIALIZADO
// ============================================

socket.on("player:init", data => {
  player = data.player;
  mapSize = data.mapSize;

  document.getElementById("gold").textContent =
    Math.floor(player.gold);

  document.getElementById("troops").textContent =
    Math.floor(player.troops);

  document.getElementById("cityLevel").textContent =
    player.level;

  centerCamera();

  console.log("🏰 Jugador:", player);
});

// ============================================
// MAPA
// ============================================

socket.on("map:visible", data => {
  territories = data;

  drawMap();
});

socket.on("territory:updated", territory => {
  const index = territories.findIndex(
    t => t.id === territory.id
  );

  if (index !== -1) {
    territories[index] = territory;
  } else {
    territories.push(territory);
  }

  drawMap();
});

// ============================================
// RECURSOS
// ============================================

socket.on("resources:update", data => {
  if (!player) return;

  player.gold = data.gold;
  player.troops = data.troops;

  player.level = data.level;
  player.xp = data.xp;

  document.getElementById("gold").textContent =
    Math.floor(player.gold);

  document.getElementById("troops").textContent =
    Math.floor(player.troops);

  document.getElementById("cityLevel").textContent =
    player.level;
});

// ============================================
// BATALLA
// ============================================

socket.on("battle:result", result => {
  console.log("⚔️ Resultado:", result);

  if (result.winner === "attacker") {
    alert(
      "¡Ciudad conquistada!\n\n" +
      "Tropas restantes: " +
      Math.floor(result.survivingTroops || result.troops || 0)
    );
  } else {
    alert("Has perdido la batalla.");
  }

  socket.emit("player:state");
});

// ============================================
// CIUDAD PERDIDA
// ============================================

socket.on("territory:lost", data => {
  console.log(
    "❌ Has perdido la ciudad:",
    data.territoryId
  );
});

// ============================================
// ERRORES
// ============================================

socket.on("error", data => {
  console.error("❌", data.message);

  alert(data.message);
});

// ============================================
// CENTRAR CÁMARA
// ============================================

function centerCamera() {
  if (!player) return;

  camera.x =
    player.x * TILE_SIZE -
    canvas.width / 2 +
    TILE_SIZE / 2;

  camera.y =
    player.y * TILE_SIZE -
    canvas.height / 2 +
    TILE_SIZE / 2;

  drawMap();
}

// ============================================
// DIBUJAR MAPA
// ============================================

function drawMap() {
  if (!canvas) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );

  ctx.scale(
    camera.zoom,
    camera.zoom
  );

  drawTerrain();

  territories.forEach(
    drawTerritory
  );

  ctx.restore();
}

// ============================================
// TERRENO
// ============================================

function drawTerrain() {
  const startX =
    Math.floor(camera.x / TILE_SIZE) - 2;

  const startY =
    Math.floor(camera.y / TILE_SIZE) - 2;

  const endX =
    startX +
    Math.ceil(
      canvas.width /
        TILE_SIZE /
        camera.zoom
    ) +
    4;

  const endY =
    startY +
    Math.ceil(
      canvas.height /
        TILE_SIZE /
        camera.zoom
    ) +
    4;

  for (
    let y = startY;
    y <= endY;
    y++
  ) {
    for (
      let x = startX;
      x <= endX;
      x++
    ) {
      if (
        x < 0 ||
        y < 0 ||
        x >= mapSize ||
        y >= mapSize
      ) {
        continue;
      }

      const px =
        x * TILE_SIZE;

      const py =
        y * TILE_SIZE;

      const gradient =
        ctx.createLinearGradient(
          px,
          py,
          px,
          py + TILE_SIZE
        );

      gradient.addColorStop(
        0,
        "#315c3b"
      );

      gradient.addColorStop(
        1,
        "#172c20"
      );

      ctx.fillStyle =
        gradient;

      ctx.fillRect(
        px,
        py,
        TILE_SIZE,
        TILE_SIZE
      );

      ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

      ctx.strokeRect(
        px,
        py,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

// ============================================
// CIUDAD
// ============================================

function drawTerritory(
  territory
) {
  const x =
    territory.x *
    TILE_SIZE +
    TILE_SIZE / 2;

  const y =
    territory.y *
    TILE_SIZE +
    TILE_SIZE / 2;

  const ownedByPlayer =
    player &&
    territory.ownerId ===
      player.id;

  const radius = 23;

  // Sombra

  ctx.beginPath();

  ctx.arc(
    x + 4,
    y + 6,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(0,0,0,0.45)";

  ctx.fill();

  // Ciudad

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  if (ownedByPlayer) {
    ctx.fillStyle =
      "#1976ff";
  } else if (
    territory.ownerId
  ) {
    ctx.fillStyle =
      "#d43d3d";
  } else {
    ctx.fillStyle =
      "#777f86";
  }

  ctx.fill();

  // Borde

  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth = 3;

  ctx.stroke();

  // Fortaleza

  ctx.fillStyle =
    "#d9dee3";

  ctx.fillRect(
    x - 8,
    y - 10,
    16,
    18
  );

  ctx.fillRect(
    x - 12,
    y - 15,
    7,
    8
  );

  ctx.fillRect(
    x + 5,
    y - 15,
    7,
    8
  );

  // Nivel

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "bold 11px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    territory.level,
    x,
    y + 32
  );
}

// ============================================
// CLICK EN CIUDAD
// ============================================

canvas.addEventListener(
  "click",
  event => {
    const world =
      screenToWorld(
        event.clientX,
        event.clientY
      );

    const territory =
      findTerritoryAt(
        world.x,
        world.y
      );

    if (!territory) {
      return;
    }

    console.log(
      "🏰 Ciudad seleccionada:",
      territory
    );

    if (
      player &&
      territory.ownerId !==
        player.id
    ) {
      const confirmAttack =
        confirm(
          "¿Quieres atacar " +
          territory.cityName +
          "?"
        );

      if (confirmAttack) {
        socket.emit(
          "territory:attack",
          {
            territoryId:
              territory.id
          }
        );
      }
    }
  }
);

// ============================================
// CONVERTIR PANTALLA → MAPA
// ============================================

function screenToWorld(
  screenX,
  screenY
) {
  return {
    x:
      (screenX +
        camera.x) /
      camera.zoom,

    y:
      (screenY +
        camera.y) /
      camera.zoom
  };
}

// ============================================
// BUSCAR CIUDAD
// ============================================

function findTerritoryAt(
  x,
  y
) {
  return territories.find(
    territory => {
      const centerX =
        territory.x *
          TILE_SIZE +
        TILE_SIZE / 2;

      const centerY =
        territory.y *
          TILE_SIZE +
        TILE_SIZE / 2;

      const distance =
        Math.sqrt(
          Math.pow(
            x - centerX,
            2
          ) +
          Math.pow(
            y - centerY,
            2
          )
        );

      return distance < 30;
    }
  );
}

// ============================================
// ARRASTRAR MAPA
// ============================================

canvas.addEventListener(
  "pointerdown",
  event => {
    dragging = true;

    lastMouseX =
      event.clientX;

    lastMouseY =
      event.clientY;

    canvas.setPointerCapture(
      event.pointerId
    );
  }
);

canvas.addEventListener(
  "pointermove",
  event => {
    if (!dragging) return;

    const dx =
      event.clientX -
      lastMouseX;

    const dy =
      event.clientY -
      lastMouseY;

    camera.x -=
      dx / camera.zoom;

    camera.y -=
      dy / camera.zoom;

    lastMouseX =
      event.clientX;

    lastMouseY =
      event.clientY;

    drawMap();
  }
);

canvas.addEventListener(
  "pointerup",
  event => {
    dragging = false;

    canvas.releasePointerCapture(
      event.pointerId
    );
  }
);

// ============================================
// ZOOM
// ============================================

canvas.addEventListener(
  "wheel",
  event => {
    event.preventDefault();

    if (event.deltaY < 0) {
      camera.zoom += 0.1;
    } else {
      camera.zoom -= 0.1;
    }

    camera.zoom =
      Math.max(
        0.5,
        Math.min(
          2.5,
          camera.zoom
        )
      );

    drawMap();
  },
  { passive: false }
);

// ============================================
// ACTUALIZAR ESTADO
// ============================================

setInterval(() => {
  if (
    socket.connected
  ) {
    socket.emit(
      "player:state"
    );
  }
}, 1000);

// ============================================
// INICIO
// ============================================

resizeCanvas();
