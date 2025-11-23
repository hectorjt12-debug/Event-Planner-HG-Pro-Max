import React from 'react';
import { Mic, Play, ZoomIn, ZoomOut, RotateCcw, Box, Move, RotateCw, Copy, Lock, Ungroup, Monitor, Maximize, Tent, Utensils, Armchair, Sun, Square, Users, Lightbulb } from 'lucide-react';
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
    let w = 6;
    let h = 6;
    let color = '#64748b';
    
    if (type === 'carpa') { w = 12; h = 15; color = '#22c55e'; }
    if (type === 'terraza') { w = 15; h = 8; color = '#a855f7'; }
    if (type === 'cocina') { w = 8; h = 6; color = '#f97316'; }
    if (type === 'lounge') { w = 10; h = 10; color = '#db2777'; }

    const wVal = w; // meters
    const hVal = h; // meters

    addArea({
      id: nanoid(),
      name: type.toUpperCase(),
      type: type as any,
      width: wVal,
      height: hVal,
      x: 2500, 
      y: 2500,
      rotation: 0,
      color: color
    });
  };

  const simulateCrowd = () => {
      if (guests.length > 0) {
          setGuests([]); // Toggle off
          return;
      }

      const newGuests: Guest[] = [];
      
      items.forEach(item => {
          if (item.category === 'sillas' || item.type === 'chair') {
              newGuests.push({
                  id: nanoid(),
                  x: item.x,
                  y: item.y,
                  color: '#ffffff'
              });
          }
          if (item.category === 'pistas' || item.type === 'dance') {
              const count = Math.floor((item.w * item.h) / 4000); 
              for(let i=0; i<count; i++) {
                  newGuests.push({
                      id: nanoid(),
                      x: item.x + (Math.random() * item.w - item.w/2),
                      y: item.y + (Math.random() * item.h - item.h/2),
                      color: Math.random() > 0.5 ? '#D4AF37' : '#ffffff'
                  });
              }
          }
      });

      setGuests(newGuests);
  };

  return (
    <div className="flex flex-col w-full bg-[#050505] border-b border-white/10 z-[9999] relative shadow-2xl pb-1 select-none pointer-events-auto">
      
      {/* ROW 1: AI & GLOBAL TOOLS */}
      <div className="relative flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-md border-b border-white/5 h-20 pointer-events-auto">
        
        {/* LEFT: INTERACTION TOOLS */}
        <div className="flex items-center gap-2 pointer-events-auto relative z-50">
           <div className="flex bg-gray-900/50 rounded-xl p-1 gap-1 border border-white/10 pointer-events-auto">
              <button onClick={() => setMode('move')} className={`hg-btn neon ${mode === 'move' ? 'active' : ''}`} title="Mover"><Move size={18}/></button>
              <button onClick={() => setMode('rotate')} className={`hg-btn neon ${mode === 'rotate' ? 'active' : ''}`} title="Rotar"><RotateCw size={18}/></button>
              <button onClick={() => setMode('duplicate')} className={`hg-btn neon ${mode === 'duplicate' ? 'active' : ''}`} title="Duplicar"><Copy size={18}/></button>
              <button onClick={() => setMode('lock')} className={`hg-btn neon ${mode === 'lock' ? 'active' : ''}`} title="Bloquear"><Lock size={18}/></button>
              <button onClick={() => setMode('group')} className={`hg-btn neon ${mode === 'group' ? 'active' : ''}`} title="Agrupar"><Ungroup size={18}/></button>
           </div>
        </div>

        {/* CENTER: AI COMMAND CABIN */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 z-50 pointer-events-auto">
          <button onClick={onMic} className="hg-btn primary shadow-lg" title="Comando de Voz">
             <Mic size={20} />
          </button>
          <div className="relative pointer-events-auto">
            <input 
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Instrucciones IA (ej. Agrega 10 mesas)..." 
                onKeyDown={(e) => e.key === 'Enter' && onExecute()}
                className="hg-input w-96 shadow-inner pointer-events-auto"
            />
            <button onClick={onExecute} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C9A227] hover:text-white transition-colors pointer-events-auto cursor-pointer">
                <Play size={16} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* RIGHT: VIEW CONTROLS */}
        <div className="flex items-center gap-3 pointer-events-auto relative z-50">
           <button onClick={onToggle3D} className={`hg-btn ${is3D ? 'primary' : 'neon'}`}>
             <Box size={20} /> <span className="text-xs">{is3D ? "3D ON" : "2D"}</span>
           </button>
           <div className="flex bg-gray-900 rounded-xl border border-gray-700 overflow-hidden pointer-events-auto">
             <button onClick={onZoomOut} className="p-3 hover:bg-gray-800 border-r border-gray-700 transition-colors text-gray-400 hover:text-white hg-btn"><ZoomOut size={20} /></button>
             <button onClick={onZoomIn} className="p-3 hover:bg-gray-800 transition-colors text-gray-400 hover:text-white hg-btn"><ZoomIn size={20} /></button>
           </div>
           <button onClick={onReset} className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl border border-transparent hover:border-red-900/50 transition-all hg-btn"><RotateCcw size={20} /></button>
        </div>
      </div>

      {/* ROW 2: GENERATOR & QUICK ACTIONS */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0a0a0a] pointer-events-auto relative z-40">
        
        {/* GENERAR SALON FIX */}
        <div className="flex items-center justify-center gap-4 py-2 px-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-[#C9A227]/30 hover:border-[#C9A227]/60 transition-colors group pointer-events-auto">
          
          <div className="flex flex-col text-[#C9A227] pointer-events-auto">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 text-center">Ancho (m)</label>
            <input
              type="number"
              value={width === "" ? "" : width}
              onChange={(e) => setWidth(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="hg-input text-center text-lg w-20 pointer-events-auto"
              min="1"
            />
          </div>

          <div className="flex flex-col text-[#C9A227] pointer-events-auto">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 text-center">Largo (m)</label>
            <input
              type="number"
              value={length === "" ? "" : length}
              onChange={(e) => setLength(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="hg-input text-center text-lg w-20 pointer-events-auto"
              min="1"
            />
          </div>

          <button 
            onClick={onGenerateSalon}
            className="hg-btn primary h-[50px] mt-auto ml-4 px-6 pointer-events-auto"
          >
            <Square size={18} />
            GENERAR
          </button>
        </div>

        {/* QUICK AREAS - FIXED BUTTONS */}
        <div className="flex items-center gap-3 ml-8 pointer-events-auto">
             <button onClick={() => handleAddArea("carpa")} className="hg-btn neon-green flex-col w-16 h-16 hover:scale-105 active:scale-95 pointer-events-auto"><Tent size={16}/> <span className="text-[9px]">CARPA</span></button>
             <button onClick={() => handleAddArea("terraza")} className="hg-btn neon-purple flex-col w-16 h-16 hover:scale-105 active:scale-95 pointer-events-auto"><Sun size={16}/> <span className="text-[9px]">TERRAZA</span></button>
             <button onClick={() => handleAddArea("cocina")} className="hg-btn neon-orange flex-col w-16 h-16 hover:scale-105 active:scale-95 pointer-events-auto"><Utensils size={16}/> <span className="text-[9px]">COCINA</span></button>
             <button onClick={() => handleAddArea("lounge")} className="hg-btn neon-pink flex-col w-16 h-16 hover:scale-105 active:scale-95 pointer-events-auto"><Armchair size={16}/> <span className="text-[9px]">LOUNGE</span></button>
        </div>

        <div className="flex-1" />

        {/* GOD MODE FEATURES */}
        <div className="flex items-center gap-3 mr-4 border-r border-white/10 pr-4 pointer-events-auto">
            <button onClick={simulateCrowd} className={`hg-btn ${guests.length > 0 ? 'primary' : 'neon'} flex-col h-16 w-16 pointer-events-auto`} title="Simular Invitados">
                <Users size={20} />
                <span className="text-[8px] mt-1">CROWD SIM</span>
            </button>
             <button onClick={onToggleNightMode} className={`hg-btn ${isNightMode ? 'primary' : 'neon'} flex-col h-16 w-16 pointer-events-auto`} title="Modo Neón">
                <Lightbulb size={20} />
                <span className="text-[8px] mt-1">NEON BLUEPRINT</span>
            </button>
        </div>

        {/* SIDEBAR TOGGLES */}
        <div className="flex items-center gap-3 pointer-events-auto">
            <button onClick={onToggleCatalog} className="hg-btn neon h-14 pointer-events-auto">
               <Monitor size={18} /> <span className="text-xs uppercase">Galería</span>
            </button>
             <button onClick={onToggleRules} className="hg-btn neon h-14 pointer-events-auto">
               <Maximize size={18} /> <span className="text-xs uppercase">Reglas</span>
            </button>
        </div>

      </div>
    </div>
  );
}