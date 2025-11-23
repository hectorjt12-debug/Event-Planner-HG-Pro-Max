import { create } from "zustand";

export interface Mesa {
  id: string | number;
  x: number;
  y: number;
  nombre: string;
  w?: number;
  h?: number;
  color?: string;
  capacidad?: number;
  rot?: number;
  [key: string]: any;
}

interface MesasStore {
  mesas: Mesa[];
  add: (m: Mesa) => void;
  update: (id: string | number | null, vals: Partial<Mesa>) => void;
  setAll: (mesas: Mesa[]) => void;
}

export const useMesasStore = create<MesasStore>((set) => ({
  mesas: [],

  add(m) {
    set((s) => ({ mesas: [...s.mesas, m] }));
  },

  update(id, vals) {
    if (id === null) return;
    set((s) => ({
      mesas: s.mesas.map((m) =>
        m.id === id ? { ...m, ...vals } : m
      )
    }));
  },

  setAll(mesas) {
    set({ mesas });
  }
}));