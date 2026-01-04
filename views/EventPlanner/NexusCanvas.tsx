
import React, { useRef, useEffect, useMemo } from 'react';
import { PlannerItem, Area, Guest, usePlannerStore, Agent, Peer, EventPhase } from '../../store/usePlannerStore';
import { Lock, Volume2, Moon, Sun, MousePointer2 } from 'lucide-react';
import { nanoid } from 'nanoid';

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
  
  const { 
    showAcousticHeatmap, 
    showChronosFlow, 
    timeOfDay, 
    simulationRunning, 
    simulationSpeed, 
    simulationDensity,
    eventPhase,
    agents, 
    updateAgents,
    themeMode,
    peers 
  } = usePlannerStore();

  // --- 4D ORACLE ENGINE: PHASE-AWARE CROWD SIMULATION ---
  useEffect(() => {
    if (!simulationRunning || eventPhase === 'setup') {
      if (agents.length > 0) updateAgents([]);
      return;
    }

    let animationFrameId: number;
    
    // Maintain simulation density
    let currentAgents = agents.length > 0 && Math.abs(agents.length - simulationDensity) < 20 
      ? agents 
      : Array.from({ length: simulationDensity }).map(() => ({
          id: nanoid(),
          x: 2500 + (Math.random() * 800 - 400),
          y: 2500 + (Math.random() * 800 - 400),
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          state: 'walking' as const
        }));

    const attractors = items.filter(i => 
      i.category === 'pistas' || i.type === 'dance' || 
      i.category === 'estaciones' || i.type === 'bar' ||
      i.category === 'mesas'
    );

    const entranceArea = areas.find(a => a.type === 'extra' || a.name.toLowerCase().includes('entrada'));

    const loop = () => {
      currentAgents = currentAgents.map(agent => {
        let { x, y, vx, vy, state } = agent;
        
        // Phase logic
        if (eventPhase === 'welcome' && entranceArea) {
           // Flowing from entrance to general area
           const targetX = 2500 + (Math.random() * 400 - 200);
           const targetY = 2500 + (Math.random() * 400 - 200);
           vx += (targetX - x) * 0.001;
           vy += (targetY - y) * 0.001;
        } else if (eventPhase === 'party') {
           // Attract to dancefloor
           const dancefloor = items.find(i => i.category === 'pistas' || i.type === 'dance');
           if (dancefloor) {
              const dx = (dancefloor.x + dancefloor.w / 2) - x;
              const dy = (dancefloor.y + dancefloor.h / 2) - y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist > 50) {
                 vx += (dx / dist) * 0.2;
                 vy += (dy / dist) * 0.2;
              } else {
                 // Dancing behavior
                 vx += (Math.random() - 0.5) * 2;
                 vy += (Math.random() - 0.5) * 2;
              }
           }
        } else if (eventPhase === 'closing') {
           // Move to edges
           if (x > 2500) vx += 0.1; else vx -= 0.1;
           if (y > 2500) vy += 0.1; else vy -= 0.1;
        }

        vx += (Math.random() - 0.5) * 0.5;
        vy += (Math.random() - 0.5) * 0.5;

        const speed = Math.sqrt(vx*vx + vy*vy);
        const maxSpeed = 2.5 * simulationSpeed;
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed;
          vy = (vy / speed) * maxSpeed;
        }

        x += vx;
        y += vy;

        // Boundaries
        if (x < 2000) vx += 1; if (x > 3000) vx -= 1;
        if (y < 2000) vy += 1; if (y > 3000) vy -= 1;

        return { ...agent, x, y, vx, vy, state };
      });

      updateAgents(currentAgents);
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [simulationRunning, simulationSpeed, simulationDensity, eventPhase, items.length, areas.length]);

  // --- ELITE DRAG ENGINE ---
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

  const getAreaStyle = (area: Area) => {
    const isSalon = area.type === 'salon';
    let baseColor = area.color;
    let borderColor = `2px solid ${area.color}`;
    if (themeMode === 'blueprint') {
        baseColor = '#0f172a';
        borderColor = '1px solid #3b82f6';
    } else if (themeMode === 'watercolor') {
        baseColor = `${area.color}40`; 
        borderColor = `2px dashed ${area.color}`;
    }
    return {
      backgroundColor: isNightMode ? (isSalon ? '#0f172a' : '#18181b') : baseColor,
      border: isSalon ? '4px solid #475569' : borderColor,
      boxShadow: isNightMode ? `0 0 50px ${area.color}20` : 'inset 0 0 40px rgba(0,0,0,0.1)',
    };
  };

  const ambientLight = useMemo(() => {
    if (!showChronosFlow) return {};
    const hour = timeOfDay;
    let opacity = 0;
    let color = '';
    if (hour >= 6 && hour <= 17) {
        opacity = 0;
    } else if (hour > 17 && hour < 20) {
        opacity = 0.3; color = '#ff4500'; // Sunset
    } else {
        const diff = Math.min(Math.abs(hour - 24), Math.abs(hour - 0));
        opacity = 0.6;
        color = '#000022';
    }
    return {
        backgroundColor: color,
        opacity: opacity,
        pointerEvents: 'none' as const,
        zIndex: 50
    };
  }, [showChronosFlow, timeOfDay]);

  const acousticZones = useMemo(() => {
    if (!showAcousticHeatmap) return [];
    return items.filter(i => i.category === 'pistas' || i.type === 'dance' || i.name.toLowerCase().includes('dj') || i.name.toLowerCase().includes('audio'));
  }, [showAcousticHeatmap, items]);

  return (
    <div 
      id="nexus-canvas-layer"
      className="absolute top-0 left-0 w-full h-full"
      style={{ 
        transformStyle: "preserve-3d",
        filter: isNightMode || themeMode === 'cyberpunk' ? 'contrast(1.1) brightness(0.9)' : 'none',
        fontFamily: themeMode === 'blueprint' ? 'monospace' : 'inherit'
      }}
    >
      {/* GRID LAYER */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none z-[1]" 
             style={{ 
                backgroundImage: `linear-gradient(${isNightMode || themeMode === 'blueprint' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isNightMode || themeMode === 'blueprint' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
             }} 
        />
      )}

      {/* AREAS LAYER */}
      {areas.map(area => (
        <div
          key={area.id}
          onMouseDown={(e) => handleAreaDrag(e, area)}
          className="absolute flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing group"
          style={{
            left: 0, top: 0,
            width: area.width * 20, 
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
          {is3D && (
            <div className="absolute -bottom-2 -right-2 w-full h-full border-b-4 border-r-4 border-black/30 opacity-50 pointer-events-none transform translate-z-[-10px]" />
          )}
        </div>
      ))}

      {/* ACOUSTIC HEATMAP LAYERS */}
      {showAcousticHeatmap && acousticZones.map(source => (
         <div key={`heat-${source.id}`}
              className="absolute rounded-full pointer-events-none animate-pulse"
              style={{
                  left: source.x + (source.w/2) - 400,
                  top: source.y + (source.h/2) - 400,
                  width: 800,
                  height: 800,
                  background: 'radial-gradient(circle, rgba(255,50,0,0.3) 0%, rgba(255,150,0,0.1) 40%, rgba(0,0,255,0) 70%)',
                  zIndex: 9,
                  mixBlendMode: 'screen'
              }}
         >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-200 font-mono text-xs bg-black/50 px-2 rounded">
               <Volume2 size={12} className="inline mr-1"/> 95dB
            </div>
         </div>
      ))}

      {/* ITEMS LAYER */}
      {items.map(item => {
        const isSelected = selected === item.id;
        const isRound = item.type?.includes('round') || item.category === 'mesas';
        
        return (
          <div
            key={item.id}
            onMouseDown={(e) => handleItemDrag(e, item)}
            onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
            className={`group ${item.locked ? 'opacity-90' : ''}`}
            style={{
              position: 'absolute',
              width: item.w || item.size,
              height: item.h || item.size,
              transform: is3D 
                ? `translate3d(${item.x}px, ${item.y}px, 15px) rotate(${item.rotation || 0}deg)`
                : `translate(${item.x}px, ${item.y}px) rotate(${item.rotation || 0}deg)`,
              cursor: item.locked ? 'default' : 'grab',
              zIndex: isSelected ? 120 : 10,
              transformOrigin: 'center center',
              transition: is3D ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
            }}
          >
            <div 
              className={`w-full h-full relative flex items-center justify-center transition-all duration-300 ${
                isSelected 
                  ? 'ring-2 ring-[#D4AF37] shadow-[0_0_22px_rgba(212,175,55,0.45)]' 
                  : 'hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]'
              }`}
              style={{
                backgroundColor: isNightMode ? '#111' : item.color,
                borderRadius: isRound ? '50%' : '8px',
                boxShadow: is3D ? '10px 10px 20px rgba(0,0,0,0.8)' : '0 4px 6px rgba(0,0,0,0.3)',
                border: themeMode === 'blueprint' ? '1px solid #3b82f6' : `1px solid ${isNightMode ? '#333' : 'rgba(255,255,255,0.1)'}`
              }}
            >
              {item.locked && (
                <div className="absolute -top-2 -right-2 text-[#D4AF37] bg-black rounded-full p-1 border border-[#D4AF37] z-20 shadow-sm">
                  <Lock size={10} />
                </div>
              )}
              
              {!isNightMode && (
                <span className={`text-[9px] text-center font-bold uppercase tracking-tighter px-1 select-none ${item.color === '#ffffff' ? 'text-black' : 'text-white'}`}>
                  {item.name.slice(0, 10)}
                </span>
              )}
              
              {is3D && <div className="absolute -bottom-1 w-full h-2 bg-black/40 blur-sm rounded-full transform translate-z-[-1px]" />}
            </div>
          </div>
        );
      })}

      {/* REMOTE CURSORS */}
      {Object.values(peers).map((peer: Peer) => peer.cursor && (
        <div
          key={peer.id}
          className="absolute z-[140] pointer-events-none transition-transform duration-100 ease-linear"
          style={{
            transform: `translate(${peer.cursor.x}px, ${peer.cursor.y}px)`
          }}
        >
          <MousePointer2 size={20} fill={peer.color} color="white" className="drop-shadow-md" />
          <div 
            className="absolute left-4 top-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm"
            style={{ backgroundColor: peer.color }}
          >
            {peer.name}
          </div>
        </div>
      ))}

      {/* CROWD SIMULATION AGENTS */}
      {simulationRunning && agents.map(agent => (
         <div 
            key={agent.id}
            className="absolute rounded-full transition-all duration-75 ease-linear"
            style={{
                left: agent.x,
                top: agent.y,
                width: 10,
                height: 10,
                backgroundColor: isNightMode ? (Math.random() > 0.5 ? '#D4AF37' : '#fff') : '#38bdf8',
                boxShadow: isNightMode ? '0 0 10px rgba(212,175,55,0.5)' : 'none',
                zIndex: 150,
                pointerEvents: 'none',
                transform: is3D ? 'translateZ(20px)' : 'none'
            }}
         />
      ))}

      {/* CHRONOS FLOW OVERLAY */}
      {showChronosFlow && (
         <div className="absolute inset-0 pointer-events-none z-[200] transition-colors duration-1000" style={ambientLight} />
      )}

    </div>
  );
}
