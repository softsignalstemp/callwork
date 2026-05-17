import { getDb } from '../schema';
import type { Sessione } from '../types';

function rowToSessione(row: Record<string, unknown>): Sessione {
  return {
    id: row.id as string,
    datoreId: row.datore_id as string,
    lavoroId: row.lavoro_id as string | undefined,
    data: row.data as string,
    oraInizio: row.ora_inizio as string,
    oraFine: row.ora_fine as string,
    oreTotali: row.ore_totali as number,
    guadagno: row.guadagno as number,
    note: row.note as string | undefined,
    confermato: (row.confermato as number) === 1,
    creatoIl: row.creato_il as string,
  };
}

export function getSessioniByMese(mese: string): Sessione[] {
  const rows = getDb().getAllSync(
    "SELECT * FROM sessioni WHERE data LIKE ? ORDER BY data DESC, ora_inizio DESC",
    [`${mese}%`]
  ) as Record<string, unknown>[];
  return rows.map(rowToSessione);
}

export function getAllSessioni(): Sessione[] {
  const rows = getDb().getAllSync(
    'SELECT * FROM sessioni ORDER BY data DESC, ora_inizio DESC'
  ) as Record<string, unknown>[];
  return rows.map(rowToSessione);
}

export function insertSessione(s: Omit<Sessione, 'creatoIl'>) {
  const now = new Date().toISOString();
  getDb().runSync(
    `INSERT INTO sessioni
      (id, datore_id, lavoro_id, data, ora_inizio, ora_fine, ore_totali, guadagno, note, confermato, creato_il)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [s.id, s.datoreId, s.lavoroId ?? null, s.data, s.oraInizio, s.oraFine,
     s.oreTotali, s.guadagno, s.note ?? null, s.confermato ? 1 : 0, now]
  );
}

export function updateSessione(s: Sessione) {
  getDb().runSync(
    `UPDATE sessioni SET datore_id=?, lavoro_id=?, data=?, ora_inizio=?, ora_fine=?,
     ore_totali=?, guadagno=?, note=?, confermato=? WHERE id=?`,
    [s.datoreId, s.lavoroId ?? null, s.data, s.oraInizio, s.oraFine,
     s.oreTotali, s.guadagno, s.note ?? null, s.confermato ? 1 : 0, s.id]
  );
}

export function deleteSessione(id: string) {
  getDb().runSync('DELETE FROM sessioni WHERE id = ?', [id]);
}
