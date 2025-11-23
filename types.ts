export enum View {
  DASHBOARD = 'DASHBOARD',
  LIVE_VOICE = 'LIVE_VOICE',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  CINEMA_VEO = 'CINEMA_VEO',
  ATLAS_MAPS = 'ATLAS_MAPS',
  EVENT_PLANNER = 'EVENT_PLANNER'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[]; // Base64 strings
  groundingUrls?: { uri: string; title: string }[];
  timestamp: number;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  // Augment the existing Window interface
  interface Window {
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
    webkitSpeechRecognition: any;
  }
}

export enum ProcessingState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}