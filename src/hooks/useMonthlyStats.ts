import { useMemo } from 'react';
import { useLavoriStore } from '@/store/useLavoriStore';

export function useMonthlyStats() {
  const { sessioni, datori, meseSelezionato } = useLavoriStore();

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
        perDatore[s.datoreId] = {
          ore: 0,
          guadagno: 0,
          nome: d?.nome ?? '?',
          colore: d?.colore ?? '#999',
        };
      }
      perDatore[s.datoreId].ore += s.oreTotali;
      perDatore[s.datoreId].guadagno += s.guadagno;
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { data: key, guadagno: perGiorno[key] ?? 0 };
    });

    return { totaleGuadagnato, oreTotali, giorniLavorati, perGiorno, perDatore, last7Days, mese: meseSelezionato };
  }, [sessioni, datori, meseSelezionato]);
}
