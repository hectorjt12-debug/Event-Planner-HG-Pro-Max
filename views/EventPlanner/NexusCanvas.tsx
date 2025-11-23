import React, { useRef } from 'react';
import { PlannerItem, Area, Guest, usePlannerStore } from '../../store/usePlannerStore';
import { Lock } from 'lucide-react';

interface NexusCanvasProps {
  items: PlannerItem[];
  areas?: Area[];
  guests?: Guest[];
  selected: string | null; // ID
  onSelect: (id: string | null) => void;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onMoveArea?: (id: string, pos: { x: number; y: number }) => void;
  scale: number;
  is3D: boolean;
  showGrid?: boolean;
  isNightMode: boolean;
}

export function NexusCanvas({ items, areas, guests, selected, onSelect, onMove, onMoveArea, scale, is3D, showGrid, isNightMode }: NexusCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const layers = usePlannerStore((s) => s.layers);

  function drag(e: React.MouseEvent, item: PlannerItem) {
    if (item.locked) return;
    
    e.stopPropagation(); 
    e.preventDefault();
    
    onSelect(item.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const sx = item.x;
    const sy = item.y;

    const moveHandler = (ev: MouseEvent) => {
      const deltaX = (ev.clientX - startX) / scale;
      const deltaY = (ev.clientY - startY) / scale;
      
      onMove(item.id, { x: sx + deltaX, y: sy + deltaY });
    };

    const upHandler = () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
    };

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);
  }

  function dragArea(e: React.MouseEvent, area: Area) {
    e.stopPropagation();
    e.preventDefault();
    if (!onMoveArea) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const sx = area.x;
    const sy = area.y;

    const moveHandler = (ev: MouseEvent) => {
      const deltaX = (ev.clientX - startX) / scale;
      const deltaY = (ev.clientY - startY) / scale;
      
      onMoveArea(area.id, { x: sx + deltaX, y: sy + deltaY });
    };

    const upHandler = () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
    };

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);
  }

  const handleItemClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onSelect(id);
  };

  return (
    <div
      id="plano-fondo"
      className="relative w-full h-full"
      ref={canvasRef}
      style={{ 
        transformStyle: "preserve-3d",
        pointerEvents: 'auto',
        filter: isNightMode ? 'contrast(1.2) brightness(0.8)' : 'none'
      }}
    >
      <div className="absolute inset-0 pointer-events-none bg-grid-pattern" style={{width: '100%', height: '100%', opacity: isNightMode ? 0.1 : 0.3}} />
      
      {/* Grid Overlay for Rules */}
      {showGrid && (
         <div className="absolute inset-0 pointer-events-none z-[5]" style={{
             backgroundImage: `linear-gradient(to right, rgba(201, 162, 39, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 162, 39, 0.3) 1px, transparent 1px)`,
             backgroundSize: '100px 100px'
         }} />
      )}

      {/* AREAS LAYER */}
      {layers.areas && areas?.map((a) => {
        const isLounge = a.type === 'lounge';
        
        return (
        <div
            key={a.id}
            onMouseDown={(e) => dragArea(e, a)}
            onClick={(e) => e.stopPropagation()}
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: a.width * 100, // 100px per meter scale (Standardized)
                height: a.height * 100,
                backgroundColor: isNightMode ? 'transparent' : a.color,
                opacity: isNightMode ? 1 : 0.7,
                zIndex: 5, 
                transform: is3D 
                    ? `translate3d(${a.x}px, ${a.y}px, 0) rotate(${a.rotation || 0}deg)`
                    : `translate(${a.x}px, ${a.y}px) rotate(${a.rotation || 0}deg)`,
                cursor: 'grab',
                transformOrigin: '0 0', 
                border: isNightMode 
                  ? `2px solid ${a.color}` 
                  : '2px solid rgba(255,255,255,0.2)',
                boxShadow: isNightMode 
                  ? `0 0 20px ${a.color}, inset 0 0 30px ${a.color}22` 
                  : 'inset 0 0 50px rgba(0,0,0,0.5)',
                pointerEvents: 'auto'
            }}
            className="rounded-sm backdrop-blur-sm flex items-center justify-center group"
        >
            <span className={`text-xs font-bold select-none drop-shadow-md ${isNightMode ? 'text-white text-shadow-neon' : 'text-white/90'}`} style={{ transform: `rotate(-${a.rotation || 0}deg)` }}>
              {a.name} ({a.width}x{a.height}m)
            </span>
             {is3D && (
                <div className="absolute inset-0 border-b-4 border-r-4 border-black/30 pointer-events-none" />
             )}
        </div>
      )})}

      {/* ITEMS LAYER */}
      {items.map((m) => {
        if (m.category === 'sillas' && !layers.chairs) return null;
        if (m.category === 'mesas' && !layers.tables) return null;
        if (m.category === 'decor' && !layers.decor) return null;
        
        const isSelected = selected === m.id;
        const isRound = m.type?.includes('round') || m.shape === 'round';
        const isArea = m.category === 'hall' || m.category === 'area';
        
        return (
          <div
            key={m.id}
            onMouseDown={(e) => drag(e, m)}
            onClick={(e) => handleItemClick(e, m.id)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: m.w || m.size,
              height: m.h || m.size,
              transform: is3D 
                 ? `translate3d(${m.x}px, ${m.y}px, ${isArea ? '1px' : '10px'}) rotate(${m.rotation || 0}deg)` 
                 : `translate(${m.x}px, ${m.y}px) rotate(${m.rotation || 0}deg)`,
              zIndex: isSelected ? 100 : (isArea ? 2 : 10),
              cursor: m.locked ? 'default' : 'grab',
              transformOrigin: 'center center',
              pointerEvents: 'auto'
            }}
            className={`group ${m.locked && !isArea ? 'opacity-80' : ''}`}
          >
             <div 
               className={`w-full h-full relative flex items-center justify-center transition-all duration-200 ${isSelected ? "ring-2 ring-[#C9A227] shadow-[0_0_25px_rgba(197,162,83,0.4)]" : "hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"}`}
               style={{
                   backgroundColor: isNightMode ? '#000' : (m.category === 'pistas' ? '#2a2a2a' : m.color),
                   backgroundImage: m.category === 'pistas' ? 'repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333)' : 'none',
                   borderRadius: isRound ? '50%' : (isArea ? '0px' : '6px'),
                   boxShadow: isNightMode 
                    ? `0 0 10px ${m.color}, inset 0 0 5px ${m.color}`
                    : (is3D && !isArea ? '8px 8px 15px rgba(0,0,0,0.6)' : '0 4px 6px rgba(0,0,0,0.3)'),
                   border: isNightMode ? `1px solid ${m.color}` : (isArea ? '4px solid rgba(255,255,255,0.5)' : 'none')
               }}
             >
                 {m.locked && !isArea && <div className="absolute -top-2 -right-2 text-[#C9A227] bg-black rounded-full p-1 border border-[#C9A227] z-20 shadow-sm"><Lock size={10} /></div>}

                 {!isNightMode && <span className={`text-[9px] text-center font-medium px-1 pointer-events-none select-none ${m.color === '#ffffff' ? 'text-black' : 'text-white'} drop-shadow-md overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}>
                     {m.name} {isArea && `(${(m.w/100).toFixed(1)}x${(m.h/100).toFixed(1)}m)`}
                 </span>}
                 
                 {/* Direction Indicator */}
                 {!isArea && <div className="absolute top-0 w-1.5 h-2 bg-white/40 rounded-b-sm" />}
             </div>
          </div>
        );
      })}

      {/* GUESTS LAYER (CROWD SIM) */}
      {layers.guests && guests?.map((g) => (
          <div 
             key={g.id}
             style={{
                 position: "absolute",
                 left: g.x,
                 top: g.y,
                 width: 12,
                 height: 12,
                 borderRadius: '50%',
                 backgroundColor: g.color,
                 boxShadow: '0 0 5px rgba(255,255,255,0.8)',
                 zIndex: 120,
                 transform: is3D ? 'translate3d(0,0,20px)' : 'none',
                 pointerEvents: 'none'
             }}
             className="animate-pulse"
          />
      ))}
    </div>
  );
}