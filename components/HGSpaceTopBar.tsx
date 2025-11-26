import React from 'react';
import { Mic, Play, ZoomIn, ZoomOut, RotateCcw, Box, Move, RotateCw, Copy, Lock, Ungroup, Monitor, Maximize, Tent, Utensils, Armchair, Sun, Square, Users, Lightbulb, Sparkles, Map as MapIcon, Moon } from 'lucide-react';
import { useInteractiveStore } from '../store/useInteractiveStore';
import { usePlannerStore, Guest } from '../store/usePlannerStore';
import { nanoid } from 'nanoid';

interface HGSpaceTopBarProps {
  aiText: string;
  setAiText: (text: string) => void;
  onMic: () => void;
  onExecute: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggle3D: () => void;
  is3D: boolean;
  onToggleCatalog: () => void;
  onToggleRules: () => void;
  
  width: number | "";
  length: number | "";
  height: number | "";
  setWidth: (v: number | "") => void;
  setLength: (v: number | "") => void;
  setHeight: (v: number | "") => void;
  onGenerateSalon: () => void;
  
  onToggleNightMode: () => void;
  isNightMode: boolean;
}

export default function HGSpaceTopBar({
  aiText, setAiText, onMic, onExecute,
  onZoomIn, onZoomOut, onReset,
  onToggle3D, is3D,
  onToggleCatalog, onToggleRules,
  width, setWidth, length, setLength, height, setHeight, onGenerateSalon,
  onToggleNightMode, isNightMode
}: HGSpaceTopBarProps) {
  const { mode, setMode } = useInteractiveStore();
  const { addArea, setGuests, items, guests } = usePlannerStore();

  const handleAddArea = (type: "carpa" | "terraza" | "cocina" | "lounge") => {
    const configs = {
      carpa: { w: 12, h: 15, color: '#22c55e' },
      terraza: { w: 15, h: 8, color: '#a855f7' },
      cocina: { w: 8, h: 6, color: '#f97316' },
      lounge: { w: 10, h: 10, color: '#db2777' }
    };
    const cfg = configs[type];

    addArea({
      id: nanoid(),
      name: type.toUpperCase(),
      type: type as any,
      width: cfg.w,
      height: cfg.h,
      x: 2500 + Math.random() * 100, 
      y: 2500 + Math.random() * 100,
      rotation: 0,
      color: cfg.color
    });
  };

  return (
    <div className="relative w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 z-[2000] shadow-2xl pointer-events-auto h-auto flex flex-col">
      
      {/* UPPER DECK: AI & Main Controls */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-white/5 gap-4">
        
        {/* Interaction Modes */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
           {['move', 'rotate', 'duplicate', 'lock'].map(m => (
             <button 
               key={m}
               onClick={() => setMode(m as any)} 
               className={`hg-btn neon p-2 rounded-lg ${mode === m ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400'}`}
               title={m.toUpperCase()}
             >
               {m === 'move' && <Move size={16}/>}
               {m === 'rotate' && <RotateCw size={16}/>}
               {m === 'duplicate' && <Copy size={16}/>}
               {m === 'lock' && <Lock size={16}/>}
             </button>
           ))}
        </div>

        {/* AI Command Center */}
        <div className="flex-1 max-w-2xl flex items-center gap-2 mx-auto">
          <button onClick={onMic} className="hg-btn primary p-3 rounded-xl animate-pulse hover:animate-none shadow-lg shadow-red-900/20">
             <Mic size={20} />
          </button>
          <input 
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="Describe your event (e.g., 'Wedding setup for 200 pax with gold chairs')"
            className="flex-1 hg-input bg-black/60 border-white/10 text-white placeholder-gray-500 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && onExecute()}
          />
          <button onClick={onExecute} className="hg-btn neon p-3 rounded-xl text-[#D4AF37]">
             <Sparkles size={20} />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
           <button onClick={onToggle3D} className={`hg-btn neon p-2 ${is3D ? 'text-[#D4AF37] border-[#D4AF37]' : ''}`} title="3D View">
              <Box size={18} />
           </button>
           <button onClick={onToggleNightMode} className={`hg-btn neon p-2 ${isNightMode ? 'text-blue-400' : ''}`} title="Night Mode">
              {isNightMode ? <Moon size={18} /> : <Sun size={18} />}
           </button>
           <div className="w-px h-6 bg-white/10 mx-1" />
           <button onClick={onZoomOut} className="hg-btn neon p-2"><ZoomOut size={18} /></button>
           <button onClick={onZoomIn} className="hg-btn neon p-2"><ZoomIn size={18} /></button>
        </div>
      </div>

      {/* LOWER DECK: Quick Areas & Salon Config */}
      <div className="flex flex-wrap items-center justify-between px-6 py-2 bg-black/60 gap-4 text-sm">
        
        {/* Quick Add Areas */}
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Add:</span>
           <button onClick={() => handleAddArea("carpa")} className="hg-btn neon-green px-3 py-1 text-xs flex items-center gap-1"><Tent size={12}/> Carpa</button>
           <button onClick={() => handleAddArea("terraza")} className="hg-btn neon-purple px-3 py-1 text-xs flex items-center gap-1"><Sun size={12}/> Terraza</button>
           <button onClick={() => handleAddArea("cocina")} className="hg-btn neon-orange px-3 py-1 text-xs flex items-center gap-1"><Utensils size={12}/> Cocina</button>
           <button onClick={() => handleAddArea("lounge")} className="hg-btn neon-pink px-3 py-1 text-xs flex items-center gap-1"><Armchair size={12}/> Lounge</button>
        </div>

        {/* Salon Generator */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
           <div className="flex items-center gap-1 px-2">
              <span className="text-gray-500 text-xs">W:</span>
              <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-12 bg-transparent text-white border-b border-white/20 text-center outline-none" placeholder="30"/>
           </div>
           <div className="flex items-center gap-1 px-2">
              <span className="text-gray-500 text-xs">L:</span>
              <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-12 bg-transparent text-white border-b border-white/20 text-center outline-none" placeholder="28"/>
           </div>
           <button 
             onClick={onGenerateSalon}
             disabled={!width || !length}
             className="hg-btn primary px-4 py-1 text-xs font-bold rounded-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
           >
             GENERATE SALON
           </button>
        </div>

        {/* Utility Toggles */}
        <div className="flex items-center gap-2">
           <button onClick={onToggleCatalog} className="hg-btn neon px-3 py-1 text-xs flex gap-2 items-center">
              <Square size={12} /> Gallery
           </button>
           <button onClick={onToggleRules} className="hg-btn neon px-3 py-1 text-xs flex gap-2 items-center">
              <MapIcon size={12} /> Grid
           </button>
        </div>

      </div>
    </div>
  );
}