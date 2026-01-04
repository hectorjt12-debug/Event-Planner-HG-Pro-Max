
import { nanoid } from "nanoid";
import { create } from "zustand";
import { HGCoreAPI } from "../api/HGCoreAPI";

export type EventPhase = 'setup' | 'welcome' | 'main' | 'party' | 'closing';

export interface PlannerItem {
  id: string;
  x: number;
  y: number;
  name: string;
  w: number;
  h: number;
  rotation: number;
  category: string;
  type: string;
  color: string;
  locked: boolean;
  zOffset: number;
  opacity?: number;
}

export interface Area {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  type: string;
  color: string;
}

interface PlannerState {
  projectId: string;
  items: PlannerItem[];
  areas: Area[];
  selectedId: string | null;
  timeOfDay: number;
  eventPhase: EventPhase;
  isSyncing: boolean;
  lastError: string | null;

  // Diamond Actions
  addItem: (item: Partial<PlannerItem>) => void;
  updateItem: (id: string, partial: Partial<PlannerItem>) => void;
  removeItem: (id: string) => void;
  setAll: (items: PlannerItem[]) => void;
  addArea: (area: Partial<Area>) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;
  removeArea: (id: string) => void;
  
  setSelectedId: (id: string | null) => void;
  setEventPhase: (phase: EventPhase) => void;
  setTimeOfDay: (time: number) => void;
  
  // Cloud & Stability
  syncCloud: () => Promise<void>;
  loadCloud: (id: string) => Promise<void>;
  reset: () => void;
  setError: (msg: string | null) => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  projectId: "HG_MASTER_01",
  items: [],
  areas: [],
  selectedId: null,
  timeOfDay: 12,
  eventPhase: 'setup',
  isSyncing: false,
  lastError: null,

  addItem: (item) => {
    const newItem = {
      id: nanoid(),
      x: 2500, y: 2500,
      name: "HG Object",
      w: 100, h: 100,
      rotation: 0,
      category: "generic",
      type: "mueble",
      color: "#ffffff",
      locked: false,
      zOffset: 10,
      ...item
    };
    set(s => ({ items: [...s.items, newItem] }));
    get().syncCloud();
  },

  updateItem: (id, partial) => {
    set(s => ({
      items: s.items.map(i => i.id === id ? { ...i, ...partial } : i)
    }));
    // Throttle sync or broadcast here
  },

  removeItem: (id) => set(s => ({
    items: s.items.filter(i => i.id !== id),
    selectedId: s.selectedId === id ? null : s.selectedId
  })),

  setAll: (items) => set({ items }),

  addArea: (area) => set(s => ({
    areas: [...s.areas, {
      id: nanoid(),
      name: "New Hall",
      width: 15, height: 10,
      x: 2400, y: 2400,
      rotation: 0,
      type: "extra",
      color: "#444",
      ...area
    }]
  })),

  updateArea: (id, partial) => set(s => ({
    areas: s.areas.map(a => a.id === id ? { ...a, ...partial } : a)
  })),

  removeArea: (id) => set(s => ({
    areas: s.areas.filter(a => a.id !== id)
  })),

  setSelectedId: (id) => set({ selectedId: id }),

  setEventPhase: (phase) => {
    const times = { setup: 10, welcome: 18, main: 20, party: 23, closing: 2 };
    set({ eventPhase: phase, timeOfDay: times[phase] });
  },

  setTimeOfDay: (time) => set({ timeOfDay: time }),

  syncCloud: async () => {
    const { projectId, items, areas, isSyncing } = get();
    if (isSyncing) return;
    set({ isSyncing: true });
    try {
      await HGCoreAPI.saveProject(projectId, { items, areas });
    } catch (e) {
      set({ lastError: "Cloud Sync Failed" });
    } finally {
      set({ isSyncing: false });
    }
  },

  loadCloud: async (id) => {
    set({ isSyncing: true });
    const data = await HGCoreAPI.loadProject(id);
    if (data) {
      set({ items: data.items, areas: data.areas, projectId: id });
    }
    set({ isSyncing: false });
  },

  reset: () => set({ items: [], areas: [], selectedId: null, lastError: null }),
  setError: (msg) => set({ lastError: msg })
}));
