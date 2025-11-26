import React, { useState } from "react";
import { usePlannerStore } from "../../store/usePlannerStore";
import { ChevronLeft, Circle, Armchair, Music, Layers, Utensils, X, Sparkles, Upload, Mic, Sofa, Lamp } from "lucide-react";
import { nanoid } from "nanoid";

export default function CatalogPanel() {
  const [open, setOpen] = useState(true);
  const { addItem } = usePlannerStore(); 
  
  const handleAdd = (item: any) => {
    let category = item.category || 'decor';
    let type = item.type || 'mueble';
    
    // Smart Type Mapping
    if (type === 'table') category = 'mesas';
    if (type === 'chair') category = 'sillas';
    if (type === 'dance') category = 'pistas';
    if (type === 'stage') category = 'escenarios';
    if (type === 'bar') category = 'estaciones';

    addItem({
        id: nanoid(),
        name: item.label,
        w: item.w,
        h: item.h,
        size: Math.max(item.w, item.h),
        // Place in visible area center-ish
        x: 2500 + (Math.random() * 200 - 100),
        y: 2500 + (Math.random() * 200 - 100),
        rotation: 0,
        type: type,
        category: category,
        color: item.color || "#ffffff",
        locked: false,
        tier: item.tier || "standard"
    });
  };

  const catalogData: Record<string, any[]> = {
    "Mobiliario": [
        { id: "r6", label: "Redonda 6px", w: 120, h: 120, type: "table", icon: <Circle size={14}/>, color: "#e2e8f0" },
        { id: "r8", label: "Redonda 8px", w: 150, h: 150, type: "table", icon: <Circle size={14}/>, color: "#e2e8f0" },
        { id: "r10", label: "Redonda 10px", w: 180, h: 180, type: "table", icon: <Circle size={14}/>, color: "#e2e8f0" },
        { id: "imp6", label: "Imperial 6m", w: 600, h: 120, type: "table", icon: <Circle size={14}/>, color: "#cbd5e1" },
        { id: "rect2", label: "Rectangular 2.4", w: 240, h: 100, type: "table", icon: <Circle size={14}/>, color: "#cbd5e1" },
    ],
    "Sillas & Lounge": [
        { id: "s1", label: "Tiffany Blanca", w: 45, h: 45, type: "chair", icon: <Armchair size={14}/>, color: "#fff" },
        { id: "s2", label: "Versalles Oro", w: 45, h: 45, type: "chair", icon: <Armchair size={14}/>, color: "#D4AF37", tier: "premium" },
        { id: "s3", label: "Crossback", w: 45, h: 45, type: "chair", icon: <Armchair size={14}/>, color: "#8B4513" },
        { id: "l1", label: "Sillón Lounge", w: 80, h: 80, type: "chair", icon: <Sofa size={14}/>, color: "#f472b6", tier: "premium" },
    ],
    "Estructuras": [
        { id: "p1", label: "Pista Madera", w: 600, h: 600, type: "dance", icon: <Music size={14}/>, color: "#5C4033" },
        { id: "p2", label: "Pista LED", w: 800, h: 800, type: "dance", icon: <Music size={14}/>, color: "#111", tier: "ultra" },
        { id: "e1", label: "Escenario", w: 600, h: 400, type: "stage", icon: <Layers size={14}/>, color: "#333" },
        { id: "b1", label: "Barra Circular", w: 400, h: 400, type: "bar", icon: <Utensils size={14}/>, color: "#D4AF37", tier: "premium" },
    ],
  };

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)} 
        className="fixed right-0 top-32 bg-[#D4AF37] text-black p-3 rounded-l-xl shadow-[0_0_25px_rgba(197,162,83,0.5)] hover:pl-5 transition-all z-[9999] hg-btn pointer-events-auto cursor-pointer"
      >
        <ChevronLeft size={24} />
      </button>
    );
  }

  return (
    <div className="fixed right-6 top-36 bottom-24 w-80 hg-card rounded-2xl flex flex-col z-[9999] animate-in slide-in-from-right-10 duration-300 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-[#5A0F1B]/40 to-transparent rounded-t-2xl pointer-events-auto">
        <div className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles size={18} />
            <h2 className="font-display font-bold tracking-widest text-sm">HG GALLERY</h2>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors pointer-events-auto cursor-pointer">
          <X size={20} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-white/10 bg-black/20 pointer-events-auto">
          <button className="flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] hover:bg-[#D4AF37]/10 border border-white/5 hover:border-[#D4AF37]/30 rounded-xl text-xs text-gray-300 transition-all hg-btn group">
              <Mic size={14} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span>AI Voice</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] hover:bg-[#D4AF37]/10 border border-white/5 hover:border-[#D4AF37]/30 rounded-xl text-xs text-gray-300 transition-all hg-btn group">
              <Upload size={14} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span>Upload</span>
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 p-5 pointer-events-auto">
        {Object.entries(catalogData).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
               <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span> 
               {category}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAdd(item)}
                  className={`hg-btn neon flex flex-col items-center justify-center p-3 group relative overflow-hidden pointer-events-auto hover:-translate-y-1 transition-all
                    ${item.tier === 'premium' ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5' : ''}
                    ${item.tier === 'ultra' ? 'border-purple-500/30 bg-purple-500/5' : ''}
                  `}
                >
                  {/* Shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  
                  <div className={`mb-2 transition-transform group-hover:scale-110 relative z-10 ${item.tier ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] text-gray-200 text-center font-medium leading-tight relative z-10">{item.label}</span>
                  <span className="text-[8px] text-gray-500 mt-1 font-mono relative z-10">{item.w}×{item.h}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-center bg-black/40 rounded-b-2xl pointer-events-auto backdrop-blur-md">
         <span className="text-[9px] text-[#D4AF37]/70 uppercase tracking-widest font-mono">Pro Collection v4.0</span>
      </div>
    </div>
  );
}