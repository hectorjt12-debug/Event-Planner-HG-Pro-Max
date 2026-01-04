
import { nanoid } from "nanoid";
import { create } from "zustand";

export type EventPhase = 'setup' | 'welcome' | 'main' | 'party' | 'closing';

export interface PlannerItem {
  id: string;
  x: number;
  y: number;
  name: string;
  w: number;
  h: number;
  size: number;
  rotation: number;
  category: string; 
  type: string;     
  color: string;
  locked: boolean;
  groupId?: string;
  tier?: string;    
  [key: string]: any;
}

export interface Area {
  id: string;
  name: string;
  width: number;  
  height: number; 
  x: number;      
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

export interface Agent {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  target?: { x: number, y: number };
  state: 'dancing' | 'sitting' | 'walking' | 'bar' | 'leaving';
}

export interface Peer {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  selectedIds: string[];
  status: 'active' | 'idle';
}

interface PlannerState {
  // State
  items: PlannerItem[];
  areas: Area[];
  guests: Guest[];
  selectedId: string | null;
  selected: PlannerItem | null;
  layers: { [key: string]: boolean };
  
  // Collaboration State
  peers: Record<string, Peer>;
  currentUser: Peer;
  
  // Simulation State
  simulationRunning: boolean;
  themeMode: 'blueprint' | 'luxury' | 'cyberpunk' | 'watercolor' | 'boho' | 'industrial' | 'garden';
  
  // God Mode / 4D State
  showAcousticHeatmap: boolean;
  showChronosFlow: boolean;
  timeOfDay: number; // 0 - 24
  simulationSpeed: number; // 0.5 - 5
  simulationDensity: number; // 0 - 200
  eventPhase: EventPhase;
  enableAutoAIAdjust: boolean;
  agents: Agent[];

  // Actions
  addItem: (item: Partial<PlannerItem>, isRemote?: boolean) => void;
  updateItem: (id: string, partial: Partial<PlannerItem>, isRemote?: boolean) => void;
  removeItem: (id: string, isRemote?: boolean) => void;
  setAll: (items: PlannerItem[]) => void;
  
  addArea: (area: Partial<Area>) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;
  removeArea: (id: string) => void;
  clearHall: () => void;

  setSelectedId: (id: string | null) => void;
  reset: () => void;
  setLayer: (layer: string, visible: boolean) => void;
  
  toggleSimulation: () => void;
  setThemeMode: (mode: 'blueprint' | 'luxury' | 'cyberpunk' | 'watercolor' | 'boho' | 'industrial' | 'garden') => void;
  
  // God Mode Actions
  setShowAcousticHeatmap: (v: boolean) => void;
  setShowChronosFlow: (v: boolean) => void;
  setTimeOfDay: (v: number) => void;
  setSimulationSpeed: (v: number) => void;
  setSimulationDensity: (v: number) => void;
  setEventPhase: (phase: EventPhase) => void;
  setEnableAutoAIAdjust: (v: boolean) => void;
  updateAgents: (agents: Agent[]) => void;

  // Collaboration Actions
  updatePeer: (id: string, data: Partial<Peer>) => void;
  removePeer: (id: string) => void;
}

const generateRandomColor = () => {
  const colors = ['#f472b6', '#38bdf8', '#4ade80', '#fbbf24', '#a78bfa'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  items: [],
  areas: [],
  guests: [],
  selectedId: null,
  selected: null,
  layers: { tables: true, chairs: true, decor: true, areas: true, guests: true },
  
  // Collaboration Init
  peers: {},
  currentUser: {
    id: nanoid(),
    name: "Architect " + Math.floor(Math.random() * 100),
    color: generateRandomColor(),
    cursor: null,
    selectedIds: [],
    status: 'active'
  },

  simulationRunning: false,
  themeMode: 'luxury',
  
  showAcousticHeatmap: false,
  showChronosFlow: false,
  timeOfDay: 12, 
  simulationSpeed: 1,
  simulationDensity: 50,
  eventPhase: 'setup',
  enableAutoAIAdjust: false,
  agents: [],

  addItem: (item, isRemote = false) => {
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

  updateItem: (id, partial, isRemote = false) => {
    set((state) => {
      const idx = state.items.findIndex(i => i.id === id);
      if (idx === -1) return state;

      const updatedItems = [...state.items];
      updatedItems[idx] = { ...updatedItems[idx], ...partial };
      const updatedSelected = state.selectedId === id ? updatedItems[idx] : state.selected;
      return { items: updatedItems, selected: updatedSelected };
    });
  },

  removeItem: (id, isRemote = false) => {
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

  reset: () => set({ items: [], areas: [], guests: [], selectedId: null, selected: null, agents: [] }),

  setLayer: (layer, visible) => {
    set((state) => ({ layers: { ...state.layers, [layer]: visible } }));
  },
  
  toggleSimulation: () => set(s => ({ simulationRunning: !s.simulationRunning })),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setShowAcousticHeatmap: (v) => set({ showAcousticHeatmap: v }),
  setShowChronosFlow: (v) => set({ showChronosFlow: v }),
  setTimeOfDay: (v) => set({ timeOfDay: v }),
  setSimulationSpeed: (v) => set({ simulationSpeed: v }),
  setSimulationDensity: (v) => set({ simulationDensity: v }),
  setEventPhase: (phase) => {
    const timeMap: Record<EventPhase, number> = {
      setup: 10,
      welcome: 18,
      main: 20,
      party: 23,
      closing: 2
    };
    set({ 
      eventPhase: phase, 
      timeOfDay: timeMap[phase],
      showChronosFlow: phase !== 'setup',
      showAcousticHeatmap: phase === 'party' || phase === 'main',
      simulationRunning: phase !== 'setup'
    });
  },
  setEnableAutoAIAdjust: (v) => set({ enableAutoAIAdjust: v }),
  updateAgents: (agents) => set({ agents }),

  updatePeer: (id, data) => set((state) => ({
    peers: {
      ...state.peers,
      [id]: { ...(state.peers[id] || {}), ...data }
    }
  })),
  
  removePeer: (id) => set((state) => {
    const newPeers = { ...state.peers };
    delete newPeers[id];
    return { peers: newPeers };
  })
}));
