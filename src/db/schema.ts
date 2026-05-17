import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync('callwork.db');
  }
  return db;
}

export async function initDb() {
  const database = getDb();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS datori (
      id          TEXT PRIMARY KEY,
      nome        TEXT NOT NULL,
      paga_oraria REAL NOT NULL,
      descrizione TEXT,
      colore      TEXT NOT NULL DEFAULT '#6750A4',
      creato_il   TEXT NOT NULL,
      aggiornato  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lavori (
      id          TEXT PRIMARY KEY,
      datore_id   TEXT NOT NULL REFERENCES datori(id) ON DELETE CASCADE,
      titolo      TEXT NOT NULL,
      descrizione TEXT,
      paga_oraria REAL,
      creato_il   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessioni (
      id          TEXT PRIMARY KEY,
      datore_id   TEXT NOT NULL REFERENCES datori(id),
      lavoro_id   TEXT REFERENCES lavori(id),
      data        TEXT NOT NULL,
      ora_inizio  TEXT NOT NULL,
      ora_fine    TEXT NOT NULL,
      ore_totali  REAL NOT NULL,
      guadagno    REAL NOT NULL,
      note        TEXT,
      confermato  INTEGER NOT NULL DEFAULT 0,
      creato_il   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disponibilita (
      id        TEXT PRIMARY KEY,
      data      TEXT NOT NULL UNIQUE,
      note      TEXT,
      creato_il TEXT NOT NULL
    );
  `);
}
