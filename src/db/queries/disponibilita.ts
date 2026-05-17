import { getDb } from '../schema';
import type { Disponibilita } from '../types';

function rowToDisponibilita(row: Record<string, unknown>): Disponibilita {
  return {
    id: row.id as string,
    data: row.data as string,
    note: row.note as string | undefined,
    creatoIl: row.creato_il as string,
  };
}

export function getAllDisponibilita(): Disponibilita[] {
  const rows = getDb().getAllSync('SELECT * FROM disponibilita ORDER BY data DESC') as Record<string, unknown>[];
  return rows.map(rowToDisponibilita);
}

export function upsertDisponibilita(d: Omit<Disponibilita, 'creatoIl'>) {
  const now = new Date().toISOString();
  getDb().runSync(
    `INSERT INTO disponibilita (id, data, note, creato_il) VALUES (?, ?, ?, ?)
     ON CONFLICT(data) DO UPDATE SET note = excluded.note`,
    [d.id, d.data, d.note ?? null, now]
  );
}

export function deleteDisponibilita(data: string) {
  getDb().runSync('DELETE FROM disponibilita WHERE data = ?', [data]);
}
