import { nanoid } from "nanoid";
import { create } from "zustand";

export interface PlannerItem {
  id: string;
  x: number;
  y: number;
  name: string;
  w: number;
  h: number;
  size: number;
  rotation: number;
  category: string; // 'mesas' | 'sillas' | 'pistas' | 'escenarios' | 'decor' | ...
  type: string;     // 'round10', 'rect', 'chair', etc.
  color: string;
  locked: boolean;
  groupId?: string;
  tier?: string;    // 'standard' | 'premium' | 'ultra' | 'ai-generated'
  [key: string]: any;
}

export interface Area {
  id: string;
  name: string;
  width: number;  // en metros
  height: number; // en metros
  x: number;      // coordenadas locales (generalmente 2500 center)
  y: number;
  rotation: number;
  type: "salon" | "carpa" | "cocina" | "terraza" | "extra" | "hall" | "lounge";
  color: string;
  terrazaType?: string;
  uso?: string;
  conectaCon?: string[];
}

export interface Guest {
  id: string;
  x: number;
  y: number;
  color: string;
  tableId?: string;
}

interface PlannerState {
  // State
  items: PlannerItem[];
  areas: Area[];
  guests: Guest[];
  selectedId: string | null;
  selected: PlannerItem | null;
  layers: { [key: string]: boolean };
  
  // Simulation State
  simulationRunning: boolean;
  themeMode: 'blueprint' | 'luxury' | 'cyberpunk' | 'watercolor';

  // Actions
  addItem: (item: Partial<PlannerItem>) => void;
  updateItem: (id: string, partial: Partial<PlannerItem>) => void;
  removeItem: (id: string) => void;
  setAll: (items: PlannerItem[]) => void;
  
  addArea: (area: Partial<Area>) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;
  removeArea: (id: string) => void;
  clearHall: () => void;

  setSelectedId: (id: string | null) => void;
  reset: () => void;
  setLayer: (layer: string, visible: boolean) => void;
  
  toggleSimulation: () => void;
  setThemeMode: (mode: 'blueprint' | 'luxury' | 'cyberpunk' | 'watercolor') => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  items: [],
  areas: [],
  guests: [],
  selectedId: null,
  selected: null,
  layers: { tables: true, chairs: true, decor: true, areas: true, guests: true },
  simulationRunning: false,
  themeMode: 'luxury',

  addItem: (item) => {
    const newItem: PlannerItem = {
      id: item.id || nanoid(),
      x: item.x ?? 2500,
      y: item.y ?? 2500,
      name: item.name || "Nuevo Item",
      w: item.w || 100,
      h: item.h || 100,
      size: item.size || Math.max(item.w || 0, item.h || 0, 100),
      rotation: item.rotation || 0,
      category: item.category || "mueble",
      type: item.type || "generic",
      color: item.color || "#ffffff",
      locked: item.locked || false,
      tier: item.tier || "standard",
      ...item
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  updateItem: (id, partial) => {
    set((state) => {
      const idx = state.items.findIndex(i => i.id === id);
      if (idx === -1) return state;

      const updatedItems = [...state.items];
      updatedItems[idx] = { ...updatedItems[idx], ...partial };
      
      // Sync selection if needed
      const updatedSelected = state.selectedId === id ? updatedItems[idx] : state.selected;

      return { items: updatedItems, selected: updatedSelected };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter(i => i.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selected: state.selectedId === id ? null : state.selected
    }));
  },

  setAll: (items) => set({ items }),

  addArea: (area) => {
    const newArea: Area = {
      id: area.id || nanoid(),
      name: area.name || "Nueva Área",
      width: area.width || 10,
      height: area.height || 10,
      x: area.x ?? 2500,
      y: area.y ?? 2500,
      rotation: area.rotation || 0,
      type: area.type || "extra",
      color: area.color || "#888888",
      ...area
    };
    set((state) => ({ areas: [...state.areas, newArea] }));
  },

  updateArea: (id, partial) => {
    set((state) => ({
      areas: state.areas.map(a => a.id === id ? { ...a, ...partial } : a)
    }));
  },

  removeArea: (id) => {
    set((state) => ({ areas: state.areas.filter(a => a.id !== id) }));
  },

  clearHall: () => {
    set((state) => ({ areas: state.areas.filter(a => a.type !== 'salon') }));
  },

  setSelectedId: (id) => {
    if (!id) {
      set({ selectedId: null, selected: null });
      return;
    }
    const found = get().items.find(i => i.id === id) || null;
    set({ selectedId: id, selected: found });
  },

  reset: () => set({ items: [], areas: [], guests: [], selectedId: null, selected: null }),

  setLayer: (layer, visible) => {
    set((state) => ({ layers: { ...state.layers, [layer]: visible } }));
  },
  
  toggleSimulation: () => set(s => ({ simulationRunning: !s.simulationRunning })),
  
  setThemeMode: (mode) => set({ themeMode: mode })
}));