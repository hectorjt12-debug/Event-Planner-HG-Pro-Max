import React from "react";
import { usePlannerStore } from "../../store/usePlannerStore";
import { nanoid } from "nanoid";
import { Trash2, Copy, Move, RotateCw, Lock, Unlock } from "lucide-react";

export function PropertiesPanel() {
  const selected = usePlannerStore((s) => s.selected);
  const update = usePlannerStore((s) => s.updateItem);
  const remove = usePlannerStore((s) => s.removeItem);
  const addItem = usePlannerStore((s) => s.addItem);

  if (!selected) return null;

  const handleDuplicate = () => {
      const { id, ...rest } = selected;
      addItem({
          ...rest,
          id: nanoid(),
          x: selected.x + 20,
          y: selected.y + 20
      });
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 hg-card z-50 w-[380px] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto flex flex-col gap-3">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h2 className="text-[#C9A227] font-bold font-display tracking-wider text-sm uppercase">
            {selected.name}
        </h2>
        <span className="text-[10px] text-gray-500 font-mono">{selected.id.slice(0,6)}</span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
          <button onClick={handleDuplicate} className="flex flex-col items-center justify-center p-2 bg-gray-900/50 hover:bg-[#C9A227]/10 rounded-lg group transition-colors" title="Duplicar">
             <Copy size={16} className="text-gray-400 group-hover:text-[#C9A227]" />
          </button>
          <button onClick={() => update(selected.id, { rotation: (selected.rotation || 0) + 45 })} className="flex flex-col items-center justify-center p-2 bg-gray-900/50 hover:bg-[#C9A227]/10 rounded-lg group transition-colors" title="Rotar +45">
             <RotateCw size={16} className="text-gray-400 group-hover:text-[#C9A227]" />
          </button>
          <button onClick={() => update(selected.id, { locked: !selected.locked })} className="flex flex-col items-center justify-center p-2 bg-gray-900/50 hover:bg-[#C9A227]/10 rounded-lg group transition-colors" title={selected.locked ? "Desbloquear" : "Bloquear"}>
             {selected.locked ? <Lock size={16} className="text-red-400" /> : <Unlock size={16} className="text-gray-400 group-hover:text-[#C9A227]" />}
          </button>
          <button onClick={() => remove(selected.id)} className="flex flex-col items-center justify-center p-2 bg-red-900/20 hover:bg-red-900/40 rounded-lg group transition-colors" title="Eliminar">
             <Trash2 size={16} className="text-red-400 group-hover:text-red-200" />
          </button>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3">
         <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold">Ancho</label>
            <input 
                type="number" 
                value={selected.w || selected.size} 
                onChange={(e) => update(selected.id, { w: Number(e.target.value) })}
                className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-[#C9A227] outline-none"
            />
         </div>
         <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold">Alto</label>
            <input 
                type="number" 
                value={selected.h || selected.size} 
                onChange={(e) => update(selected.id, { h: Number(e.target.value) })}
                className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-[#C9A227] outline-none"
            />
         </div>
      </div>
      
      {/* Color */}
      <div>
         <label className="text-[10px] text-gray-500 uppercase font-bold">Color</label>
         <div className="flex gap-2 mt-1">
             {['#ffffff', '#000000', '#C9A227', '#5A0F1B', '#22c55e'].map(c => (
                 <button 
                    key={c}
                    onClick={() => update(selected.id, { color: c })}
                    className={`w-6 h-6 rounded-full border border-white/20 ${selected.color === c ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                 />
             ))}
             <input 
                type="color" 
                value={selected.color || "#ffffff"}
                onChange={(e) => update(selected.id, { color: e.target.value })}
                className="w-6 h-6 bg-transparent border-none p-0 rounded-full overflow-hidden cursor-pointer"
             />
         </div>
      </div>

    </div>
  );
}