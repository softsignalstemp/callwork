import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getAllSessioni } from '@/db/queries/sessioni';
import { getAllDatori } from '@/db/queries/datori';
import type { Sessione } from '@/db/types';

const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
              'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

function csvEscape(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return GIORNI[new Date(y, m - 1, d).getDay()];
}

function sessioneToRow(s: Sessione, nomeAdatore: string): string {
  const fields = [
    s.data,
    formatDay(s.data),
    nomeAdatore,
    s.oraInizio,
    s.pausaInizio ?? '',
    s.pausaFine ?? '',
    s.oraFine,
    s.oreTotali.toFixed(2),
    s.guadagno.toFixed(2),
    s.note ?? '',
  ];
  return fields.map(csvEscape).join(',');
}

const CSV_HEADER = 'data,giorno,datore,ora_inizio,pausa_inizio,pausa_fine,ora_fine,ore_nette,guadagno_eur,note';

export type ExportScope = { type: 'mese'; mese: string } | { type: 'tutto' };

export async function exportCsv(scope: ExportScope): Promise<void> {
  const allSessioni = getAllSessioni();
  const datori = getAllDatori();
  const datoreMap = Object.fromEntries(datori.map(d => [d.id, d.nome]));

  const sessioni = scope.type === 'mese'
    ? allSessioni.filter(s => s.data.startsWith(scope.mese))
    : allSessioni;

  if (sessioni.length === 0) {
    throw new Error('Nessuna sessione da esportare per il periodo selezionato.');
  }

  // Sort chronologically
  const sorted = [...sessioni].sort((a, b) => a.data.localeCompare(b.data));

  const rows = sorted.map(s => sessioneToRow(s, datoreMap[s.datoreId] ?? s.datoreId));
  const csv = [CSV_HEADER, ...rows].join('\n');

  const filename = scope.type === 'mese'
    ? `callwork_${scope.mese}.csv`
    : `callwork_tutti.csv`;

  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('La condivisione file non è disponibile su questo dispositivo.');
  }

  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    dialogTitle: 'Esporta turni CSV',
    UTI: 'public.comma-separated-values-text',
  });
}

export function meseLabel(mese: string): string {
  const [y, m] = mese.split('-').map(Number);
  return `${MESI[m - 1]} ${y}`;
}

export function availableMonths(): string[] {
  const sessioni = getAllSessioni();
  const months = new Set(sessioni.map(s => s.data.slice(0, 7)));
  return [...months].sort().reverse();
}
