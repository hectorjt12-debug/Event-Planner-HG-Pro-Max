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
  const setSelected = usePlannerStore((s) => s.setSelected);
  const setSelectedId = usePlannerStore((s) => s.setSelectedId);
  const reset = usePlannerStore((s) => s.reset);
  
  const { mode, setMode } = useInteractiveStore();
  const { generatedItems } = useHGCreatorStore();
  const prevGeneratedCount = useRef(0);

  useEffect(() => {
    if (generatedItems.length > prevGeneratedCount.current) {
        const newItem = generatedItems[generatedItems.length - 1];
        let w = 100, h = 100, cat = 'mueble', type = 'mueble';
        
        if (newItem.category === 'table') { 
            w = 150; h = 150; cat = 'mesas'; type = 'table';
            if (newItem.shape === 'rectangular') { w = 240; h = 100; }
        } else if (newItem.category === 'chair') {
            w = 50; h = 50; cat = 'sillas'; type = 'chair';
        } else if (newItem.category === 'lounge') {
            w = 200; h = 100; cat = 'mueble'; type = 'lounge';
        }

        addItem({
            id: newItem.id || nanoid(),
            name: newItem.label || newItem.category,
            w: w,
            h: h,
            size: Math.max(w, h),
            x: 2500 + (Math.random() * 200 - 100), 
            y: 2500 + (Math.random() * 200 - 100),
            rotation: 0,
            type: type,
            category: cat,
            color: newItem.color || (cat === 'mesas' ? '#333' : '#fff'),
            locked: false
        });
        prevGeneratedCount.current = generatedItems.length;
    }
  }, [generatedItems, addItem]);

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

  // Controlled Inputs State
  const [width, setWidth] = useState<number | "">(30);
  const [length, setLength] = useState<number | "">(28);
  const [height, setHeight] = useState<number | "">(6);

  // --- ZOOM & PAN LOGIC ---
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
         // PAN
         setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    } else {
         // ZOOM
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

  // --- PANNING (Drag Mode) ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
      const targetId = (e.target as HTMLElement).id;
      
      if (targetId === "plano-fondo" || targetId === "canvas-wrapper" || targetId.includes("grid")) {
          setIsDraggingCanvas(true);
          lastMouseRef.current = { x: e.clientX, y: e.clientY };
          setSelected(null); 
      }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
      if (isDraggingCanvas) {
          const dx = e.clientX - lastMouseRef.current.x;
          const dy = e.clientY - lastMouseRef.current.y;
          setPan(p => ({ x: p.x + dx, y: p.y + dy }));
          lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
  };

  const handleCanvasMouseUp = () => setIsDraggingCanvas(false);

  // --- AI COMMANDS ---
  function micCommand() {
      if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
      const r = new window.webkitSpeechRecognition();
      r.lang = "es-MX";
      r.onresult = async (e: any) => {
          const text = e.results[0][0].transcript;
          setAiText(text);
          await executeAI(text);
      };
      r.start();
    } else {
      alert("Speech recognition not supported.");
    }
  }

  async function executeAI(cmd?: string) {
    const text = cmd || aiText;
    if (!text) return;
    const response = await HGBrain.process(text);
    setAiText(response); 
    setTimeout(() => setAiText(""), 4000);
  }

  // FIXED: Generate Hall Logic (Clean previous areas first)
  const generateHall = () => {
    if (!width || !length) return;
    
    // Remove existing salon/hall items or areas
    areas.forEach(a => {
        if (a.type === 'salon' || a.name === 'Gran Salón') removeArea(a.id);
    });

    // Clear items classified as hall
    clearHall();
    
    const wVal = Number(width);
    const hVal = Number(length);

    // Add as Area (Bottom Layer)
    addArea({
        id: nanoid(),
        name: "Gran Salón",
        width: wVal,
        height: hVal,
        x: 2500,
        y: 2500, // Centered
        type: "salon",
        color: "#1e293b"
    });
  };

   const handleMove = (id: string, newPos: {x: number, y: number}) => {
     updateItem(id, newPos);
  };

  const handleMoveArea = (id: string, newPos: {x: number, y: number}) => {
      updateArea(id, newPos);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden font-sans text-white">
      
      <HGSpaceTopBar 
        aiText={aiText}
        setAiText={setAiText}
        onMic={micCommand}
        onExecute={() => executeAI()}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={reset}
        onToggle3D={() => setIs3D(!is3D)}
        is3D={is3D}
        onToggleCatalog={() => setShowCatalog(!showCatalog)}
        onToggleRules={() => setShowRules(!showRules)}
        width={width}
        setWidth={setWidth}
        length={length}
        setLength={setLength}
        height={height}
        setHeight={setHeight}
        onGenerateSalon={generateHall}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        isNightMode={isNightMode}
      />

      <div className="flex-1 relative overflow-hidden flex">
        
        {/* Infinite Canvas Wrapper */}
        <div 
            className={`flex-1 h-full relative bg-[#0a0a0a] overflow-hidden ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
            id="canvas-wrapper"
            ref={canvasWrapperRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
        >
             <div 
                className="absolute transition-transform duration-100 ease-linear will-change-transform"
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
                    onSelect={(id) => {
                        setSelectedId(id);
                    }}
                    onMove={handleMove}
                    onMoveArea={handleMoveArea}
                    scale={scale}
                    is3D={is3D}
                    showGrid={showRules}
                    isNightMode={isNightMode}
                />
             </div>
        </div>

        {/* Panels */}
        {showAreaCreator && (
          <div className="absolute top-6 left-6 z-[150] animate-in fade-in zoom-in duration-200 hg-interactive">
             <AreaCreator onClose={() => setShowAreaCreator(false)} />
          </div>
        )}
        
        <HGCreatorButton />
      </div>

      {showCatalog && <CatalogPanel />}
      <PropertiesPanel />
      
    </div>
  );
}