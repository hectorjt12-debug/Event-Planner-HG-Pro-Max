import { create } from 'zustand';
import { View } from './types';

interface AppState {
  currentView: View;
  setView: (view: View) => void;
}

export const useViewState = create<AppState>((set) => ({
  currentView: View.DASHBOARD,
  setView: (v: View) => {
    if (!Object.values(View).includes(v)) return;
    set({ currentView: v });
  }
}));