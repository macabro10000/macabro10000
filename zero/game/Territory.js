class Territory {

  constructor(id, x, y) {

    this.id = id;

    this.x = x;
    this.y = y;

    // Propietario
    this.ownerId = null;

    // Nivel de la ciudad
    this.level = 1;

    // Tropas que defienden la ciudad
    this.troops = 20;

    // Nombre
    this.cityName =
      `Ciudad ${id}`;

    // Estado de la ciudad
    this.active = true;
  }


  // ============================================
  // ASIGNAR PROPIETARIO
  // ============================================

  setOwner(ownerId) {

    this.ownerId =
      ownerId;
  }


  // ============================================
  // QUITAR PROPIETARIO
  // ============================================

  removeOwner() {

    this.ownerId = null;
  }


  // ============================================
  // SUBIR NIVEL
  // ============================================

  levelUp() {

    this.level++;
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
  // QUITAR TROPAS
  // ============================================

  removeTroops(amount) {

    const value =
      Number(amount);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {

      return;
    }

    this.troops =
      Math.max(
        0,
        this.troops - value
      );
  }


  // ============================================
  // CONVERTIR PARA EL CLIENTE
  // ============================================

  toJSON() {

    return {

      id:
        this.id,

      x:
        this.x,

      y:
        this.y,

      ownerId:
        this.ownerId,

      level:
        this.level,

      troops:
        this.troops,

      cityName:
        this.cityName,

      active:
        this.active
    };
  }

}


module.exports = Territory;
