import type { Sessione } from '@/db/types';

export const MOLTIPLICATORI = [1.25, 1.5, 1.75, 2.0];

export interface StraordinariConfig {
  abilitato: boolean;
  sogliaDiariaOre: number;
  moltiplicatore: number;
  pagaOrariaStraordinario?: number;
}

export const DEFAULT_STRAORDINARI: StraordinariConfig = {
  abilitato: false,
  sogliaDiariaOre: 8,
  moltiplicatore: 1.5,
};

export interface CalcoloStraordinari {
  totale: number;
  hasStraordinari: boolean;
  oreOrdinarie: number;
  oreStraordinarie: number;
  compensoOrdinario: number;
  compensoStraordinario: number;
}

export function calcolaConStraordinari(
  oreNette: number,
  pagaOraria: number,
  config: StraordinariConfig,
): CalcoloStraordinari {
  if (!config.abilitato || oreNette <= config.sogliaDiariaOre) {
    return {
      totale: oreNette * pagaOraria,
      hasStraordinari: false,
      oreOrdinarie: oreNette,
      oreStraordinarie: 0,
      compensoOrdinario: oreNette * pagaOraria,
      compensoStraordinario: 0,
    };
  }

  const oreOrdinarie = config.sogliaDiariaOre;
  const oreStraordinarie = oreNette - oreOrdinarie;
  const compensoOrdinario = oreOrdinarie * pagaOraria;
  const rateStraordinari = config.pagaOrariaStraordinario ?? pagaOraria * config.moltiplicatore;
  const compensoStraordinario = oreStraordinarie * rateStraordinari;

  return {
    totale: compensoOrdinario + compensoStraordinario,
    hasStraordinari: true,
    oreOrdinarie,
    oreStraordinarie,
    compensoOrdinario,
    compensoStraordinario,
  };
}

export function calcolaStatStraordinari(
  sessioni: Sessione[],
  config: StraordinariConfig,
): { oreStraordinarie: number; compensoStraordinario: number } {
  if (!config.abilitato) return { oreStraordinarie: 0, compensoStraordinario: 0 };

  let oreStraordinarie = 0;
  let compensoStraordinario = 0;

  for (const s of sessioni) {
    if (s.oreTotali <= config.sogliaDiariaOre) continue;
    const oreStr = s.oreTotali - config.sogliaDiariaOre;
    oreStraordinarie += oreStr;
    const avgRate = s.oreTotali > 0 ? s.guadagno / s.oreTotali : 0;
    compensoStraordinario += oreStr * avgRate;
  }

  return { oreStraordinarie, compensoStraordinario };
}
