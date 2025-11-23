import { nanoid } from "nanoid";
import { create } from "zustand";

export interface PlannerItem {
  id: string;
  x: number;
  y: number;
  name: string;
  size: number;
  w: number;
  h: number;
  rotation: number;
  category?: string;
  type?: string;
  color?: string;
  capacity?: number;
  locked?: boolean;
  groupId?: string;
  [key: string]: any;
}

export interface Area {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  type: 
    | "salon"
    | "carpa"
    | "cocina"
    | "terraza"
    | "extra"
    | "hall"
    | "lounge";
  color: string;
  rotation?: number;
  terrazaType?: "abierta" | "techada" | "semi-techada";
  uso?: "coctel" | "recepcion" | "vip" | "lounge" | "fumadores" | "extra";
  conectaCon?: string[];
}

export interface Guest {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface LayerState {
  tables: boolean;
  chairs: boolean;
  decor: boolean;
  areas: boolean;
  guests: boolean;
  [key: string]: boolean;
}

interface PlannerState {
  items: PlannerItem[];
  areas: Area[];
  guests: Guest[];
  selected: PlannerItem | null;
  selectedId: string | null;

  layers: LayerState;

  addItem: (item: PlannerItem) => void;
  updateItem: (id: string, partial: Partial<PlannerItem>) => void;
  removeItem: (id: string) => void;

  setAll: (items: PlannerItem[]) => void;
  setSelected: (item: PlannerItem | null) => void;
  setSelectedId: (id: string | null) => void;

  reset: () => void;
  setLayer: (layer: string, visible: boolean) => void;

  addArea: (area: Area) => void;
  updateArea: (id: string, data: Partial<Area>) => void;
  removeArea: (id: string) => void;

  clearHall: () => void;

  setGuests: (guests: Guest[]) => void;
  clearGuests: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  items: [],
  areas: [],
  guests: [],
  selectedId: null,
  selected: null,

  layers: {
    tables: true,
    chairs: true,
    decor: true,
    areas: true,
    guests: true,
  },

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, { ...item, locked: item.locked ?? false }],
    })),

  updateItem: (id, partial) =>
    set((state) => {
      const index = state.items.findIndex((i) => i.id === id);
      if (index === -1) return state;

      const original = state.items[index];
      const updated = { ...original, ...partial };

      // Auto-ajustar tamaño si solo cambia size
      if (partial.size && !partial.w && !partial.h) {
        updated.w = partial.size;
        updated.h = partial.size;
      }

      const newItems = [...state.items];
      newItems[index] = updated;

      return {
        items: newItems,
        selected: state.selectedId === id ? updated : state.selected,
      };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selected: state.selectedId === id ? null : state.selected,
    })),

  setAll: (items) => set({ items }),

  setSelected: (item) =>
    set({ selected: item, selectedId: item?.id ?? null }),

  setSelectedId: (id) => {
    if (!id) return set({ selected: null, selectedId: null });

    const found = get().items.find((i) => i.id === id);

    set({
      selected: found ?? null,
      selectedId: found?.id ?? null,
    });
  },

  reset: () =>
    set({
      items: [],
      areas: [],
      guests: [],
      selected: null,
      selectedId: null,
    }),

  setLayer: (layer, visible) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: visible },
    })),

  addArea: (area) =>
    set((s) => ({
      areas: [
        ...s.areas,
        {
          ...area,
          id: area.id ?? nanoid(),
          rotation: area.rotation ?? 0,
          conectaCon: area.conectaCon ?? [],
        },
      ],
    })),

  updateArea: (id, data) =>
    set((s) => ({
      areas: s.areas.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),

  removeArea: (id) =>
    set((s) => ({
      areas: s.areas.filter((a) => a.id !== id),
    })),

  clearHall: () =>
    set((s) => ({
      areas: s.areas.filter((a) => a.type !== "hall"),
    })),

  setGuests: (guests) => set({ guests }),
  clearGuests: () => set({ guests: [] }),
}));
