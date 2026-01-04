
import React from 'react';
import { Mic, Play, ZoomIn, ZoomOut, Box, Move, RotateCw, Copy, Lock, Sparkles, Map as MapIcon, Moon, Sun, Volume2, Clock, Users, Pause, CalendarDays, FastForward } from 'lucide-react';
import { useInteractiveStore } from '../store/useInteractiveStore';
import { usePlannerStore, EventPhase } from '../store/usePlannerStore';
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
  const { 
    addArea, 
    showAcousticHeatmap, setShowAcousticHeatmap,
    showChronosFlow, setShowChronosFlow,
    simulationRunning, toggleSimulation,
    autoTimeline, toggleAutoTimeline,
    timeOfDay, setTimeOfDay,
    themeMode, setThemeMode,
    eventPhase, setEventPhase,
    simulationDensity, setSimulationDensity
  } = usePlannerStore();

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

  const phases: {id: EventPhase, label: string}[] = [
    { id: 'setup', label: 'Montaje' },
    { id: 'welcome', label: 'Bienvenida' },
    { id: 'main', label: 'Cena' },
    { id: 'party', label: 'Fiesta' },
    { id: 'closing', label: 'Cierre' }
  ];

  return (
    <div className="relative w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 z-[2000] shadow-2xl pointer-events-auto h-auto flex flex-col">
      
      {/* 4D CONTROL DECK: Time & Phases */}
      <div className="flex items-center justify-between px-6 py-2 bg-[#5A0F1B]/15 border-b border-white/5 overflow-x-auto no-scrollbar">
         <div className="flex items-center gap-4 min-w-max">
            <div className="flex items-center gap-2 mr-2">
               <button 
                  onClick={toggleAutoTimeline} 
                  className={`p-2 rounded-full transition-all ${autoTimeline ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-pulse' : 'bg-white/5 text-gray-500'}`}
                  title="Play 4D Simulation"
               >
                  {autoTimeline ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
               </button>
               <span className="text-[#D4AF37] font-display font-bold text-[10px] tracking-[0.2em] hidden sm:block">4D CHRONOS</span>
            </div>
            
            <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
               {phases.map(p => (
                 <button 
                   key={p.id}
                   onClick={() => setEventPhase(p.id)}
                   className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-widest ${eventPhase === p.id ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                    {p.label}
                 </button>
               ))}
            </div>

            <div className="h-4 w-px bg-white/10 mx-2" />

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                  <Clock size={12} className="text-blue-400" />
                  <span className="text-[10px] font-mono text-gray-300">{String(Math.floor(timeOfDay)).padStart(2, '0')}:00</span>
               </div>
               <div className="flex items-center gap-2">
                  <Users size={12} className="text-green-400" />
                  <input 
                    type="range" min="0" max="200" step="10" 
                    value={simulationDensity} onChange={(e) => setSimulationDensity(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4 ml-4 min-w-max">
            <button 
               onClick={() => setShowAcousticHeatmap(!showAcousticHeatmap)}
               className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] uppercase font-bold tracking-widest transition-all ${showAcousticHeatmap ? 'border-red-500 text-red-400 bg-red-900/20' : 'border-white/5 text-gray-500'}`}
            >
               <Volume2 size={12} /> Acoustic
            </button>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Style</span>
               <select 
                  value={themeMode} 
                  onChange={(e) => setThemeMode(e.target.value as any)}
                  className="bg-black/50 border border-white/10 text-[#D4AF37] rounded-md px-2 py-0.5 outline-none text-[10px] font-bold uppercase"
               >
                  <option value="luxury">Luxury</option>
                  <option value="blueprint">Blueprint</option>
                  <option value="cyberpunk">Cyberpunk</option>
                  <option value="watercolor">Watercolor</option>
               </select>
            </div>
         </div>
      </div>

      {/* COMMAND DECK: AI & Core Tools */}
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
          <button onClick={onMic} className="hg-btn primary p-3 rounded-xl animate-pulse hover:animate-none shadow-lg shadow-[#5A0F1B]/20">
             <Mic size={20} />
          </button>
          <input 
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="AI Command: 'Simulate full cycle', 'Arrange party layout'..."
            className="flex-1 hg-input bg-black/60 border-white/10 text-white placeholder-gray-500 text-sm font-display"
            onKeyDown={(e) => e.key === 'Enter' && onExecute()}
          />
          <button onClick={onExecute} className="hg-btn neon p-3 rounded-xl text-[#D4AF37] hover:scale-105 transition-all">
             <Sparkles size={20} />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
           <button onClick={onToggle3D} className={`hg-btn neon p-2 group transition-all ${is3D ? 'text-[#D4AF37] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : ''}`} title="Toggle 3D Perspective">
              <Box size={18} className={is3D ? 'rotate-12' : ''} />
           </button>
           <button onClick={onToggleNightMode} className={`hg-btn neon p-2 ${isNightMode ? 'text-blue-400 border-blue-900' : ''}`} title="Quick Night Toggle">
              {isNightMode ? <Moon size={18} /> : <Sun size={18} />}
           </button>
           <div className="w-px h-6 bg-white/10 mx-1" />
           <button onClick={onZoomOut} className="hg-btn neon p-2"><ZoomOut size={18} /></button>
           <button onClick={onZoomIn} className="hg-btn neon p-2"><ZoomIn size={18} /></button>
        </div>
      </div>

      {/* QUICK ACTIONS DECK */}
      <div className="flex flex-wrap items-center justify-between px-6 py-2 bg-black/60 gap-4 text-sm">
        <div className="flex items-center gap-3">
           <button onClick={() => handleAddArea("carpa")} className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">+ Carpa</button>
           <button onClick={() => handleAddArea("terraza")} className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors">+ Terraza</button>
           <button onClick={() => handleAddArea("cocina")} className="text-[10px] font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors">+ Cocina</button>
           <button onClick={() => handleAddArea("lounge")} className="text-[10px] font-bold uppercase tracking-widest text-pink-400 hover:text-pink-300 transition-colors">+ Lounge</button>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5">
              <span className="text-[9px] text-gray-500 font-mono uppercase">Venue</span>
              <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-8 bg-transparent text-[#D4AF37] text-center outline-none text-xs font-bold" placeholder="30"/>
              <span className="text-gray-700">×</span>
              <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-8 bg-transparent text-[#D4AF37] text-center outline-none text-xs font-bold" placeholder="28"/>
              <button onClick={onGenerateSalon} className="ml-2 text-[10px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-500 transition-all">GEN</button>
           </div>
           <button onClick={onToggleCatalog} className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">Catalog</button>
           <button onClick={onToggleRules} className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">Grid</button>
        </div>
      </div>
    </div>
  );
}
