import { getDb } from '../schema';
import type { Datore } from '../types';

function rowToDatore(row: Record<string, unknown>): Datore {
  return {
    id: row.id as string,
    nome: row.nome as string,
    pagaOraria: row.paga_oraria as number,
    descrizione: row.descrizione as string | undefined,
    colore: row.colore as string,
    creatoIl: row.creato_il as string,
    aggiornato: row.aggiornato as string,
  };
}

export function getAllDatori(): Datore[] {
  const rows = getDb().getAllSync('SELECT * FROM datori ORDER BY nome ASC') as Record<string, unknown>[];
  return rows.map(rowToDatore);
}

export function getDatore(id: string): Datore | null {
  const row = getDb().getFirstSync('SELECT * FROM datori WHERE id = ?', [id]) as Record<string, unknown> | null;
  return row ? rowToDatore(row) : null;
}

export function insertDatore(d: Omit<Datore, 'creatoIl' | 'aggiornato'>) {
  const now = new Date().toISOString();
  getDb().runSync(
    'INSERT INTO datori (id, nome, paga_oraria, descrizione, colore, creato_il, aggiornato) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [d.id, d.nome, d.pagaOraria, d.descrizione ?? null, d.colore, now, now]
  );
}

export function updateDatore(d: Omit<Datore, 'creatoIl'>) {
  const now = new Date().toISOString();
  getDb().runSync(
    'UPDATE datori SET nome = ?, paga_oraria = ?, descrizione = ?, colore = ?, aggiornato = ? WHERE id = ?',
    [d.nome, d.pagaOraria, d.descrizione ?? null, d.colore, now, d.id]
  );
}

export function deleteDatore(id: string) {
  getDb().runSync('DELETE FROM datori WHERE id = ?', [id]);
}
