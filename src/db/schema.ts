import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('callwork.db');
  }
  return db;
}

// Each statement is separate — execSync with multi-statement blocks
// can silently fail in expo-sqlite 16
export function initDb(): void {
  const database = getDb();

  database.execSync(
    `CREATE TABLE IF NOT EXISTS datori (
      id          TEXT PRIMARY KEY,
      nome        TEXT NOT NULL,
      paga_oraria REAL NOT NULL,
      descrizione TEXT,
      colore      TEXT NOT NULL DEFAULT '#8B5CF6',
      creato_il   TEXT NOT NULL,
      aggiornato  TEXT NOT NULL
    )`
  );

  database.execSync(
    `CREATE TABLE IF NOT EXISTS lavori (
      id          TEXT PRIMARY KEY,
      datore_id   TEXT NOT NULL,
      titolo      TEXT NOT NULL,
      descrizione TEXT,
      paga_oraria REAL,
      creato_il   TEXT NOT NULL
    )`
  );

  // No REFERENCES constraint — avoids FK errors on fresh DBs
  database.execSync(
    `CREATE TABLE IF NOT EXISTS sessioni (
      id          TEXT PRIMARY KEY,
      datore_id   TEXT NOT NULL,
      lavoro_id   TEXT,
      data        TEXT NOT NULL,
      ora_inizio  TEXT NOT NULL,
      ora_fine    TEXT NOT NULL,
      ore_totali  REAL NOT NULL,
      guadagno    REAL NOT NULL,
      note        TEXT,
      confermato  INTEGER NOT NULL DEFAULT 0,
      creato_il   TEXT NOT NULL
    )`
  );

  database.execSync(
    `CREATE TABLE IF NOT EXISTS disponibilita (
      id        TEXT PRIMARY KEY,
      data      TEXT NOT NULL UNIQUE,
      note      TEXT,
      creato_il TEXT NOT NULL
    )`
  );
}
