function renderMap() {
  const map = document.getElementById('map');
  const size = 50; // Tamaño del mapa configurado en servidor
  map.style.gridTemplateColumns = `repeat(${size}, 36px)`;
  map.style.gridTemplateRows = `repeat(${size}, 36px)`;
  
  map.innerHTML = '';
  mapData.forEach(territory => {
    const div = document.createElement('div');
    div.className = 'territory-node'; // Nueva clase con diseño de castillo
    
    // Evaluar propietario para cambiar el aspecto visual
    if (territory.ownerId === playerData?.id) {
      div.classList.add('node-owned');
      div.innerHTML = `<span class="node-icon">🏰</span><span class="node-troops">${territory.troops}</span>`;
    } else if (territory.ownerId) {
      div.classList.add('node-enemy');
      div.innerHTML = `<span class="node-icon">🗼</span><span class="node-troops">${territory.troops}</span>`;
    } else {
      div.classList.add('node-neutral');
      div.innerHTML = `<span class="node-icon">🏛️</span><span class="node-troops">${territory.troops}</span>`;
    }
    
    // Si este territorio está seleccionado actualmente, le ponemos borde brillante
    if (selectedTerritoryId === territory.id) {
      div.classList.add('selected');
    }
    
    div.title = `ID: ${territory.id} | Tropas: ${territory.troops} | Coordenadas: (${territory.x}, ${territory.y})`;
    div.onclick = () => selectTerritory(territory);
    map.appendChild(div);
  });
}
