import { create } from "zustand";

export type InteractionMode = "move" | "rotate" | "duplicate" | "lock" | "group";

interface InteractiveState {
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
}

export const useInteractiveStore = create<InteractiveState>((set) => ({
  mode: "move",
  setMode: (mode) => set({ mode }),
}));