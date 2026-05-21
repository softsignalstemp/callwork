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
  const parts = (s: string) => s.split(':').map(Number);
  const [ih, im] = parts(oraInizio);
  const [fh, fm] = parts(oraFine);
  if ([ih, im, fh, fm].some((n) => !isFinite(n))) return 0;
  let minuti = (fh * 60 + fm) - (ih * 60 + im);
  // Turno notturno: fine il giorno dopo
  if (minuti <= 0) minuti += 24 * 60;
  return minuti / 60;
}

export function isOvernightShift(oraInizio: string, oraFine: string): boolean {
  const [ih, im] = oraInizio.split(':').map(Number);
  const [fh, fm] = oraFine.split(':').map(Number);
  return (fh * 60 + fm) <= (ih * 60 + im);
}

export function calcGuadagno(ore: number, pagaOraria: number): number {
  return Math.round(ore * pagaOraria * 100) / 100;
}

export function calcOreNette(
  oraInizio: string,
  oraFine: string,
  pausaInizio?: string,
  pausaFine?: string
): number {
  const lorde = calcOre(oraInizio, oraFine);
  if (!pausaInizio || !pausaFine) return lorde;
  const pausa = calcOre(pausaInizio, pausaFine);
  return Math.max(0, lorde - pausa);
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
