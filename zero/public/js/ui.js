// ======================================================
// ZERO - UI.JS
// Interfaz del jugador
// ======================================================

let elements = {};


// ======================================================
// INICIALIZAR
// ======================================================

export function initUI() {

  elements = {

    gold:
      document.getElementById("gold"),

    troops:
      document.getElementById("troops"),

    cityLevel:
      document.getElementById("cityLevel")

  };


  console.log(
    "🖥️ Interfaz ZERO inicializada."
  );

}


// ======================================================
// ACTUALIZAR RECURSOS
// ======================================================

export function updateResources(
  player
) {

  if (!player) {
    return;
  }


  if (elements.gold) {

    elements.gold.textContent =
      formatNumber(
        player.gold
      );

  }


  if (elements.troops) {

    elements.troops.textContent =
      formatNumber(
        player.troops
      );

  }


  if (elements.cityLevel) {

    elements.cityLevel.textContent =
      player.level || 1;

  }

}


// ======================================================
// ACTUALIZAR DESDE EVENTO
// ======================================================

export function updateResourceData(
  data
) {

  if (!data) {
    return;
  }


  if (
    elements.gold &&
    data.gold !== undefined
  ) {

    elements.gold.textContent =
      formatNumber(
        data.gold
      );

  }


  if (
    elements.troops &&
    data.troops !== undefined
  ) {

    elements.troops.textContent =
      formatNumber(
        data.troops
      );

  }


  if (
    elements.cityLevel &&
    data.level !== undefined
  ) {

    elements.cityLevel.textContent =
      data.level;

  }

}


// ======================================================
// FORMATEAR NÚMEROS
// ======================================================

function formatNumber(
  value
) {

  const number =
    Number(value) || 0;


  return Math.floor(
    number
  ).toLocaleString(
    "es-CO"
  );

}


// ======================================================
// MENSAJE
// ======================================================

export function showMessage(
  message,
  type = "info"
) {

  const existing =
    document.getElementById(
      "zero-message"
    );


  if (existing) {
    existing.remove();
  }


  const element =
    document.createElement(
      "div"
    );


  element.id =
    "zero-message";


  element.className =
    `zero-message ${type}`;


  element.textContent =
    message;


  document.body.appendChild(
    element
  );


  requestAnimationFrame(() => {

    element.classList.add(
      "visible"
    );

  });


  setTimeout(() => {

    element.classList.remove(
      "visible"
    );


    setTimeout(() => {

      element.remove();

    }, 300);

  }, 3000);

}


// ======================================================
// MENSAJE DE BATALLA
// ======================================================

export function showBattleResult(
  result
) {

  if (!result) {
    return;
  }


  if (
    result.winner ===
    "attacker"
  ) {

    const troops =
      Math.floor(
        Number(
          result.survivingTroops ||
          result.troops ||
          0
        )
      );


    showMessage(
      `⚔️ ¡Ciudad conquistada! Tropas restantes: ${troops}`,
      "success"
    );


    return;

  }


  showMessage(
    "🛡️ Has perdido la batalla.",
    "danger"
  );

}


// ======================================================
// ERROR
// ======================================================

export function showError(
  message
) {

  showMessage(
    message ||
      "Ha ocurrido un error.",
    "danger"
  );

}


// ======================================================
// CIUDAD SELECCIONADA
// ======================================================

export function showCityInfo(
  territory
) {

  if (!territory) {
    return;
  }


  const name =
    territory.cityName ||
    `Ciudad ${territory.id}`;


  console.log(
    "🏰 Ciudad seleccionada:",
    name
  );

}


// ======================================================
// LIMPIAR
// ======================================================

export function clearUI() {

  if (
    elements.gold
  ) {

    elements.gold.textContent =
      "0";

  }


  if (
    elements.troops
  ) {

    elements.troops.textContent =
      "0";

  }


  if (
    elements.cityLevel
  ) {

    elements.cityLevel.textContent =
      "1";

  }

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initUI,

  updateResources,

  updateResourceData,

  showMessage,

  showBattleResult,

  showError,

  showCityInfo,

  clearUI

};
