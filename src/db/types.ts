export interface Datore {
  id: string;
  nome: string;
  pagaOraria: number;
  descrizione?: string;
  colore: string;
  creatoIl: string;
  aggiornato: string;
}

export interface Lavoro {
  id: string;
  datoreId: string;
  titolo: string;
  descrizione?: string;
  pagaOraria?: number;
  creatoIl: string;
}

export interface Sessione {
  id: string;
  datoreId: string;
  lavoroId?: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  oreTotali: number;
  guadagno: number;
  note?: string;
  confermato: boolean;
  creatoIl: string;
}

export interface Disponibilita {
  id: string;
  data: string;
  note?: string;
  creatoIl: string;
}
