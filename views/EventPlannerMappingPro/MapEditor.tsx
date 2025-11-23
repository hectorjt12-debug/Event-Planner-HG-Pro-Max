import React, { useState, useRef } from "react";
import { autoLayoutMaster, Table } from "../../utils/autoLayoutEngine";
import { checkpoint } from "../../utils/checkpointEngine";
import { asignarNumeros } from "../../utils/numbering";
import { exportarPNG } from "../../utils/exportPNG";
import { cinematicCamera } from "../../utils/cinematic";
import { COLORS } from "../../utils/colors";
import PlannerPanel from "./PlannerPanel";
import MimiOverlay from "./MimiOverlay";
import Fake3D from "./Fake3D";
import { X } from "lucide-react";

export default function MapEditor() {
  const [tablas, setTablas] = useState<Table[]>([]);
  const [style, setStyle] = useState("auto");
  const [vip, setVip] = useState(true);
  const [mimi, setMimi] = useState(true);
  const [director, setDirector] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleAuto = () => {
    if (tablas.length > 0) {
      checkpoint.save("auto", tablas);
    }

    let nuevas = autoLayoutMaster({
      ancho: 35,
      largo: 17,
      personas: 400,
      paxPorMesa: 10,
      estilo: style,
      vipEnabled: vip
    });

    // Premium: Assign Numbers
    nuevas = asignarNumeros(nuevas);

    setTablas(nuevas);
    cinematicCamera(svgRef);
  };

  const toggleDirector = () => {
    setDirector(!director);
    if (!director) {
        // Trigger movement when entering director mode
        cinematicCamera(svgRef);
    }
  };

  return (
    <div className="flex w-full h-full relative bg-transparent overflow-hidden font-sans text-white">
      {/* Ambience Layers */}
      {mimi && <MimiOverlay />}
      <Fake3D />

      <div className="absolute inset-0 pointer-events-none app-frame z-50 opacity-50"></div>

      {/* Controls - Hidden in Director Mode */}
      {!director && (
        <PlannerPanel
          onAuto={handleAuto}
          onStyle={setStyle}
          onVIP={() => setVip(!vip)}
          onReset={() => setTablas([])}
          onSave={() => checkpoint.save("manual", tablas)}
          onRestore={() => {
            const restored = checkpoint.restore("manual");
            if (restored) setTablas(restored);
          }}
          onExport={() => exportarPNG(svgRef)}
          onDirectorMode={toggleDirector}
        />
      )}

      {/* Exit Director Mode Button */}
      {director && (
          <button 
            onClick={toggleDirector}
            className="absolute top-6 right-6 z-50 px-6 py-3 btn-hg flex items-center gap-2 transition-all"
          >
             <X size={16} />
             <span>Exit Director Mode</span>
          </button>
      )}

      {/* Canvas Area */}
      <div className={`flex-1 w-full h-full transition-all duration-1000 ease-in-out ${director ? "scale-110 brightness-110" : ""}`}>
        <div className="w-full h-full flex items-center justify-center p-6 lg:p-12">
            <svg 
              ref={svgRef} 
              width="100%" 
              height="100%" 
              viewBox="0 0 800 450"
              preserveAspectRatio="xMidYMid meet"
              className="transition-transform duration-700"
            >
              {/* Floor Grid (Optimized for Dark BG) */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {tablas.map((t) => (
                <g key={t.id} className="cursor-pointer hover:opacity-80 transition-opacity">
                  {/* Shadow */}
                  <circle
                    cx={t.x * 20}
                    cy={t.y * 20 + 4}
                    r="14"
                    fill="rgba(0,0,0,0.5)"
                  />
                  {/* Table Top */}
                  <circle
                    cx={t.x * 20}
                    cy={t.y * 20}
                    r="14"
                    fill={t.vip ? COLORS.mesaVIP : COLORS.mesa}
                    stroke={t.vip ? COLORS.bordeVIP : COLORS.borde}
                    strokeWidth="1.5"
                    className={t.vip ? "mesa-vip" : ""}
                  />
                  {/* Table Number */}
                  <text
                    x={t.x * 20}
                    y={t.y * 20 + 4}
                    fontSize={t.vip ? "6" : "8"}
                    fontWeight={t.vip ? "bold" : "normal"}
                    textAnchor="middle"
                    fill={t.vip ? "#be185d" : "#374151"}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {t.numero}
                  </text>
                </g>
              ))}
            </svg>
        </div>
      </div>
    </div>
  );
}