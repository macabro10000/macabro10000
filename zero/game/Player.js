
const config = require("../config/gameConfig");

class Player {

  constructor(id, username) {

    this.id = id;
    this.username = username;

    // Recursos
    this.gold =
      config.INITIAL_GOLD;

    this.troops =
      config.INITIAL_TROOPS;

    // Experiencia
    this.level = 1;
    this.xp = 0;

    // Territorios
    this.territories = [];

    // Posición
    this.x = 0;
    this.y = 0;

    // Socket
    this.socketId = id;

    // Producción
    this.lastProduction =
      Date.now();
  }


  // ============================================
  // CREAR JUGADOR DESDE MONGODB
  // ============================================

  static fromDatabase(
    socketId,
    data
  ) {

    const player =
      new Player(
        socketId,
        data.username
      );

    player.gold =
      Number(
        data.gold ??
        config.INITIAL_GOLD
      );

    player.troops =
      Number(
        data.troops ??
        config.INITIAL_TROOPS
      );

    player.level =
      Number(
        data.level ?? 1
      );

    player.xp =
      Number(
        data.xp ?? 0
      );

    player.territories =
      Array.isArray(
        data.territories
      )
        ? data.territories
        : [];

    player.x =
      Number(
        data.x ?? 0
      );

    player.y =
      Number(
        data.y ?? 0
      );

    player.socketId =
      socketId;

    player.lastProduction =
      Date.now();

    return player;
  }


  // ============================================
  // CONVERTIR A OBJETO PARA EL CLIENTE
  // ============================================

  toJSON() {

    return {

      id:
        this.id,

      username:
        this.username,

      gold:
        this.gold,

      troops:
        this.troops,

      level:
        this.level,

      xp:
        this.xp,

      territories:
        this.territories,

      x:
        this.x,

      y:
        this.y
    };
  }


  // ============================================
  // AGREGAR TERRITORIO
  // ============================================

  addTerritory(
    territoryId
  ) {

    if (
      !this.territories.includes(
        territoryId
      )
    ) {

      this.territories.push(
        territoryId
      );
    }
  }


  // ============================================
  // QUITAR TERRITORIO
  // ============================================

  removeTerritory(
    territoryId
  ) {

    this.territories =
      this.territories.filter(
        id =>
          id !== territoryId
      );
  }


  // ============================================
  // AGREGAR ORO
  // ============================================

  addGold(amount) {

    const value =
      Number(amount);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {

      this.gold += value;
    }
  }


  // ============================================
  // AGREGAR TROPAS
  // ============================================

  addTroops(amount) {

    const value =
      Number(amount);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {

      this.troops += value;
    }
  }


  // ============================================
  // GASTAR ORO
  // ============================================

  spendGold(amount) {

    const value =
      Number(amount);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {

      return false;
    }

    if (
      this.gold < value
    ) {

      return false;
    }

    this.gold -= value;

    return true;
  }


  // ============================================
  // GASTAR TROPAS
  // ============================================

  spendTroops(amount) {

    const value =
      Number(amount);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {

      return false;
    }

    if (
      this.troops < value
    ) {

      return false;
    }

    this.troops -= value;

    return true;
  }

}


module.exports = Player;
