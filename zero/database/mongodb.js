const { MongoClient } = require("mongodb");
const config = require("../config/gameConfig");

const MONGO_URI =
  process.env.MONGO_URI;

let client = null;
let db = null;


// ======================================================
// CONECTAR A MONGODB
// ======================================================

async function connectDB() {

  if (!MONGO_URI) {

    console.warn(
      "⚠️ MONGO_URI no está configurado. El juego funcionará sin persistencia."
    );

    return null;
  }

  try {

    client =
      new MongoClient(
        MONGO_URI
      );

    await client.connect();

    db =
      client.db(
        config.DATABASE_NAME
      );

    console.log(
      "✅ MongoDB conectado correctamente"
    );

    return db;

  } catch (error) {

    console.error(
      "❌ Error conectando a MongoDB:",
      error.message
    );

    client = null;
    db = null;

    return null;
  }
}


// ======================================================
// OBTENER BASE DE DATOS
// ======================================================

function getDB() {
  return db;
}


// ======================================================
// OBTENER COLECCIÓN
// ======================================================

function getCollection(
  collectionName
) {

  if (!db) {
    return null;
  }

  return db.collection(
    collectionName
  );
}


// ======================================================
// CERRAR CONEXIÓN
// ======================================================

async function closeDB() {

  if (!client) {
    return;
  }

  try {

    await client.close();

    client = null;
    db = null;

    console.log(
      "🔴 MongoDB desconectado"
    );

  } catch (error) {

    console.error(
      "❌ Error cerrando MongoDB:",
      error.message
    );
  }
}


// ======================================================
// COMPROBAR CONEXIÓN
// ======================================================

function isConnected() {
  return db !== null;
}


// ======================================================
// INICIALIZAR ÍNDICES
// ======================================================

async function initializeIndexes() {

  if (!db) {
    return;
  }

  try {

    const players =
      db.collection(
        "players"
      );

    const territories =
      db.collection(
        "territories"
      );


    await players.createIndex(
      { username: 1 },
      { unique: true }
    );


    await territories.createIndex(
      { id: 1 },
      { unique: true }
    );


    console.log(
      "✅ Índices de MongoDB preparados"
    );

  } catch (error) {

    console.error(
      "❌ Error creando índices:",
      error.message
    );
  }
}


// ======================================================
// INICIALIZACIÓN COMPLETA
// ======================================================

async function initializeDatabase() {

  const database =
    await connectDB();

  if (database) {
    await initializeIndexes();
  }

  return database;
}


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {

  connectDB,

  initializeDatabase,

  getDB,

  getCollection,

  closeDB,

  isConnected,

  initializeIndexes

};
