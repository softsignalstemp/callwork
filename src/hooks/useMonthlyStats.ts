import { useMemo } from 'react';
import { useLavoriStore } from '@/store/useLavoriStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { calcolaStatStraordinari } from '@/utils/straordinari';

export interface DayData {
  day: number;
  date: string;
  guadagno: number;
}

export function useMonthlyStats() {
  const { sessioni, datori, meseSelezionato } = useLavoriStore();
  const straordinariConfig = useSettingsStore((s) => s.straordinari);

  return useMemo(() => {
    const totaleGuadagnato = sessioni.reduce((sum, s) => sum + s.guadagno, 0);
    const oreTotali = sessioni.reduce((sum, s) => sum + s.oreTotali, 0);
    const giorniLavorati = new Set(sessioni.map((s) => s.data)).size;

    const perGiorno: Record<string, number> = {};
    for (const s of sessioni) {
      perGiorno[s.data] = (perGiorno[s.data] ?? 0) + s.guadagno;
    }

    const perDatore: Record<string, { ore: number; guadagno: number; nome: string; colore: string }> = {};
    for (const s of sessioni) {
      const d = datori.find((dd) => dd.id === s.datoreId);
      if (!perDatore[s.datoreId]) {
        perDatore[s.datoreId] = { ore: 0, guadagno: 0, nome: d?.nome ?? '?', colore: d?.colore ?? '#999' };
      }
      perDatore[s.datoreId].ore += s.oreTotali;
      perDatore[s.datoreId].guadagno += s.guadagno;
    }

    // All days 1..today (or end of month for past months)
    const [year, month] = meseSelezionato.split('-').map(Number);
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const lastDay = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();
    const daysOfMonth: DayData[] = Array.from({ length: lastDay }, (_, i) => {
      const day = i + 1;
      const date = `${meseSelezionato}-${String(day).padStart(2, '0')}`;
      return { day, date, guadagno: perGiorno[date] ?? 0 };
    });

    const { oreStraordinarie, compensoStraordinario } = calcolaStatStraordinari(sessioni, straordinariConfig);

    return {
      totaleGuadagnato, oreTotali, giorniLavorati,
      perGiorno, perDatore, daysOfMonth,
      mese: meseSelezionato,
      oreStraordinarie,
      compensoStraordinario,
      straordinariAbilitati: straordinariConfig.abilitato,
    };
  }, [sessioni, datori, meseSelezionato, straordinariConfig]);
}
