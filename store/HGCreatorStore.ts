import { create } from "zustand";

export interface GeneratedItem {
  id: string;
  category: string;
  label?: string;
  style: string;
  capacity?: number;
  shape?: string;
  material?: string;
  color?: string;
  seats?: number;
  tier: string;
  imageReal: string;
  vector2D: string;
  createdAt: number;
}

interface HGCreatorState {
  statusLevel: string; // diamond | gold | silver | bronze
  setStatusLevel: (lvl: string) => void;
  generatedItems: GeneratedItem[];
  addGeneratedItem: (item: GeneratedItem) => void;
  clearGenerated: () => void;
  generateFurniture: (payload: any) => Promise<GeneratedItem>;
  createTableIA: (payload: any) => Promise<GeneratedItem>;
  createChairIA: (payload: any) => Promise<GeneratedItem>;
  createLoungeIA: (payload: any) => Promise<GeneratedItem>;
}

export const useHGCreatorStore = create<HGCreatorState>((set, get) => ({

  statusLevel: "diamond", 

  setStatusLevel: (lvl) => set({ statusLevel: lvl }),

  generatedItems: [],

  addGeneratedItem: (item) =>
    set((s) => ({
      generatedItems: [...s.generatedItems, { ...item, id: crypto.randomUUID() }],
    })),

  clearGenerated: () =>
    set({
      generatedItems: [],
    }),

  // Motor de IA para generar objeto REAL
  generateFurniture: async (payload) => {
    const tier = get().statusLevel;

    // payload: { category, style, capacity, shape, material }

    return {
      id: crypto.randomUUID(),
      tier,
      category: payload.category,
      label: payload.label || "HG Item",
      style: payload.style,
      capacity: payload.capacity,
      shape: payload.shape,
      material: payload.material,
      imageReal: "",  // IA generará aquí la foto real
      vector2D: "",   // SVG 2D generado automático
      createdAt: Date.now(),
    };
  },

  // Crear mesa via IA
  createTableIA: async ({
    shape = "round",
    capacity = 10,
    style = "luxury",
    material = "acrylic",
  }) => {
    const tier = get().statusLevel;

    return {
      id: crypto.randomUUID(),
      category: "table",
      shape,
      capacity,
      style,
      tier,
      material,
      imageReal: "",
      vector2D: "",
      createdAt: Date.now(),
    };
  },

  // Crear silla via IA
  createChairIA: async ({
    style = "luxury",
    material = "crystal",
    color = "white",
  }) => {
    const tier = get().statusLevel;
    return {
      id: crypto.randomUUID(),
      category: "chair",
      style,
      tier,
      color,
      material,
      imageReal: "",
      vector2D: "",
      createdAt: Date.now(),
    };
  },

  // Crear Lounge IA
  createLoungeIA: async ({
    style = "futuristic",
    seats = 4,
    material = "acrylic",
  }) => {
    const tier = get().statusLevel;
    return {
      id: crypto.randomUUID(),
      category: "lounge",
      style,
      seats,
      material,
      tier,
      imageReal: "",
      vector2D: "",
      createdAt: Date.now(),
    };
  },
}));