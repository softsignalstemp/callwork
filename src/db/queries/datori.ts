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
    strAbilitato: !!row.str_abilitato,
    strSogliaOre: row.str_soglia_ore as number | undefined,
    strMoltiplicatore: row.str_moltiplicatore as number | undefined,
    strPagaOraria: row.str_paga_oraria != null ? (row.str_paga_oraria as number) : undefined,
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
    `INSERT INTO datori (id, nome, paga_oraria, descrizione, colore, str_abilitato, str_soglia_ore, str_moltiplicatore, str_paga_oraria, creato_il, aggiornato)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.id, d.nome, d.pagaOraria, d.descrizione ?? null, d.colore,
     d.strAbilitato ? 1 : 0, d.strSogliaOre ?? 8, d.strMoltiplicatore ?? 1.5,
     d.strPagaOraria ?? null, now, now]
  );
}

export function updateDatore(d: Omit<Datore, 'creatoIl'>) {
  const now = new Date().toISOString();
  getDb().runSync(
    `UPDATE datori SET nome = ?, paga_oraria = ?, descrizione = ?, colore = ?,
     str_abilitato = ?, str_soglia_ore = ?, str_moltiplicatore = ?, str_paga_oraria = ?, aggiornato = ? WHERE id = ?`,
    [d.nome, d.pagaOraria, d.descrizione ?? null, d.colore,
     d.strAbilitato ? 1 : 0, d.strSogliaOre ?? 8, d.strMoltiplicatore ?? 1.5,
     d.strPagaOraria ?? null, now, d.id]
  );
}

export function deleteDatore(id: string) {
  getDb().runSync('DELETE FROM datori WHERE id = ?', [id]);
}
