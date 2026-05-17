export function formatEuro(value: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

export function formatOre(ore: number): string {
  const h = Math.floor(ore);
  const m = Math.round((ore - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calcOre(oraInizio: string, oraFine: string): number {
  const [ih, im] = oraInizio.split(':').map(Number);
  const [fh, fm] = oraFine.split(':').map(Number);
  const minuti = (fh * 60 + fm) - (ih * 60 + im);
  return Math.max(0, minuti / 60);
}

export function calcGuadagno(ore: number, pagaOraria: number): number {
  return Math.round(ore * pagaOraria * 100) / 100;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function monthLabel(mese: string): string {
  const [year, month] = mese.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}

export function prevMonth(mese: string): string {
  const [year, month] = mese.split('-').map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function nextMonth(mese: string): string {
  const [year, month] = mese.split('-').map(Number);
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
