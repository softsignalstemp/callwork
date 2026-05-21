import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('callwork.db');
  }
  return db;
}

function safeAlter(database: SQLite.SQLiteDatabase, sql: string) {
  try {
    database.execSync(sql);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.toLowerCase().includes('duplicate column name') && !msg.toLowerCase().includes('already exists')) {
      console.error('[db] migration error:', msg, '|', sql);
    }
  }
}

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

  database.execSync(
    `CREATE TABLE IF NOT EXISTS sessioni (
      id           TEXT PRIMARY KEY,
      datore_id    TEXT NOT NULL,
      lavoro_id    TEXT,
      data         TEXT NOT NULL,
      ora_inizio   TEXT NOT NULL,
      ora_fine     TEXT NOT NULL,
      pausa_inizio TEXT,
      pausa_fine   TEXT,
      ore_totali   REAL NOT NULL,
      guadagno     REAL NOT NULL,
      note         TEXT,
      confermato   INTEGER NOT NULL DEFAULT 0,
      creato_il    TEXT NOT NULL
    )`
  );

  // Migrations for existing DBs — only suppresses duplicate-column errors
  safeAlter(database, `ALTER TABLE sessioni ADD COLUMN pausa_inizio TEXT`);
  safeAlter(database, `ALTER TABLE sessioni ADD COLUMN pausa_fine TEXT`);
  safeAlter(database, `ALTER TABLE datori ADD COLUMN str_abilitato INTEGER DEFAULT 0`);
  safeAlter(database, `ALTER TABLE datori ADD COLUMN str_soglia_ore REAL DEFAULT 8`);
  safeAlter(database, `ALTER TABLE datori ADD COLUMN str_moltiplicatore REAL DEFAULT 1.5`);
  safeAlter(database, `ALTER TABLE datori ADD COLUMN str_paga_oraria REAL DEFAULT NULL`);

  database.execSync(
    `CREATE TABLE IF NOT EXISTS disponibilita (
      id        TEXT PRIMARY KEY,
      data      TEXT NOT NULL UNIQUE,
      note      TEXT,
      creato_il TEXT NOT NULL
    )`
  );
}
