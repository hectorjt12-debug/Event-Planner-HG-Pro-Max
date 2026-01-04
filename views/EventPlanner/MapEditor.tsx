
import React, { useState, useRef, useEffect } from "react";
import CatalogPanel from "./CatalogPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { NexusCanvas } from "./NexusCanvas";
import AreaCreator from "./AreaCreator";
import AreaRulesPanel from "../../components/AreaRulesPanel";
import { usePlannerStore } from "../../store/usePlannerStore";
import { useInteractiveStore } from "../../store/useInteractiveStore";
import { HGBrain } from "../../ai/HGBrain";
import HGSpaceTopBar from "../../components/HGSpaceTopBar";
import { nanoid } from "nanoid";
import HGCreatorButton from "../../components/HGCreatorButton";
import { useHGCreatorStore } from "../../store/HGCreatorStore";
import { useRealtime } from "../../hooks/useRealtime";
import Collaborators from "../../components/Collaborators";

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export default function MapEditor() {
  const items = usePlannerStore((s) => s.items);
  const areas = usePlannerStore((s) => s.areas);
  const guests = usePlannerStore((s) => s.guests);
  const updateItem = usePlannerStore((s) => s.updateItem);
  const updateArea = usePlannerStore((s) => s.updateArea);
  const addItem = usePlannerStore((s) => s.addItem);
  const addArea = usePlannerStore((s) => s.addArea);
  const clearHall = usePlannerStore((s) => s.clearHall);
  const removeArea = usePlannerStore((s) => s.removeArea);
  const selectedId = usePlannerStore((s) => s.selectedId);
  const setSelectedId = usePlannerStore((s) => s.setSelectedId);
  const reset = usePlannerStore((s) => s.reset);
  
  const { mode, setMode } = useInteractiveStore();
  const { generatedItems } = useHGCreatorStore();
  
  // Realtime Connection
  const { broadcastCursor } = useRealtime();

  const [aiText, setAiText] = useState("");
  const [is3D, setIs3D] = useState(false);
  const [showAreaCreator, setShowAreaCreator] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showCatalog, setShowCatalog] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  
  // Viewport State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: -2000, y: -2000 }); 
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // Inputs
  const [width, setWidth] = useState<number | "">(30);
  const [length, setLength] = useState<number | "">(28);
  const [height, setHeight] = useState<number | "">(6);

  // --- ZOOM & PAN LOGIC ---
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
         setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    } else {
         const direction = e.deltaY > 0 ? -1 : 1;
         const newScale = clamp(scale + direction * 0.05, 0.3, 4);
         setScale(newScale);
    }
  };

  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (wrapper) wrapper.removeEventListener("wheel", handleWheel);
    }
  }, [scale]); 

  const zoomIn = () => setScale(s => clamp(s + 0.2, 0.3, 4));
  const zoomOut = () => setScale(s => clamp(s - 0.2, 0.3, 4));

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
      if((e.target as HTMLElement).closest('.hg-btn') || (e.target as HTMLElement).closest('.hg-input')) return;

      const targetId = (e.target as HTMLElement).id;
      if (targetId === "plano-fondo" || targetId === "canvas-wrapper" || targetId.includes("grid")) {
          setIsDraggingCanvas(true);
          lastMouseRef.current = { x: e.clientX, y: e.clientY };
          setSelectedId(null); 
      }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
      // 1. Pan logic
      if (isDraggingCanvas) {
          const dx = e.clientX - lastMouseRef.current.x;
          const dy = e.clientY - lastMouseRef.current.y;
          setPan(p => ({ x: p.x + dx, y: p.y + dy }));
          lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }

      // 2. Real-time Cursor Broadcast
      // Need to convert screen coords to canvas coords
      // Coords = (Client - CenterOffset - Pan) / Scale
      // This is rough approximation for the demo cursor visual
      const canvasX = (e.clientX - window.innerWidth / 2 - pan.x) / scale + 2500;
      const canvasY = (e.clientY - window.innerHeight / 2 - pan.y) / scale + 2500;
      
      broadcastCursor(canvasX, canvasY);
  };

  const handleCanvasMouseUp = () => setIsDraggingCanvas(false);

  // AI
  async function executeAI(cmd?: string) {
    const text = cmd || aiText;
    if (!text) return;
    const response = await HGBrain.process(text);
    setAiText(response); 
    setTimeout(() => setAiText(""), 4000);
  }

  const generateHall = () => {
    if (!width || !length) return;
    areas.forEach(a => { if (a.type === 'salon') removeArea(a.id); });
    clearHall();
    addArea({
        id: nanoid(),
        name: "Gran Salón",
        width: Number(width),
        height: Number(length),
        x: 2500,
        y: 2500,
        type: "salon",
        color: "#1e293b"
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden font-sans text-white relative">
      
      {/* 1. TOP BAR (UI LAYER - Z-INDEX HIGH) */}
      <div className="relative z-[100] pointer-events-auto">
        <div className="absolute top-2 right-4 z-[2000]">
           <Collaborators />
        </div>
        <HGSpaceTopBar 
            aiText={aiText} setAiText={setAiText}
            onMic={() => {}} onExecute={() => executeAI()}
            onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset}
            onToggle3D={() => setIs3D(!is3D)} is3D={is3D}
            onToggleCatalog={() => setShowCatalog(!showCatalog)}
            onToggleRules={() => setShowRules(!showRules)}
            width={width} setWidth={setWidth}
            length={length} setLength={setLength}
            height={height} setHeight={setHeight}
            onGenerateSalon={generateHall}
            onToggleNightMode={() => setIsNightMode(!isNightMode)}
            isNightMode={isNightMode}
        />
      </div>

      {/* 2. CANVAS AREA (LOWER LAYER) */}
      <div className="flex-1 relative overflow-hidden flex z-0">
        <div 
            className={`flex-1 h-full relative bg-[#0a0a0a] overflow-hidden ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
            id="canvas-wrapper"
            ref={canvasWrapperRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{ zIndex: 0 }} 
        >
             <div 
                className="absolute will-change-transform"
                style={{
                    width: '5000px',
                    height: '5000px',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-2500px',
                    marginTop: '-2500px',
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale}) ${is3D ? 'perspective(2000px) rotateX(35deg) translateY(-100px)' : ''}`,
                    transformOrigin: "center center",
                    transformStyle: 'preserve-3d',
                    pointerEvents: 'none'
                }}
             >
                <NexusCanvas
                    items={items}
                    areas={areas}
                    guests={guests}
                    selected={selectedId}
                    onSelect={setSelectedId}
                    onMove={(id, p) => updateItem(id, p)}
                    onMoveArea={(id, p) => updateArea(id, p)}
                    scale={scale}
                    is3D={is3D}
                    showGrid={showRules}
                    isNightMode={isNightMode}
                />
             </div>
        </div>

        {/* 3. OVERLAYS (Z-INDEX HIGH) */}
        {showCatalog && <CatalogPanel />}
        <PropertiesPanel />
        <HGCreatorButton />
        
        {showAreaCreator && (
          <div className="absolute top-6 left-6 z-[200]">
             <AreaCreator onClose={() => setShowAreaCreator(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
