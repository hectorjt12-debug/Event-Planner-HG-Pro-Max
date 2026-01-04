
import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePlannerStore } from "../../store/usePlannerStore";
import { HGCoreAPI } from "../../api/HGCoreAPI";
import { NexusCanvas } from "./NexusCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import CatalogPanel from "./CatalogPanel";
import { Sparkles, Database, LayoutGrid, CloudSync, Maximize2, Mic, Settings } from "lucide-react";

export default function MapEditor() {
  const store = usePlannerStore();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: -2500, y: -2500 });
  const [is3D, setIs3D] = useState(false);
  const [aiCommand, setAiCommand] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-load project on startup
  useEffect(() => {
    store.loadCloud(store.projectId);
  }, []);

  // Stabilized Pan Logic (Mobile Friendly)
  const handleMove = useCallback((dx: number, dy: number) => {
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handleZoom = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    setScale(s => Math.min(Math.max(s * factor, 0.15), 5));
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.addEventListener("wheel", handleZoom, { passive: false });
    return () => el?.removeEventListener("wheel", handleZoom);
  }, [handleZoom]);

  const executeAI = async () => {
    if (!aiCommand.trim()) return;
    setIsProcessingAI(true);
    try {
      const result = await HGCoreAPI.analyzeLayout(aiCommand, { items: store.items, areas: store.areas });
      if (Array.isArray(result)) {
        // Apply AI suggestions
        result.forEach(item => store.addItem(item));
      }
      setAiCommand("");
    } catch (e) {
      store.setError("AI Analysis Failure");
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden flex flex-col font-sans select-none touch-none">
      
      {/* 4D DIAMOND HUD: UI LAYER */}
      <div className="hg-ui-layer">
        
        {/* Top Control Bar */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-6 pointer-events-auto border border-white/5 shadow-2xl">
            <div className="flex flex-col pr-4 border-r border-white/10">
              <span className="text-[10px] text-[#D4AF37] font-bold tracking-[0.2em] uppercase">ARKHÉ OS v4.0</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${store.isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} shadow-[0_0_8px_currentColor]`} />
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                  {store.isSyncing ? 'SYNCING NUBE...' : 'SAFE & SECURED'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIs3D(!is3D)} 
                className={`p-2.5 rounded-xl transition-all hg-btn ${is3D ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button className="p-2.5 bg-white/5 text-gray-400 hover:text-white rounded-xl border border-white/5 hg-btn"><Maximize2 size={18} /></button>
              <button className="p-2.5 bg-white/5 text-gray-400 hover:text-white rounded-xl border border-white/5 hg-btn"><Settings size={18} /></button>
            </div>
          </div>

          <div className="flex gap-4 pointer-events-auto">
             <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 border border-[#D4AF37]/20">
               <div className="flex flex-col text-right">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Master ID</span>
                  <span className="text-xs font-mono text-[#D4AF37] font-bold">{store.projectId}</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5A0F1B] to-[#D4AF37] p-[1px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold">HG</div>
               </div>
             </div>
          </div>
        </div>

        {/* PROMPT COMMANDER: DIAMOND AI BRIDGE */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 pointer-events-auto">
          <div className="glass-panel p-2 rounded-2xl flex gap-3 border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex-1 flex items-center gap-3 px-4">
               <Sparkles size={18} className={`${isProcessingAI ? 'text-blue-400 animate-spin' : 'text-[#D4AF37]'}`} />
               <input 
                value={aiCommand}
                onChange={(e) => setAiCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeAI()}
                placeholder="Ask ARKHÉ AI: 'Organize tables for 300 guests', 'Auto-layout dancefloor'..."
                className="flex-1 bg-transparent py-4 outline-none text-sm font-medium text-white placeholder-gray-600 font-display"
               />
               <button className="text-gray-500 hover:text-white transition-colors"><Mic size={18}/></button>
            </div>
            <button 
              onClick={executeAI}
              disabled={isProcessingAI || !aiCommand.trim()}
              className="hg-btn-gold px-8 h-full rounded-xl flex items-center gap-2 group disabled:opacity-30 disabled:grayscale"
            >
              <span className="text-xs uppercase tracking-widest">Execute AI</span>
            </button>
          </div>
        </div>

        {/* Error Shield Indicator */}
        {store.lastError && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md animate-bounce">
            Alert: {store.lastError}
          </div>
        )}
      </div>

      {/* NEXUS RENDER ENGINE VIEWPORT */}
      <div 
        ref={viewportRef}
        id="canvas-wrapper" 
        className="cursor-crosshair active:cursor-grabbing h-full w-full"
        onMouseDown={(e) => {
            if (e.buttons !== 1 || (e.target as HTMLElement).closest('.hg-ui-layer')) return;
            const onMouseMove = (moveE: MouseEvent) => handleMove(moveE.movementX, moveE.movementY);
            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }}
      >
        <div 
          className="will-change-transform transform-gpu"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale}) ${is3D ? 'perspective(2000px) rotateX(42deg) translateY(-250px)' : ''}`,
            transformOrigin: '0 0',
            transition: 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)',
            transformStyle: 'preserve-3d'
          }}
        >
          <NexusCanvas 
            items={store.items}
            areas={store.areas}
            selected={store.selectedId}
            onSelect={store.setSelectedId}
            onMove={store.updateItem}
            scale={scale}
            is3D={is3D}
            showGrid={true}
            isNightMode={store.timeOfDay > 18 || store.timeOfDay < 6}
          />
        </div>
      </div>

      {/* HUD SIDEBARS */}
      <div className="hg-ui-layer">
        <div className="absolute right-6 top-32 pointer-events-auto">
          <CatalogPanel />
        </div>
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-auto">
          <PropertiesPanel />
        </div>
      </div>

    </div>
  );
}
