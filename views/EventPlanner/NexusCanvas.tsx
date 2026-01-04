
import React from 'react';
import { PlannerItem, Area } from '../../store/usePlannerStore';
import { Lock, Volume2 } from 'lucide-react';

interface NexusCanvasProps {
  items: PlannerItem[];
  areas: Area[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  scale: number;
  is3D: boolean;
  showGrid: boolean;
  isNightMode: boolean;
}

export function NexusCanvas({ items, areas, selected, onSelect, onMove, scale, is3D, showGrid, isNightMode }: NexusCanvasProps) {
  return (
    <div className="relative w-[5000px] h-[5000px] origin-top-left" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* BACKGROUND GRID */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      )}

      {/* ARCHITECTURAL AREAS */}
      {areas.map(area => (
        <div key={area.id}
          className="absolute border-2 transition-colors duration-1000"
          style={{
            left: area.x, top: area.y,
            width: area.width * 20, height: area.height * 20,
            borderColor: area.color,
            backgroundColor: isNightMode ? '#111' : area.color + '15',
            transform: `rotate(${area.rotation}deg)`,
            zIndex: 5
          }}>
          <span className="absolute top-2 left-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">{area.name}</span>
        </div>
      ))}

      {/* DYNAMIC ASSETS */}
      {items.map(item => {
        const isSelected = selected === item.id;
        const z = is3D ? item.zOffset : 0;
        
        return (
          <div key={item.id}
            onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
            onMouseDown={(e) => {
              if (item.locked) return;
              e.stopPropagation();
              const startX = e.clientX / scale - item.x;
              const startY = e.clientY / scale - item.y;
              const move = (ev: MouseEvent) => onMove(item.id, { x: ev.clientX / scale - startX, y: ev.clientY / scale - startY });
              const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
              window.addEventListener('mousemove', move);
              window.addEventListener('mouseup', up);
            }}
            className="absolute transition-transform will-change-transform"
            style={{
              left: item.x, top: item.y,
              width: item.w, height: item.h,
              zIndex: isSelected ? 1000 : 100,
              transform: `translate3d(0, 0, ${z}px) rotate(${item.rotation}deg)`,
              transformStyle: 'preserve-3d'
            }}>
            
            {/* 3D BODY */}
            <div className={`w-full h-full relative border transition-all ${isSelected ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]' : 'border-white/10'}`}
              style={{
                backgroundColor: isNightMode ? '#222' : item.color,
                borderRadius: item.type === 'round' ? '50%' : '4px',
                boxShadow: is3D ? '0 10px 30px rgba(0,0,0,0.6)' : 'none'
              }}>
              {item.locked && <Lock size={12} className="text-red-500 opacity-50 m-auto mt-2" />}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 text-[9px] font-bold uppercase truncate px-1">
                {item.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* TIME OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-[5000] transition-colors duration-1000"
        style={{
          backgroundColor: isNightMode ? '#000033' : 'transparent',
          opacity: isNightMode ? 0.4 : 0
        }}
      />
    </div>
  );
}
