const database = require("./mongodb");

// ======================================================
// COLECCIÓN DE TERRITORIOS
// ======================================================

function getTerritoriesCollection() {
  return database.getCollection("territories");
}


// ======================================================
// BUSCAR TERRITORIO POR ID
// ======================================================

async function findTerritory(id) {
  const collection = getTerritoriesCollection();

  if (!collection) {
    return null;
  }

  try {
    return await collection.findOne({
      id: Number(id)
    });
  } catch (error) {
    console.error(
      "❌ Error buscando territorio:",
      error.message
    );

    return null;
  }
}


// ======================================================
// GUARDAR TERRITORIO
// ======================================================

async function saveTerritory(territory) {
  const collection = getTerritoriesCollection();

  if (!collection) {
    return false;
  }

  try {
    await collection.updateOne(
      {
        id: territory.id
      },
      {
        $set: {
          id: territory.id,
          x: territory.x,
          y: territory.y,
          ownerId: territory.ownerId,
          level: territory.level,
          troops: territory.troops,
          cityName: territory.cityName,
          active: territory.active
        }
      },
      {
        upsert: true
      }
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Error guardando territorio:",
      error.message
    );

    return false;
  }
}


// ======================================================
// GUARDAR MUCHOS TERRITORIOS
// ======================================================

async function saveTerritories(territories) {
  const collection = getTerritoriesCollection();

  if (!collection || !Array.isArray(territories)) {
    return false;
  }

  if (territories.length === 0) {
    return true;
  }

  try {
    const operations = territories.map(
      territory => ({
        updateOne: {
          filter: {
            id: territory.id
          },

          update: {
            $set: {
              id: territory.id,
              x: territory.x,
              y: territory.y,
              ownerId: territory.ownerId,
              level: territory.level,
              troops: territory.troops,
              cityName: territory.cityName,
              active: territory.active
            }
          },

          upsert: true
        }
      })
    );

    await collection.bulkWrite(
      operations,
      {
        ordered: false
      }
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Error guardando territorios:",
      error.message
    );

    return false;
  }
}


// ======================================================
// CARGAR TODO EL MAPA
// ======================================================

async function loadTerritories() {
  const collection = getTerritoriesCollection();

  if (!collection) {
    return [];
  }

  try {
    return await collection
      .find({})
      .sort({
        id: 1
      })
      .toArray();
  } catch (error) {
    console.error(
      "❌ Error cargando territorios:",
      error.message
    );

    return [];
  }
}


// ======================================================
// CREAR MAPA INICIAL
// ======================================================

async function initializeTerritories(
  territories
) {
  const collection = getTerritoriesCollection();

  if (!collection) {
    return false;
  }

  try {
    const count =
      await collection.countDocuments();

    // Ya existe un mapa
    if (count > 0) {
      return false;
    }

    const data =
      Array.from(
        territories.values()
      ).map(
        territory => ({
          id: territory.id,
          x: territory.x,
          y: territory.y,
          ownerId: territory.ownerId,
          level: territory.level,
          troops: territory.troops,
          cityName: territory.cityName,
          active: territory.active
        })
      );

    if (data.length > 0) {
      await collection.insertMany(
        data
      );
    }

    console.log(
      `✅ ${data.length} territorios guardados en MongoDB`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Error inicializando territorios:",
      error.message
    );

    return false;
  }
}


// ======================================================
// ELIMINAR TERRITORIO
// ======================================================

async function deleteTerritory(id) {
  const collection = getTerritoriesCollection();

  if (!collection) {
    return false;
  }

  try {
    const result =
      await collection.deleteOne({
        id: Number(id)
      });

    return result.deletedCount > 0;
  } catch (error) {
    console.error(
      "❌ Error eliminando territorio:",
      error.message
    );

    return false;
  }
}


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
  findTerritory,
  saveTerritory,
  saveTerritories,
  loadTerritories,
  initializeTerritories,
  deleteTerritory
};
