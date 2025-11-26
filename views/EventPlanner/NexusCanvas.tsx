import React, { useRef, useEffect } from 'react';
import { PlannerItem, Area, Guest } from '../../store/usePlannerStore';
import { Lock } from 'lucide-react';

interface NexusCanvasProps {
  items: PlannerItem[];
  areas: Area[];
  guests: Guest[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onMoveArea: (id: string, pos: { x: number; y: number }) => void;
  scale: number;
  is3D: boolean;
  showGrid: boolean;
  isNightMode: boolean;
}

export function NexusCanvas({ 
  items, areas, guests, selected, onSelect, onMove, onMoveArea, 
  scale, is3D, showGrid, isNightMode 
}: NexusCanvasProps) {
  
  // --- ELITE DRAG ENGINE ---
  // Handles interaction seamlessly even with Zoom Scale
  const handleItemDrag = (e: React.MouseEvent, item: PlannerItem) => {
    if (item.locked) return;
    e.stopPropagation(); 
    e.preventDefault();
    
    onSelect(item.id);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = item.x;
    const initialY = item.y;

    const move = (ev: MouseEvent) => {
      // Compensation for scale is CRITICAL for 1:1 movement
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      onMove(item.id, { x: initialX + dx, y: initialY + dy });
    };

    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const handleAreaDrag = (e: React.MouseEvent, area: Area) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = area.x;
    const initialY = area.y;

    const move = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      onMoveArea(area.id, { x: initialX + dx, y: initialY + dy });
    };

    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // --- VISUAL STYLES ---
  const getAreaStyle = (area: Area) => {
    const isSalon = area.type === 'salon';
    return {
      backgroundColor: isNightMode ? (isSalon ? '#0f172a' : '#18181b') : area.color,
      border: isSalon ? '4px solid #475569' : `2px solid ${area.color}`,
      boxShadow: isNightMode ? `0 0 50px ${area.color}20` : 'inset 0 0 40px rgba(0,0,0,0.1)',
    };
  };

  return (
    <div 
      id="nexus-canvas-layer"
      className="absolute top-0 left-0 w-full h-full"
      style={{ 
        transformStyle: "preserve-3d",
        filter: isNightMode ? 'contrast(1.1) brightness(0.9)' : 'none'
      }}
    >
      {/* GRID LAYER */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none z-[1]" 
             style={{ 
                backgroundImage: `linear-gradient(${isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
             }} 
        />
      )}

      {/* AREAS LAYER (Z: 5-9) */}
      {areas.map(area => (
        <div
          key={area.id}
          onMouseDown={(e) => handleAreaDrag(e, area)}
          className="absolute flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing group"
          style={{
            left: 0, top: 0,
            width: area.width * 20, // Scale: 1m = 20px (Standardized)
            height: area.height * 20,
            transform: `translate(${area.x}px, ${area.y}px) rotate(${area.rotation}deg)`,
            zIndex: 5,
            ...getAreaStyle(area),
            backdropFilter: 'blur(4px)',
            transition: 'background-color 0.3s'
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 select-none text-white drop-shadow-md px-2 py-1 bg-black/20 rounded">
            {area.name}
          </span>
          {/* 3D Wall Simulation */}
          {is3D && (
            <div className="absolute -bottom-2 -right-2 w-full h-full border-b-4 border-r-4 border-black/30 opacity-50 pointer-events-none transform translate-z-[-10px]" />
          )}
        </div>
      ))}

      {/* ITEMS LAYER (Z: 10-100) */}
      {items.map(item => {
        const isSelected = selected === item.id;
        const isRound = item.type?.includes('round') || item.category === 'mesas';
        
        return (
          <div
            key={item.id}
            onMouseDown={(e) => handleItemDrag(e, item)}
            onClick={(e) => { e.stopPropagation(); onSelect