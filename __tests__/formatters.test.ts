import {
  calcOre,
  calcOreNette,
  calcGuadagno,
  formatOre,
  prevMonth,
  nextMonth,
  currentMonth,
} from '../src/utils/formatters';

describe('calcOre', () => {
  it('calcola ore intere', () => {
    expect(calcOre('08:00', '17:00')).toBe(9);
  });

  it('calcola ore con minuti', () => {
    expect(calcOre('08:00', '12:30')).toBe(4.5);
  });

  it('restituisce 0 se fine <= inizio', () => {
    expect(calcOre('17:00', '08:00')).toBe(0);
    expect(calcOre('08:00', '08:00')).toBe(0);
  });

  it('restituisce 0 su input non valido', () => {
    expect(calcOre('', '')).toBe(0);
    expect(calcOre('xx:yy', '08:00')).toBe(0);
  });

  it('gestisce minuti a 1 cifra', () => {
    expect(calcOre('08:00', '08:30')).toBe(0.5);
  });
});

describe('calcOreNette', () => {
  it('senza pausa = ore lorde', () => {
    expect(calcOreNette('08:00', '17:00')).toBe(9);
  });

  it('sottrae la pausa', () => {
    expect(calcOreNette('08:00', '17:00', '12:30', '13:30')).toBe(8);
  });

  it('pausa che copre tutto → 0', () => {
    expect(calcOreNette('08:00', '09:00', '08:00', '09:00')).toBe(0);
  });

  it('pausa più lunga del turno → 0 (non negativo)', () => {
    expect(calcOreNette('08:00', '09:00', '07:00', '11:00')).toBe(0);
  });

  it('pausa undefined ignorata', () => {
    expect(calcOreNette('08:00', '17:00', undefined, undefined)).toBe(9);
    expect(calcOreNette('08:00', '17:00', '12:00', undefined)).toBe(9);
  });
});

describe('calcGuadagno', () => {
  it('moltiplicazione base', () => {
    expect(calcGuadagno(8, 11.5)).toBe(92);
  });

  it('arrotonda a 2 decimali', () => {
    expect(calcGuadagno(1, 11.11)).toBe(11.11);
    expect(calcGuadagno(3, 10.005)).toBe(30.02);
  });

  it('ore 0 → guadagno 0', () => {
    expect(calcGuadagno(0, 15)).toBe(0);
  });
});

describe('formatOre', () => {
  it('ore intere', () => {
    expect(formatOre(8)).toBe('8h');
  });

  it('ore e minuti', () => {
    expect(formatOre(8.5)).toBe('8h 30m');
  });

  it('solo minuti', () => {
    expect(formatOre(0.5)).toBe('0h 30m');
  });

  it('zero', () => {
    expect(formatOre(0)).toBe('0h');
  });
});

describe('prevMonth / nextMonth', () => {
  it('mese precedente stesso anno', () => {
    expect(prevMonth('2026-05')).toBe('2026-04');
  });

  it('mese precedente cambio anno', () => {
    expect(prevMonth('2026-01')).toBe('2025-12');
  });

  it('mese successivo stesso anno', () => {
    expect(nextMonth('2026-05')).toBe('2026-06');
  });

  it('mese successivo cambio anno', () => {
    expect(nextMonth('2026-12')).toBe('2027-01');
  });

  it('padding con zero', () => {
    expect(prevMonth('2026-10')).toBe('2026-09');
    expect(nextMonth('2026-09')).toBe('2026-10');
  });
});

describe('currentMonth', () => {
  it('restituisce YYYY-MM del mese corrente', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    expect(currentMonth()).toBe(expected);
  });
});
