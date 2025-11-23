import React, { useState } from "react";
import { usePlannerStore } from "../../store/usePlannerStore";
import { ChevronLeft, Circle, Armchair, Music, Layers, Utensils, X, Sparkles, Upload, Mic } from "lucide-react";
import { nanoid } from "nanoid";

export default function CatalogPanel() {
  const [open, setOpen] = useState(true);
  const { addItem } = usePlannerStore(); 
  
  const handleAdd = (item: any) => {
    let category = item.category || 'decor';
    let type = item.type || 'mueble';
    
    if (type === 'table') category = 'mesas';
    if (type === 'chair') category = 'sillas';
    if (type === 'dance') category = 'pistas';
    if (type === 'stage') category = 'escenarios';
    if (type === 'bar') category = 'estaciones';

    const color = item.color || (type === 'table' ? '#444' : '#ffffff'); 
    
    addItem({
        id: nanoid(),
        name: item.label,
        w: item.w,
        h: item.h,
        size: Math.max(item.w, item.h),
        x: 2500 + (Math.random() * 100 - 50),
        y: 2500 + (Math.random() * 100 - 50),
        rotation: 0,
        type: type,
        category: category,
        color: color,
        locked: false
    });
  };

  const catalogData: Record<string, any[]> = {
    "Mesas & Mobiliario": [
        { id: "r6", label: "Redonda 6px", w: 120, h: 120, type: "table", icon: <Circle size={14}/>, color: "#444" },
        { id: "r8", label: "Redonda 8px", w: 150, h: 150, type: "table", icon: <Circle size={14}/>, color: "#444" },
        { id: "r10", label: "Redonda 10px", w: 180, h: 180, type: "table", icon: <Circle size={14}/>, color: "#444" },
        { id: "imp6", label: "Imperial 6m", w: 600, h: 120, type: "table", icon: <Circle size={14}/>, color: "#444" },
        { id: "rect2", label: "Rectangular 2.4m", w: 240, h: 100, type: "table", icon: <Circle size={14}/>, color: "#444" },
    ],
    "Sillas Premium": [
        { id: "s1", label: "Tiffany Blanca", w: 45, h: 45, type: "chair", icon: <Armchair size={14}/> },
        { id: "s2", label: "Versalles Oro", w: 45, h: 45, type: "chair", icon: <Armchair size={14}/>, color: "#C9A227" },
        { id: "s3", label: "Crossback Madera", w: 45, h: 45, type: "chair", icon: <Armchair size={14}/>, color: "#8B4513" },
    ],
    "Pista & Escenario": [
        { id: "p1", label: "Pista Madera 6x6", w: 600, h: 600, type: "dance", icon: <Music size={14}/>, color: "#5C4033" },
        { id: "p2", label: "Pista LED 8x8", w: 800, h: 800, type: "dance", icon: <Music size={14}/>, color: "#111" },
        { id: "e1", label: "Escenario 6x4", w: 600, h: 400, type: "stage", icon: <Layers size={14}/>, color: "#222" },
    ],
    "Barras & Alimentos": [
        { id: "b1", label: "Barra Circular", w: 400, h: 400, type: "bar", icon: <Utensils size={14}/>, color: "#C9A227" },
        { id: "b2", label: "Barra Rectangular", w: 300, h: 100, type: "bar", icon: <Utensils size={14}/>, color: "#222" },
    ],
  };

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)} 
        className="fixed right-0 top-24 bg-[#C9A227] text-black p-2 rounded-l-xl shadow-[0_0_20px_rgba(197,162,83,0.4)] hover:pl-4 transition-all z-[9999] hg-btn pointer-events-auto cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-48 bottom-24 w-72 bg-[#0f0f0f]/95 backdrop-blur-2xl border border-[#C9A227]/20 rounded-2xl flex flex-col z-[9999] animate-in slide-in-from-right-10 duration-300 pointer-events-auto shadow-2xl hg-card">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-[#5A0F1B]/20 to-transparent rounded-t-2xl pointer-events-auto">
        <div className="flex items-center gap-2 text-[#C9A227]">
            <Sparkles size={16} />
            <h2 className="font-display font-bold tracking-wider text-sm">GALERÍA HG</h2>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors pointer-events-auto cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* PREMIUM ACTIONS */}
      <div className="grid grid-cols-2 gap-2 p-3 border-b border-white/10 bg-black/20 pointer-events-auto">
          <button className="flex items-center justify-center gap-2 py-2 bg-[#1a1a1a] hover:bg-[#C9A227]/20 border border-white/5 rounded-lg text-xs text-gray-300 transition-colors hg-btn">
              <Mic size={14} className="text-[#C9A227]" />
              <span>Voz</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-2 bg-[#1a1a1a] hover:bg-[#C9A227]/20 border border-white/5 rounded-lg text-xs text-gray-300 transition-colors hg-btn">
              <Upload size={14} className="text-[#C9A227]" />
              <span>Subir</span>
          </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 p-4 pointer-events-auto">
        {Object.entries(catalogData).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">{category}</h3>
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAdd(item)}
                  className="hg-btn neon flex flex-col items-center justify-center p-3 group h-24 relative overflow-hidden pointer-events-auto hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <div className="mb-2 text-gray-400 group-hover:text-[#C9A227] group-hover:scale-110 transition-transform relative z-10">
                    {item.icon}
                  </div>
                  <span className="text-[10px] text-gray-300 text-center leading-tight group-hover:text-white relative z-10">{item.label}</span>
                  <span className="text-[8px] text-gray-600 mt-1 relative z-10">{item.w}x{item.h}</span>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-white/10 text-center bg-black/20 rounded-b-2xl pointer-events-auto">
         <span className="text-[9px] text-[#C9A227]/60 uppercase tracking-widest">Premium Collection v2.0</span>
      </div>
    </div>
  );
}