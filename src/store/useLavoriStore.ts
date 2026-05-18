import { create } from 'zustand';
import { getAllDatori, insertDatore, updateDatore, deleteDatore } from '@/db/queries/datori';
import { getSessioniByMese, insertSessione, deleteSessione } from '@/db/queries/sessioni';
import { getAllDisponibilita, upsertDisponibilita, deleteDisponibilita } from '@/db/queries/disponibilita';
import { generateId } from '@/utils/id';
import { currentMonth } from '@/utils/formatters';
import type { Datore, Sessione, Disponibilita } from '@/db/types';

interface LavoriState {
  datori: Datore[];
  sessioni: Sessione[];
  disponibilita: Disponibilita[];
  meseSelezionato: string;

  caricaDati: () => void;
  cambiaMese: (mese: string) => void;

  aggiungiDatore: (d: Omit<Datore, 'id' | 'creatoIl' | 'aggiornato'>) => void;
  modificaDatore: (d: Omit<Datore, 'creatoIl'>) => void;
  rimuoviDatore: (id: string) => void;

  aggiungiSessione: (s: Omit<Sessione, 'id' | 'creatoIl'>) => void;
  rimuoviSessione: (id: string) => void;

  aggiungiDisponibilita: (data: string, note?: string) => void;
  rimuoviDisponibilita: (data: string) => void;
}

export const useLavoriStore = create<LavoriState>((set, get) => ({
  datori: [],
  sessioni: [],
  disponibilita: [],
  meseSelezionato: currentMonth(),

  caricaDati: () => {
    const mese = get().meseSelezionato;
    set({
      datori: getAllDatori(),
      sessioni: getSessioniByMese(mese),
      disponibilita: getAllDisponibilita(),
    });
  },

  cambiaMese: (mese) => {
    set({ meseSelezionato: mese, sessioni: getSessioniByMese(mese) });
  },

  aggiungiDatore: (d) => {
    const colore = /^#[0-9A-Fa-f]{6}$/.test(d.colore) ? d.colore : '#8B5CF6';
    const newDatore: Omit<Datore, 'creatoIl' | 'aggiornato'> = { ...d, colore, id: generateId() };
    insertDatore(newDatore);
    set({ datori: getAllDatori() });
  },

  modificaDatore: (d) => {
    const colore = /^#[0-9A-Fa-f]{6}$/.test(d.colore) ? d.colore : '#8B5CF6';
    updateDatore({ ...d, colore });
    set({ datori: getAllDatori() });
  },

  rimuoviDatore: (id) => {
    deleteDatore(id);
    set({ datori: getAllDatori(), sessioni: getSessioniByMese(get().meseSelezionato) });
  },

  aggiungiSessione: (s) => {
    insertSessione({ ...s, id: generateId() });
    set({ sessioni: getSessioniByMese(get().meseSelezionato) });
  },

  rimuoviSessione: (id) => {
    deleteSessione(id);
    set({ sessioni: getSessioniByMese(get().meseSelezionato) });
  },

  aggiungiDisponibilita: (data, note) => {
    upsertDisponibilita({ id: generateId(), data, note });
    set({ disponibilita: getAllDisponibilita() });
  },

  rimuoviDisponibilita: (data) => {
    deleteDisponibilita(data);
    set({ disponibilita: getAllDisponibilita() });
  },
}));
